import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material";
import axiosInstance from "../config/axios";
import { useCloudinary } from "../contexts/CloudinaryContext";

const foodTypes = [
  'American', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Thai', 'Indian',
  'Mediterranean', 'Middle Eastern', 'Korean', 'Vietnamese', 'Greek',
  'French', 'Spanish', 'German', 'Brazilian', 'Peruvian', 'Caribbean',
  'African', 'Hawaiian', 'Filipino', 'Malaysian', 'Indonesian', 'Russian',
  'Polish', 'Turkish', 'Lebanese', 'Israeli', 'Ethiopian', 'Moroccan'
];

const FoodCartNew = () => {
  const navigate = useNavigate();
  const { cartPodId } = useParams();
  const { uploadImage } = useCloudinary();
  
  const [name, setName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [menuImage, setMenuImage] = useState(null);
  const [specialsImage, setSpecialsImage] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({
    main: null,
    menu: null,
    specials: null,
  });
  const [loading, setLoading] = useState(false);

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
      // Upload images to Cloudinary
      const [mainImageUrl, menuImageUrl, specialsImageUrl] = await Promise.all([
        mainImage ? uploadImage(mainImage) : null,
        menuImage ? uploadImage(menuImage) : null,
        specialsImage ? uploadImage(specialsImage) : null
      ]);

      // Create food cart with Cloudinary URLs
      const response = await axiosInstance.post('/foodcarts', {
        name,
        foodType,
        cartPod: cartPodId,
        images: {
          main: mainImageUrl ? {
            url: mainImageUrl.url,
            publicId: mainImageUrl.publicId
          } : null,
          menu: menuImageUrl ? {
            url: menuImageUrl.url,
            publicId: menuImageUrl.publicId
          } : null,
          specials: specialsImageUrl ? {
            url: specialsImageUrl.url,
            publicId: specialsImageUrl.publicId
          } : null
        }
      });

      navigate(`/foodcart/${response.data._id}`);
    } catch (error) {
      console.error('Error creating food cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Food Cart
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
            label="Food Type"
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
            <Grid item xs={12} md={4}>
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
                  <img
                    src={previewUrls.main}
                    alt="Main preview"
                    style={{ maxWidth: '100%', marginTop: '10px' }}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
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
                  <img
                    src={previewUrls.menu}
                    alt="Menu preview"
                    style={{ maxWidth: '100%', marginTop: '10px' }}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
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
                  <img
                    src={previewUrls.specials}
                    alt="Specials preview"
                    style={{ maxWidth: '100%', marginTop: '10px' }}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Food Cart'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/cartpod/${cartPodId}`)}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default FoodCartNew; 