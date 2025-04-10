import mongoose from 'mongoose';

const cartPodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  foodCarts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCart'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geospatial queries
cartPodSchema.index({ location: '2dsphere' });

const CartPod = mongoose.model('CartPod', cartPodSchema);

export default CartPod; 