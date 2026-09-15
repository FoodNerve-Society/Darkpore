export const normalizeArticleBlocks = (rawBlocks: unknown): any[] => {
  let blocks = rawBlocks;

  if (typeof blocks === 'string') {
    try {
      blocks = JSON.parse(blocks);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    if (!block || typeof block !== 'object') return block;
    const normalizedBlock = block as Record<string, unknown>;
    let content = normalizedBlock.content;

    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch {
        content = {};
      }
    }

    return { ...normalizedBlock, content: content && typeof content === 'object' ? content : {} };
  });
};