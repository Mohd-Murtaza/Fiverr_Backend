# Fiverr_Backend

This repository contains the backend code for a Fiverr-like platform, where users can register, create products, and make payments. Below is a brief overview of the directory structure and how to use this backend.

## Installation

1. Clone the repository:
2. Install dependencies:
3. Set up environment variables:
Create a `.env` file in the root directory and add the following variables:
4. Start the server:


## Routes

### User Routes

- `POST /user/signup`: Register a new user.
- `POST /user/login`: Log in an existing user.
- `POST /user/reset`: Reset user password.
- `POST /user/otpRequest`: Request OTP for password reset.
- `POST /user/otpVerify`: Verify OTP for password reset.
- `POST /user/forget`: Forget password and reset.
- `POST /user/logout`: Log out the current user.

### Product Routes

- `GET /product/all`: Get all products.
- `POST /product/create`: Create a new product.
- `GET /product/:id`: Get details of a specific product.
- `PUT /product/:id/update`: Update a product.
- `DELETE /product/:id/delete`: Delete a product.

### Payment Routes

- `POST /payment/checkout`: Process payment for a product.

## Middlewares

- `cors`: Allows cross-origin resource sharing with specified origins.
- `morgan`: HTTP request logger middleware.
- `express.json()`: Parses incoming request bodies in JSON format.
- `cookieParser`: Parses cookies attached to the client request.

## Error Handling
 
- 400: Bad request, typically due to invalid input.
- 401: Unauthorized, typically due to invalid credentials.
- 404: Not found, typically when a requested resource does not exist./Invalid request route.
- 500: Internal server error.

## Database Connection

The server connects to the database upon startup. Ensure that your database credentials are correctly configured in the `.env` file.

## Let's see all routes in details one by one ##

# ==> User Routes <== #

These endpoints for user authentication, password management, and OTP verification. You can integrate these endpoints into your application to handle user authentication and password management.

## Endpoints

### Signup

- **Endpoint**: `POST /signup`
- **Description**: Register a new user.
- **Request Body**:
  - `userName`: User's name.
  - `email`: User's email.
  - `password`: User's password.
- **Response**:
  - Success: Status 200 with a success message and user details.
  - Failure: Status 400 with an error message.

### Login

- **Endpoint**: `POST /login`
- **Description**: Authenticate a user and generate access and refresh tokens.
- **Request Body**:
  - `email`: User's email.
  - `password`: User's password.
- **Response**:
  - Success: Status 200 with access and refresh tokens.
  - Failure: Status 404 if user not found, 401 if invalid password, or 500 for internal server error.

### Reset Password

- **Endpoint**: `POST /reset`
- **Description**: Reset user password.
- **Request Body**:
  - `oldPassword`: User's old password.
  - `newPassword`: User's new password.
  - `email`: User's email.
- **Response**:
  - Success: Status 201 with a success message.
  - Failure: Status 400 with an error message.

### Request OTP

- **Endpoint**: `POST /otpRequest`
- **Description**: Request OTP for password reset.
- **Request Body**:
  - `email`: User's email.
- **Response**:
  - Success: Status 201 with a success message.
  - Failure: Status 400 with an error message.

### Verify OTP

- **Endpoint**: `POST /otpVerify`
- **Description**: Verify OTP for password reset.
- **Request Body**:
  - `otp`: OTP sent to the user's email.
  - `email`: User's email.
- **Response**:
  - Success: Status 201 with a success message.
  - Failure: Status 401 with an error message.

### Forget Password

- **Endpoint**: `POST /forget`
- **Description**: Reset user password using OTP.
- **Request Body**:
  - `newPassword`: User's new password.
  - `email`: User's email.
- **Response**:
  - Success: Status 201 with a success message.
  - Failure: Status 400 with an error message.

### Logout

- **Endpoint**: `POST /logout`
- **Description**: Logout user and invalidate access token.
- **Response**:
  - Success: Status 200 with a success message.
  - Failure: Status 400 with an error message.

# ==> Product Routes <== #

These endpoints for managing products. It includes functionality to retrieve all products and add new products.

## Endpoints

### Get All Products

- **Endpoint**: `GET /allProducts`
- **Description**: Retrieves all products based on optional query parameters.
- **Query Parameters**:
  - Optional parameters to filter products.
- **Response**:
  - Success: Status 200 with a success message and array of products.
  - Failure: Status 500 with an error message.

### Add Product

- **Endpoint**: `POST /add`
- **Description**: Adds a new product to the database.
- **Request Body**:
  - JSON object representing the product to be added.
