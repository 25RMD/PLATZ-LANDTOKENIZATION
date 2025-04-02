"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/common/AnimatedButton";

const CreateNFTPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setIsUploading(true);

    try {
      setTimeout(() => {
        console.log("NFT created:", formData);
        setIsUploading(false);
        alert("NFT created successfully");
        setFormData({
          name: "",
          description: "",
          price: "",
          image: null,
        });
        setPreview("");
      }, 2000);
    } catch (error) {
      setIsUploading(false);
      console.log(error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-white mb-8">Create New NFT</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Upload Media
          </h2>

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
                  PNG, GIF, WEBP, MP4 or AVI. Max 100MB.
                </p>
              </div>
            )}
            <label className="mt-4 inline-block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              Choose File
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">NFT Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Price (ETH)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <AnimatedButton
            type="submit"
            disabled={isUploading || !formData.image}
            className="px-8 py-3"
          >
            {isUploading ? (
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
                Creating ...
              </span>
            ) : (
              "Create NFT"
            )}
          </AnimatedButton>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateNFTPage;
