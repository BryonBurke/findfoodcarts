import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Map from './pages/Map';
import CartPodNew from './pages/CartPodNew';
import CartPodDetail from './pages/CartPodDetail';
import CartPodEdit from './pages/CartPodEdit';
import FoodCartNew from './pages/FoodCartNew';
import FoodCartEdit from './pages/FoodCartEdit';
import FoodCartDetail from './pages/FoodCartDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import { CloudinaryProvider } from './contexts/CloudinaryContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <CloudinaryProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router future={{ v7_startTransition: true }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cartpod/:id" element={<CartPodDetail />} />
              <Route path="/foodcart/:id" element={<FoodCartDetail />} />
              
              {/* Protected Routes */}
              <Route
                path="/cartpod/new"
                element={
                  <ProtectedRoute>
                    <CartPodNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cartpod/:id/edit"
                element={
                  <ProtectedRoute>
                    <CartPodEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/foodcart/new/:cartPodId"
                element={
                  <ProtectedRoute>
                    <FoodCartNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/foodcart/:id/edit"
                element={
                  <ProtectedRoute>
                    <FoodCartEdit />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </Router>
        </ThemeProvider>
      </CloudinaryProvider>
    </AuthProvider>
  );
}

export default App; 