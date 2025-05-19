import React, { useState, useCallback } from 'react';
import FileInputField from '../common/FileInputField';

interface NFTImageUploaderProps {
  onImageSelected: (file: File) => void;
}

const NFTImageUploader: React.FC<NFTImageUploaderProps> = ({ onImageSelected }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      onImageSelected(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      onImageSelected(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">NFT Image</h3>
      <p className="text-gray-500 mb-3 text-sm">
        Upload an image for your NFT. This will be the visual representation of your land on marketplaces.
      </p>
      
      <FileInputField
        id="nft-image"
        label="NFT Image"
        accept="image/*"
        file={imageFile}
        previewUrl={previewUrl}
        onChange={handleImageChange}
        onDrop={handleDrop}
      />
      
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm mb-2">Image Preview:</p>
          <div className="border rounded-lg overflow-hidden bg-gray-50 p-2 flex justify-center">
            <img 
              src={previewUrl} 
              alt="NFT Preview" 
              className="max-h-64 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTImageUploader; 