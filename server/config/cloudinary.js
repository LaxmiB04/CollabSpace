import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'collabspace',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'docx', 'txt'],
  },
});

const upload = multer({ storage });

export { cloudinary, upload };