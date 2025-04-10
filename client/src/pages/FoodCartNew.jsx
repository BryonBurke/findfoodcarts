import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCloudinary } from '../contexts/CloudinaryContext';
import axiosInstance from '../config/axios';
import { toast } from 'react-toastify';

const popularFoodTypes = [
  'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'Italian', 'American',
  'Mediterranean', 'Vietnamese', 'Korean', 'Greek', 'Middle Eastern',
  'Caribbean', 'African', 'French', 'German', 'Spanish', 'Brazilian',
  'Peruvian', 'Ethiopian', 'Lebanese', 'Turkish', 'Russian', 'Polish',
  'Hungarian', 'Cuban', 'Puerto Rican', 'Hawaiian', 'Filipino', 'Malaysian'
];

const FoodCartNew = () => {
  const { cartPodId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadImage } = useCloudinary();
  const [loading, setLoading] = useState(false);
  const [foodCart, setFoodCart] = useState({
    name: '',
    foodType: '',
    cartPod: cartPodId,
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    images: {
      main: { url: '', publicId: '' },
      menu: { url: '', publicId: '' },
      specials: { url: '', publicId: '' }
    }
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to create a food cart');
      navigate('/login');
      return;
    }

    const fetchCartPodLocation = async () => {
      try {
        const response = await axiosInstance.get(`/api/cartpods/${cartPodId}`);
        const { location } = response.data;
        setFoodCart(prev => ({
          ...prev,
          location
        }));
      } catch (error) {
        console.error('Error fetching cart pod location:', error);
        toast.error('Failed to load cart pod location');
      }
    };

    fetchCartPodLocation();
  }, [cartPodId, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFoodCart(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadImage(file);
      setFoodCart(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [imageType]: {
            url: result.url,
            publicId: result.publicId
          }
        }
      }));
      toast.success(`${imageType} image uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${imageType} image`);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodCart.name || !foodCart.foodType || !foodCart.images.main.url) {
      toast.error('Please fill in all required fields and upload a main image');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        name: foodCart.name,
        foodType: foodCart.foodType,
        cartPod: foodCart.cartPod,
        images: foodCart.images
      };
      
      console.log('Submitting food cart:', requestData);
      const response = await axiosInstance.post('/api/foodcarts', requestData);
      console.log('Response:', response.data);
      toast.success('Food cart created successfully');
      navigate(`/cartpods/${cartPodId}`);
    } catch (error) {
      console.error('Error creating food cart:', error);
      console.error('Request payload:', requestData);
      toast.error('Failed to create food cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Food Cart</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={foodCart.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type of Food</label>
          <select
            name="foodType"
            value={foodCart.foodType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select a food type</option>
            {popularFoodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'main')}
              className="mt-1 block w-full"
              required
            />
            {foodCart.images.main.url && (
              <div className="mt-2">
                <img
                  src={foodCart.images.main.url}
                  alt="Main"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Menu Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'menu')}
                className="mt-1 block w-full"
              />
              {foodCart.images.menu.url && (
                <div className="mt-2">
                  <img
                    src={foodCart.images.menu.url}
                    alt="Menu"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Specials Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'specials')}
                className="mt-1 block w-full"
              />
              {foodCart.images.specials.url && (
                <div className="mt-2">
                  <img
                    src={foodCart.images.specials.url}
                    alt="Specials"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/cartpods/${cartPodId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Creating...' : 'Create Food Cart'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodCartNew; 