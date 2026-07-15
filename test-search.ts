import { searchExternalOrganizations } from './lib/actions/trade';

async function main() {
  const result = await searchExternalOrganizations('Mamatee');
  console.log('Result:', result);
}
main().catch(console.error);
