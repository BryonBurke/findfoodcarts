import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import axios from 'axios';

const CartPodEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ type: 'Point', coordinates: [0, 0] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCartpod = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/cartpods/${id}`);
        const { name, description, location } = response.data;
        setName(name);
        setDescription(description);
        setLocation(location);
      } catch (error) {
        console.error('Error fetching cartpod:', error);
        setError('Failed to load cart pod data');
      }
    };
    fetchCartpod();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put(`http://localhost:3000/api/cartpods/${id}`, {
        name,
        description,
        location
      });
      navigate(`/cartpod/${id}`);
    } catch (error) {
      console.error('Error updating cartpod:', error);
      setError(error.response?.data?.error || 'Failed to update cart pod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit CartPod
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
            disabled={loading}
          />
          <Box sx={{ mt: 2 }}>
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
              onClick={() => navigate(`/cartpod/${id}`)}
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

export default CartPodEdit; 