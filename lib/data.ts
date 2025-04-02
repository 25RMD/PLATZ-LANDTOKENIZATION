import { SiOpensea } from "react-icons/si";
import { Collection, NFT } from "./interdace";
import {
  FaCopy,
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa";

export const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "Cosmic Dream #123",
    description: "A beautiful cosmic dream digital artwork",
    image: "/images/nfts1.png",
    price: 0.25,
    creator: {
      name: "Artist1",
      avatar: "/images/avatar1.png",
      verified: true,
    },
    owner: {
      name: "CryptoCollector",
      avatar: "/images/avatar1.png",
    },
    highestBid: 2.1,
    auctionEnd: "2023-12-31T23:59:59",
    properties: [
      { name: "Background", value: "Cosmic" },
      { name: "Elements", value: "Energy" },
      { name: "Rarity", value: "Legendary" },
      { name: "Edition", value: "1 of 1" },
    ],
    history: [
      {
        event: "Sale",
        price: 1.2,
        from: "0x7f...3a4b",
        to: "0x8d...5f2c",
        date: "2023-05-15",
      },
      {
        event: "Mint",
        price: 0,
        from: "",
        to: "0x7f...3a4b",
        date: "2023-04-01",
      },
    ],
  },
  {
    id: "2",
    name: "NFT",
    description: "A beautiful cosmic dream digital artwork",
    image: "/images/nfts2.png",
    price: 0.25,
    creator: {
      name: "Artist1",
      avatar: "/images/avatar2.png",
      verified: true,
    },
    owner: {
      name: "CryptoCollector",
      avatar: "/images/avatar1.png",
    },
    highestBid: 2.1,
    auctionEnd: "2023-12-31T23:59:59",
    properties: [
      { name: "Background", value: "Cosmic" },
      { name: "Elements", value: "Energy" },
      { name: "Rarity", value: "Legendary" },
      { name: "Edition", value: "1 of 1" },
    ],
    history: [
      {
        event: "Sale",
        price: 1.2,
        from: "0x7f...3a4b",
        to: "0x8d...5f2c",
        date: "2023-05-15",
      },
      {
        event: "Mint",
        price: 0,
        from: "",
        to: "0x7f...3a4b",
        date: "2023-04-01",
      },
    ],
  },
  {
    id: "3",
    name: "Cosmic Dream #123",
    description: "A beautiful cosmic dream digital artwork",
    image: "/images/nfts4.png",
    price: 0.25,
    creator: {
      name: "Artist1",
      avatar: "/images/avatar4.png",
      verified: true,
    },
    owner: {
      name: "CryptoCollector",
      avatar: "/images/avatar1.png",
    },
    highestBid: 2.1,
    auctionEnd: "2023-12-31T23:59:59",
    properties: [
      { name: "Background", value: "Cosmic" },
      { name: "Elements", value: "Energy" },
      { name: "Rarity", value: "Legendary" },
      { name: "Edition", value: "1 of 1" },
    ],
    history: [
      {
        event: "Sale",
        price: 1.2,
        from: "0x7f...3a4b",
        to: "0x8d...5f2c",
        date: "2023-05-15",
      },
      {
        event: "Mint",
        price: 0,
        from: "",
        to: "0x7f...3a4b",
        date: "2023-04-01",
      },
    ],
  },
  {
    id: "4",
    name: "Cosmic Dream #123",
    description: "A beautiful cosmic dream digital artwork",
    image: "/images/nfts5.png",
    price: 0.25,
    creator: {
      name: "Artist1",
      avatar: "/images/avatar3.png",
      verified: true,
    },
    owner: {
      name: "CryptoCollector",
      avatar: "/images/avatar1.png",
    },
    highestBid: 2.1,
    auctionEnd: "2023-12-31T23:59:59",
    properties: [
      { name: "Background", value: "Cosmic" },
      { name: "Elements", value: "Energy" },
      { name: "Rarity", value: "Legendary" },
      { name: "Edition", value: "1 of 1" },
    ],
    history: [
      {
        event: "Sale",
        price: 1.2,
        from: "0x7f...3a4b",
        to: "0x8d...5f2c",
        date: "2023-05-15",
      },
      {
        event: "Mint",
        price: 0,
        from: "",
        to: "0x7f...3a4b",
        date: "2023-04-01",
      },
    ],
  },
  {
    id: "5",
    name: "Cosmic Dream #123",
    description: "A beautiful cosmic dream digital artwork",
    image: "/images/nfts5.png",
    price: 0.25,
    creator: {
      name: "Artist1",
      avatar: "/images/avatar2.png",
      verified: true,
    },
    owner: {
      name: "CryptoCollector",
      avatar: "/images/avatar1.png",
    },
    highestBid: 2.1,
    auctionEnd: "2023-12-31T23:59:59",
    properties: [
      { name: "Background", value: "Cosmic" },
      { name: "Elements", value: "Energy" },
      { name: "Rarity", value: "Legendary" },
      { name: "Edition", value: "1 of 1" },
    ],
    history: [
      {
        event: "Sale",
        price: 1.2,
        from: "0x7f...3a4b",
        to: "0x8d...5f2c",
        date: "2023-05-15",
      },
      {
        event: "Mint",
        price: 0,
        from: "",
        to: "0x7f...3a4b",
        date: "2023-04-01",
      },
    ],
  },
  {
    id: "6",
    name: "Cosmic Dream #123",
    description: "A beautiful cosmic dream digital artwork",
    image: "/images/nfts6.png",
    price: 0.25,
    creator: {
      name: "Artist1",
      avatar: "/images/avatar1.png",
      verified: true,
    },
    owner: {
      name: "CryptoCollector",
      avatar: "/images/avatar1.png",
    },
    highestBid: 2.1,
    auctionEnd: "2023-12-31T23:59:59",
    properties: [
      { name: "Background", value: "Cosmic" },
      { name: "Elements", value: "Energy" },
      { name: "Rarity", value: "Legendary" },
      { name: "Edition", value: "1 of 1" },
    ],
    history: [
      {
        event: "Sale",
        price: 1.2,
        from: "0x7f...3a4b",
        to: "0x8d...5f2c",
        date: "2023-05-15",
      },
      {
        event: "Mint",
        price: 0,
        from: "",
        to: "0x7f...3a4b",
        date: "2023-04-01",
      },
    ],
  },
];

