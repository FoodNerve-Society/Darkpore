const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function pushSchemaToTurso() {
  console.log("=========================================");
  console.log("   AUTOMATIC TURSO SCHEMA SYNC");
  console.log("=========================================");

  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!authToken) {
    console.error("❌ Missing TURSO_AUTH_TOKEN in .env.local");
    process.exit(1);
  }

  console.log(`Connecting to Turso: ${url}`);
  const client = createClient({ url, authToken });

  // Read schema.prisma
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Parse models from schema.prisma
  const models = parsePrismaModels(schemaContent);
  console.log(`Found ${models.length} Prisma models in schema.prisma.`);

  // Fetch existing tables on Turso
  const tablesRes = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';");
  const existingTables = new Set(tablesRes.rows.map(r => String(r.name)));

  let changesApplied = 0;

  for (const model of models) {
    const tableName = model.name;
    const fields = model.fields;

    if (!existingTables.has(tableName)) {
      // Table doesn't exist -> CREATE TABLE
      console.log(`\n✨ Table "${tableName}" does not exist on Turso. Creating table...`);
      const columnDefs = fields.map(f => {
        let col = `"${f.name}" ${f.sqlType}`;
        if (f.isId) col += ' PRIMARY KEY';
        if (f.isUnique && !f.isId) col += ' UNIQUE';
        return col;
      }).join(', ');

      const createSql = `CREATE TABLE "${tableName}" (${columnDefs});`;
      try {
        await client.execute(createSql);
        console.log(`  ✅ Table "${tableName}" created successfully.`);
        changesApplied++;
      } catch (err) {
        console.error(`  ❌ Failed creating table "${tableName}":`, err.message);
      }
    } else {
      // Table exists -> Check for missing columns
      const colsRes = await client.execute(`PRAGMA table_info("${tableName}");`);
      const existingCols = new Set(colsRes.rows.map(r => String(r.name)));

      for (const field of fields) {
        if (!existingCols.has(field.name)) {
          console.log(`\n➕ Missing column "${field.name}" in table "${tableName}". Adding column...`);
          const alterSql = `ALTER TABLE "${tableName}" ADD COLUMN "${field.name}" ${field.sqlType};`;
          try {
            await client.execute(alterSql);
            console.log(`  ✅ Column "${field.name}" added to "${tableName}".`);
            changesApplied++;
          } catch (err) {
            console.error(`  ❌ Failed adding column "${field.name}":`, err.message);
          }

          if (field.isUnique) {
            const indexSql = `CREATE UNIQUE INDEX IF NOT EXISTS "${tableName}_${field.name}_key" ON "${tableName}"("${field.name}");`;
            try {
              await client.execute(indexSql);
              console.log(`  ✅ Unique index created for "${tableName}.${field.name}".`);
            } catch (err) {
              console.log(`  Note on index: ${err.message}`);
            }
          }
        }
      }
    }
  }

  // Also check if scratch/diff_utf8.sql exists and apply any extra manual DDL queries if present
  const diffPath = path.join(__dirname, 'scratch', 'diff_utf8.sql');
  if (fs.existsSync(diffPath)) {
    const rawSql = fs.readFileSync(diffPath, 'utf8');
    const manualQueries = rawSql.split(';')
      .map(q => q.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
      .filter(q => q.length > 0);

    for (const q of manualQueries) {
      try {
        await client.execute(q);
      } catch (err) {
        // Silently skip if query already applied (e.g. column already exists)
      }
    }
  }

  console.log(`\n=========================================`);
  console.log(`✅ TURSO SCHEMA SYNC COMPLETE! (${changesApplied} updates applied)`);
  console.log(`=========================================\n`);
}

function parsePrismaModels(schemaContent) {
  const models = [];
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const fields = [];

    const lines = body.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;

      const tokens = line.split(/\s+/);
      if (tokens.length >= 2) {
        const fieldName = tokens[0];
        const fieldTypeRaw = tokens[1];
        const attributes = tokens.slice(2).join(' ');

        // Skip relation fields (e.g. author User @relation(...))
        if (isPrismaRelationField(fieldTypeRaw)) continue;

        const sqlType = mapPrismaTypeToSql(fieldTypeRaw);
        const isId = attributes.includes('@id');
        const isUnique = attributes.includes('@unique');

        fields.push({
          name: fieldName,
          sqlType,
          isId,
          isUnique
        });
      }
    }

    models.push({ name: modelName, fields });
  }

  return models;
}

function isPrismaRelationField(typeRaw) {
  const cleanType = typeRaw.replace('?', '').replace('[]', '');
  const primitiveTypes = ['String', 'Int', 'BigInt', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json', 'Bytes'];
  return !primitiveTypes.includes(cleanType);
}

function mapPrismaTypeToSql(typeRaw) {
  const cleanType = typeRaw.replace('?', '').replace('[]', '');
  switch (cleanType) {
    case 'String':
      return 'TEXT';
    case 'Int':
    case 'BigInt':
      return 'INTEGER';
    case 'Boolean':
      return 'INTEGER';
    case 'Float':
    case 'Decimal':
      return 'REAL';
    case 'DateTime':
      return 'DATETIME';
    case 'Json':
      return 'TEXT';
    default:
      return 'TEXT';
  }
}

pushSchemaToTurso().catch(err => {
  console.error("Fatal schema sync error:", err);
  process.exit(1);
});
