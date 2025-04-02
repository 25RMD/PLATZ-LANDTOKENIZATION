import AnimatedButton from "@/components/common/AnimatedButton";
import { mockNFTs } from "@/lib/data";
import NFTDetailsPage from "@/mainpages/NFTDetailsPage";
import React from "react";

const NFTDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const nft = mockNFTs.find((item) => item.id == id);

  return <NFTDetailsPage nft={nft} />;
};

export default NFTDetails;
