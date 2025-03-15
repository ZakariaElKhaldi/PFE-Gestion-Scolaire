import express, { Express, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { testConnection } from './config/db';
import routes from './routes';
import { initializeDatabase } from './utils/db-init';
import { setupSocketIO } from './socket';
import assignmentRoutes from './routes/assignment.routes';
import documentRoutes from './routes/document.routes';
import teacherRoutes from './routes/teacher.routes';
import { ensureUploadDirectories } from './services/file-upload.service';
import dotenv from 'dotenv';

// Import error handling middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const server = http.createServer(app);

// Set up Socket.IO
setupSocketIO(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Version check endpoint
app.get('/version', (_req: Request, res: Response) => {
  res.status(200).json({ 
    version: '1.0.1',
    description: 'Fixed payment API endpoints to handle missing user ID gracefully',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/teachers', teacherRoutes);

// Register routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import classRoutes from './routes/class.routes';
import departmentRoutes from './routes/department.routes';
import paymentRoutes from './routes/payment.routes';
import materialRoutes from './routes/material.routes';
import feedbackRoutes from './routes/feedback.routes';
import certificateRoutes from './routes/certificate.routes';
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/certificates', certificateRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('School Management API is running');
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Test database connection but don't exit if it fails
    await testConnection();
    
    // Initialize database tables (don't exit on failure)
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Error initializing database tables, but server will continue running:', error);
    }
    
    // Ensure upload directories exist
    await ensureUploadDirectories();
    console.log('Upload directories initialized');
    
    // Start the server
    const PORT = config.server.port;
    server.listen(PORT, () => {
      console.log(`Server is ready at ${config.server.baseUrl}`);
      console.log(`Socket.IO server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    console.log('Server will continue running with limited functionality');
    
    // Ensure upload directories exist anyway
    await ensureUploadDirectories();
    console.log('Upload directories initialized');
    
    // Start the server even if database connection fails
    const PORT = config.server.port;
    server.listen(PORT, () => {
      console.log(`Server is ready at ${config.server.baseUrl} (limited functionality)`);
      console.log(`Socket.IO server is running on port ${PORT}`);
    });
  }
};

startServer();

export default app; 