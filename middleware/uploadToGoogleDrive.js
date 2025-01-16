const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const keyFilePath = path.join(__dirname, 'apikeys.json');;

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

const uploadToGoogleDrive = async (file) => {
  const fileMetadata = {
    name: file.originalname,
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    fs.unlinkSync(file.path);

    console.log('File uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error.response?.data || error.message);
    throw new Error('Failed to upload file to Google Drive');
  }
};

module.exports = { uploadToGoogleDrive };
