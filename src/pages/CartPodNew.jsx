import { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const CartPodNew = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState([45.5231, -122.6765]); // Default to Portland
  const [selectedPosition, setSelectedPosition] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPosition) return;

    try {
      const response = await axios.post('/api/cartpods', {
        name,
        description,
        location: {
          type: 'Point',
          coordinates: [selectedPosition[1], selectedPosition[0]] // GeoJSON format: [longitude, latitude]
        }
      });
      navigate(`/cartpod/${response.data._id}`);
    } catch (error) {
      console.error('Error creating cartpod:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New CartPod
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
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Box sx={{ height: '400px', width: '100%', mt: 2, mb: 2 }}>
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