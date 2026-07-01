// @ts-nocheck
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ArticleReader } from "@/components/learn/ArticleReader";
import { Box, Paper } from "@mui/material";

export default function ArticleReaderPageWrapper() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <Box sx={{ p: { xs: 0, md: 2, lg: 3 }, minHeight: '100vh' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 0, md: 3 }, 
          borderRadius: { xs: 0, md: 4 }, 
          minHeight: "100vh", 
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <ArticleReader slug={slug} />
      </Paper>
    </Box>
  );
}
