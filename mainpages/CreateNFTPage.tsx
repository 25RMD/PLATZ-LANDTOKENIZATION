"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/common/AnimatedButton";
import { categories } from "@/lib/data"; // Import categories
import { Collection } from "@/lib/interdace"; // Import Collection interface

// Rename component
const CreateCollectionPage = () => {
  // Update state to match Collection fields (excluding id, volume, verified, image string initially)
  const [formData, setFormData] = useState({
    name: "",
    creator: "",
    items: "",
    floorPrice: "",
    category: categories[1]?.id || "art", // Default to the first category after 'all'
    imageFile: null as File | null, // Store the file object
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string>(""); // Keep preview URL state

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      // Revoke previous object URL to prevent memory leaks
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Rename submit handler
  const handleCreateCollection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.imageFile) {
      alert("Please upload a collection image.");
      return;
    }
    setIsSubmitting(true);

    // Create FormData object to send file and text data
    const data = new FormData();
    data.append('name', formData.name);
    data.append('creator', formData.creator);
    data.append('items', formData.items);
    data.append('floorPrice', formData.floorPrice);
    data.append('category', formData.category);
    data.append('imageFile', formData.imageFile); // Append the file object

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        body: data, // Send FormData object
      });

      if (!response.ok) {
        // Attempt to read error message from response body
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON errors
        console.error("API Error Response:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newCollection = await response.json();
      console.log("Collection Created via API:", newCollection);
      alert(`Collection '${newCollection.name}' created successfully!`);

      // Reset form
      setFormData({
        name: "",
        creator: "",
        items: "",
        floorPrice: "",
        category: categories[1]?.id || "art",
        imageFile: null,
      });
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview("");

    } catch (error: any) {
      console.error("Error creating collection:", error);
      alert(`Failed to create collection: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* Update title */}
      <h1 className="text-3xl font-bold text-white mb-8">Create New Collection</h1>
      {/* Update form handler */}
      <form className="space-y-6" onSubmit={handleCreateCollection}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          {/* Update section title */}
          <h2 className="text-xl font-semibold text-white mb-4">
            Collection Image
          </h2>
          {/* Image upload section remains similar */}
          <div className="border-2 border-dashed border-gray-700 text-center rounded-lg p-8 cursor-pointer">
            {preview ? (
              <div className="relative h-64 w-full mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <p className="tezxt-gray-400">
                  PNG, GIF, WEBP. Max 100MB.
                </p>
              </div>
            )}
            <label className="mt-4 inline-block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              Choose Image
              <input
                type="file"
                className="hidden"
                accept="image/png, image/gif, image/webp, image/jpeg"
                onChange={handleImageChange}
                required // Make image required for collection
              />
            </label>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          {/* Update section title */}
          <h2 className="text-xl font-semibold text-white mb-4">Collection Details</h2>
          <div className="space-y-4">
            {/* Collection Name */}
            <div>
              <label className="block text-gray-400 mb-2">Collection Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            {/* Creator Name */}
             <div>
              <label className="block text-gray-400 mb-2">Creator Name</label>
              <input
                type="text"
                name="creator"
                value={formData.creator}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            {/* Number of Items */}
             <div>
              <label className="block text-gray-400 mb-2">Number of Items</label>
              <input
                type="number"
                name="items"
                value={formData.items}
                onChange={handleInputChange}
                 min="1"
                step="1"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            {/* Floor Price */}
            <div>
              <label className="block text-gray-400 mb-2">Floor Price (ETH)</label>
              <input
                type="number"
                name="floorPrice" // Changed from 'price'
                value={formData.floorPrice} // Changed from 'price'
                onChange={handleInputChange}
                min="0" // Allow 0 floor price
                step="0.01"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
             {/* Category Dropdown */}
             <div className="relative"> {/* Added relative positioning for the arrow */}
                <label htmlFor="category" className="block text-gray-400 mb-2">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none pr-8"
                  required
                >
                  {categories.filter(cat => cat.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 top-0 pt-7 flex items-center px-2 text-gray-400"> {/* Adjusted arrow positioning */}
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            {/* Removed Description Field */}
          </div>
        </motion.div>

        <div className="flex justify-end">
          {/* Update button text and disabled logic */}
          <AnimatedButton
            type="submit"
            disabled={isSubmitting || !formData.imageFile} // Check for imageFile
            className="px-8 py-3"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Collection...
              </span>
            ) : (
              "Create Collection"
            )}
          </AnimatedButton>
        </div>
      </form>
    </motion.div>
  );
};

// Update export name
export default CreateCollectionPage;
