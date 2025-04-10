import express from 'express';
import FoodCart from '../models/FoodCart.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create a new food cart
router.post('/', auth, async (req, res) => {
  try {
    const { name, foodType, cartPod, images } = req.body;
    const foodCart = new FoodCart({
      name,
      foodType,
      cartPod,
      images
    });
    await foodCart.save();
    res.status(201).json(foodCart);
  } catch (error) {
    console.error('Error creating food cart:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all food carts
router.get('/', async (req, res) => {
  try {
    const foodCarts = await FoodCart.find()
      .populate('cartPod')
      .sort({ createdAt: -1 });
    res.json(foodCarts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single food cart
router.get('/:id', async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id)
      .populate('cartPod', 'name location');
    if (!foodCart) {
      return res.status(404).json({ message: 'Food cart not found' });
    }
    console.log(`Sending food cart data for ${req.params.id}:`, JSON.stringify(foodCart, null, 2));
    res.json(foodCart);
  } catch (error) {
    console.error('Error fetching single food cart:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Food cart not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error fetching food cart' });
  }
});

// Update a food cart using findByIdAndUpdate (refined $set logic)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, foodType, images } = req.body;
    const foodCartId = req.params.id;
    console.log(`PUT request for foodCartId: ${foodCartId}`);
    console.log('Received update request with data:', JSON.stringify({ name, foodType, images }, null, 2));

    // Initialize an object to hold all updates for the $set operator
    const setUpdates = {};

    // Add direct fields if they exist
    if (name) setUpdates.name = name;
    if (foodType) setUpdates.foodType = foodType;

    // Add image fields using dot notation if they exist
    if (images) {
        if (images.main && images.main.url && images.main.publicId) {
            console.log('Adding main image to $set update:', images.main);
            setUpdates['images.main'] = images.main;
        }
        if (images.menu && images.menu.url && images.menu.publicId) {
            console.log('Adding menu image to $set update:', images.menu);
            setUpdates['images.menu'] = images.menu;
        }
        if (images.specials && images.specials.url && images.specials.publicId) {
            console.log('Adding specials image to $set update:', images.specials);
            setUpdates['images.specials'] = images.specials;
        }
    }

    // Ensure there's something to update
    if (Object.keys(setUpdates).length === 0) {
        // Find the existing cart to return it without making an empty update
        const existingFoodCart = await FoodCart.findById(foodCartId).populate('cartPod');
        if (!existingFoodCart) {
             return res.status(404).json({ message: 'Food cart not found' });
        }
         console.log('No update data provided, returning existing cart.');
        return res.json(existingFoodCart); 
    }

    console.log('Final $set update object:', JSON.stringify({ $set: setUpdates }, null, 2));

    const updatedFoodCart = await FoodCart.findByIdAndUpdate(
      foodCartId,
      { $set: setUpdates }, // Use the constructed $set object directly
      { new: true, runValidators: true, context: 'query' } // Return updated doc, run validators
    ).populate('cartPod');

    if (!updatedFoodCart) {
      console.log(`Food cart with ID ${foodCartId} not found for update.`);
      return res.status(404).json({ message: 'Food cart not found' });
    }

    console.log('Updated food cart after findByIdAndUpdate:', JSON.stringify(updatedFoodCart, null, 2));
    res.json(updatedFoodCart);

  } catch (error) {
    console.error('Error updating food cart:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error during update' });
  }
});

// Delete a food cart
router.delete('/:id', auth, async (req, res) => {
  try {
    const foodCart = await FoodCart.findById(req.params.id);
    if (!foodCart) {
      return res.status(404).json({ message: 'Food cart not found' });
    }

    await foodCart.deleteOne();
    res.json({ message: 'Food cart deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 