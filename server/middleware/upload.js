import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use https
});

// Configure Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on fieldname (e.g., 'cartpods/main', 'cartpods/map')
    let folder = 'cartpods/other'; 
    if (file.fieldname === 'mainImage') {
        folder = 'cartpods/main';
    } else if (file.fieldname === 'mapImage') {
        folder = 'cartpods/map';
    }
    
    // Generate a unique public ID (optional, Cloudinary generates one if not provided)
    // const publicId = `${Date.now()}-${file.originalname}`; 

    return {
      folder: folder,
      // public_id: publicId, // Uncomment to use custom public IDs
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // Specify allowed formats
      // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional transformations
    };
  },
});

// Set up Multer middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (e.g., 5MB)
  fileFilter: (req, file, cb) => {
    // Basic check for image mime types
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// Middleware to handle specific fields ('mainImage', 'mapImage')
const uploadCartPodImages = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'mapImage', maxCount: 1 }
]);

export { cloudinary, uploadCartPodImages }; 