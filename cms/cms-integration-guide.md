# CMS Integration Guide for School Management System

## Overview
This guide outlines how to integrate Puck CMS to enable extensible website functionality for schools using our management system. Puck provides a flexible, React-based visual editing experience that allows schools to customize their web presence without requiring extensive technical knowledge.

## What is Puck CMS?

Puck is a self-hosted, React-based CMS that enables visual page building with a component-driven approach. Unlike traditional CMS platforms, Puck integrates directly with React applications, allowing for seamless integration with our existing frontend architecture.

```
┌─────────────────────────────────────────────────────────────────┐
│                     School Management System                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Puck CMS Integration                      │
└───────┬───────────────┬────────────────┬────────────┬───────────┘
        │               │                │            │
        ▼               ▼                ▼            ▼
┌───────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Page Builder  │ │ Component    │ │ Content  │ │ Template     │
│ Interface     │ │ Library      │ │ API      │ │ Management   │
└───────────────┘ └──────────────┘ └──────────┘ └──────────────┘
```

## Key Benefits

1. **No-Code Page Building**: Enables school administrators to create and modify pages without coding knowledge
2. **Component-Based**: Leverages our existing React components for consistent design
3. **Customizable Templates**: Schools can create templates for common page types (events, announcements, etc.)
4. **Content API**: Headless architecture allows content to be displayed across web and mobile platforms
5. **Seamless Integration**: Works within our existing React application without requiring a separate CMS platform

## Architecture Integration

The Puck CMS will be integrated with our school management system using the following architecture:

```
┌───────────────────────────────────────────────────────────────┐
│                  School Management Frontend                    │
│                                                               │
│  ┌─────────────────┐       ┌─────────────────────────────┐    │
│  │ Admin Dashboard │       │ Public-Facing School Pages  │    │
│  └────────┬────────┘       └──────────────┬──────────────┘    │
│           │                               │                    │
│           ▼                               ▼                    │
│  ┌─────────────────┐       ┌─────────────────────────────┐    │
│  │ Puck Editor     │──────►│ Rendered Puck Components    │    │
│  └─────────────────┘       └─────────────────────────────┘    │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                  Content Storage & API Layer                   │
│                                                               │
│  ┌─────────────────┐       ┌─────────────────────────────┐    │
│  │ Puck Content DB │◄─────►│ Content API                 │    │
│  └─────────────────┘       └─────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Implementation Strategy

### Phase 1: Foundation Setup (Weeks 1-2)
- Install and configure Puck CMS within the React application
- Set up content storage database (MongoDB recommended)
- Create basic component library for Puck

### Phase 2: Component Development (Weeks 3-5)
- Develop school-specific components:
  - Announcement boards
  - Event calendars
  - Staff directories
  - Course showcases
  - Photo galleries
- Create component documentation

### Phase 3: Admin Integration (Weeks 6-8)
- Integrate Puck editor into admin dashboard
- Implement role-based access control
- Create user guides for school administrators
- Develop template library

### Phase 4: Deployment & Training (Weeks 9-10)
- Deploy to production
- Conduct training sessions for school staff
- Create tutorial videos and documentation

## Technical Implementation

### Installation

```bash
# Install Puck CMS
npm install @measured/puck

# Install required dependencies
npm install mongodb mongoose
```

### Basic Setup

```jsx
// pages/admin/cms/editor.js
import { Puck } from '@measured/puck';
import { schoolComponents } from '@/components/puck';

