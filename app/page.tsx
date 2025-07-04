import HomePage from "@/mainpages/HomePage";
import type { Metadata } from 'next'; // Import Metadata type

// Define metadata for this page
export const metadata: Metadata = {
  title: "Animated NFT marketplace | Home", // More specific title
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)]">
      {/* Head component removed */}
      <HomePage />
    </div>
  );
}
