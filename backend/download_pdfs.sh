#!/bin/bash
# Quick Download Script for Real Industrial PDFs

echo "=================================================="
echo "  Downloading Real Industrial PDFs"
echo "=================================================="
echo ""

# Create directory
mkdir -p "real_industrial_pdfs"
cd "real_industrial_pdfs"

echo "📥 Starting downloads..."
echo ""

# 1. API 610 Pump Standard (Public Domain)
echo "[1/10] Downloading API 610 Pump Standard..."
curl -L -o "01_API_610_Pump_Standard.pdf" \
  "https://law.resource.org/pub/us/cfr/ibr/003/api.610.1989.pdf" \
  --silent --show-error --max-time 60

# 2. Pump Basics Guide
echo "[2/10] Downloading Pump Basics Guide..."
curl -L -o "02_Pump_Basics_Guide.pdf" \
  "https://www.pumpschool.com/intro/Pump%20Basics.pdf" \
  --silent --show-error --max-time 60

# 3. OSHA Safety Publication
echo "[3/10] Downloading OSHA Safety Guide..."
curl -L -o "03_OSHA_Safety_Guide.pdf" \
  "https://www.osha.gov/Publications/osha3990.pdf" \
  --silent --show-error --max-time 60

# 4. CCOHS Welding Safety
echo "[4/10] Downloading Industrial Safety Guide..."
curl -L -o "04_Industrial_Safety_Welding.pdf" \
  "https://www.ccohs.ca/oshanswers/safety_haz/welding/fumes.pdf" \
  --silent --show-error --max-time 60

# 5. Grundfos Technical Data
echo "[5/10] Downloading Grundfos Pump Technical Data..."
curl -L -o "05_Grundfos_Pump_Technical.pdf" \
  "https://product-selection.grundfos.com/documents/cri/cri-technical-data-sheet-4124524.pdf" \
  --silent --show-error --max-time 60

# 6. Industrial Ventilation Guide
echo "[6/10] Downloading Ventilation Guide..."
curl -L -o "06_Industrial_Ventilation.pdf" \
  "https://www.cdc.gov/niosh/docs/2012-116/pdfs/2012-116.pdf" \
  --silent --show-error --max-time 60

# 7. Electrical Safety NFPA 70E Sample
echo "[7/10] Downloading Electrical Safety Guide..."
curl -L -o "07_Electrical_Safety_NFPA.pdf" \
  "https://www.nfpa.org/-/media/Files/Codes-and-standards/All-Codes-and-standards/70E/NFPA70E-sample.pdf" \
  --silent --show-error --max-time 60

# 8. EPA Industrial Wastewater Guide
echo "[8/10] Downloading EPA Wastewater Guide..."
curl -L -o "08_EPA_Industrial_Wastewater.pdf" \
  "https://www3.epa.gov/npdes/pubs/industrial_swppp_guide.pdf" \
  --silent --show-error --max-time 60

# 9. Process Safety Management Guide
echo "[9/10] Downloading Process Safety Guide..."
curl -L -o "09_Process_Safety_Management.pdf" \
  "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119" \
  --silent --show-error --max-time 60

# 10. Industrial Hygiene Guide
echo "[10/10] Downloading Industrial Hygiene Guide..."
curl -L -o "10_Industrial_Hygiene.pdf" \
  "https://www.cdc.gov/niosh/docs/2003-154/pdfs/2003-154.pdf" \
  --silent --show-error --max-time 60

echo ""
echo "=================================================="
echo "  Download Complete!"
echo "=================================================="
echo ""

# Check downloaded files
echo "📊 Downloaded files:"
ls -lh *.pdf 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

# Count valid PDFs
valid_pdfs=$(find . -name "*.pdf" -size +1k | wc -l | tr -d ' ')
echo ""
echo "✓ Valid PDFs downloaded: $valid_pdfs"

if [ "$valid_pdfs" -gt 0 ]; then
    echo ""
    echo "🧪 Ready to test! Run:"
    echo "  cd /Users/Utkarsh/Documents/AI\ Hackthon"
    echo "  python3 scripts/batch_test_pdfs.py real_industrial_pdfs/ --detailed"
else
    echo ""
    echo "⚠️  No valid PDFs downloaded."
    echo "  Some URLs may be restricted or require authentication."
    echo "  See DOWNLOAD_REAL_PDFS.md for alternative sources."
fi

echo ""
