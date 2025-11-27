# E-Commerce Backend API

Production-ready e-commerce backend API built with Node.js, Express, and MongoDB, featuring comprehensive payment integration with Paystack.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **User Management** - Complete user CRUD operations
- 📦 **Product Management** - Product catalog with categories and inventory
- 🛒 **Order Management** - Full order lifecycle management
- 💳 **Payment Integration** - Paystack payment gateway integration
- 🔒 **Security** - Helmet, rate limiting, CORS, and input validation
- 📝 **Logging** - Winston logger for production-grade logging
- 📤 **File Upload** - Multer for handling image uploads

## Tech Stack

- **Runtime**: Node.js (>= 18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Payment**: Paystack
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Logging**: Winston, Morgan

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB database
- Paystack account (for payment processing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-backend-1
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see [Environment Variables](#environment-variables))

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm run prod
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Server Configuration
```env
NODE_ENV=development
PORT=5500
```

### Database
```env
MONGODB_URI=your_mongodb_connection_string
```

### Authentication
```env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
```

### CORS
```env
CORS_ORIGIN=http://localhost:3000
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Paystack Configuration
```env
# Get these from your Paystack dashboard: https://dashboard.paystack.com/#/settings/developer
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

> **Note**: For production, use live keys (starting with `sk_live_` and `pk_live_`). For testing, use test keys (starting with `sk_test_` and `pk_test_`).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/all/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Payments
- `POST /api/payments/initialize` - Initialize payment for an order
- `GET /api/payments/verify/:reference` - Verify payment status
- `POST /api/payments/webhook` - Paystack webhook endpoint (Public)
- `GET /api/payments/history` - Get user's payment history
- `GET /api/payments/:reference` - Get payment by reference
- `GET /api/payments/admin/all` - Get all payments (Admin)

## Payment Flow

### 1. Initialize Payment
```javascript
POST /api/payments/initialize
{
  "orderId": "order_id_here",
  "email": "customer@example.com",
  "currency": "NGN",
  "callback_url": "https://yoursite.com/payment/callback"
}
```

Response includes `authorizationUrl` - redirect user to this URL to complete payment.

### 2. Customer Completes Payment
User is redirected to Paystack payment page, completes payment, and is redirected back to your `callback_url`.

### 3. Verify Payment
```javascript
GET /api/payments/verify/:reference
```

This verifies the payment with Paystack and updates the order status.

### 4. Webhook (Automatic)
Paystack sends webhook events to `/api/payments/webhook` for real-time payment updates.

## Paystack Setup

1. **Create Account**: Sign up at [Paystack](https://paystack.com)

2. **Get API Keys**:
   - Go to Settings → API Keys & Webhooks
   - Copy your test/live secret key and public key

3. **Setup Webhook**:
   - In Paystack dashboard, go to Settings → API Keys & Webhooks
   - Add webhook URL: `https://your-domain.com/api/payments/webhook`
   - Copy the webhook secret

4. **Test Cards** (for testing):
   - Success: `4084084084084081`
   - Insufficient Funds: `5060666666666666666`
   - Declined: `5143010522339965`

## Security Features

- **Helmet**: Sets security HTTP headers
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi validation for all inputs
- **Password Hashing**: bcryptjs for secure password storage
- **JWT**: Secure token-based authentication
- **Webhook Signature Verification**: Validates Paystack webhooks

## Project Structure

```
ecommerce-backend-1/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic & external services
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation schemas
│   └── server.js        # App entry point
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Error Handling

The API uses a centralized error handling system with custom error classes. All errors are returned in the following format:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

## Logging

Winston logger is configured for:
- Console logging in development
- File logging in production
- HTTP request logging with Morgan

## License

ISC

## Support

For issues and questions:
- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
