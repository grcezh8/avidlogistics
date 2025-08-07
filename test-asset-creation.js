// Test script to create an asset via the API
const axios = require('axios');

async function createTestAsset() {
  try {
    const testAsset = {
      serialNumber: `TEST-${Date.now()}`,
      assetType: "VotingMachine",
      barcode: `BAR-${Date.now()}`,
      rfidTag: `RFID-${Date.now()}`
    };

    console.log('Creating test asset:', testAsset);

    const response = await axios.post('http://localhost:5000/api/assets', testAsset, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Asset created successfully!');
    console.log('Response:', response.data);
    console.log('\nNow check the inventory page to see if this asset appears.');
    console.log(`Look for Serial Number: ${testAsset.serialNumber}`);
  } catch (error) {
    console.error('Error creating asset:', error.response?.data || error.message);
  }
}

createTestAsset();