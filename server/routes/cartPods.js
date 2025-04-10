import express from 'express';
import CartPod from '../models/CartPod.js';
import FoodCart from '../models/FoodCart.js'; // Needed for deleting associated food carts
import auth from '../middleware/auth.js'; // Assuming authentication is needed for some routes

const router = express.Router();

// GET all active cart pods
router.get('/', async (req, res) => {
  try {
    // Optionally filter for active pods if there's an 'isActive' field, or just get all
    const cartPods = await CartPod.find().sort({ createdAt: -1 }); // Sort by creation date
    res.json(cartPods);
  } catch (error) {
    console.error('Error fetching cart pods:', error);
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

// POST - Create a new cart pod (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, address } = req.body;

    // Basic validation
    if (!name || !location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Name and valid location (GeoJSON Point) are required' });
    }

    const newCartPod = new CartPod({
      name,
      location: {
        type: 'Point',
        coordinates: [location.coordinates[0], location.coordinates[1]] // Ensure correct order [lng, lat]
      },
      address, // Optional address
      owner: req.user._id // Associate with the logged-in user
    });

    const savedCartPod = await newCartPod.save();

     // Create the geospatial index after saving if it doesn't exist (best practice: ensure index in model or manually)
     // await CartPod.collection.createIndex({ location: '2dsphere' }); // Run once or ensure in model

    res.status(201).json(savedCartPod);
  } catch (error) {
    console.error('Error creating cart pod:', error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error creating cart pod' });
  }
});

// PUT - Update a cart pod (requires auth and ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, location, address } = req.body;
    const cartPodId = req.params.id;

    const cartPod = await CartPod.findById(cartPodId);

    if (!cartPod) {
      return res.status(404).json({ message: 'Cart pod not found' });
    }

    // Check if the logged-in user is the owner
    // Note: Convert ObjectId to string for comparison
    if (cartPod.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to update this cart pod' });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (location && location.coordinates && location.coordinates.length === 2) {
         updateData.location = {
            type: 'Point',
            coordinates: [location.coordinates[0], location.coordinates[1]]
        };
    } else if (location) {
        // Handle case where location is provided but invalid
        return res.status(400).json({ message: 'Invalid location format provided for update' });
    }

     if (Object.keys(updateData).length === 0) {
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
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
     if (error.kind === 'ObjectId') {
         return res.status(404).json({ message: 'Cart pod not found (invalid ID format)' });
     }
    res.status(500).json({ message: 'Server error updating cart pod' });
  }
});

// DELETE - Delete a cart pod (requires auth and ownership)
// Also deletes associated food carts
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

    // Delete associated food carts first
    await FoodCart.deleteMany({ cartPod: cartPodId });

    // Delete the cart pod itself
    await CartPod.findByIdAndDelete(cartPodId);

    res.json({ message: 'Cart pod and associated food carts deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart pod:', error);
     if (error.kind === 'ObjectId') {
         return res.status(404).json({ message: 'Cart pod not found (invalid ID format)' });
     }
    res.status(500).json({ message: 'Server error deleting cart pod' });
  }
});


export default router; 