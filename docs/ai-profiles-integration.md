# AI Profiles Integration

This document explains how to use the AI Profiles integration with the School Management System.

## Overview

The School Management System integrates with the AI Profiles API to provide AI-powered features including:

1. **Interactive AI Assistant** - A chatbot-like interface that can answer questions about courses, assignments, and educational content
2. **AI-Powered Course Material Explanations** - Simplified explanations of complex course materials tailored to student level
3. **Personalized Learning Recommendations** - AI-generated recommendations for additional learning resources

## Setup

### Prerequisites

1. A running instance of the AI Profiles backend (see [AI Profiles Repository](https://github.com/your-org/ai-profiles))
2. An API key with access to an AI profile

### Configuration

1. Add the following environment variables to your `.env` file:

```
# AI Profiles API Configuration
AI_PROFILES_API_URL=http://localhost:8000/api
AI_PROFILES_API_KEY=your_api_key_here
```

2. Make sure you've uploaded relevant educational documents to your AI profile through the AI Profiles interface.

### Testing the Integration

You can test if the integration is working correctly using the provided test script:

```bash
node scripts/test-ai-profiles.js "What are the main features of this school system?"
```

## Usage

### Backend API

The following endpoints are available for AI profile interaction:

1. **Query AI Profile**
   - `POST /api/ai-profiles/query`
   - Body: `{ "query": "Your question here", "context": "Optional context" }`
   - Returns AI-generated response

2. **Get Course Material Explanation**
   - `GET /api/ai-profiles/materials/:materialId/explanation?studentLevel=intermediate`
   - Returns simplified explanation of the course material

3. **Get Personalized Recommendations**
   - `GET /api/ai-profiles/students/:studentId/courses/:courseId/recommendations`
   - Returns personalized learning recommendations

### Frontend Integration

The system includes an AI Assistant widget that appears on the student dashboard. Students can ask questions and receive AI-powered responses.

#### Programmatic Usage (Frontend)

The frontend service can be used to interact with the AI profiles:

```typescript
import { AiProfileService } from '@/services/ai-profile.service';

// Ask a general question
const response = await AiProfileService.queryProfile("What is photosynthesis?");
console.log(response.response);

// Get explanation for a course material
const explanation = await AiProfileService.getCourseMaterialExplanation(
  "material_id_here", 
  "beginner"
);
console.log(explanation);

// Get personalized recommendations
const recommendations = await AiProfileService.getPersonalizedRecommendations(
  "student_id_here",
  "course_id_here"
);
console.log(recommendations);
```

## Best Practices

1. **User Experience**: Always indicate to users when they are interacting with an AI system
2. **Context**: Provide context when querying the AI to get more relevant responses
3. **Error Handling**: Always implement proper error handling as the AI service may be unavailable
4. **Review**: Review AI-generated content before using it in critical educational contexts

## Troubleshooting

1. **API Key Invalid**: Ensure your API key is correctly added to the `.env` file
2. **AI Profile Not Responding**: Check if the AI Profiles backend is running
3. **Poor Quality Responses**: Ensure your AI profile has been trained with relevant educational content 