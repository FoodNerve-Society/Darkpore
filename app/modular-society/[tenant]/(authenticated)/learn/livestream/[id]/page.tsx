import React from 'react';
import { getLearnContentById } from '@/lib/actions/learn';
import { notFound } from 'next/navigation';
import LivestreamPresentationViewer from './LivestreamPresentationViewer';

export default async function LivestreamPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const content = await getLearnContentById(resolvedParams.id);
  
  if (!content || content.type !== 'livestream') {
    return notFound();
  }

  return <LivestreamPresentationViewer content={content} />;
}
