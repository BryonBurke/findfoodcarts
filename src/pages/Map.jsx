import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = () => {
  const [position, setPosition] = useState([45.5231, -122.6765]); // Default to Portland
  const [cartPods, setCartPods] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          console.log('Map.jsx: Got user location:', pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.error('Error getting location:', err);
        }
      );
    }

    // Fetch cart pods
    const fetchCartPods = async () => {
      console.log('Map.jsx: Fetching cart pods...');
      try {
        setLoading(true);
        console.log('Map.jsx: Making API request to:', 'api/cartpods'); // Log the exact URL
        const response = await axiosInstance.get('cartpods');
        console.log('Map.jsx: API Response Status:', response.status);
        console.log('Map.jsx: API Response Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Map.jsx: API Response Data:', JSON.stringify(response.data, null, 2)); // Log the raw data

        if (Array.isArray(response.data)) {
          setCartPods(response.data);
          console.log(`Map.jsx: Set cartPods state with ${response.data.length} items.`);
        } else {
          setCartPods([]);
          console.warn('Map.jsx: API response was not an array, setting state to empty.', response.data);
        }
        setError(null);
      } catch (error) {
        console.error('Map.jsx: Error fetching cart pods:', error);
        console.error('Map.jsx: Error details:', {
          message: error.message,
          response: error.response,
          request: error.request ? 'Request made but no response' : 'No request made',
          config: error.config
        });
        setError(`Failed to load cart pods: ${error.message}`);
        setCartPods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartPods();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading cart pods...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {Array.isArray(cartPods) && cartPods.map((pod) => (
          <Marker 
            key={pod._id} 
            position={[pod.location.coordinates[1], pod.location.coordinates[0]]}
          >
            <Popup>
              <div>
                <h3>{pod.name}</h3>
                <p>{pod.description}</p>
                <Button 
                  size="small" 
                  onClick={() => navigate(`/cartpod/${pod._id}`)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => navigate('/cartpod/new')}
      >
        New CartPod
      </Button>
    </Box>
  );
};

export default Map; 