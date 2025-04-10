import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import axiosInstance from '../config/axios';
import { useCloudinary } from '../contexts/CloudinaryContext';

const foodTypes = [
  'American', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Thai', 'Indian',
  'Mediterranean', 'Middle Eastern', 'Korean', 'Vietnamese', 'Greek',
  'French', 'Spanish', 'German', 'Brazilian', 'Peruvian', 'Caribbean',
  'African', 'Hawaiian', 'Filipino', 'Malaysian', 'Indonesian', 'Russian',
  'Polish', 'Turkish', 'Lebanese', 'Israeli', 'Ethiopian', 'Moroccan'
];

const FoodCartEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { uploadImage } = useCloudinary();
  const [name, setName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [cartPod, setCartPod] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [menuImage, setMenuImage] = useState(null);
  const [specialsImage, setSpecialsImage] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({
    main: null,
    menu: null,
    specials: null,
  });
  const [existingImages, setExistingImages] = useState({
    main: null,
    menu: null,
    specials: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoodCart = async () => {
      try {
        const response = await axiosInstance.get(`/foodcarts/${id}`);
        const { name, foodType, cartPod, images } = response.data;
        setName(name);
        setFoodType(foodType);
        setCartPod(cartPod._id || cartPod);
        setPreviewUrls({
          main: images?.main?.url || null,
          menu: images?.menu?.url || null,
          specials: images?.specials?.url || null,
        });
        setExistingImages({
          main: images?.main || null,
          menu: images?.menu || null,
          specials: images?.specials || null,
        });
      } catch (error) {
        console.error('Error fetching food cart:', error);
      }
    };
    fetchFoodCart();
  }, [id]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => ({
          ...prev,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
      
      switch (type) {
        case 'main':
          setMainImage(file);
          break;
        case 'menu':
          setMenuImage(file);
          break;
        case 'specials':
          setSpecialsImage(file);
          break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const images = {};
      
      // Handle main image
      if (mainImage) {
        const result = await uploadImage(mainImage);
        console.log('Main image upload result:', result);
        images.main = {
          url: result.url,
          publicId: result.publicId
        };
      } else if (existingImages.main?.url) {
        console.log('Keeping existing main image:', existingImages.main);
        images.main = existingImages.main;
      }

      // Handle menu image
      if (menuImage) {
        const result = await uploadImage(menuImage);
        console.log('Menu image upload result:', result);
        images.menu = {
          url: result.url,
          publicId: result.publicId
        };
      } else if (existingImages.menu?.url) {
        console.log('Keeping existing menu image:', existingImages.menu);
        images.menu = existingImages.menu;
      }

      // Handle specials image
      if (specialsImage) {
        const result = await uploadImage(specialsImage);
        console.log('Specials image upload result:', result);
        images.specials = {
          url: result.url,
          publicId: result.publicId
        };
      } else if (existingImages.specials?.url) {
        console.log('Keeping existing specials image:', existingImages.specials);
        images.specials = existingImages.specials;
      }

      console.log('Sending update with images:', JSON.stringify(images, null, 2));

      const response = await axiosInstance.put(`/foodcarts/${id}`, {
        name,
        foodType,
        cartPod,
        images
      });

      console.log('Update response:', JSON.stringify(response.data, null, 2));
      
      navigate(`/foodcart/${id}`);
    } catch (error) {
      console.error('Error updating food cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Food Cart
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Type of Food"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            margin="normal"
            required
          >
            {foodTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Main Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'main')}
                />
                {previewUrls.main && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={previewUrls.main}
                      alt="Main preview"
                      style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Menu Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'menu')}
                />
                {previewUrls.menu && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={previewUrls.menu}
                      alt="Menu preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Specials Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'specials')}
                />
                {previewUrls.specials && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={previewUrls.specials}
                      alt="Specials preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/foodcart/${id}`)}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default FoodCartEdit;