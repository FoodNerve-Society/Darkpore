import { getLearnContent } from './lib/db/society';

async function main() {
  try {
    const content = await getLearnContent();
    console.log(`Successfully fetched ${content.length} items`);
    const article = content.find(c => c.type === 'article' || c.swimlane === 'articles');
    if (article) {
      console.log('Article found. Block count:', article.articleBlocks?.length);
      console.log('Sample block:', article.articleBlocks[0]);
    }
  } catch (err) {
    console.error('ERROR in getLearnContent:');
    console.error(err);
  }
}
main();
