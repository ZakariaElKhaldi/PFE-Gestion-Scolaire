export interface Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  path?: string; // Add path property for file system path
  size: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDTO {
  userId: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  path?: string; // Add path property for upload
  size: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UpdateDocumentDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
} 