export default function PuckEditor() {
  const [data, setData] = useState(null);
  
  // Load existing content if editing
  useEffect(() => {
    // Fetch content from API
  }, []);
  
  const handlePublish = async (data) => {
    // Save content to database via API
    await fetch('/api/cms/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
  
  return (
    <AdminLayout>
      <Puck
        data={data}
        onPublish={handlePublish}
        config={{
          components: schoolComponents,
        }}
      />
    </AdminLayout>
  );
}
```

### Component Library Example

```jsx
// components/puck/index.js
import { Hero } from './Hero';
import { AnnouncementBoard } from './AnnouncementBoard';
import { EventCalendar } from './EventCalendar';
import { StaffDirectory } from './StaffDirectory';
import { CourseShowcase } from './CourseShowcase';
import { PhotoGallery } from './PhotoGallery';

export const schoolComponents = {
  Hero: {
    component: Hero,
    label: 'Hero Section',
    fields: {
      title: { type: 'text', label: 'Title' },
      subtitle: { type: 'text', label: 'Subtitle' },
      backgroundImage: { type: 'image', label: 'Background Image' },
      buttonText: { type: 'text', label: 'Button Text' },
      buttonLink: { type: 'text', label: 'Button Link' },
    },
  },
  AnnouncementBoard: {
    component: AnnouncementBoard,
    label: 'Announcement Board',
    fields: {
      title: { type: 'text', label: 'Title' },
      maxItems: { type: 'number', label: 'Maximum Items to Show' },
      category: { 
        type: 'select', 
        label: 'Category',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Important', value: 'important' },
          { label: 'Events', value: 'events' },
          { label: 'Academic', value: 'academic' },
        ]
      },
    },
  },
  // Additional components...
};
```

### Content API

```javascript
// pages/api/cms/content/[slug].js
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req, res) {
  const { slug } = req.query;
  const { db } = await connectToDatabase();
  
  if (req.method === 'GET') {
    const content = await db.collection('pages').findOne({ slug });
    if (!content) {
      return res.status(404).json({ message: 'Page not found' });
    }
    return res.status(200).json(content);
  }
  
  if (req.method === 'POST') {
    const { content, title, description } = JSON.parse(req.body);
    
    // Update or create page
    await db.collection('pages').updateOne(
      { slug },
      { 
        $set: { 
          content,
          title,
          description,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );
    
    return res.status(200).json({ message: 'Page saved successfully' });
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}
```

### Rendering Content

```jsx
// pages/[slug].js
import { useRouter } from 'next/router';
import { Puck } from '@measured/puck';
import { schoolComponents } from '@/components/puck';

export default function DynamicPage({ pageData }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  
  return (
    <SchoolLayout>
      <Puck
        data={pageData.content}
        config={{
          components: schoolComponents,
        }}
        renderMode="view"
      />
    </SchoolLayout>
  );
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  
  // Fetch page data from API
  const res = await fetch(`${process.env.API_URL}/api/cms/content/${slug}`);
  
  if (!res.ok) {
    return {
      notFound: true,
    };
  }
  
  const pageData = await res.json();
  
  return {
    props: {
      pageData,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export async function getStaticPaths() {
  // Fetch all page slugs for pre-rendering
  const res = await fetch(`${process.env.API_URL}/api/cms/pages`);
  const pages = await res.json();
  
  const paths = pages.map((page) => ({
    params: { slug: page.slug },
  }));
  
  return {
    paths,
    fallback: true,
  };
}
```

## Database Schema

```javascript
// models/Page.js
import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  content: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
```

## Security Considerations

1. **Role-Based Access Control**: Limit CMS access to authorized personnel
2. **Content Validation**: Implement validation to prevent malicious content
3. **API Security**: Secure API endpoints with proper authentication
4. **Content Backup**: Implement regular content backups
5. **Audit Logging**: Track all content changes for accountability

## User Training Materials

1. **Admin Guide**: Comprehensive documentation for school administrators
2. **Video Tutorials**: Step-by-step guides for common tasks
3. **Component Library Documentation**: Details on available components and their options
4. **Best Practices**: Guidelines for creating effective school pages

## Integration with AI Services

The CMS can be enhanced with our AI services to provide intelligent content suggestions:

1. **Content Optimization**: AI-powered suggestions for improving page content
2. **Automated Tagging**: Automatically categorize and tag content
3. **Personalization**: Dynamically adjust content based on user profiles
4. **Content Analytics**: AI-driven insights on content performance

## Conclusion

Integrating Puck CMS with our school management system provides schools with a flexible, user-friendly way to create and manage their web content. The component-based approach ensures consistency with the main application while giving schools the freedom to customize their online presence.

By following this implementation guide, schools can quickly set up and begin using the CMS to create engaging, informative pages for their communities. 