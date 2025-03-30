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
import { assignmentRoutes } from './routes/assignment.routes';
import documentRoutes from './routes/document.routes';
import teacherRoutes from './routes/teacher.routes';
import { attendanceRoutes } from './routes/attendance.routes';
import { ensureUploadDirectories } from './services/file-upload.service';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { getHealthStatus } from './utils/health-check';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import fs from 'fs';

// Import error handling middleware
import { errorHandler, notFoundHandler, asyncHandler } from './middlewares/error.middleware';

// Load environment variables
dotenv.config();

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

// Add a route to check if uploads directory is accessible
app.get('/api/check-uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, '../uploads');
  try {
    const stats = fs.statSync(uploadsPath);
    const items = fs.readdirSync(uploadsPath);
    res.json({
      exists: true,
      isDirectory: stats.isDirectory(),
      permissions: {
        read: true,
        write: fs.accessSync(uploadsPath, fs.constants.W_OK) === undefined
      },
      contents: items
    });
  } catch (error: any) {
    res.status(500).json({
      exists: false,
      error: error.message
    });
  }
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', asyncHandler(async (req, res) => {
  const healthStatus = await getHealthStatus();
  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
}));

// Detailed health check endpoint (with auth in production)
app.get('/health/detailed', asyncHandler(async (req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    // Get detailed system information
    const detailedHealth = {
      health: healthStatus,
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
      environment: process.env.NODE_ENV,
      activeConnections: 0, // This would be populated by your connection tracking
    };
    
    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    console.error('Health check error', error);
    res.status(500).json({ status: 'error', message: 'Failed to get health information' });
  }
}));

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
app.use('/api/attendance', attendanceRoutes);

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
import { adminRoutes } from './routes/admin.routes';

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
app.use('/api/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('School Management API is running');
});

// 404 handler
app.use(notFoundHandler);

// Register error handling middleware (should be the last middleware)
app.use(errorHandler);

// Initialize HTTP server
const server = http.createServer(app);

// Initialize Socket.IO (only once!)
const io = setupSocketIO(server);

// Export the server and io instances
export { server, io };
export default app; 