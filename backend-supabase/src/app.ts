import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Import routes
import routes from './routes';

// Initialize Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite development server
    'http://localhost:3000',  // Alternate development port
    'http://127.0.0.1:5173',  // Using IP instead of localhost
    'http://127.0.0.1:3000'   // Alternate with IP
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Version check endpoint
app.get('/version', (_req, res) => {
  res.status(200).json({ 
    version: '1.0.0',
    description: 'School Management System API with Supabase',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// Default route
app.get('/', (_req, res) => {
  res.send('School Management API is running');
});

// Register all API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Register error handling middleware (should be the last middleware)
app.use(errorHandler);

export default app; 