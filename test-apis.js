/**
 * API Test Script
 *
 * Test PDOK en DSO APIs direct om te zien of ze werken
 * Run met: node test-apis.js
 */

const fetch = require('node-fetch');

// Test configuratie
const TEST_ADDRESS = 'Plein 1945 1, Haarlem';
const PDOK_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';
const DSO_BASE_URL = 'https://service.omgevingswet.overheid.nl';

console.log('🧪 API Test Script');
console.log('='.repeat(50));
console.log('');

/**
 * Test 1: PDOK Geocoding
 */
async function testPDOK() {
  console.log('📍 Test 1: PDOK Locatieserver Geocoding');
  console.log('-'.repeat(50));

  try {
    const url = `${PDOK_URL}?q=${encodeURIComponent(TEST_ADDRESS)}&fq=type:adres&rows=5`;
    console.log(`URL: ${url}`);
    console.log('Fetching...');

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.response && data.response.docs && data.response.docs.length > 0) {
      console.log(`✅ SUCCESS - Gevonden: ${data.response.docs.length} resultaten`);
      console.log('');
      console.log('Eerste resultaat:');
      const doc = data.response.docs[0];
      console.log(`  Adres: ${doc.weergavenaam}`);
      console.log(`  Coördinaten: ${doc.centroide_ll}`);
      console.log(`  Gemeente: ${doc.gemeentenaam}`);
      console.log(`  Type: ${doc.type}`);
      return { success: true, data: doc };
    } else {
      console.log('❌ FAILED - Geen resultaten gevonden');
      return { success: false, error: 'Geen resultaten' };
    }

  } catch (error) {
    console.log(`❌ FAILED - ${error.message}`);
    console.log('Error details:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: DSO API (zonder API key - sommige endpoints werken publiek)
 */
async function testDSO(lat, lon) {
  console.log('');
  console.log('🏛️  Test 2: DSO Omgevingsdocumenten API');
  console.log('-'.repeat(50));

  if (!lat || !lon) {
    console.log('⚠️  SKIPPED - Geen coördinaten (PDOK test eerst nodig)');
    return { success: false, error: 'Geen coördinaten' };
  }

  try {
    // Probeer verschillende DSO endpoints
    const endpoints = [
      `/publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten?locatie=POINT(${lon} ${lat})`,
      `/publiek/omgevingsdocumenten/api/presenteren/v7/omgevingsdocumenten?locatie=POINT(${lon} ${lat})`,
      `/publiek/catalogus/api/raadplegen/v4/regelingen`
    ];

    for (const endpoint of endpoints) {
      const url = `${DSO_BASE_URL}${endpoint}`;
      console.log(`\nProberen: ${url}`);

      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/hal+json',
            'Content-Type': 'application/json'
          }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS - Response ontvangen`);
          console.log('Response type:', data._links ? 'HAL+JSON ✓' : 'JSON');

          if (data._embedded) {
            const keys = Object.keys(data._embedded);
            console.log(`Embedded data: ${keys.join(', ')}`);

            keys.forEach(key => {
              if (Array.isArray(data._embedded[key])) {
                console.log(`  - ${key}: ${data._embedded[key].length} items`);
              }
            });
          }

          return { success: true, data, endpoint };
        } else if (response.status === 401) {
          console.log('⚠️  401 Unauthorized - API key vereist voor dit endpoint');
        } else if (response.status === 404) {
          console.log('⚠️  404 Not Found - Endpoint bestaat niet of verkeerde URL');
        } else {
          const text = await response.text();
          console.log(`❌ Error: ${text.substring(0, 200)}`);
        }

      } catch (endpointError) {
        console.log(`❌ Error: ${endpointError.message}`);
      }
    }

    console.log('');
    console.log('❌ FAILED - Geen werkend endpoint gevonden');
    console.log('');
    console.log('💡 Mogelijke oorzaken:');
    console.log('   - DSO API key is vereist voor deze endpoints');
    console.log('   - API endpoints zijn gewijzigd (check DSO docs)');
    console.log('   - Locatie heeft geen omgevingsdocumenten');
    console.log('');
    console.log('📖 DSO API Documentatie:');
    console.log('   https://developer.overheid.nl/');
    console.log('   https://aandeslagmetdeomgevingswet.nl/');

    return { success: false, error: 'Geen werkend endpoint' };

  } catch (error) {
    console.log(`❌ FAILED - ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Run alle tests
 */
async function runTests() {
  console.log('Start testing...');
  console.log('');

  // Test 1: PDOK
  const pdokResult = await testPDOK();

  // Test 2: DSO (alleen als PDOK werkt)
  let dsoResult;
  if (pdokResult.success && pdokResult.data) {
    // Parse coördinaten uit PDOK response
    const coords = pdokResult.data.centroide_ll;
    if (coords) {
      const match = coords.match(/POINT\(([\d.]+) ([\d.]+)\)/);
      if (match) {
        const lon = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        dsoResult = await testDSO(lat, lon);
      }
    }
  } else {
    dsoResult = await testDSO(null, null);
  }

  // Samenvatting
  console.log('');
  console.log('='.repeat(50));
  console.log('📊 Test Samenvatting');
  console.log('='.repeat(50));
  console.log(`PDOK Geocoding: ${pdokResult.success ? '✅ WERKT' : '❌ WERKT NIET'}`);
  console.log(`DSO API:        ${dsoResult.success ? '✅ WERKT' : '❌ WERKT NIET'}`);
  console.log('');

  if (!pdokResult.success) {
    console.log('⚠️  PDOK werkt niet - check je internetverbinding');
  }

  if (!dsoResult.success) {
    console.log('⚠️  DSO werkt niet - mogelijk is een API key nodig');
    console.log('');
    console.log('Verkrijg een DSO API key:');
    console.log('1. Ga naar: https://aandeslagmetdeomgevingswet.nl/');
    console.log('2. Registreer een account');
    console.log('3. Vraag API toegang aan');
    console.log('4. Voeg de key toe aan .env: DSO_API_KEY=jouw_key');
  }

  console.log('');
  console.log('Test voltooid! 🎉');
}

// Run de tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
