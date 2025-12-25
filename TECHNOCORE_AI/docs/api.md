
## Endpoints

### Authentication

#### Register User
- **POST** `/api/users/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }