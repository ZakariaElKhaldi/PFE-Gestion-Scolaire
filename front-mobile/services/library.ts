import { apiClient } from '../utils/api-client';

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  type: 'book' | 'article' | 'video' | 'document';
  coverImage?: string;
  description: string;
  tags: string[];
  published: string; // Date string
  available: boolean;
  dueDate?: string; // Date string if borrowed
  course?: string;
  downloadUrl?: string;
}

export interface ResourceCategory {
  id: string;
  name: string;
  count: number;
}

class LibraryService {
  private readonly basePath = '/students/library';

  /**
   * Get all available library resources with optional filters
   */
  async getResources(filter?: {
    type?: string;
    query?: string;
    course?: string;
    limit?: number;
  }): Promise<LibraryResource[]> {
    // This is using mock data for now
    // In a real implementation, you would fetch from API:
    // const response = await apiClient.get<LibraryResource[]>(this.basePath, { 
    //   params: filter ? { ...filter } : undefined 
    // });
    // return response;
    
    // Mock data
    const resources: LibraryResource[] = [
      {
        id: '1',
        title: 'Introduction to Calculus',
        author: 'Dr. Robert Smith',
        type: 'book',
        coverImage: 'https://via.placeholder.com/150x200?text=Calculus',
        description: 'A comprehensive introduction to calculus for high school students.',
        tags: ['mathematics', 'calculus', 'beginner'],
        published: '2020-05-15',
        available: true,
      },
      {
        id: '2',
        title: 'Physics in the Modern World',
        author: 'Dr. Helen Johnson',
        type: 'book',
        coverImage: 'https://via.placeholder.com/150x200?text=Physics',
        description: 'An exploration of physics concepts with real-world examples.',
        tags: ['physics', 'science', 'intermediate'],
        published: '2019-11-20',
        available: false,
        dueDate: '2023-12-10',
      },
      {
        id: '3',
        title: 'Literary Analysis Techniques',
        author: 'Prof. James Williams',
        type: 'article',
        description: 'A guide to analyzing literary works for high school students.',
        tags: ['literature', 'english', 'analysis'],
        published: '2021-02-10',
        available: true,
        course: 'English Literature',
        downloadUrl: 'https://example.com/articles/lit-analysis.pdf',
      },
      {
        id: '4',
        title: 'History of Ancient Civilizations',
        author: 'Dr. Sarah Thompson',
        type: 'book',
        coverImage: 'https://via.placeholder.com/150x200?text=History',
        description: 'A detailed history of ancient civilizations including Egypt, Greece, and Rome.',
        tags: ['history', 'ancient', 'advanced'],
        published: '2018-07-15',
        available: true,
      },
      {
        id: '5',
        title: 'Introduction to Computer Programming',
        author: 'Michael Chen',
        type: 'video',
        description: 'A series of video lectures introducing the fundamentals of programming.',
        tags: ['programming', 'computer science', 'beginner'],
        published: '2022-01-05',
        available: true,
        course: 'Computer Science',
        downloadUrl: 'https://example.com/videos/intro-programming',
      },
    ];

    if (!filter) return resources;

    let filteredResources = [...resources];
    
    if (filter.type) {
      filteredResources = filteredResources.filter(r => r.type === filter.type);
    }
    
    if (filter.query) {
      const query = filter.query.toLowerCase();
      filteredResources = filteredResources.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.author.toLowerCase().includes(query) || 
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (filter.course) {
      filteredResources = filteredResources.filter(r => 
        r.course && r.course.toLowerCase().includes(filter.course!.toLowerCase())
      );
    }
    
    if (filter.limit && filter.limit > 0) {
      filteredResources = filteredResources.slice(0, filter.limit);
    }
    
    return filteredResources;
  }

  /**
   * Get a specific resource by ID
   */
  async getResourceById(id: string): Promise<LibraryResource | null> {
    const resources = await this.getResources();
    return resources.find(r => r.id === id) || null;
  }

  /**
   * Get resource categories with counts
   */
  async getCategories(): Promise<ResourceCategory[]> {
    return [
      { id: 'books', name: 'Books', count: 24 },
      { id: 'articles', name: 'Articles', count: 15 },
      { id: 'videos', name: 'Video Lectures', count: 8 },
      { id: 'documents', name: 'Documents', count: 12 },
    ];
  }

  /**
   * Request to borrow a resource
   */
  async borrowResource(resourceId: string): Promise<{ success: boolean; message: string }> {
    // In a real implementation, you would call the API:
    // const response = await apiClient.post<{ success: boolean; message: string }>(
    //   `${this.basePath}/${resourceId}/borrow`
    // );
    // return response;
    
    // Mock response
    return {
      success: true,
      message: 'Resource requested successfully. Please collect from the library.'
    };
  }
}

export const libraryService = new LibraryService(); 