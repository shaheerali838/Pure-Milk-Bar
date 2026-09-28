import { uploadToCloudinary, isCloudinaryConfigured } from '../../../config/cloudinary.js';

export const uploadImage = async (req, res, next) => {
  try {
    let fileSource;
    const folder = req.body.folder || 'puremilkbar/uploads';

    if (req.file) {
      fileSource = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.image) {
      fileSource = req.body.image;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image file or base64 image data provided in request',
      });
    }

    const secureUrl = await uploadToCloudinary(fileSource, folder);

    return res.status(200).json({
      success: true,
      message: isCloudinaryConfigured() 
        ? 'Image processed and uploaded to Cloudinary successfully' 
        : 'Image received and processed (local fallback)',
      data: {
        url: secureUrl,
        cloudinaryActive: isCloudinaryConfigured(),
      },
    });
  } catch (error) {
    next(error);
  }
};
