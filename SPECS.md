# Food Cart Specifications

## Model Structure
The FoodCart model has exactly these fields and no others:

```javascript
{
  name: String,        // required
  cartPod: ObjectId,   // required, references CartPod
  foodType: String,    // required
  images: {
    main: {
      url: String,
      publicId: String
    },
    menu: {
      url: String,
      publicId: String
    },
    specials: {
      url: String,
      publicId: String
    }
  }
}
```

## Key Points
- NO owner field
- NO timestamps
- NO status field
- NO additional fields beyond those listed above
- Images are optional (can be null)
- All other fields are required

## API Endpoints
All endpoints should only handle these exact fields:
- POST /foodcarts - Create new food cart
- PUT /foodcarts/:id - Update existing food cart
- GET /foodcarts - List all food carts
- GET /foodcarts/:id - Get single food cart
- DELETE /foodcarts/:id - Delete food cart

## Frontend Components
FoodCartNew and FoodCartEdit components should only handle:
- name input
- foodType selection
- cartPod reference (from URL params)
- Three image uploads (main, menu, specials)

# Cart Pod Specifications

## Model Structure
The CartPod model has exactly these fields and no others:

```javascript
{
  name: String,        // required
  description: String, // required
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  images: {
    main: {
      url: String,
      publicId: String
    },
    map: {
      url: String,
      publicId: String
    }
  }
}
```

## Key Points
- NO owner field
- NO timestamps
- NO status field
- NO additional fields beyond those listed above
- Images are optional (can be null)
- Location is required and must be a valid GeoJSON Point
- All other fields are required

## API Endpoints
All endpoints should only handle these exact fields:
- POST /cartpods - Create new cart pod
- PUT /cartpods/:id - Update existing cart pod
- GET /cartpods - List all cart pods
- GET /cartpods/:id - Get single cart pod
- DELETE /cartpods/:id - Delete cart pod

## Frontend Components
CartPodNew and CartPodEdit components should only handle:
- name input
- description input
- location selection (map picker)
- Two image uploads (main, map) 