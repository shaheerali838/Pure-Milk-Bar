import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME) &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Uploads a base64 data URL, remote image URL, or buffer to Cloudinary
 * Automatically optimizes format (WebP/AVIF) and compresses quality
 * @param {string} fileData - Base64 Data URI or image file path / URL
 * @param {string} folder - Destination Cloudinary folder
 * @returns {Promise<string>} Secure HTTPS Cloudinary URL (or original if not configured)
 */
export const uploadToCloudinary = async (fileData, folder = 'puremilkbar/uploads') => {
  if (!fileData) return null;

  // If already a remote Cloudinary URL or http URL, return directly
  if (typeof fileData === 'string' && (fileData.startsWith('http://') || fileData.startsWith('https://'))) {
    return fileData;
  }

  // If Cloudinary keys are not configured yet, fallback gracefully to stored string (e.g. data URI)
  if (!isCloudinaryConfigured()) {
    console.warn('[Cloudinary Warning]: Cloudinary credentials not configured in .env. Falling back to local data URI.');
    return fileData;
  }

  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
    console.log(`[Cloudinary Success] Uploaded image to folder '${folder}': ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message);
    // Graceful fallback if upload fails
    return fileData;
  }
};

/**
 * Delete an image from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary Delete Error]:', error.message);
  }
};

export default cloudinary;
