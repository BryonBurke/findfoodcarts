import { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Input } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import 'leaflet/dist/leaflet.css';

const CartPodNew = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState([45.5231, -122.6765]); // Default to Portland
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [mapImage, setMapImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error('Error getting location:', err);
        }
      );
    }
  }, []);

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleMapImageChange = (e) => {
    setMapImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPosition || !name || !description) {
      setError('Name, description, and selected location are required.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('location', JSON.stringify({ // Send location as JSON string
        type: 'Point',
        coordinates: [selectedPosition[1], selectedPosition[0]] // GeoJSON format: [longitude, latitude]
    }));
    if (mainImage) {
        formData.append('mainImage', mainImage);
    }
    if (mapImage) {
        formData.append('mapImage', mapImage);
    }

    try {
      // Use axiosInstance and send FormData
      const response = await axiosInstance.post('/cartpods', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/cartpod/${response.data._id}`);
    } catch (err) {
      console.error('Error creating cartpod:', err);
      setError(err.response?.data?.message || 'Failed to create cart pod. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New CartPod
        </Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          {/* Main Image Upload */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1">Main Image</Typography>
            <Input 
                type="file"
                onChange={handleMainImageChange}
                fullWidth
                inputProps={{ accept: "image/*" }} // Accept only image files
            />
             {mainImage && <Typography variant="caption">{mainImage.name}</Typography>}
          </Box>

          {/* Map Image Upload */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1">Map Image (Optional)</Typography>
            <Input 
                type="file"
                onChange={handleMapImageChange}
                fullWidth
                inputProps={{ accept: "image/*" }}
            />
            {mapImage && <Typography variant="caption">{mapImage.name}</Typography>}
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Select Location on Map</Typography>
          <Box sx={{ height: '400px', width: '100%', mt: 1, mb: 2, border: '1px solid grey' }}>
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              onClick={(e) => setSelectedPosition([e.latlng.lat, e.latlng.lng])}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedPosition && (
                <Marker position={selectedPosition}>
                  <Popup>Selected Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!selectedPosition}
          >
            Create CartPod
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default CartPodNew; 