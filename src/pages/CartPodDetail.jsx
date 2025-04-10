import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../config/axios';

const CartPodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartpod, setCartpod] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCartpod = async () => {
      try {
        const response = await axiosInstance.get(`/cartpods/${id}`);
        console.log('Fetched Cart Pod Data:', JSON.stringify(response.data, null, 2));
        setCartpod(response.data);
      } catch (error) {
        console.error('Error fetching cartpod:', error);
      }
    };
    fetchCartpod();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/cartpods/${id}`);
      navigate('/map');
    } catch (error) {
      console.error('Error deleting cartpod:', error);
    }
  };

  if (!cartpod) return <div>Loading...</div>;

  console.log('Rendering foodCarts:', cartpod.foodCarts);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {cartpod.name}
          </Typography>
          <Box>
            <IconButton onClick={() => navigate(`/cartpod/${id}/edit`)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)}>
              <DeleteIcon />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/foodcart/new/${id}`)}
            >
              New Food Cart
            </Button>
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {cartpod.description}
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Food Carts
        </Typography>
        <Grid container spacing={3}>
          {cartpod.foodCarts?.length > 0 ? (
            cartpod.foodCarts.map((foodCart, index) => {
              console.log(`Mapping item index: ${index}, id: ${foodCart?._id}, name: ${foodCart?.name}, image: ${foodCart?.images?.main?.url}`);
              if (!foodCart || !foodCart._id) {
                  console.warn(`FoodCart at index ${index} is missing or has no _id:`, foodCart);
                  return null;
              }
              return (
                <Grid item key={foodCart._id} xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => navigate(`/foodcart/${foodCart._id}`)} sx={{ flexGrow: 1 }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={foodCart.images?.main?.url || 'https://via.placeholder.com/150?text=No+Image'}
                        alt={foodCart.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {foodCart.name || 'Unnamed Cart'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {foodCart.foodType || 'Unknown Type'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })
          ) : (
             <Grid item xs={12}>
                <Typography sx={{ mt: 2 }}>No food carts found for this pod yet.</Typography>
             </Grid>
          )}
        </Grid>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete CartPod</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this CartPod and all its Food Carts?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CartPodDetail; 