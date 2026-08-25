export type ClipScope = 'global' | 'commodity_category' | 'article' | 'block';

export interface ClipAttachment {
  scope: ClipScope;
  commodity?: string;
  category?: string;
  articleId?: string;
  blockRole?: string;
  blockId?: string;
}

export interface ClipNote {
  id: string;
  tenantId?: string;
  authorId?: string;
  title?: string;
  content: string;
  attachments: ClipAttachment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClipFilterOptions {
  scope?: ClipScope | 'all';
  commodity?: string;
  category?: string;
  articleId?: string;
  blockRole?: string;
  searchQuery?: string;
  tag?: string;
}
