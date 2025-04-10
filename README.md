# Find Food Carts

A web application for discovering and managing food carts and cart pods in your area.

## Features

- Interactive map showing food cart locations
- User authentication and authorization
- Create, read, update, and delete cart pods and food carts
- Image upload for food cart menus and specials
- Responsive design with Material-UI components

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
- OpenStreetMap API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd findfoodcarts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── context/       # React context providers
  ├── services/      # API services
  ├── utils/         # Utility functions
  ├── assets/        # Static assets
  ├── hooks/         # Custom React hooks
  └── api/           # API routes
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Cart Pods
- GET /api/cartpods - Get all cart pods
- POST /api/cartpods - Create a new cart pod
- GET /api/cartpods/:id - Get a specific cart pod
- PUT /api/cartpods/:id - Update a cart pod
- DELETE /api/cartpods/:id - Delete a cart pod

### Food Carts
- GET /api/foodcarts - Get all food carts
- POST /api/foodcarts - Create a new food cart
- GET /api/foodcarts/:id - Get a specific food cart
- PUT /api/foodcarts/:id - Update a food cart
- DELETE /api/foodcarts/:id - Delete a food cart

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 