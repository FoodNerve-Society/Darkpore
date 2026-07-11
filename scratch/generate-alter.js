const fs = require('fs');

function parseTables(sql) {
  const tables = {};
  const statements = sql.split('-- CreateTable');
  for (let stmt of statements) {
    const match = stmt.match(/CREATE TABLE "([^"]+)" \(([\s\S]+?)\);/);
    if (match) {
      const tableName = match[1];
      const columnsBlock = match[2];
      const columns = [];
      const lines = columnsBlock.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('"')) {
          const colMatch = line.match(/"([^"]+)"\s+(.+?),?$/);
          if (colMatch) {
            columns.push({ name: colMatch[1], def: colMatch[2].replace(/,$/, '') });
          }
        }
      }
      tables[tableName] = columns;
    }
  }
  return tables;
}

let baselineSql = fs.readFileSync('baseline.sql', 'utf16le');
if (baselineSql.charCodeAt(0) === 0xFEFF) baselineSql = baselineSql.slice(1);
const newSql = fs.readFileSync('scratch/diff_utf8.sql', 'utf8');

const baselineTables = parseTables(baselineSql);
const newTables = parseTables(newSql);

const alterQueries = [];

for (const tableName in newTables) {
  if (!baselineTables[tableName]) {
    // We can't do CREATE TABLE easily here, assuming they were created, but let's log
    console.log(`-- Table ${tableName} is entirely new (Make sure it exists)`);
    continue;
  }
  
  const baselineCols = baselineTables[tableName].map(c => c.name);
  const newCols = newTables[tableName];
  
  for (const col of newCols) {
    if (!baselineCols.includes(col.name)) {
      // Missing column!
      let def = col.def;
      // SQLite ALTER TABLE ADD COLUMN does not support UNIQUE or PRIMARY KEY or NOT NULL without DEFAULT
      // If NOT NULL but no default, SQLite will fail. 
      // A safe fallback for dev: remove NOT NULL if no default exists.
      if (def.includes('NOT NULL') && !def.includes('DEFAULT')) {
         def = def.replace('NOT NULL', '');
      }
      alterQueries.push(`ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${def};`);
    }
  }
}

const out = `
const { createClient } = require('@libsql/client');

async function main() {
  require('dotenv').config({ path: '.env.local' });
  const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL).replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  const queries = [
${alterQueries.map(q => `    \`${q}\``).join(',\n')}
  ];

  for (let q of queries) {
    try {
      await client.execute(q);
      console.log("Success:", q);
    } catch (e) {
      console.log("Failed (might already exist):", q, "->", e.message);
    }
  }
}
main();
`;

fs.writeFileSync('scratch/update-all-missing.js', out);
console.log("Generated scratch/update-all-missing.js with " + alterQueries.length + " missing columns.");
