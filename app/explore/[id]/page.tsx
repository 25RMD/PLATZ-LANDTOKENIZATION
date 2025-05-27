'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import NFTCollectionDetailPage from '@/mainpages/NFTCollectionDetailPage';

const CollectionDetailPage = () => {
  const params = useParams();
  const collectionId = params.id as string;

  return (
    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)]">
      <NFTCollectionDetailPage collectionId={collectionId} />
    </div>
  );
};

export default CollectionDetailPage;
