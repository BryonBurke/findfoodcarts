import express from 'express';
import CartPod from '../models/CartPod.js';
import FoodCart from '../models/FoodCart.js'; // Needed for deleting associated food carts
import auth from '../middleware/auth.js'; // Assuming authentication is needed for some routes
import { cloudinary, uploadCartPodImages } from '../middleware/upload.js'; // Import upload middleware and cloudinary instance

const router = express.Router();

// Helper function to delete images from Cloudinary
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
    // Decide if you want to throw the error or just log it
  }
};

// GET all active cart pods
router.get('/', async (req, res) => {
  try {
    // Optionally filter for active pods if there's an 'isActive' field, or just get all
    const cartPods = await CartPod.find().sort({ createdAt: -1 }); // Sort by creation date
    // Log the data before sending
    console.log(`[GET /api/cartpods] Data found:`, JSON.stringify(cartPods, null, 2)); 
    res.json(cartPods);
  } catch (error) {
    console.error('[GET /api/cartpods] Error fetching cart pods:', error); // Enhanced log
    res.status(500).json({ message: 'Server error fetching cart pods' });
  }
});

// GET a single cart pod by ID and populate its food carts
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching cart pod ${req.params.id} and populating food carts...`);
    const cartPod = await CartPod.findById(req.params.id)
                                 .populate({
                                    path: 'foodCarts', 
                                    select: '_id name foodType images.main.url'
                                 });

    if (!cartPod) {
      console.log(`Cart pod ${req.params.id} not found.`);
      return res.status(404).json({ message: 'Cart pod not found' });
    }
    
    console.log('Populated Cart Pod data:', JSON.stringify(cartPod, null, 2)); // Log the result
    res.json(cartPod);
    
  } catch (error) {
    console.error('Error fetching single cart pod with population:', error);
     if (error.kind === 'ObjectId') {
         return res.status(404).json({ message: 'Cart pod not found (invalid ID format)' });
     }
    res.status(500).json({ message: 'Server error fetching cart pod' });
  }
});

// POST - Create a new cart pod (requires auth, handles image uploads)
router.post('/', auth, uploadCartPodImages, async (req, res) => {
  try {
    // Extract data from request body
    const { name, description, location } = req.body; 
    const owner = req.user._id;

    // Basic validation (Location might be stringified if sent via FormData)
    let parsedLocation;
    try {
      parsedLocation = JSON.parse(location); 
    } catch (e) {
      return res.status(400).json({ message: 'Invalid location format. It should be a JSON string.' });
    }

    if (!name || !description || !parsedLocation || !parsedLocation.coordinates || parsedLocation.coordinates.length !== 2) {
      // Clean up uploaded files if validation fails
      if (req.files?.mainImage?.[0]) await deleteCloudinaryImage(req.files.mainImage[0].filename); 
      if (req.files?.mapImage?.[0]) await deleteCloudinaryImage(req.files.mapImage[0].filename);
      return res.status(400).json({ message: 'Name, description, and valid location (GeoJSON Point as JSON string) are required' });
    }

    // Prepare image data from uploaded files
    const images = {};
    if (req.files?.mainImage?.[0]) {
      images.main = { url: req.files.mainImage[0].path, publicId: req.files.mainImage[0].filename };
    }
    if (req.files?.mapImage?.[0]) {
      images.map = { url: req.files.mapImage[0].path, publicId: req.files.mapImage[0].filename };
    }

    const newCartPod = new CartPod({
      name,
      description, // Add description
      location: {
        type: 'Point',
        coordinates: [parsedLocation.coordinates[0], parsedLocation.coordinates[1]] // Ensure correct order [lng, lat]
      },
      images, // Add image data
      owner // Associate with the logged-in user
    });

    const savedCartPod = await newCartPod.save();
    res.status(201).json(savedCartPod);

  } catch (error) {
    console.error('Error creating cart pod:', error);
    // Clean up uploaded files if error occurs after upload but before save
    if (req.files?.mainImage?.[0]) await deleteCloudinaryImage(req.files.mainImage[0].filename);
    if (req.files?.mapImage?.[0]) await deleteCloudinaryImage(req.files.mapImage[0].filename);

    if (error.name === 'ValidationError') {
       return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
     if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${error.message}` });
    }
    if (error.message.includes('Invalid file type')) { // From our fileFilter
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating cart pod' });
  }
});

