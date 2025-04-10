import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCloudinary } from "../contexts/CloudinaryContext";
import axiosInstance from "../config/axios";
import { toast } from "react-toastify";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  IconButton
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

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
  const { user, loading: authLoading } = useAuth();
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

  const mainFileInputRef = useRef(null);
  const menuFileInputRef = useRef(null);
  const specialsFileInputRef = useRef(null);
  const mainCameraInputRef = useRef(null);
  const menuCameraInputRef = useRef(null);
  const specialsCameraInputRef = useRef(null);

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
    e.target.value = null;
  };

  const handleButtonClick = (ref) => {
    ref.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a food cart.");
      return;
    }
    setLoading(true);
    
    try {
      const images = {};
      if (mainImage) {
        const result = await uploadImage(mainImage);
        images.main = { url: result.url, publicId: result.publicId };
      } else {
        toast.error("Main image is required.");
        setLoading(false);
        return;
      }
      if (menuImage) {
        const result = await uploadImage(menuImage);
        images.menu = { url: result.url, publicId: result.publicId };
      }
      if (specialsImage) {
        const result = await uploadImage(specialsImage);
        images.specials = { url: result.url, publicId: result.publicId };
      }

      const response = await axiosInstance.post('/foodcarts', {
        name,
        foodType,
        cartPod: cartPodId,
        images,
      });

      toast.success('Food Cart Created!');
      navigate(`/foodcart/${response.data._id}`);
    } catch (error) {
      console.error('Error creating food cart:', error);
      toast.error(error.response?.data?.message || 'Failed to create food cart');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <CircularProgress />;
  }

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
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="food-type-label">Type of Food</InputLabel>
            <Select
              labelId="food-type-label"
              value={foodType}
              label="Type of Food"
              onChange={(e) => setFoodType(e.target.value)}
            >
              {foodTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Main Image*
                </Typography>
                <Box
                  sx={{
                    border: '1px dashed grey',
                    padding: 1,
                    minHeight: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  {previewUrls.main ? (
                    <img
                      src={previewUrls.main}
                      alt="Main preview"
                      style={{ maxWidth: '100%', maxHeight: '150px' }}
                    />
                  ) : (
                    <Typography variant="caption">Preview</Typography>
                  )}
                </Box>
                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, 'main')}
                />
                <input
                  ref={mainCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => handleImageChange(e, 'main')}
                />
                <Button variant="outlined" onClick={() => handleButtonClick(mainFileInputRef)} size="small" sx={{ mr: 1 }}>
                  Choose File
                </Button>
                <IconButton color="primary" onClick={() => handleButtonClick(mainCameraInputRef)} size="small">
                  <PhotoCamera />
                </IconButton>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Menu Image
                </Typography>
                <Box sx={{ border: '1px dashed grey', padding: 1, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {previewUrls.menu ? <img src={previewUrls.menu} alt="Menu preview" style={{ maxWidth: '100%', maxHeight: '150px' }} /> : <Typography variant="caption">Preview</Typography>}
                </Box>
                <input ref={menuFileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, 'menu')} />
                <input ref={menuCameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleImageChange(e, 'menu')} />
                <Button variant="outlined" onClick={() => handleButtonClick(menuFileInputRef)} size="small" sx={{ mr: 1 }}>Choose File</Button>
                <IconButton color="primary" onClick={() => handleButtonClick(menuCameraInputRef)} size="small"><PhotoCamera /></IconButton>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Specials Image
                </Typography>
                <Box sx={{ border: '1px dashed grey', padding: 1, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {previewUrls.specials ? <img src={previewUrls.specials} alt="Specials preview" style={{ maxWidth: '100%', maxHeight: '150px' }} /> : <Typography variant="caption">Preview</Typography>}
                </Box>
                <input ref={specialsFileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, 'specials')} />
                <input ref={specialsCameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleImageChange(e, 'specials')} />
                <Button variant="outlined" onClick={() => handleButtonClick(specialsFileInputRef)} size="small" sx={{ mr: 1 }}>Choose File</Button>
                <IconButton color="primary" onClick={() => handleButtonClick(specialsCameraInputRef)} size="small"><PhotoCamera /></IconButton>
              </Paper>
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || authLoading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Food Cart'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default FoodCartNew; 