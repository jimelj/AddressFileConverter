const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../client/build'))); // REMOVE for Render

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

// Routes
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let jsonData;

    // Handle both CSV and Excel files
    if (req.file.mimetype === 'text/csv') {
      // Read CSV file
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const workbook = XLSX.read(csvContent, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } else {
      // Handle Excel files
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }
    
    // Convert to text format
    const textContent = convertToTextFormat(jsonData);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      data: jsonData,
      textContent: textContent,
      headers: CANONICAL_HEADER,
      rows: jsonData.slice(1) || []
    });
    
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Canonical header from the user's sample (update this string if the sample changes)
const CANONICAL_HEADER = [
  "Primary Salutation","Street Address","Secondary Ad","City Address","ST","Zip","Z+4","CRRT","WalkS","Delivery Point Usage Code","DPBC Digit","DPBC Check Digit","List Code","Alternate Salutation","Median Age","Median Home Value","Median Income","Dwelling Type","Home Ownership Code","Owner Occupied","Renter Occupied","Households with Children","African American","Asian","Hispanic","Education","Health & Fitness","Do It Yourselfer","Travel","Latitude","Longitude","Match Code Level","CBSA","Census Tract","Census Block","Endorsement Field","Pre Name","First Name","M","Last Name","Post"
];

// Mapping from output header to uploaded CSV column
const HEADER_MAP = {
  "Primary Salutation": "title",
  "Street Address": "addressl",
  "City Address": "city",
  "ST": "st",
  "Zip": "zip",
  "Z+4": "zip4",
  "CRRT": "crid",
  "WalkS": "sequence",
  "DPBC Digit": "dp",
  "DPBC Check Digit": "cd",
  "Endorsement Field": "endorse"
  // All other fields will be left empty
};

function convertToTextFormat(data) {
  if (!data || data.length === 0) return '';

  // The first row of data is the uploaded CSV's header
  const uploadedHeader = data[0] || [];
  const rows = data.slice(1) || [];

  // Map uploaded header fields to their indices (case-insensitive, trimmed)
  const headerIndexMap = {};
  uploadedHeader.forEach((h, i) => {
    if (h) headerIndexMap[h.trim().toLowerCase()] = i;
  });

  // Debug: print uploaded header and mapping
  console.log('Uploaded CSV header:', uploadedHeader);
  console.log('Header index map:', headerIndexMap);
  console.log('Output mapping:');
  CANONICAL_HEADER.forEach(header => {
    const csvCol = HEADER_MAP[header];
    if (csvCol) {
      console.log(`Output column "${header}" <- CSV column "${csvCol}"`);
    }
  });

  let textContent = '';

  // Add canonical header (always quoted)
  const formattedHeaders = CANONICAL_HEADER.map(header => `"${header}"`).join(',');
  textContent += formattedHeaders + '\n';

  // For each row, map values to canonical header order using HEADER_MAP
  rows.forEach(row => {
    const formattedRow = CANONICAL_HEADER.map(header => {
      const csvCol = HEADER_MAP[header];
      if (!csvCol) return '""'; // Always output quoted empty string for unmapped columns
      const idx = headerIndexMap[csvCol.trim().toLowerCase()];
      const cell = idx !== undefined ? row[idx] : '';
      if (cell === undefined || cell === null || cell === '') {
        return '""'; // Always output quoted empty string for empty values
      } else {
        return `"${cell.toString().replace(/"/g, '""') }"`;
      }
    }).join(',');
    textContent += formattedRow + '\n';
  });

  return textContent;
}

// Serve React app for any other routes
// Remove this catch-all route for Render deployment
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 