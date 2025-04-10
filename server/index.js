import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import CartPod from './models/CartPod.js';
import FoodCart from './models/FoodCart.js';
import authRoutes from './routes/auth.js';
import foodCartRoutes from './routes/foodCarts.js';
import cartPodRoutes from './routes/cartPods.js';

// Load environment variables
dotenv.config();
console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'present' : 'missing',
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
});

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/foodcarts', foodCartRoutes);
app.use('/api/cartpods', cartPodRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Food Cart Finder API',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
};

let dbConnected = false;

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('Successfully connected to MongoDB');
    dbConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('MongoDB URI:', process.env.MONGODB_URI);
    dbConnected = false;
    // Retry connection after 5 seconds
    setTimeout(connectToMongoDB, 5000);
  }
};

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  dbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  dbConnected = false;
  connectToMongoDB();
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  dbConnected = true;
});

// Start MongoDB connection
connectToMongoDB();

// FoodCart routes
app.post('/api/foodcarts', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database not connected',
      details: 'Please try again in a few moments'
    });
  }

  try {
    console.log('Received food cart request:', req.body);
    const { name, foodType, cartPod, images } = req.body;

    // Validate required fields
    if (!name || !foodType || !cartPod || !images?.main?.url) {
      console.log('Missing required fields:', { name, foodType, cartPod, images });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the food cart
    const foodCart = new FoodCart({
      name,
      foodType,
      cartPod,
      images
    });

    console.log('Creating food cart:', foodCart);

    // Save the food cart
    const savedFoodCart = await foodCart.save();

    // Add the food cart to the cart pod's foodCarts array
    await CartPod.findByIdAndUpdate(
      cartPod,
      { $push: { foodCarts: savedFoodCart._id } }
    );

    console.log('Successfully created food cart:', savedFoodCart);
    res.status(201).json(savedFoodCart);
  } catch (error) {
    console.error('Error creating food cart:', error);
    res.status(500).json({ 
      error: 'Error creating food cart',
      details: error.message 
    });
  }
});

app.get('/api/foodcarts/:id', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database not connected',
      details: 'Please try again in a few moments'
    });
  }

  try {
    const { id } = req.params;
    const foodCart = await FoodCart.findById(id).populate('cartPod');
    
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }

    res.json(foodCart);
  } catch (error) {
    console.error('Error fetching food cart:', error);
    res.status(500).json({ 
      error: 'Error fetching food cart',
      details: error.message 
    });
  }
});

app.put('/api/foodcarts/:id', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database not connected',
      details: 'Please try again in a few moments'
    });
  }

  try {
    const { id } = req.params;
    const { name, description, cuisine, menu, operatingHours, contactInfo } = req.body;

    // Validate required fields
    if (!name || !description || !cuisine) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const foodCart = await FoodCart.findById(id);
    if (!foodCart) {
      return res.status(404).json({ error: 'Food cart not found' });
    }

    // Update the food cart (location will be preserved)
    foodCart.name = name;
    foodCart.description = description;
    foodCart.cuisine = cuisine;
    if (menu) foodCart.menu = menu;
    if (operatingHours) foodCart.operatingHours = operatingHours;
    if (contactInfo) foodCart.contactInfo = contactInfo;
    foodCart.updatedAt = new Date();

    const updatedFoodCart = await foodCart.save();
    res.json(updatedFoodCart);
  } catch (error) {
    console.error('Error updating food cart:', error);
    res.status(500).json({ 
      error: 'Error updating food cart',
      details: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}); 