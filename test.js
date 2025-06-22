const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing Web Scraper API...\n');

  const endpoints = [
    { name: 'Health Check', url: '/' },
    { name: 'Browser Test', url: '/test' },
    { name: 'Internshala', url: '/internshala?category=web-development' },
    { name: 'LetsIntern', url: '/letsintern?category=technology' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        timeout: 30000
      });

      console.log(`✅ ${endpoint.name}: SUCCESS`);
      if (endpoint.url === '/') {
        console.log(`   Status: ${response.data.status}`);
      } else if (endpoint.url === '/test') {
        console.log(`   Browser: ${response.data.success ? 'Working' : 'Failed'}`);
      } else {
        console.log(`   Jobs found: ${response.data.count || 0}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };