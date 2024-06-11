# Education Content Platform

This is a backend application built using Node.js, Express.js, and MongoDB to serve educational content with user authentication and other education-related features.

## Features

- User authentication (registration, login, password reset)
- CRUD operations for courses, lessons, and quizzes
- User enrollment and progress tracking for courses
- Discussion forums for courses
- Instructor dashboard for managing content and users

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Nodemailer for email sending
- Socket.IO for real-time communication (e.g., discussion forums)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/education-backend.git
```

2. Install dependencies:

```bash
cd education-backend
npm install
```

3. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add the following variables:

     ```
     MONGODB_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret-key>
     EMAIL_USER=<your-email-username>
     EMAIL_PASS=<your-email-password>
     ```

4. Start the server:

```bash
npm start
```

The server will start running on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint                | Description                                 |
|--------|-------------------------|---------------------------------------------|
| POST   | /api/auth/register      | Register a new user                        |
| POST   | /api/auth/login         | Login a user                               |
| POST   | /api/auth/reset-password| Reset a user's password                    |
| GET    | /api/courses            | Get all courses                            |
| POST   | /api/courses            | Create a new course                        |
| GET    | /api/courses/:id        | Get a specific course                      |
| PUT    | /api/courses/:id        | Update a specific course                   |
| DELETE | /api/courses/:id        | Delete a specific course                   |
| GET    | /api/lessons            | Get all lessons                            |
| POST   | /api/lessons            | Create a new lesson                        |
| GET    | /api/lessons/:id        | Get a specific lesson                      |
| PUT    | /api/lessons/:id        | Update a specific lesson                   |
| DELETE | /api/lessons/:id        | Delete a specific lesson                   |
| GET    | /api/quizzes            | Get all quizzes                            |
| POST   | /api/quizzes            | Create a new quiz                          |
| GET    | /api/quizzes/:id        | Get a specific quiz                        |
| PUT    | /api/quizzes/:id        | Update a specific quiz                     |
| DELETE | /api/quizzes/:id        | Delete a specific quiz                     |
| POST   | /api/enroll             | Enroll a user in a course                  |
| GET    | /api/progress           | Get a user's progress in a course          |
| POST   | /api/forums             | Create a new forum post                    |
| GET    | /api/forums             | Get all forum posts                        |
| GET    | /api/forums/:id         | Get a specific forum post                  |
| PUT    | /api/forums/:id         | Update a specific forum post               |
| DELETE | /api/forums/:id         | Delete a specific forum post               |

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Create a pull request to the original repository.

## License

This project is licensed under the [MIT License](LICENSE).