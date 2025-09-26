# Users CRUD API Guide

This document describes the complete CRUD operations for the Users API.

## Authentication

All user endpoints require authentication via JWT token. The token can be provided:

1. As a cookie named `token` (set automatically on login)
2. In the `Authorization` header as `Bearer <token>`

## Endpoints

### 1. Get All Users

**GET** `/api/users`

**Access**: Admin only

**Description**: Retrieves a list of all users in the system.

**Response**:

```json
{
  "message": "Successfully retrieved all users",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. Get User by ID

**GET** `/api/users/:id`

**Access**: Owner or Admin

**Description**: Retrieves a specific user by their ID. Users can only access their own data unless they are administrators.

**Parameters**:

- `id` (number): User ID

**Response**:

```json
{
  "message": "Successfully retrieved user",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update User

**PUT** `/api/users/:id`

**Access**: Owner or Admin (role changes require Admin)

**Description**: Updates user information. Users can only update their own data unless they are administrators. Only administrators can change user roles.

**Parameters**:

- `id` (number): User ID

**Request Body** (all fields optional):

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "role": "admin"
}
```

**Validation Rules**:

- `name`: 1-255 characters
- `email`: Valid email format, max 255 characters
- `password`: 6-128 characters
- `role`: Must be "user" or "admin"
- At least one field must be provided

**Response**:

```json
{
  "message": "Successfully updated user",
  "user": {
    "id": 1,
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. Delete User

**DELETE** `/api/users/:id`

**Access**: Owner or Admin (with restrictions)

**Description**: Deletes a user account. Users can only delete their own account unless they are administrators. Administrators cannot delete their own account.

**Parameters**:

- `id` (number): User ID

**Response**:

```json
{
  "message": "Successfully deleted user",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed.",
  "details": "User ID must be a valid number"
}
```

### 401 Unauthorized

```json
{
  "error": "Access denied. No token provided."
}
```

### 403 Forbidden

```json
{
  "error": "You can only update your own information unless you are an admin."
}
```

### 404 Not Found

```json
{
  "error": "User not found"
}
```

### 409 Conflict

```json
{
  "error": "Email already exists"
}
```

## Authorization Matrix

| Endpoint          | User (Own Data) | User (Others) | Admin  |
| ----------------- | --------------- | ------------- | ------ |
| GET /users        | ❌              | ❌            | ✅     |
| GET /users/:id    | ✅              | ❌            | ✅     |
| PUT /users/:id    | ✅\*            | ❌            | ✅     |
| DELETE /users/:id | ✅\*\*          | ❌            | ✅\*\* |

\*Users cannot change their own role
\*\*Admin users cannot delete their own account

## Example Usage

### 1. Login to get token

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 2. Get all users (Admin only)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update user information

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Name",
    "email": "newemail@example.com"
  }'
```

### 4. Delete user

```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Email uniqueness validation
- Input validation and sanitization
- Comprehensive logging for audit trails
- Protection against unauthorized access to other users' data
