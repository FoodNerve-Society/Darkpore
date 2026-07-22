import { getPublicUser } from '../lib/actions/users';

async function test() {
  const result = await getPublicUser('adefolami');
  console.log("getPublicUser('adefolami') result:", JSON.stringify(result, null, 2));
}

test();
