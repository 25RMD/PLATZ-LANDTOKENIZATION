import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary
 * @param buffer - File buffer to upload
 * @param fileName - Original filename for reference
 * @param folder - Cloudinary folder to organize uploads (optional)
 * @returns Promise with upload result containing secure_url
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder: string = 'platz-uploads'
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, "")}`, // Remove extension for public_id
        resource_type: 'auto', // Auto-detect file type
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Upload failed - no result received'));
        }
      }
    ).end(buffer);
  });
};

/**
 * Upload a File object to Cloudinary
 * @param file - File object from form upload
 * @param folder - Cloudinary folder to organize uploads (optional)
 * @returns Promise with upload result containing secure_url
 */
export const uploadFileToCloudinary = async (
  file: File,
  folder: string = 'platz-uploads'
): Promise<{ secure_url: string; public_id: string }> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadToCloudinary(buffer, file.name, folder);
};

export default cloudinary; 