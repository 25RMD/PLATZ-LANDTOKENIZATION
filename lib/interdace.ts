import { ReactNode } from "react";

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  owner: {
    name: string;
    avatar: string;
  };
  highestBid: number;
  auctionEnd: string;
  properties: {
    name: string;
    value: string;
  }[];
  history: {
    event: string;
    price: number;
    from: string;
    to: string;
    date: string;
  }[];
}

export interface Collection {
  id: string;
  name: string;
  creator: string;
  items: number;
  volume: number;
  floorPrice: number;
  image: string;
  category: string;
  verified: boolean;
}

export interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: (isConnet: boolean) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  isConnect?: boolean;
}
