import { toast } from 'react-toastify';

export interface CacheOptions {
  expireInMinutes?: number;
  forceRefresh?: boolean;
}

export interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
}

export interface StorageOptions {
  expireInMinutes?: number;
}

export interface CachedItem<T> {
  data: T;
  expiresAt?: number;
  timestamp: number;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  contentType: string;
  size: number;
}

/**
 * Storage service for managing localStorage and IndexedDB
 */
class StorageService {
  private PREFIX = 'school_app_';
  private DB_NAME = 'school_app_db';
  private DOCUMENT_STORE = 'documents';
  private db: IDBDatabase | null = null;
  private readonly ESTIMATED_TOTAL_BYTES = 5 * 1024 * 1024; // 5MB conservative estimate

  constructor() {
    this.initIndexedDB();
  }

  /**
   * Initialize IndexedDB for document storage
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported by this browser');
        resolve();
        return;
      }

      const request = window.indexedDB.open(this.DB_NAME, 1);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(this.DOCUMENT_STORE)) {
          const store = db.createObjectStore(this.DOCUMENT_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Created document store in IndexedDB');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };
    });
  }

  /**
   * Check if IndexedDB is ready
   */
  private isIndexedDBReady(): boolean {
    return !!this.db;
  }

  /**
   * Store data in localStorage with optional expiration
   */
  setItem<T>(key: string, data: T, options?: CacheOptions): void {
    try {
      // Check storage usage before adding new item
      const usage = this.getStorageUsage();
      if (usage.percentage > 90) {
        this.clearOldestItems(80);
      }
      
      const storageItem = {
        data,
        timestamp: new Date().getTime(),
        expiry: options?.expireInMinutes 
          ? new Date().getTime() + (options.expireInMinutes * 60 * 1000)
          : null
      };
      
      localStorage.setItem(this.PREFIX + key, JSON.stringify(storageItem));
    } catch (error) {
      console.error('Error storing item in localStorage:', error);
      
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestItems(70); // Clear more aggressively
        toast.error('Storage full. Oldest items were removed.');
        
        try {
          // Try again after clearing space
          const storageItem = {
            data,
            timestamp: new Date().getTime(),
            expiry: options?.expireInMinutes 
              ? new Date().getTime() + (options.expireInMinutes * 60 * 1000)
              : null
          };
          
          localStorage.setItem(this.PREFIX + key, JSON.stringify(storageItem));
        } catch (retryError) {
          console.error('Still could not store item after clearing space:', retryError);
        }
      }
    }
  }
  
  /**
   * Get data from localStorage if not expired
   */
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(this.PREFIX + key);
    
    if (!item) return null;
    
    try {
      const storageItem = JSON.parse(item);
      
      // Check if item has expired
      if (storageItem.expiry && new Date().getTime() > storageItem.expiry) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }
      
      // Update timestamp to keep track of recently used items
      storageItem.timestamp = new Date().getTime();
      localStorage.setItem(this.PREFIX + key, JSON.stringify(storageItem));
      
      return storageItem.data as T;
    } catch (error) {
      console.error('Error parsing stored item:', error);
      return null;
    }
  }
  
  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }
  
  /**
   * Clear all app data from localStorage
   */
  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
  
  /**
   * Check storage usage
   */
  getStorageUsage(): StorageUsage {
    let usedBytes = 0;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        usedBytes += (localStorage.getItem(key)?.length || 0) * 2; // Approximate for UTF-16
      }
    });
    
    return {
      used: usedBytes,
      total: this.ESTIMATED_TOTAL_BYTES,
      percentage: (usedBytes / this.ESTIMATED_TOTAL_BYTES) * 100
    };
  }
  
  /**
   * Clear least recently used items if approaching limit
   */
  clearOldestItems(targetPercentage: number = 80): void {
    const usage = this.getStorageUsage();
    
    if (usage.percentage < targetPercentage) return;
    
    // Get all items with timestamps
    const items = Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .map(key => {
        try {
          const value = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, timestamp: value.timestamp || 0, size: (localStorage.getItem(key)?.length || 0) * 2 };
        } catch {
          return { key, timestamp: 0, size: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Sort oldest first
    
    // Remove oldest items until we get below target
    for (const item of items) {
      localStorage.removeItem(item.key);
      
      const newUsage = this.getStorageUsage();
      if (newUsage.percentage < targetPercentage) break;
    }
  }
  
  /**
   * Helper to convert file to base64 for storage
   */
  async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Helper to convert base64 to blob for retrieval
   */
  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    
    return new Blob(byteArrays, { type: contentType });
  }

  /**
   * Store item in localStorage
   */
  setItem<T>(key: string, data: T, options?: StorageOptions): void {
    try {
      const prefixedKey = this.PREFIX + key;
      const timestamp = Date.now();
      
      const cachedItem: CachedItem<T> = {
        data,
        timestamp
      };
      
      if (options?.expireInMinutes) {
        cachedItem.expiresAt = timestamp + (options.expireInMinutes * 60 * 1000);
      }
      
      localStorage.setItem(prefixedKey, JSON.stringify(cachedItem));
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
      
      // Clear some old items if we're reaching storage limit
      if (error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || 
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        this.clearOldItems();
      }
    }
  }

  /**
   * Get item from localStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.PREFIX + key;
      const item = localStorage.getItem(prefixedKey);
      
      if (!item) return null;
      
      const cachedItem = JSON.parse(item) as CachedItem<T>;
      
      // Check if expired
      if (cachedItem.expiresAt && cachedItem.expiresAt < Date.now()) {
        localStorage.removeItem(prefixedKey);
        return null;
      }
      
      return cachedItem.data;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear old items when approaching storage limit
   */
  clearOldItems(): void {
    try {
      const keys: {key: string, timestamp: number}[] = [];
      
      // Get all keys with their timestamps
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const cachedItem = JSON.parse(item) as CachedItem<unknown>;
              keys.push({
                key,
                timestamp: cachedItem.timestamp
              });
            } catch (_) {
              // If we can't parse it, just remove it
              localStorage.removeItem(key);
            }
          }
        }
      }
      
      // Sort by oldest first
      keys.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest 20% of items
      const removeCount = Math.ceil(keys.length * 0.2);
      keys.slice(0, removeCount).forEach(item => {
        localStorage.removeItem(item.key);
      });
      
      console.log(`Cleared ${removeCount} old items from localStorage`);
    } catch (error) {
      console.error('Error clearing old items from localStorage:', error);
    }
  }

  /**
   * Store a document in IndexedDB
   */
  async storeDocumentInIndexedDB(id: string, blob: Blob, metadata: DocumentMetadata): Promise<boolean> {
    if (!this.isIndexedDBReady()) {
      console.warn('IndexedDB not ready, falling back to localStorage');
      return false;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([this.DOCUMENT_STORE], 'readwrite');
        const store = transaction.objectStore(this.DOCUMENT_STORE);

        const request = store.put({
          id,
          blob,
          metadata,
          timestamp: Date.now()
        });

        request.onsuccess = () => {
          console.log(`Document ${id} stored in IndexedDB`);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error storing document in IndexedDB:', event);
          resolve(false);
        };
      } catch (error) {
        console.error('Failed to store document in IndexedDB:', error);
        resolve(false);
      }
    });
  }

  /**
   * Retrieve a document from IndexedDB
   */
  async getDocumentFromIndexedDB(id: string): Promise<{ blob: Blob, metadata: DocumentMetadata } | null> {
    if (!this.isIndexedDBReady()) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([this.DOCUMENT_STORE], 'readonly');
        const store = transaction.objectStore(this.DOCUMENT_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result) {
            resolve({
              blob: request.result.blob,
              metadata: request.result.metadata
            });
          } else {
            resolve(null);
          }
        };

        request.onerror = (event) => {
          console.error('Error retrieving document from IndexedDB:', event);
          resolve(null);
        };
      } catch (error) {
        console.error('Failed to get document from IndexedDB:', error);
        resolve(null);
      }
    });
  }

  /**
   * Remove a document from IndexedDB
   */
  async removeDocumentFromIndexedDB(id: string): Promise<boolean> {
    if (!this.isIndexedDBReady()) {
      return false;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([this.DOCUMENT_STORE], 'readwrite');
        const store = transaction.objectStore(this.DOCUMENT_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
          console.log(`Document ${id} removed from IndexedDB`);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error removing document from IndexedDB:', event);
          resolve(false);
        };
      } catch (error) {
        console.error('Failed to remove document from IndexedDB:', error);
        resolve(false);
      }
    });
  }
}

const storageService = new StorageService();
export default storageService; 