import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as mime from 'mime-types';

// Upload directory for files
export const uploadDir = path.join(__dirname, '../../uploads');

// Create subdirectories for different file types
export const documentsDir = path.join(uploadDir, 'documents');
export const assignmentsDir = path.join(uploadDir, 'assignments');
export const profilesDir = path.join(uploadDir, 'profiles');
export const submissionsDir = path.join(uploadDir, 'submissions'); // Add submissions directory

// Ensure the upload directories exist
function createDirectoryIfNotExists(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
    return false;
  }
}

// Initialize directories on module load
export function initializeDirectories() {
  console.log('Initializing file storage directories...');
  
  const allDirs = [uploadDir, documentsDir, assignmentsDir, profilesDir, submissionsDir];
  let success = true;
  
  for (const dir of allDirs) {
    if (!createDirectoryIfNotExists(dir)) {
      console.error(`Failed to create or verify directory: ${dir}`);
      success = false;
    } else {
      console.log(`Directory verified: ${dir}`);
    }
  }
  
  if (success) {
    console.log('All file storage directories initialized successfully');
  } else {
    console.error('Failed to initialize some file storage directories');
  }
  
  return success;
}

// Initialize directories
initializeDirectories();

// Interface for file info
export interface FileInfo {
  originalName: string;
  fileName: string;
  path: string; // Physical path on disk (used internally, not stored in DB)
  url: string;  // URL path for accessing the file (stored in DB)
  size: number;
  type: string;
}

// Get the URL for a file
export function getFileUrl(filename: string, category: string = ''): string {
  return `/api/uploads/${category ? category + '/' : ''}${filename}`;
}

// Get the absolute path for a file
export function getFilePath(filename: string, category: string = ''): string {
  if (category === 'document') return path.join(documentsDir, filename);
  if (category === 'assignment') return path.join(assignmentsDir, filename);
  if (category === 'profile') return path.join(profilesDir, filename);
  if (category === 'submission') return path.join(submissionsDir, filename);
  return path.join(uploadDir, filename);
}

// Save a file from a buffer to disk
export function saveFile(
  buffer: Buffer, 
  originalName: string, 
  category: 'document' | 'assignment' | 'profile' | 'submission' = 'document'
): FileInfo {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid or empty file buffer');
  }
  
  if (!originalName) {
    throw new Error('Original filename is required');
  }
  
  try {
    // Generate a unique filename
    const ext = path.extname(originalName) || '.bin';
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileName = `${timestamp}-${randomString}${ext}`;
    
    // Determine the appropriate directory
    let targetDir = uploadDir;
    switch (category) {
      case 'document':
        targetDir = documentsDir;
        break;
      case 'assignment':
        targetDir = assignmentsDir;
        break;
      case 'profile':
        targetDir = profilesDir;
        break;
      case 'submission':
        targetDir = submissionsDir;
        break;
    }
    
    // Ensure the target directory exists
    if (!createDirectoryIfNotExists(targetDir)) {
      throw new Error(`Failed to create directory for ${category} files`);
    }
    
    // Create the file path
    const filePath = path.join(targetDir, fileName);
    
    // Write the file to disk
    fs.writeFileSync(filePath, buffer);
    console.log(`File saved successfully: ${filePath}`);
    
    // Return file info with separate path (internal) and url (for DB)
    return {
      originalName,
      fileName,
      path: filePath,
      url: getFileUrl(fileName, category),
      size: buffer.length,
      type: mime.lookup(ext) || 'application/octet-stream'
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error; // Re-throw for proper handling upstream
  }
}

// Delete a file
export function deleteFile(filePath: string): boolean {
  try {
    console.log(`Attempting to delete file: ${filePath}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted successfully: ${filePath}`);
      return true;
    }
    console.warn(`File not found, cannot delete: ${filePath}`);
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Allowed file types (MIME types)
export const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
];

// Maximum file size (in bytes)
export const maxFileSize = 10 * 1024 * 1024; // 10MB

// Check if file type is allowed
export function isFileTypeAllowed(mimeType: string): boolean {
  // Display debug information
  console.log(`Checking if mime type is allowed: ${mimeType}`);
  const allowed = allowedFileTypes.includes(mimeType);
  console.log(`Mime type ${mimeType} is ${allowed ? 'allowed' : 'not allowed'}`);
  return allowed;
}

// Check if file size is within limits
export function isFileSizeAllowed(size: number): boolean {
  console.log(`Checking if file size is allowed: ${size} bytes (limit: ${maxFileSize} bytes)`);
  const allowed = size <= maxFileSize;
  console.log(`File size ${size} bytes is ${allowed ? 'allowed' : 'not allowed'}`);
  return allowed;
}

// Get the content type based on file extension
export function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.doc':
    case '.docx':
      return 'application/msword';
    case '.xls':
    case '.xlsx':
      return 'application/vnd.ms-excel';
    case '.ppt':
    case '.pptx':
      return 'application/vnd.ms-powerpoint';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.txt':
      return 'text/plain';
    case '.zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}

// Stream a file to response
export function streamFileToResponse(filePath: string, res: any, fileName?: string): void {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found for streaming: ${filePath}`);
    res.status(404).send('File not found');
    return;
  }

  try {
    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(filePath);
    const downloadName = fileName || path.basename(filePath);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    
    fileStream.pipe(res);
  } catch (error) {
    console.error(`Error streaming file ${filePath}:`, error);
    res.status(500).send('Error streaming file');
  }
}

// Save a file from multer upload (req.file)
export function saveUploadedFile(file: Express.Multer.File, category: 'document' | 'assignment' | 'profile' | 'submission' = 'document'): FileInfo {
  if (!file || !file.buffer) {
    throw new Error('Invalid or missing file upload');
  }
  
  console.log('Saving uploaded file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  return saveFile(file.buffer, file.originalname, category);
} 