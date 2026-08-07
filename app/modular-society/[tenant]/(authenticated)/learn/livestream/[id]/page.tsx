import React from 'react';
import { getLearnContentById } from '@/lib/actions/learn';
import { notFound } from 'next/navigation';
import LivestreamPresentationViewer from './LivestreamPresentationViewer';

export default async function LivestreamPage({ params }: { params: { id: string } }) {
  const content = await getLearnContentById(params.id);
  
  if (!content || content.type !== 'livestream') {
    return notFound();
  }

  return <LivestreamPresentationViewer content={content} />;
}
