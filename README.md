# 📊 CSV to TXT Converter

A modern web application for converting CSV files to formatted text files. Built with React frontend and Node.js backend.

## Features

- 🎨 Modern, responsive UI with beautiful design
- 📁 Drag & drop file upload
- 📊 Real-time data preview with table and text format
- 💾 Download converted data as TXT file
- 🔄 Support for CSV, Excel (.xlsx, .xls) files
- ⚡ Fast processing with server-side conversion

## Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Node.js with Express
- **File Processing**: xlsx library
- **File Upload**: Multer middleware

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd AddressFileConverter
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Setup (Alternative)

If you prefer to install dependencies separately:

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the servers**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Click on the upload area or drag & drop a CSV file
3. Click "Convert File" to process the file
4. Preview the converted data in both table and text format
5. Click "Download TXT" to save the converted text file

## API Endpoints

- `POST /api/convert` - Upload and convert CSV/Excel files to text format
  - Accepts: multipart/form-data with 'file' field
  - Returns: JSON with converted data structure and text content

## Project Structure

```
AddressFileConverter/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   └── App.css        # Styles
│   └── package.json
├── server/
│   ├── index.js           # Express server
│   └── uploads/           # Temporary file storage
├── package.json           # Backend dependencies
└── README.md
```

## Customization

### Adding New Output Formats

To add support for additional output formats, modify the server's `/api/convert` endpoint in `server/index.js`:

```javascript
// Example: Add JSON output
app.post('/api/convert', upload.single('file'), async (req, res) => {
  // ... existing code ...
  
  // Add your custom conversion logic here
  const customFormat = convertToCustomFormat(jsonData);
  
  res.json({
    success: true,
    data: jsonData,
    customFormat: customFormat
  });
});
```

### Styling

The app uses modern CSS with gradients and animations. You can customize the appearance by modifying `client/src/App.css`.

## Troubleshooting

### Common Issues

1. **"Error connecting to server"**
   - Make sure the backend server is running on port 5000
   - Check that no other application is using port 5000

2. **File upload fails**
   - Ensure the file is a valid Excel (.xlsx, .xls) or CSV file
   - Check file size (default limit is 10MB)

3. **Port already in use**
   - Change the port in `server/index.js` (line 8)
   - Update the frontend API URL in `client/src/App.js` (line 47)

### Development Tips

- Use `npm run dev` for development with auto-reload
- Backend changes require server restart
- Frontend changes auto-reload in development mode

## License

MIT License - feel free to use this project for your own needs!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy converting! 🚀** 