# Dr. JEG File Upload Feature Documentation

## Overview
The Dr. JEG AI chat interface now supports file uploads, allowing users to send medical reports, prescriptions, lab results, images, and other documents along with their text messages for analysis.

## Features Implemented

### 1. File Selection
- **Document Picker**: Users can select PDF files, text files, and other documents
- **Image Picker**: Users can select images from their photo library
- **File Types Supported**: PDF, images (JPEG, PNG), text files, and other common medical document formats

### 2. User Interface
- **Attachment Button**: A paperclip (📎) icon button next to the text input
- **File Preview**: Shows selected files with thumbnails for images and icons for documents
- **File Information**: Displays file name and size
- **Remove Files**: Users can remove selected files before sending

### 3. File Upload Process
- **Multi-file Support**: Users can attach multiple files to a single message
- **Upload Indicator**: Shows loading state during file upload
- **Error Handling**: Proper error messages for failed uploads or unsupported file types

### 4. Message Display
- **Attachment Previews**: Shows attached files in the chat history
- **Image Thumbnails**: Displays image attachments as previews in messages
- **Document Icons**: Shows document attachments with file names

## Technical Implementation

### Backend Integration
- **API Service**: `drJegService.js` handles file uploads using FormData
- **Multipart Upload**: Supports `multipart/form-data` for file attachments
- **Conversation Context**: Files are sent with the conversation ID for context

### State Management
- `selectedFiles`: Array of selected files before sending
- `isUploading`: Boolean to track upload progress
- `attachments`: Files attached to messages in chat history

### File Structure
```javascript
{
  id: 'file-timestamp',
  uri: 'file://path/to/file',
  name: 'filename.pdf',
  type: 'application/pdf',
  size: 1024000
}
```

## Usage Instructions

### For Users
1. **Open Dr. JEG Chat**: Navigate to the AI chat screen
2. **Tap Attachment Button**: Click the paperclip icon next to the text input
3. **Choose File Type**: Select "Photo Library" for images or "Document" for files
4. **Select Files**: Choose one or more files to attach
5. **Review Attachments**: See file previews above the text input
6. **Send Message**: Type a message (optional) and tap send
7. **View Response**: Dr. JEG will analyze the files and provide insights

### For Developers
1. **File Permissions**: The app automatically requests necessary permissions for file access
2. **Error Handling**: Implements proper error messages for various failure scenarios
3. **Performance**: Optimized for handling multiple file uploads
4. **Memory Management**: Efficient handling of file previews and attachments

## Supported File Types
- **Images**: JPEG, PNG, GIF
- **Documents**: PDF, TXT, DOC, DOCX
- **Medical Files**: Lab reports, prescriptions, medical images
- **Size Limit**: Configurable per backend settings

## Security Considerations
- **File Validation**: Client-side validation of file types and sizes
- **Secure Upload**: Files are uploaded using secure HTTPS connections
- **Privacy**: Files are processed securely and not stored permanently unless specified

## Testing
Run the integration test to verify all components are working:
```bash
node test-file-upload.js
```

## Future Enhancements
- **Camera Integration**: Direct photo capture for medical images
- **Voice Messages**: Audio file upload support
- **File Compression**: Automatic compression for large files
- **OCR Integration**: Text extraction from image documents
- **File Organization**: Categorize uploads by medical type

## Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure app has camera roll and file access permissions
2. **Upload Failed**: Check network connection and file size limits
3. **Unsupported File**: Verify file type is in the supported formats list
4. **UI Not Responsive**: Restart the app if file selection doesn't respond

### Debug Commands
```bash
# Check file upload integration
node test-file-upload.js

# Test API connectivity
npm run test-api

# Check app permissions
npx expo install expo-permissions
```

## API Endpoints Used
- `POST /api/v1/dr-jeg/conversation/` - Send message with attachments
- `POST /api/v1/dr-jeg/upload/` - Direct file upload
- `GET /api/v1/dr-jeg/supported-files/` - Get supported file types

## Dependencies
- `expo-document-picker`: File selection from device storage
- `expo-image-picker`: Image selection from photo library
- `react-native`: Core platform components
- `@expo/vector-icons`: UI icons for attachments

---

**Note**: This feature requires backend support for file processing. Ensure the Django backend is configured to handle multipart file uploads and medical document analysis.
