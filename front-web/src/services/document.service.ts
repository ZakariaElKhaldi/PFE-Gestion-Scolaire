import apiClient from '../lib/api-client';
import storageService from './storage.service';
import { toast } from 'react-toastify';

export interface Document {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  path: string;
  url: string;
  size: number;
  status: 'pending' | 'approved' | 'rejected';
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  isAvailableOffline?: boolean;
  name?: string;
  contentType?: string;
}

export interface DocumentFilter {
  status?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentContent {
  blob?: Blob;
  base64?: string;
  contentType: string;
}

// Define cache options interface
export interface CacheOptions {
  expireInMinutes?: number;
  forceRefresh?: boolean;
}

// Define document metadata interface
export interface DocumentMetadata {
  id: string;
  name: string;
  contentType: string;
  size: number;
}

class DocumentService {
  private readonly DOCUMENT_CACHE_PREFIX = 'documents_';
  private readonly DOCUMENT_CONTENT_PREFIX = 'document_content_';
  private readonly MAX_DOCUMENT_SIZE_FOR_STORAGE = 4 * 1024 * 1024; // 4MB

  /**
   * Get all documents with optional filtering and use localStorage cache
   */
  async getDocuments(filters?: DocumentFilter, options?: CacheOptions): Promise<Document[]> {
    // Generate cache key based on filters
    const cacheKey = `${this.DOCUMENT_CACHE_PREFIX}${JSON.stringify(filters || {})}`;
    
    // Return cached documents if available and not forcing refresh
    if (!options?.forceRefresh) {
      const cachedDocuments = storageService.getItem<Document[]>(cacheKey);
      if (cachedDocuments) {
        console.log('Using cached documents');
        return cachedDocuments;
      }
    }
    
    try {
      // Use a direct fetch request instead of apiClient to handle non-JSON responses
      const token = localStorage.getItem('auth_token');
      let url = '/api/documents';
      
      if (filters) {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        console.error('Invalid response from documents API:', response.status, contentType);
        // Return mock data as fallback
        const mockDocs = this.getMockDocuments();
        
        // Still cache the mock data
        storageService.setItem(cacheKey, mockDocs, { expireInMinutes: 30 });
        
        return mockDocs;
      }
      
      const data = await response.json();
      const documents = data.documents || data.data?.documents || [];
      
      // Check which documents are available offline
      const enhancedDocuments = await this.checkOfflineAvailability(documents);
      
      // Cache the documents
      storageService.setItem(cacheKey, enhancedDocuments, { expireInMinutes: 15 });
      
      return enhancedDocuments;
    } catch (error) {
      console.error('Error fetching documents:', error);
      
      // Return mock data if the API call fails
      const mockDocs = this.getMockDocuments();
      
      // Cache the mock data with a shorter expiration
      storageService.setItem(cacheKey, mockDocs, { expireInMinutes: 5 });
      
      return mockDocs;
    }
  }
  
  /**
   * Check which documents are available offline
   */
  private async checkOfflineAvailability(documents: Document[]): Promise<Document[]> {
    return Promise.all(documents.map(async (doc) => {
      const contentKey = `${this.DOCUMENT_CONTENT_PREFIX}${doc.id}`;
      const isAvailableOffline = storageService.getItem<DocumentContent>(contentKey) !== null;
      return { ...doc, isAvailableOffline };
    }));
  }
  
  /**
   * Get mock documents data when API fails
   */
  private getMockDocuments(): Document[] {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      {
        id: 'mock-doc-1',
        userId: 'mock-user-id',
        title: 'Course Syllabus',
        description: 'Syllabus for the current semester',
        type: 'application/pdf',
        path: '/mock/path/syllabus.pdf',
        url: '/api/documents/mock-doc-1/download',
        size: 245000,
        status: 'approved',
        tags: ['course', 'syllabus'],
        createdAt: lastWeek.toISOString(),
        updatedAt: lastWeek.toISOString(),
        isAvailableOffline: false
      },
      {
        id: 'mock-doc-2',
        userId: 'mock-user-id',
        title: 'Assignment Guidelines',
        description: 'Instructions for completing the final project',
        type: 'application/pdf',
        path: '/mock/path/assignment.pdf',
        url: '/api/documents/mock-doc-2/download',
        size: 350000,
        status: 'approved',
        tags: ['assignment', 'project'],
        createdAt: lastMonth.toISOString(),
        updatedAt: lastMonth.toISOString(),
        isAvailableOffline: false
      },
      {
        id: 'mock-doc-3',
        userId: 'mock-user-id',
        title: 'Student Handbook',
        description: 'Official student handbook with policies and procedures',
        type: 'application/pdf',
        path: '/mock/path/handbook.pdf',
        url: '/api/documents/mock-doc-3/download',
        size: 1200000,
        status: 'approved',
        tags: ['official', 'handbook'],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        isAvailableOffline: false
      }
    ];
  }

