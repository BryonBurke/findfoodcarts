import React, { createContext, useContext } from 'react';
import axios from 'axios';

const CloudinaryContext = createContext();

export const useCloudinary = () => {
  const context = useContext(CloudinaryContext);
  if (!context) {
    throw new Error('useCloudinary must be used within a CloudinaryProvider');
  }
  return context;
};

export const CloudinaryProvider = ({ children }) => {
  const uploadImage = async (file) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      console.log('Cloudinary Config:', {
        cloudName,
        apiKey,
        uploadPreset
      });

      if (!cloudName || !apiKey || !uploadPreset) {
        throw new Error('Missing Cloudinary configuration');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('api_key', apiKey);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };

  const value = {
    uploadImage
  };

  return (
    <CloudinaryContext.Provider value={value}>
      {children}
    </CloudinaryContext.Provider>
  );
};

export default CloudinaryContext; 