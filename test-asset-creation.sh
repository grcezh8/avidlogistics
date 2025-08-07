#!/bin/bash

# Generate unique identifiers
TIMESTAMP=$(date +%s)
SERIAL="TEST-${TIMESTAMP}"
BARCODE="BAR-${TIMESTAMP}"
RFID="RFID-${TIMESTAMP}"

echo "Creating test asset with:"
echo "Serial Number: $SERIAL"
echo "Asset Type: VotingMachine"
echo "Barcode: $BARCODE"
echo ""

# Create the asset via API
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d "{
    \"serialNumber\": \"$SERIAL\",
    \"assetType\": \"VotingMachine\",
    \"barcode\": \"$BARCODE\",
    \"rfidTag\": \"$RFID\"
  }"

echo ""
echo ""
echo "Now check the inventory page to see if this asset appears."
echo "Look for Serial Number: $SERIAL"