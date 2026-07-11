import { createTradeListing } from '../lib/actions/trade';

async function test() {
  const payload = {
    category: 'jobs',
    title: 'Test Job',
    description: 'Test Description',
    priceOrAsk: 'USD  - ',
    location: 'Remote',
    lga: 'Virtual',
    postedById: 'anon',
    status: 'active',
    metadata: {
      jobChallenges: ['challenge1']
    }
  };
  
  const res = await createTradeListing(payload);
  console.log(res);
}

test();