export const collections: Collection[] = [
  {
    id: "1",
    name: "CryptoPunks",
    creator: "Larva Labs",
    items: 10000,
    volume: 125000,
    floorPrice: 65.5,
    image: "/images/crypto1.png",
    category: "art",
    verified: true,
  },
  {
    id: "2",
    name: "Bored Ape Yacht",
    creator: "Yuga Labs",
    items: 10000,
    volume: 98500,
    floorPrice: 42.8,
    image: "/images/crypto2.png",
    category: "pfp",
    verified: true,
  },
  {
    id: "3",
    name: "Bored Ape Yacht",
    creator: "Yuga Labs",
    items: 10000,
    volume: 98500,
    floorPrice: 42.8,
    image: "/images/crypto3.png",
    category: "pfp",
    verified: true,
  },
  {
    id: "4",
    name: "Ape",
    creator: "Yuga Labs",
    items: 10000,
    volume: 98500,
    floorPrice: 42.8,
    image: "/images/crypto4.png",
    category: "pfp",
    verified: true,
  },
  {
    id: "5",
    name: "Bored",
    creator: "Yuga Labs",
    items: 10000,
    volume: 98500,
    floorPrice: 42.8,
    image: "/images/crypto5.png",
    category: "pfp",
    verified: true,
  },
];

export const categories = [
  { id: "all", name: "All Categories" },
  { id: "art", name: "Art" },
  { id: "pfp", name: "Profile Pictures" },
  { id: "photography", name: "Photography" },
  { id: "games", name: "Games" },
  { id: "music", name: "Music" },
];

export const sortOptions = [
  { id: "volume", name: "Highest Volume" },
  { id: "floor", name: "Floor Price" },
  { id: "items", name: "Most Items" },
  { id: "newest", name: "Newest" },
];

export const socialLinks = [
  {
    name: "Twitter",
    icon: FaTwitter,
    url: "https://twitter.com",
  },
  {
    name: "Discord",
    icon: FaDiscord,
    url: "https://discord.com",
  },
  {
    name: "GitHub",
    icon: FaGithub,
    url: "https://github.com",
  },
  {
    name: "OpenSea",
    icon: SiOpensea,
    url: "https://opensea.io",
  },
];

export const footerLinks = [
  {
    title: "Marketplace",
    links: [
      { name: "All NFTs", url: "/marketplace" },
      { name: "Art", url: "/marketplace?category=art" },
      { name: "Collectibles", url: "/marketplace?category=collectibles" },
      { name: "Virtual Worlds", url: "/marketplace?category=virtual-worlds" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", url: "/about" },
      { name: "Careers", url: "/careers" },
      { name: "Blog", url: "/blog" },
      { name: "Contact", url: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", url: "/help" },
      { name: "Platform Status", url: "/status" },
      { name: "Partners", url: "/partners" },
      { name: "Gas-Free Marketplace", url: "/gas-free" },
    ],
  },
];

export const navItems = [
  { name: "Explore", path: "/marketplace" },
  { name: "Create", path: "/create" },
  { name: "Collections", path: "/collections" },
];

export const socialShare = [
  { name: "Twitter", icon: FaTwitter },
  { name: "Facebook", icon: FaFacebook },
  { name: "Telegram", icon: FaTelegram },
  { name: "Copy Link", icon: FaCopy },
];
