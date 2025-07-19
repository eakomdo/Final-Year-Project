import { storage, appwriteConfig, ID } from './appwrite';

class StorageService {
    // Upload profile picture
    async uploadProfilePicture(file) {
        try {
            const result = await storage.createFile(
                appwriteConfig.profilePicturesBucketId,
                ID.unique(),
                file
            );

            // Get file URL
            const fileUrl = storage.getFileView(
                appwriteConfig.profilePicturesBucketId,
                result.$id
            );

            return {
                fileId: result.$id,
                fileUrl: fileUrl,
                fileName: result.name,
                fileSize: result.sizeOriginal
            };
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    }

    // Upload medical document
    async uploadMedicalDocument(file) {
        try {
            const result = await storage.createFile(
                appwriteConfig.medicalDocumentsBucketId,
                ID.unique(),
                file
            );

            const fileUrl = storage.getFileView(
                appwriteConfig.medicalDocumentsBucketId,
                result.$id
            );

            return {
                fileId: result.$id,
                fileUrl: fileUrl,
                fileName: result.name,
                fileSize: result.sizeOriginal
            };
        } catch (error) {
            console.error('Error uploading medical document:', error);
            throw error;
        }
    }

    // Delete file
    async deleteFile(bucketId, fileId) {
        try {
            await storage.deleteFile(bucketId, fileId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Get file URL
    getFileUrl(bucketId, fileId) {
        return storage.getFileView(bucketId, fileId);
    }

    // Get file download URL
    getFileDownloadUrl(bucketId, fileId) {
        return storage.getFileDownload(bucketId, fileId);
    }
}

export default new StorageService();