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

// Ensure the upload directories exist
for (const dir of [uploadDir, documentsDir, assignmentsDir, profilesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

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
export function getFileUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}

// Get the absolute path for a file
export function getFilePath(filename: string): string {
  return path.join(uploadDir, filename);
}

// Save a file from a buffer to disk
export function saveFile(
  buffer: Buffer, 
  originalName: string, 
  category: 'document' | 'assignment' | 'profile' = 'document'
): FileInfo {
  // Generate a unique filename
  const ext = path.extname(originalName);
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
  }
  
  // Create the file path
  const filePath = path.join(targetDir, fileName);
  
  // Write the file to disk
  fs.writeFileSync(filePath, buffer);
  
  // Return file info with separate path (internal) and url (for DB)
  return {
    originalName,
    fileName,
    path: filePath,
    url: getFileUrl(`${category}/${fileName}`),
    size: buffer.length,
    type: mime.lookup(ext) || 'application/octet-stream'
  };
}

// Delete a file
export function deleteFile(filePath: string): boolean {
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
  return allowedFileTypes.includes(mimeType);
}

// Check if file size is within limits
export function isFileSizeAllowed(size: number): boolean {
  return size <= maxFileSize;
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
  const fileStream = fs.createReadStream(filePath);
  const contentType = getContentType(filePath);
  const downloadName = fileName || path.basename(filePath);
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  
  fileStream.pipe(res);
} 