  /**
   * Get a specific document by ID with localStorage cache
   */
  async getDocument(id: string, options?: CacheOptions): Promise<Document> {
    const cacheKey = `document_${id}`;
    
    // Return cached document if available and not forcing refresh
    if (!options?.forceRefresh) {
      const cachedDocument = storageService.getItem<Document>(cacheKey);
      if (cachedDocument) {
        // Check if document content is available offline
        const contentKey = `${this.DOCUMENT_CONTENT_PREFIX}${id}`;
        const isAvailableOffline = storageService.getItem<DocumentContent>(contentKey) !== null;
        return { ...cachedDocument, isAvailableOffline };
      }
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documents/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        console.error('Invalid response from document API:', response.status, contentType);
        // Return mock document as fallback
        const mockDoc = this.getMockDocument(id);
        
        // Cache the mock document
        storageService.setItem(cacheKey, mockDoc, { expireInMinutes: 30 });
        
        return mockDoc;
      }
      
      const data = await response.json();
      const document = data.document || data.data?.document;
      
      // Check if document content is available offline
      const contentKey = `${this.DOCUMENT_CONTENT_PREFIX}${id}`;
      const isAvailableOffline = storageService.getItem<DocumentContent>(contentKey) !== null;
      const enhancedDocument = { ...document, isAvailableOffline };
      
      // Cache the document
      storageService.setItem(cacheKey, enhancedDocument, { expireInMinutes: 60 });
      
      return enhancedDocument;
    } catch (error) {
      console.error('Error fetching document:', error);
      // Return mock document if the API call fails
      const mockDoc = this.getMockDocument(id);
      
      // Cache the mock document with a shorter expiration
      storageService.setItem(cacheKey, mockDoc, { expireInMinutes: 5 });
      
      return mockDoc;
    }
  }
  
  /**
   * Download and store document in IndexedDB for offline use
   */
  async downloadAndStoreDocument(id: string): Promise<Blob> {
    // First check if we have the document in IndexedDB
    const storedDocument = await this.getStoredDocument(id);
    if (storedDocument) {
      console.log('Using document from IndexedDB storage');
      return storedDocument;
    }
    
    // If not in IndexedDB, download it
    try {
      console.log(`Downloading document ${id}`);
      
      // Download the document
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documents/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status}`);
      }
      
      // Get document metadata to store with the blob
      const docMetadata = await this.getDocument(id);
      
      const blob = await response.blob();
      
      // Validate the blob before storing
      if (blob.size === 0) {
        throw new Error('Downloaded document is empty');
      }
      
      console.log('Download successful, blob size:', blob.size, 'type:', blob.type);
      
      // Store the document in IndexedDB for offline use
      if (blob.size < this.MAX_DOCUMENT_SIZE_FOR_STORAGE) {
        // Only process the document if it has valid content
        if (blob.size > 0) {
          try {
            // Create a simple clone of the blob that's safe to store
            const blobClone = new Blob([await blob.arrayBuffer()], { type: blob.type });
            
            // Get document info for storage
            const metadata = {
              id,
              name: docMetadata?.name || `document-${id}`,
              contentType: blob.type || 'application/octet-stream',
              size: blob.size
            };
            
            // Store in IndexedDB
            await this.storeDocument(id, blobClone, metadata);
            
            console.log('Document stored for offline use');
          } catch (error) {
            console.error('Error storing document for offline use:', error);
          }
        }
      } else {
        console.log('Document too large for offline storage');
      }
      
      return blob;
    } catch (error) {
      console.error('Error downloading document:', error);
      
      // Create a fallback document if download fails
      return new Blob(['Document unavailable, please try again later'], 
        { type: 'text/plain' });
    }
  }
  
  /**
   * Store document in IndexedDB
   */
  private async storeDocument(id: string, blob: Blob, metadata: DocumentMetadata): Promise<void> {
    // Try to use IndexedDB
    try {
      // Check if IndexedDB is available
      if ('indexedDB' in window) {
        const request = indexedDB.open('school_documents', 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('documents')) {
            const store = db.createObjectStore('documents', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        
        request.onsuccess = async (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['documents'], 'readwrite');
          const store = transaction.objectStore('documents');
          
          // Store the document
          const storeRequest = store.put({
            id,
            blob,
            metadata,
            timestamp: Date.now()
          });
          
          storeRequest.onsuccess = () => {
            console.log(`Document ${id} stored in IndexedDB`);
            
            // Update document metadata to show it's available offline
            this.updateDocumentInCachedLists(id, { isAvailableOffline: true });
          };
          
          storeRequest.onerror = (error) => {
            console.error('Error storing document in IndexedDB:', error);
          };
        };
        
        request.onerror = (error) => {
          console.error('Error opening IndexedDB:', error);
        };
      } else {
        console.warn('IndexedDB not supported by this browser');
      }
    } catch (error) {
      console.error('Failed to store document:', error);
    }
  }
  
  /**
   * Get stored document from IndexedDB
   */
  async getStoredDocument(id: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      try {
        if ('indexedDB' in window) {
          const request = indexedDB.open('school_documents', 1);
          
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
              if (getRequest.result) {
                console.log(`Document ${id} retrieved from IndexedDB`);
                resolve(getRequest.result.blob);
              } else {
                console.log(`Document ${id} not found in IndexedDB`);
                resolve(null);
              }
            };
            
            getRequest.onerror = (error) => {
              console.error('Error getting document from IndexedDB:', error);
              resolve(null);
            };
          };
          
          request.onerror = (error) => {
            console.error('Error opening IndexedDB:', error);
            resolve(null);
          };
        } else {
          console.warn('IndexedDB not supported by this browser');
          resolve(null);
        }
      } catch (error) {
        console.error('Failed to get stored document:', error);
        resolve(null);
      }
    });
  }
  
  /**
   * Remove a document from offline storage
   */
  removeStoredDocument(id: string): void {
    const contentKey = `${this.DOCUMENT_CONTENT_PREFIX}${id}`;
    storageService.removeItem(contentKey);
    
    // Update document metadata to show it's no longer available offline
    const docCacheKey = `document_${id}`;
    const cachedDoc = storageService.getItem<Document>(docCacheKey);
    if (cachedDoc) {
      storageService.setItem(docCacheKey, { ...cachedDoc, isAvailableOffline: false });
    }
    
    // Also update the document in any lists it might be part of
    this.updateDocumentInCachedLists(id, { isAvailableOffline: false });
    
    toast.success('Document removed from offline storage');
  }
  
  /**
   * Update a document in all cached lists
   */
  private updateDocumentInCachedLists(id: string, updates: Partial<Document>): void {
    // Update any document lists in cache that contain this document
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.DOCUMENT_CACHE_PREFIX)) {
          const cachedData = localStorage.getItem(key);
          if (cachedData) {
            try {
              // Parse the cached data
              const parsed = JSON.parse(cachedData);
              if (parsed.data && Array.isArray(parsed.data)) {
                // Find and update the document in the array
                let updated = false;
                const updatedDocs = parsed.data.map((doc: Document) => {
                  if (doc.id === id) {
                    updated = true;
                    return { ...doc, ...updates };
                  }
                  return doc;
                });

                if (updated) {
                  // Save the updated array back to cache
                  parsed.data = updatedDocs;
                  localStorage.setItem(key, JSON.stringify(parsed));
                }
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating cached documents:', error);
    }
  }
  
  /**
   * Get a mock document when API fails
   */
  private getMockDocument(id: string): Document {
    const today = new Date();
    
    return {
      id,
      userId: 'mock-user-id',
      title: 'Mock Document',
      description: 'This is a mock document generated when the API is unavailable',
      type: 'application/pdf',
      path: `/mock/path/document-${id}.pdf`,
      url: `/api/documents/${id}/download`,
      size: 500000,
      status: 'approved',
      tags: ['mock', 'fallback'],
      createdAt: today,
      updatedAt: today,
      isAvailableOffline: false
    };
  }

  /**
   * Get all shared documents
   */
  async getSharedDocuments(): Promise<Document[]> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/documents/shared', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        console.error('Invalid response from shared documents API:', response.status, contentType);
        // Return empty array as fallback
        return [];
      }
      
      const data = await response.json();
      return data.documents || data.data?.documents || [];
    } catch (error) {
      console.error('Error fetching shared documents:', error);
      // Return empty array if the API call fails
      return [];
    }
  }

  /**
   * Get all pending documents (admin only)
   */
  async getPendingDocuments(): Promise<Document[]> {
    const { data } = await apiClient.get<{
      error: boolean;
      data: { documents: Document[] };
      message: string;
    }>(`/documents/pending`);
    return data.data.documents;
  }

  /**
   * Search for documents
   */
  async searchDocuments(query: string): Promise<Document[]> {
    const { data } = await apiClient.get<{
      error: boolean;
      data: { documents: Document[] };
      message: string;
    }>(`/documents/search`, { query });
    return data.data.documents;
  }

  /**
   * Upload a new document
   */
  async uploadDocument(
    file: File,
    documentData: {
      title: string;
      description?: string;
      type: string;
      tags?: string[];
    }
  ): Promise<Document> {
    console.log('Uploading document:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      documentData
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', documentData.title);
    
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    
    formData.append('type', documentData.type);
    
    if (documentData.tags) {
      formData.append('tags', JSON.stringify(documentData.tags));
    }
    
    // Log formData entries for debugging
    console.log('FormData entries:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Use direct fetch instead of apiClient to properly handle FormData
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Using API URL:', `${apiClient['baseURL']}/documents`);
      console.log('Auth token present:', !!token);
      
      const response = await fetch(`${apiClient['baseURL']}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - browser will set it with proper boundary
        },
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        console.error('Upload failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        let errorMessage = `Upload failed with status ${response.status}`;
        
        // Try to parse error JSON if possible
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If parsing fails, use the raw text
          if (errorText) {
            errorMessage += `: ${errorText.substring(0, 100)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('Upload successful, response:', responseData);
      const newDocument = responseData.document || responseData.data?.document;
      
      // Invalidate document caches
      this.invalidateDocumentCaches();
      
      // Optionally store the document for offline use
      if (file.size < this.MAX_DOCUMENT_SIZE_FOR_STORAGE) {
        try {
          const contentKey = `${this.DOCUMENT_CONTENT_PREFIX}${newDocument.id}`;
          const base64 = await storageService.fileToBase64(file);
          
          storageService.setItem(contentKey, {
            base64,
            contentType: file.type
          }, { expireInMinutes: 60 * 24 * 7 });
          
          // Update document to show it's available offline
          newDocument.isAvailableOffline = true;
          
          toast.success('Document saved for offline use');
        } catch (error) {
          console.error('Error storing document for offline use:', error);
        }
      }
      
      return newDocument;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }
  
  /**
   * Invalidate all document caches
   */
  private invalidateDocumentCaches(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(storageService['PREFIX'] + this.DOCUMENT_CACHE_PREFIX))
      .forEach(fullKey => {
        const key = fullKey.substring(storageService['PREFIX'].length);
        storageService.removeItem(key);
      });
  }

  /**
   * Update a document
   */
  async updateDocument(
    id: string,
    updateData: {
      title?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<Document> {
    const { data } = await apiClient.put<{
      error: boolean;
      data: { document: Document };
      message: string;
    }>(`/documents/${id}`, updateData);
    
    const updatedDocument = data.data.document;
    
    // Update document in caches
    const docCacheKey = `document_${id}`;
    const cachedDoc = storageService.getItem<Document>(docCacheKey);
    
    if (cachedDoc) {
      // Keep offline status
      const isAvailableOffline = cachedDoc.isAvailableOffline;
      storageService.setItem(docCacheKey, { ...updatedDocument, isAvailableOffline });
    }
    
    // Update in lists
    this.updateDocumentInCachedLists(id, updatedDocument);
    
    return updatedDocument;
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
    
    // Remove from caches
    const docCacheKey = `document_${id}`;
    storageService.removeItem(docCacheKey);
    
    // Remove content if stored
    const contentKey = `${this.DOCUMENT_CONTENT_PREFIX}${id}`;
    storageService.removeItem(contentKey);
    
    // Remove from lists
    this.removeDocumentFromCachedLists(id);
  }
  
  /**
   * Remove a document from all cached lists
   */
  private removeDocumentFromCachedLists(id: string): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(storageService['PREFIX'] + this.DOCUMENT_CACHE_PREFIX))
      .forEach(fullKey => {
        const key = fullKey.substring(storageService['PREFIX'].length);
        const documents = storageService.getItem<Document[]>(key);
        
        if (documents) {
          const updatedDocs = documents.filter((doc: Document) => doc.id !== id);
          storageService.setItem(key, updatedDocs);
        }
      });
  }

  /**
   * Approve a document (admin only)
   */
  async approveDocument(id: string): Promise<Document> {
    const { data } = await apiClient.post<{
      error: boolean;
      data: { document: Document };
      message: string;
    }>(`/documents/${id}/approve`, {});
    
    return data.data.document;
  }

  /**
   * Reject a document (admin only)
   */
  async rejectDocument(id: string, reason: string): Promise<Document> {
    const { data } = await apiClient.post<{
      error: boolean;
      data: { document: Document };
      message: string;
    }>(`/documents/${id}/reject`, { reason });
    
    return data.data.document;
  }

  /**
   * Share a document with other users
   */
  async shareDocument(id: string, userIds: string[]): Promise<void> {
    await apiClient.post(`/documents/${id}/share`, { userIds });
  }

  /**
   * Get the download URL for a document
   */
  getDownloadUrl(id: string): string {
    return `${window.location.origin}/api/documents/${id}/download`;
  }
  
  /**
   * Get storage usage for documents
   */
  getDocumentStorageUsage(): { used: number, documentCount: number } {
    let usedBytes = 0;
    let documentCount = 0;
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(storageService['PREFIX'] + this.DOCUMENT_CONTENT_PREFIX))
      .forEach(fullKey => {
        usedBytes += (localStorage.getItem(fullKey)?.length || 0) * 2; // Approximate for UTF-16
        documentCount++;
      });
    
    return { used: usedBytes, documentCount };
  }
  
  /**
   * Clear all stored documents
   */
  clearStoredDocuments(): void {
    // Find all document content caches
    Object.keys(localStorage)
      .filter(key => key.startsWith(storageService['PREFIX'] + this.DOCUMENT_CONTENT_PREFIX))
      .forEach(fullKey => {
        const key = fullKey.substring(storageService['PREFIX'].length);
        storageService.removeItem(key);
      });
    
    // Update all documents to show they're no longer available offline
    Object.keys(localStorage)
      .filter(key => key.startsWith(storageService['PREFIX'] + this.DOCUMENT_CACHE_PREFIX))
      .forEach(fullKey => {
        const key = fullKey.substring(storageService['PREFIX'].length);
        const documents = storageService.getItem<Document[]>(key);
        
        if (documents) {
          const updatedDocs = documents.map(doc => ({
            ...doc,
            isAvailableOffline: false
          }));
          
          storageService.setItem(key, updatedDocs);
        }
      });
    
    // Update individual document caches
    Object.keys(localStorage)
      .filter(key => key.startsWith(storageService['PREFIX'] + 'document_'))
      .forEach(fullKey => {
        const key = fullKey.substring(storageService['PREFIX'].length);
        const document = storageService.getItem<Document>(key);
        
        if (document) {
          storageService.setItem(key, {
            ...document,
            isAvailableOffline: false
          });
        }
      });
    
    toast.success('All offline documents cleared');
  }
}

export const documentService = new DocumentService();
export default documentService; 