import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../config/axios';

const FoodCartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foodCart, setFoodCart] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchFoodCart = useCallback(async () => {
    console.log(`FoodCartDetail: Fetching food cart data for ID ${id}...`);
    try {
      const response = await axiosInstance.get(`/foodcarts/${id}`);
      // Log the raw response data
      console.log('FoodCartDetail: Received raw response data:', JSON.stringify(response.data, null, 2)); 
      // Log specifically the images part
      console.log('FoodCartDetail: Received images:', JSON.stringify(response.data?.images, null, 2)); 
      setFoodCart(response.data);
    } catch (error) {
      console.error('FoodCartDetail: Error fetching food cart:', error);
      setFoodCart(null); // Clear state on error
    }
  }, [id]);

  useEffect(() => {
    fetchFoodCart();

    const handleFocus = () => {
      console.log('Window focused, re-fetching data...');
      fetchFoodCart();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchFoodCart]);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/foodcarts/${id}`);
      navigate(`/cartpod/${foodCart.cartPod}`);
    } catch (error) {
      console.error('Error deleting food cart:', error);
    }
  };

  if (!foodCart) return <div>Loading...</div>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/cartpod/${foodCart.cartPod?._id || foodCart.cartPod}`)}
            sx={{ mr: 2 }}
          >
            Back to Cart Pod
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {foodCart.name}
          </Typography>
          <Box>
            <IconButton onClick={() => navigate(`/foodcart/${id}/edit`)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom>
          Type: {foodCart.foodType}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Main Image
              </Typography>
              {foodCart.images?.main?.url || foodCart.image ? (
                <img
                  src={foodCart.images?.main?.url || foodCart.image}
                  alt="Main"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                  onError={(e) => {
                    console.error('Error loading main image:', e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Typography>No main image available</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Menu
              </Typography>
              {foodCart.images?.menu?.url || (Array.isArray(foodCart.menuImages) && foodCart.menuImages[0]) || foodCart.menuImages ? (
                <img
                  src={foodCart.images?.menu?.url || (Array.isArray(foodCart.menuImages) ? foodCart.menuImages[0] : foodCart.menuImages)}
                  alt="Menu"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                  onError={(e) => {
                    console.error('Error loading menu image:', e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Typography>No menu image available</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Specials
              </Typography>
              {foodCart.images?.specials?.url || (Array.isArray(foodCart.specialsImages) && foodCart.specialsImages[0]) || foodCart.specialsImages ? (
                <img
                  src={foodCart.images?.specials?.url || (Array.isArray(foodCart.specialsImages) ? foodCart.specialsImages[0] : foodCart.specialsImages)}
                  alt="Specials"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                  onError={(e) => {
                    console.error('Error loading specials image:', e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Typography>No specials image available</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Food Cart</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this food cart?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default FoodCartDetail;