// PUT - Update a cart pod (requires auth and ownership, handles image uploads)
router.put('/:id', auth, uploadCartPodImages, async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const cartPodId = req.params.id;
    const owner = req.user._id;

    const cartPod = await CartPod.findById(cartPodId);

    if (!cartPod) {
      // Clean up newly uploaded files if cart pod not found
      if (req.files?.mainImage?.[0]) await deleteCloudinaryImage(req.files.mainImage[0].filename);
      if (req.files?.mapImage?.[0]) await deleteCloudinaryImage(req.files.mapImage[0].filename);
      return res.status(404).json({ message: 'Cart pod not found' });
    }

    // Check ownership
    if (cartPod.owner.toString() !== owner.toString()) {
        // Clean up newly uploaded files if user not authorized
        if (req.files?.mainImage?.[0]) await deleteCloudinaryImage(req.files.mainImage[0].filename);
        if (req.files?.mapImage?.[0]) await deleteCloudinaryImage(req.files.mapImage[0].filename);
        return res.status(403).json({ message: 'User not authorized to update this cart pod' });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    
    // Handle location update (assuming it comes as JSON string)
    if (location) {
        let parsedLocation;
        try {
            parsedLocation = JSON.parse(location);
            if (parsedLocation.coordinates && parsedLocation.coordinates.length === 2) {
                updateData.location = {
                    type: 'Point',
                    coordinates: [parsedLocation.coordinates[0], parsedLocation.coordinates[1]]
                };
            } else {
                throw new Error('Invalid coordinates');
            }
        } catch (e) {
            // Clean up newly uploaded files if location format is invalid
            if (req.files?.mainImage?.[0]) await deleteCloudinaryImage(req.files.mainImage[0].filename);
            if (req.files?.mapImage?.[0]) await deleteCloudinaryImage(req.files.mapImage[0].filename);
            return res.status(400).json({ message: 'Invalid location format provided for update. It should be a JSON string.' });
        }
    }

    // Handle image updates
    const oldImages = { ...cartPod.images }; // Copy old image data
    updateData.images = { ...cartPod.images }; // Start with existing images

    if (req.files?.mainImage?.[0]) {
      // Delete old main image if it exists
      await deleteCloudinaryImage(oldImages.main?.publicId);
      // Update with new main image
      updateData.images.main = { url: req.files.mainImage[0].path, publicId: req.files.mainImage[0].filename };
    }
    if (req.files?.mapImage?.[0]) {
      // Delete old map image if it exists
      await deleteCloudinaryImage(oldImages.map?.publicId);
      // Update with new map image
      updateData.images.map = { url: req.files.mapImage[0].path, publicId: req.files.mapImage[0].filename };
    }

    if (Object.keys(updateData).length === 0 && !req.files?.mainImage && !req.files?.mapImage) {
         return res.status(400).json({ message: 'No update data provided' });
     }

    const updatedCartPod = await CartPod.findByIdAndUpdate(
      cartPodId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedCartPod);

  } catch (error) {
    console.error('Error updating cart pod:', error);
     // Clean up any newly uploaded files if an error occurred during update
    if (req.files?.mainImage?.[0]) await deleteCloudinaryImage(req.files.mainImage[0].filename);
    if (req.files?.mapImage?.[0]) await deleteCloudinaryImage(req.files.mapImage[0].filename);

    if (error.name === 'ValidationError') {
       return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
     if (error.kind === 'ObjectId') {
         return res.status(404).json({ message: 'Cart pod not found (invalid ID format)' });
     }
     if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${error.message}` });
     }
     if (error.message.includes('Invalid file type')) {
         return res.status(400).json({ message: error.message });
     }
    res.status(500).json({ message: 'Server error updating cart pod' });
  }
});

// DELETE - Delete a cart pod (requires auth and ownership)
// Also deletes associated food carts AND images
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartPodId = req.params.id;
    const cartPod = await CartPod.findById(cartPodId);

    if (!cartPod) {
      return res.status(404).json({ message: 'Cart pod not found' });
    }

     // Check ownership
     if (cartPod.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to delete this cart pod' });
     }

    // Delete associated images from Cloudinary first
    await deleteCloudinaryImage(cartPod.images?.main?.publicId);
    await deleteCloudinaryImage(cartPod.images?.map?.publicId);

    // Delete associated food carts (Consider if food carts also have images to delete)
    await FoodCart.deleteMany({ cartPod: cartPodId });

    // Delete the cart pod itself
    await CartPod.findByIdAndDelete(cartPodId);

    res.json({ message: 'Cart pod, associated food carts, and images deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart pod:', error);
     if (error.kind === 'ObjectId') {
         return res.status(404).json({ message: 'Cart pod not found (invalid ID format)' });
     }
    res.status(500).json({ message: 'Server error deleting cart pod' });
  }
});


export default router; 