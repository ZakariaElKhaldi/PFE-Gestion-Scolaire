/**
 * Script to test the AI Profiles integration
 * 
 * Usage:
 * node scripts/test-ai-profiles.js [query]
 * 
 * Examples:
 * node scripts/test-ai-profiles.js
 * node scripts/test-ai-profiles.js "What is the main topic of the document?"
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

async function testAIProfilesIntegration() {
  try {
    // Config
    const baseUrl = process.env.AI_PROFILES_API_URL || 'http://localhost:8000/api';
    const apiKey = process.env.AI_PROFILES_API_KEY || '';
    
    // Check if API key exists
    if (!apiKey) {
      console.error('\n❌ Error: AI_PROFILES_API_KEY not configured in .env file');
      process.exit(1);
    }

    console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
    console.log(`Using API URL: ${baseUrl}`);
    
    // 1. Verify API key to get profile ID
    console.log('🔑 Verifying API key...');
    const verifyEndpoint = `${baseUrl}/profiles/verify-key`;
    
    const verifyResponse = await axios.post(verifyEndpoint, { api_key: apiKey });
    
    if (verifyResponse.status !== 200 || !verifyResponse.data.profile_id) {
      console.error('\n❌ Error verifying API key:', verifyResponse.status);
      console.error(verifyResponse.data);
      process.exit(1);
    }
    
    // Extract profile ID
    const profileId = verifyResponse.data.profile_id;
    console.log(`✅ API key verified! Associated with profile ID: ${profileId}`);
    
    // 2. Query the profile
    const query = process.argv[2] || 'What is the main topic of the document?';
    console.log(`\n🔍 Querying profile with: "${query}"`);
    
    const queryEndpoint = `${baseUrl}/profiles/${profileId}/query`;
    
    const queryResponse = await axios.post(queryEndpoint, { query });
    
    if (queryResponse.status !== 200) {
      console.error('\n❌ Error querying profile:', queryResponse.status);
      console.error(queryResponse.data);
      process.exit(1);
    }
    
    // Print the response
    console.log('\n✅ Query successful!');
    console.log('\nResponse:');
    console.log('-'.repeat(80));
    console.log(queryResponse.data.response);
    console.log('-'.repeat(80));
    
    // Print metadata if available
    if (queryResponse.data.metadata) {
      console.log('\nMetadata:');
      console.log(JSON.stringify(queryResponse.data.metadata, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testAIProfilesIntegration(); 