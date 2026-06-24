// @ts-nocheck
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ArticleReader } from "@/components/learn/ArticleReader";

export default function ArticleReaderPageWrapper() {
  const params = useParams();
  const slug = params?.slug as string;

  return <ArticleReader slug={slug} />;
}
