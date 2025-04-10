import mongoose from 'mongoose';

const foodCartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cartPod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CartPod',
    required: true
  },
  foodType: {
    type: String,
    required: true,
    trim: true
  },
  images: {
    main: {
      url: String,
      publicId: String
    },
    menu: {
      url: String,
      publicId: String
    },
    specials: {
      url: String,
      publicId: String
    }
  }
});

const FoodCart = mongoose.model('FoodCart', foodCartSchema);

export default FoodCart; 