- **Response**:
  - Success: Status 200 with a success message and details of the added product.
  - Failure: Status 500 with an error message.

## Middlewares

### Authentication Middleware

- **Middleware**: `auth`
- **Description**: Middleware function to authenticate user requests.
- **Usage**: Imported and used in routes that require authentication.

## Models

### Product Model

- **Fields**:
  - `category`: String, required
  - `categoryDesc`: String, required
  - `pTitle`: String, required
  - `pDesc`: String, required
  - `pSubDesc`: String, required
  - `pPrice`: Number, required
  - `pRating`: Number, required
  - `pReview`: String, required
  - `pImage`: String, required
  - `sortBy`: String, required
  - `topRated`: Boolean, required
  - `proService`: Boolean, required
  - `oName`: String, required
  - `oImage`: String, required
  - `oCountry`: String, required
  - `oOrder`: String, required
  - `slider`: Array of objects with `img` and `title` properties

# ==> Payment Routes <== #

These endpoints for handling payments, including creating orders and verifying payments using the Razorpay payment gateway.

## Endpoints

### Checkout

- **Endpoint**: `POST /checkout`
- **Description**: Creates a new order with the specified name and amount.
- **Request Body**:
  - `name`: Name of the product or service.
  - `amount`: Total amount to be paid.
- **Response**:
  - Success: Status 200 with details of the created order.
  - Failure: Status 500 with an error message.

### Payment Verification

- **Endpoint**: `POST /payment-verification`
- **Description**: Verifies the payment signature and updates the order status.
- **Request Body**:
  - `razorpay_payment_id`: ID of the payment.
  - `razorpay_order_id`: ID of the order.
  - `razorpay_signature`: Signature of the payment.
- **Response**:
  - Success: Redirects to a success page with the payment ID.
  - Failure: Redirects to an error page.

## Models

### Order Model

- **Fields**:
  - `name`: String
  - `amount`: Number
  - `order_id`: String
  - `razorpay_payment_id`: String (default: null)
  - `razorpay_order_id`: String (default: null)
  - `razorpay_signature`: String (default: null)
- **Timestamps**: Automatically generated timestamps for creation and update.


# ==> Authentication Middleware

# Authentication Middleware

This middleware provides authentication functionality using JSON Web Tokens (JWT). It verifies access tokens and refresh tokens to authenticate user requests.

### auth

- **Description**: Middleware function to authenticate user requests using JWT.
- **Usage**: Import and use in routes that require authentication.

## Functionality

### Verification of Access Token:

- Verifies the provided access token using the ACCESS_KEY stored in the environment variables.
- If the access token is valid, adds the decoded user information to the request body and proceeds to the next middleware or route handler.
- If the access token is invalid or expired, it checks for a valid refresh token.

### Verification of Refresh Token:

- If the access token is expired, it verifies the provided refresh token using the REFRESH_KEY stored in the environment variables.
- If the refresh token is valid, generates a new access token and sends it in a cookie along with the response.
- If the refresh token is invalid or expired, returns a 401 Unauthorized response.

### Blacklist Check:

- Checks if the provided access token and refresh token are blacklisted.
- If either token is found in the blacklist, it prevents access and prompts the user to log in again.

## Configuration

Ensure that the following environment variables are set:

- `ACCESS_KEY`: Secret key used to sign and verify access tokens.
- `REFRESH_KEY`: Secret key used to sign and verify refresh tokens.

## Dependencies

- `jsonwebtoken`: Used for generating and verifying JWTs.
- `BlacklistModel`: Model for storing blacklisted tokens (not included in this code snippet).
- `dotenv`: Used for loading environment variables from a `.env` file.


## Security Considerations

- Implement data validation and input sanitization to prevent common vulnerabilities.
- Hash user passwords securely before storing them in the database.
- Protect against XSS and CSRF attacks by implementing appropriate measures.
- Consider rate limiting to mitigate brute force and DoS attacks.
- Regularly update dependencies and review code for security vulnerabilities.

## Contributing Guidelines

Contributions to the project are welcome! Please follow these guidelines:
- Fork the repository and create a new branch for your feature or bug fix.
- Ensure your code adheres to the project's coding standards and conventions.
- Write clear commit messages and documentation for your changes.
- Submit a pull request detailing the changes made and the problem solved.

## Testing Instructions

To test the backend functionalities, you can use tools like Postman or write unit tests using testing frameworks like Jest. Ensure thorough testing to validate the correctness and robustness of the codebase.

Feel free to reach out to the maintainers for any questions or assistance.