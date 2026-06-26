# API Documentation

The Palette backend is a REST API. All endpoints are prefixed with `/api`. Protected routes require a JSON Web Token (JWT) sent via the `Authorization: Bearer <token>` header.

---

## Authentication (`/api/auth`)

### 1. Register User
Create a new user account. Returns the signed JWT token.
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `photo` (file, optional, profile avatar)
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "603f90119...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "isVerified": false,
      "photo": "/uploads/profiles/jane-1678.jpg"
    }
  }
  ```

### 2. Verify Email Code
Verify the newly registered user's account using the numeric code sent via email.
- **URL**: `/api/auth/verify-code`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "code": "482019"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Email verified successfully."
  }
  ```

### 3. Login User
Authenticate an existing user.
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "mySecurePassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "603f90119...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "isVerified": true
    }
  }
  ```

### 4. Get Current User Details
Fetch authenticated user profile details.
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes

---

## User Services (`/api/users`)

### 1. Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Auth Required**: Yes

### 2. Get User Artworks
Fetch artworks submitted by the authenticated user.
- **URL**: `/api/users/my-artwork`
- **Method**: `GET`
- **Auth Required**: Yes

### 3. Get User Events
Fetch events the authenticated user has registered for.
- **URL**: `/api/users/my-events`
- **Method**: `GET`
- **Auth Required**: Yes

---

## Artwork Management (`/api/artwork`)

### 1. Upload Artwork
- **URL**: `/api/artwork`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `title` (string, required)
  - `description` (string, required)
  - `image` (file, required, artwork file)
- **Response (201 Created)**:
  ```json
  {
    "message": "Artwork uploaded successfully. Pending approval.",
    "artwork": {
      "_id": "65ab9801ff...",
      "title": "Starry Night",
      "description": "Inspired by Van Gogh",
      "imageUrl": "/uploads/artwork/starry-night-1678.jpg",
      "artist": "603f90119...",
      "status": "pending"
    }
  }
  ```

### 2. Fetch Public Gallery
Fetch approved artworks for public exhibition.
- **URL**: `/api/artwork`
- **Method**: `GET`
- **Auth Required**: No (Optional)
- **Query Parameters**:
  - `status` (string, default: `approved`)
  - `limit` (number, optional)

### 3. Update Artwork Status (Admin Only)
Approve or reject a submitted artwork.
- **URL**: `/api/artwork/:id/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  ```json
  {
    "status": "approved"
  }
  ```

### 4. Update Artwork Score & Order (Admin Only)
- **URL**: `/api/artwork/:id/score` | `/api/artwork/:id/order`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **Request Body**: `{ "score": 8.5 }` or `{ "order": 3 }`

---

## Event Management (`/api/events`)

### 1. Fetch Events
- **URL**: `/api/events/upcoming` | `/api/events/past` | `/api/events/workshops` | `/api/events/competitions`
- **Method**: `GET`
- **Auth Required**: No

### 2. Create Event (Admin Only)
- **URL**: `/api/events`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `title` (string, required)
  - `description` (string, required)
  - `date` (Date, required)
  - `endDate` (Date, optional)
  - `location` (string, required)
  - `type` (string, options: `workshop`, `competition`, `event`, required)
  - `maxParticipants` (number, optional)
  - `image` (file, required, event cover poster)

### 3. Register for Event
- **URL**: `/api/events/:id/apply`
- **Method**: `POST`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "message": "Successfully applied to the event.",
    "registeredParticipants": ["603f90119..."]
  }
  ```

### 4. Admin Selections (Admin Only)
Update front-page loop carousel positions and archives pin indices.
- **URL**: `/api/events/admin/selections`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  ```json
  {
    "updates": [
      {
        "id": "603f98218...",
        "loopOrder": 1,
        "archiveOrder": null
      }
    ]
  }
  ```

---

## Technical Admin Tools (`/api/admin`)

### 1. Fetch Admin Activity Audit Log
- **URL**: `/api/admin/activity`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)

### 2. Promote User to Admin
- **URL**: `/api/admin/promote`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  ```json
  {
    "userId": "603f90119..."
  }
  ```
