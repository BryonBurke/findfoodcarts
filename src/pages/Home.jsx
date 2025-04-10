import { Container, Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Find Food Carts
        </Typography>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate('/map')}
        >
          Map
        </Button>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate('/map?closest=true')}
        >
          Closest Cart
        </Button>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate('/map?search=true')}
        >
          Search
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 