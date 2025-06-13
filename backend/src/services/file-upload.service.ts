import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

// Define upload directory paths
const BASE_UPLOAD_DIR = path.join(__dirname, '../../uploads');
const DOCUMENTS_DIR = path.join(BASE_UPLOAD_DIR, 'documents');
const ASSIGNMENTS_DIR = path.join(BASE_UPLOAD_DIR, 'assignments');
const PROFILE_PICTURES_DIR = path.join(BASE_UPLOAD_DIR, 'profiles');

// Define public directory paths for certificates
const PUBLIC_DIR = path.join(__dirname, '../../public');
const CERTIFICATES_DIR = path.join(PUBLIC_DIR, 'certificates');
const CERTIFICATES_QR_DIR = path.join(CERTIFICATES_DIR, 'qr');

// Ensure all directories exist
export const ensureUploadDirectories = (): void => {
  [
    BASE_UPLOAD_DIR, 
    DOCUMENTS_DIR, 
    ASSIGNMENTS_DIR, 
    PROFILE_PICTURES_DIR,
    PUBLIC_DIR,
    CERTIFICATES_DIR,
    CERTIFICATES_QR_DIR
  ].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Map MIME types to file extensions
const MIME_TYPES_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
};

// Generate a unique filename based on original name and mime type
export const generateUniqueFilename = (originalname: string, mimetype: string): string => {
  const fileExtension = MIME_TYPES_MAP[mimetype] || originalname.split('.').pop() || 'unknown';
  const fileName = originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
  const uniqueId = uuidv4().substring(0, 8);
  
  return `${fileName}-${uniqueId}.${fileExtension}`;
};

// Type of file upload destination
export type UploadDestinationType = 'document' | 'assignment' | 'profile';

// Get the appropriate upload directory based on the type
export const getUploadDirectory = (type: UploadDestinationType): string => {
  switch (type) {
    case 'document':
      return DOCUMENTS_DIR;
    case 'assignment':
      return ASSIGNMENTS_DIR;
    case 'profile':
      return PROFILE_PICTURES_DIR;
    default:
      return BASE_UPLOAD_DIR;
  }
};

// Save a file to the file system
export const saveFile = (
  buffer: Buffer,
  filename: string,
  destinationType: UploadDestinationType
): { path: string; url: string } => {
  const uploadDir = getUploadDirectory(destinationType);
  const sanitizedFilename = generateUniqueFilename(filename, buffer.toString().slice(0, 50));
  const filePath = path.join(uploadDir, sanitizedFilename);
  
  // Write file to disk
  fs.writeFileSync(filePath, buffer);
  
  // Generate URL for accessing the file
  const relativePath = path.relative(BASE_UPLOAD_DIR, filePath);
  const url = `${config.server.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
  
  return {
    path: filePath,
    url
  };
};

// Delete a file from the file system
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Check if a file is allowed based on its mimetype
export const isFileTypeAllowed = (mimetype: string): boolean => {
  return config.upload.allowedTypes.includes(mimetype);
};

// Get the maximum file size in bytes
export const getMaxFileSize = (): number => {
  return config.upload.maxFileSize;
}; 