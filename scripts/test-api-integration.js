#!/usr/bin/env node

/**
 * Test script to verify the Property API integration
 * Usage: node scripts/test-api-integration.js [accountNumber]
 */

const DEFAULT_ACCOUNT = '1157370000003';

async function testAPIIntegration(accountNumber = DEFAULT_ACCOUNT) {
  const apiBaseUrl = process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
  const url = `${apiBaseUrl}/api/v1/properties/account/${accountNumber}?include=buildings,owners`;
  
  console.log('🧪 Testing Property API Integration');
  console.log('📍 API URL:', url);
  console.log('🔍 Account Number:', accountNumber);
  console.log('');

  try {
    console.log('⏳ Fetching data from API...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  Response time: ${duration}ms`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Property not found (404)');
        return false;
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched property data');
    console.log('📊 Data summary:');
    console.log(`   - Account: ${data.acct || 'N/A'}`);
    console.log(`   - Address: ${data.siteAddr1 || 'N/A'}`);
    console.log(`   - Market Value: ${data.totMktVal || 'N/A'}`);
    console.log(`   - Buildings: ${data.buildings?.length || 0}`);
    console.log(`   - Owners: ${data.owners?.length || 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const accountNumber = process.argv[2] || DEFAULT_ACCOUNT;
  testAPIIntegration(accountNumber)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testAPIIntegration }; 