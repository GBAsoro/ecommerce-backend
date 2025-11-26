# E-Commerce Backend API

A production-ready RESTful API built with Node.js, Express, and MongoDB for e-commerce applications.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: User registration, login, profile management, and role-based access control
- **Product Management**: Full CRUD operations with advanced filtering, sorting, and pagination
- **Category Management**: Product categorization system
- **Order Management**: Complete order lifecycle with payment and delivery tracking
- **Security**: Helmet, rate limiting, CORS, input validation, and password hashing
- **File Uploads**: Image upload support with Multer
- **Logging**: Winston logger with different levels for development and production
- **Error Handling**: Centralized error handling with custom error classes

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-backend-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT access tokens
   - `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens
   - `PORT`: Server port (default: 5000)

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoint documentation.

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints

- **Authentication**: `/api/auth`
  - POST `/register` - Register new user
  - POST `/login` - Login user
  - POST `/logout` - Logout user
  - POST `/refresh-token` - Refresh access token
  - GET `/me` - Get current user

- **Users**: `/api/users`
  - GET `/profile` - Get user profile
  - PUT `/profile` - Update user profile
  - PUT `/change-password` - Change password
  - GET `/` - Get all users (admin only)

- **Products**: `/api/products`
  - GET `/` - Get all products (with filtering, sorting, pagination)
  - GET `/featured` - Get featured products
  - GET `/:id` - Get single product
  - POST `/` - Create product (admin only)
  - PUT `/:id` - Update product (admin only)
  - DELETE `/:id` - Delete product (admin only)

- **Categories**: `/api/categories`
  - GET `/` - Get all categories
  - GET `/:id` - Get single category
  - POST `/` - Create category (admin only)
  - PUT `/:id` - Update category (admin only)
  - DELETE `/:id` - Delete category (admin only)

- **Orders**: `/api/orders`
  - POST `/` - Create order
  - GET `/` - Get user orders
  - GET `/:id` - Get order by ID
  - PUT `/:id/pay` - Update order to paid
  - PUT `/:id/cancel` - Cancel order
  - GET `/all/orders` - Get all orders (admin only)
  - PUT `/:id/status` - Update order status (admin only)

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 🧪 Testing

Test the API using tools like:
- Postman
- Insomnia
- Thunder Client (VS Code extension)
- cURL

## 📁 Project Structure

```
ecommerce-backend-1/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── logger.js        # Winston logger configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Error handling middleware
│   │   ├── validation.js    # Validation middleware
│   │   └── upload.js        # File upload middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── orderRoutes.js
│   ├── utils/
│   │   ├── AppError.js      # Custom error class
│   │   ├── asyncHandler.js  # Async wrapper
│   │   └── apiFeatures.js   # Query features
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── productValidator.js
│   └── server.js            # Main application file
├── uploads/                 # Uploaded files
├── logs/                    # Log files (production)
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Security Features

- **Helmet**: Sets various HTTP headers for security
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation
- **Password Hashing**: Bcrypt with salt rounds
- **JWT**: Secure token-based authentication
- **XSS Protection**: Input sanitization

## 🌟 Advanced Features

### Query Features

Products endpoint supports advanced querying:

**Filtering**
```
GET /api/products?price[gte]=100&price[lte]=500
```

**Sorting**
```
GET /api/products?sort=-price,name
```

**Field Limiting**
```
GET /api/products?fields=name,price,description
```

**Pagination**
```
GET /api/products?page=2&limit=10
```

**Search**
```
GET /api/products?search=laptop
```

## 📝 Environment Variables

See `.env.example` for all available environment variables and their descriptions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

ISC

## 👨‍💻 Author

Your Name

## 🐛 Known Issues

- Email functionality for password reset is not yet implemented (returns token in response)
- File upload paths are relative (consider using cloud storage in production)

## 🔮 Future Enhancements

- Email integration for password reset
- Product reviews and ratings
- Wishlist functionality
- Shopping cart management
- Payment gateway integration (Stripe, PayPal)
- Image optimization and cloud storage
- Comprehensive test suite
- API documentation with Swagger/OpenAPI
