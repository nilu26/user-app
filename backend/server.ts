import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parses JSON bodies
app.use(cors({ origin: 'http://localhost:4200' }));

// Basic Check for Route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend Server Running! Ready for API development.');
});

// User Routes
app.use('/api/users', userRoutes);

// Category Routes
app.use('/api/categories', categoryRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});