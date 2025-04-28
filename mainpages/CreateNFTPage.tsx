"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/common/AnimatedButton";
import { categories } from "@/lib/data"; // Import categories
import { Collection } from "@/lib/interdace"; // Import Collection interface
import { FaUpload, FaChevronDown } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Import ProtectedRoute
import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";

// Actual page component that handles rendering logic
const CreateListingContent = () => {
  const { isVerified } = useAuth(); // Get verification status

  // State for the form
  const [formData, setFormData] = useState({
    name: "",
    creator: "", // TODO: Should probably auto-fill with logged-in user info
    items: "",
    floorPrice: "",
    category: categories[1]?.id || "art",
    imageFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setFile(file);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFormData({ ...formData, imageFile: droppedFile });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.imageFile) {
      alert("Please upload a property image.");
      return;
    }
    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('creator', formData.creator);
    data.append('items', formData.items);
    data.append('floorPrice', formData.floorPrice);
    data.append('category', formData.category);
    data.append('imageFile', formData.imageFile);

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const newListing = await response.json();
      alert(`Property '${newListing.name}' created successfully!`);
      setFormData({ name: "", creator: "", items: "", floorPrice: "", category: categories[1]?.id || "art", imageFile: null });
      setFile(null);
      setPreviewUrl("");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      alert(`Failed to create property: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is authenticated but not verified, show a message
  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 border border-yellow-400 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
        <FiAlertCircle className="mx-auto h-12 w-12 text-yellow-500 dark:text-yellow-400 mb-4" />
        <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Verification Required</h2>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          You must be a verified user to create new property listings.
          Please complete your profile and submit the required KYC information.
        </p>
        <Link href="/profile">
          <AnimatedButton className="bg-yellow-500 hover:bg-yellow-600 text-white dark:text-black dark:bg-yellow-400 dark:hover:bg-yellow-300">
            Go to Profile
          </AnimatedButton>
        </Link>
      </div>
    );
  }

  // Render the actual form if verified
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-8">Create New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* File Upload Section */}
        <div>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
            Upload Property Asset
          </h2>
          <div
            className={`border-2 border-dashed border-black/20 dark:border-white/20 text-center rounded-lg p-8 cursor-pointer hover:border-black/50 dark:hover:border-white/50 transition-colors ${
              previewUrl ? 'border-solid border-black/50 dark:border-white/50' : ''
            }`}
            onClick={() => document.getElementById('fileUpload')?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
            {previewUrl ? (
              <div>
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-4" />
                <p className="text-sm text-text-light dark:text-text-dark opacity-70">Click or drag to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <FaUpload className="mx-auto h-12 w-12 text-text-light dark:text-text-dark opacity-50" />
                <p className="font-semibold text-text-light dark:text-text-dark">Drag & drop image, or click to browse</p>
                <p className="text-text-light dark:text-text-dark opacity-70 text-sm">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Collection Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[ { label: 'Property Name', name: 'name', type: 'text' },
              { label: 'Creator Name', name: 'creator', type: 'text' },
              { label: 'Number of Tokens', name: 'items', type: 'number', min: 1, step: 1 },
              { label: 'Floor Price (SOL)', name: 'floorPrice', type: 'number', min: 0, step: 0.01 },
            ].map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">{field.label}</label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleInputChange}
                    min={field.min}
                    step={field.step}
                  required
                  className="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  />
              </div>
            ))}

            {/* Category Select */}
            <div className="relative">
              <label htmlFor="category" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 appearance-none pr-8 transition-colors"
              >
                {categories.filter(cat => cat.id !== 'all').map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-light dark:text-text-dark opacity-50">
                <FaChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <AnimatedButton type="submit" disabled={isSubmitting} className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Property Listing'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
};

// Wrap the main content with ProtectedRoute
// Note: Renaming CreateCollectionPage to CreateListingPage is recommended
const CreateCollectionPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <CreateListingContent />
    </ProtectedRoute>
  );
};

// Update export name if file is renamed
export default CreateCollectionPage;
