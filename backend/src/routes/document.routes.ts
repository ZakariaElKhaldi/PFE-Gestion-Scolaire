/// <reference types="multer" />
import express from 'express';
import documentController from '../controllers/document.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import multer from 'multer';

// Create a router instance
const router = express.Router();

// Configure multer storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Database status endpoint
router.get('/db-status', documentController.checkDbStatus);

// Get all documents with filtering
router.get('/', authenticate, documentController.getDocuments);

// Search documents
router.get('/search', authenticate, documentController.searchDocuments);

// Get a specific document
router.get('/:id', authenticate, documentController.getDocument);

// Test upload endpoint (no authentication for debugging purposes)
router.post('/test-upload', 
  upload.single('file'),
  documentController.uploadDocument
);

// Upload a new document (two routes for flexibility)
router.post('/upload', 
  authenticate, 
  upload.single('file'),
  documentController.uploadDocument
);

// Also allow direct POST to the root endpoint for uploads
router.post('/', 
  authenticate, 
  upload.single('file'),
  documentController.uploadDocument
);

// Update document
router.put('/:id', authenticate, documentController.updateDocumentStatus);

// Delete document
router.delete('/:id', authenticate, documentController.deleteDocument);

// Document download
router.get('/:id/download', authenticate, documentController.downloadDocument);

// Share document with other users
router.post('/:id/share', authenticate, documentController.shareDocument);

export default router; 