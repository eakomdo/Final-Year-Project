// Simple network test to debug Django connection
const testUrls = [
    'http://127.0.0.1:8000/',
    'http://localhost:8000/',
    'http://192.168.1.246:8000/',
    'http://0.0.0.0:8000/'
];

async function testConnection(url) {
    try {
        console.log(`Testing: ${url}`);
        const response = await fetch(url, { 
            method: 'GET',
            timeout: 5000 
        });
        console.log(`✅ ${url} - Status: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🔍 Testing Django backend connectivity...\n');
    
    for (const url of testUrls) {
        await testConnection(url);
    }
    
    console.log('\n📱 Testing API endpoint...');
    const apiUrl = 'http://192.168.1.246:8000/api/v1/auth/login/';
    await testConnection(apiUrl);
}

// Run if this is a Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    const fetch = require('node-fetch');
    runTests();
}

module.exports = { testConnection, runTests };
