const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Path to the service account key file
const keyFilePath = path.join(__dirname, '../apikeys.json');

// Authenticate using the service account
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive'], // Full access to Google Drive
});

// Initialize Google Drive API client
const drive = google.drive({ version: 'v3', auth });

/**
 * Upload a file to Google Drive and make it publicly accessible
 * @param {Object} file - File object containing originalname, mimetype, and path
 * @returns {Object} - Response containing file ID, webViewLink, and webContentLink
 */
const uploadToGoogleDrive = async (file) => {
  if (!file || !file.originalname || !file.mimetype || !file.path) {
    throw new Error('Invalid file object. Ensure originalname, mimetype, and path are provided.');
  }

  const fileMetadata = {
    name: file.originalname, // Set the file name in Google Drive
  };
  const media = {
    mimeType: file.mimetype, // Set the file MIME type
    body: fs.createReadStream(file.path), // Read the file content
  };

  try {
    // Upload the file to Google Drive
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink', // Get file links
    });

    const fileId = response.data.id;

    // Set the file to be publicly accessible
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader', // Access level
        type: 'anyone', // Make it accessible to anyone
      },
    });

    // Delete the temporary file after upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Return the file details along with public links
    console.log('File uploaded and made public:', response.data);
    return {
      ...response.data,
      publicLink: `https://drive.google.com/uc?id=${fileId}&export=download`, // Public download link
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error.response?.data || error.message);
    throw new Error('Failed to upload and make file public on Google Drive');
  }
};

module.exports = { 
  uploadToGoogleDrive,
};
