import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Input
} from '@mui/material';
import axiosInstance from '../config/axios';

const CartPodEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ type: 'Point', coordinates: [0, 0] });
  const [currentMainImageUrl, setCurrentMainImageUrl] = useState('');
  const [currentMapImageUrl, setCurrentMapImageUrl] = useState('');
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mapImageFile, setMapImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartpod = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`/cartpods/${id}`);
        const { name, description, location, images } = response.data;
        setName(name);
        setDescription(description);
        setLocation(location);
        setCurrentMainImageUrl(images?.main?.url || '');
        setCurrentMapImageUrl(images?.map?.url || '');
      } catch (err) {
        console.error('Error fetching cartpod:', err);
        setError(err.response?.data?.message || 'Failed to load cart pod data');
      } finally {
        setLoading(false);
      }
    };
    fetchCartpod();
  }, [id]);

  const handleMainImageChange = (e) => {
    setMainImageFile(e.target.files[0]);
    if (e.target.files[0]) {
      setCurrentMainImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleMapImageChange = (e) => {
    setMapImageFile(e.target.files[0]);
    if (e.target.files[0]) {
      setCurrentMapImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (mainImageFile) {
      formData.append('mainImage', mainImageFile);
    }
    if (mapImageFile) {
      formData.append('mapImage', mapImageFile);
    }

    try {
      await axiosInstance.put(`/cartpods/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/cartpod/${id}`);
    } catch (err) {
      console.error('Error updating cartpod:', err);
      setError(err.response?.data?.message || 'Failed to update cart pod');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) {
    return <Container><Typography sx={{ mt: 4 }}>Loading cart pod data...</Typography></Container>;
  }

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

          <Box sx={{ mt: 2, mb: 1, border: '1px dashed grey', p: 2 }}>
            <Typography variant="subtitle1">Main Image</Typography>
            {currentMainImageUrl && (
                <Box sx={{ my: 1 }}>
                    <img src={currentMainImageUrl} alt="Current Main" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </Box>
            )}
            <Input 
                type="file"
                onChange={handleMainImageChange}
                fullWidth
                inputProps={{ accept: "image/*" }} 
                disabled={loading}
            />
             {mainImageFile && <Typography variant="caption">New file selected: {mainImageFile.name}</Typography>}
          </Box>

          <Box sx={{ mt: 2, mb: 2, border: '1px dashed grey', p: 2 }}>
            <Typography variant="subtitle1">Map Image</Typography>
            {currentMapImageUrl && (
                <Box sx={{ my: 1 }}>
                    <img src={currentMapImageUrl} alt="Current Map" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </Box>
            )}
            <Input 
                type="file"
                onChange={handleMapImageChange}
                fullWidth
                inputProps={{ accept: "image/*" }}
                disabled={loading}
            />
            {mapImageFile && <Typography variant="caption">New file selected: {mapImageFile.name}</Typography>}
          </Box>

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