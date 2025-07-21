import { Client, Account, Databases, Storage, Functions, ID, Query } from 'appwrite';

export const appwriteConfig = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    platform: "com.jeghealth.app",
    projectId: "jeghealth",
    databaseId: "jegdata",
    
    // Collections IDs - You'll get these when creating collections in Appwrite Console
    userCollectionId: "jeg_users",
    roleCollectionId: "jeg_roles",
    userProfileCollectionId: "jeg_user_profiles",
    userRelationshipCollectionId: "jeg_user_relationships",
    healthMetricCollectionId: "jeg_health_metrics",
    medicationCollectionId: "jeg_medications",
    appointmentCollectionId: "jeg_appointments",
    notificationCollectionId: "jeg_notifications",
    medicalRecordCollectionId: "jeg_medical_records",
    consultationCollectionId: "jeg_consultations",
    
    // Storage Buckets IDs - You'll get these when creating buckets in Appwrite Console
    profilePicturesBucketId: "jeg_profile_pictures",
    medicalDocumentsBucketId: "jeg_medical_documents",
};

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

// Note: setPlatform has been deprecated in newer versions of Appwrite
// It's no longer needed for React Native apps

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { ID, Query };
export default client;