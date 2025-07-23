// Test script to verify Appwrite User Profile collection setup
// Run this in your app to test the connection

import { databases, appwriteConfig } from '../../lib/appwrite';

class ProfileVerificationTest {
    
    // Test 1: Check if collection exists and is accessible
    static async testCollectionAccess() {
        try {
            console.log('🔍 Testing collection access...');
            
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                []
            );
            
            console.log('✅ Collection access successful!');
            console.log('📊 Collection stats:', {
                total: response.total,
                documents: response.documents.length
            });
            
            return true;
        } catch (error) {
            console.error('❌ Collection access failed:', error.message);
            console.error('Error details:', error);
            return false;
        }
    }
    
    // Test 2: Test creating a sample profile (optional)
    static async testCreateProfile(testUserId = 'test-user-123') {
        try {
            console.log('🔍 Testing profile creation...');
            
            const testProfile = {
                userId: testUserId,
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                age: 25,
                gender: 'Other',
                bloodType: 'O+',
                height: 170,
                weight: 65,
                notificationsEnabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const response = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                'unique()', // Let Appwrite generate ID
                testProfile
            );
            
            console.log('✅ Profile creation successful!');
            console.log('📄 Created profile:', response);
            
            // Clean up - delete test profile
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                response.$id
            );
            
            console.log('🧹 Test profile cleaned up');
            return true;
            
        } catch (error) {
            console.error('❌ Profile creation failed:', error.message);
            console.error('Error details:', error);
            return false;
        }
    }
    
    // Test 3: Verify all required attributes exist
    static async testAttributeStructure() {
        try {
            console.log('🔍 Testing attribute structure...');
            
            // Create a test document with all attributes
            const testProfile = {
                userId: 'attr-test-123',
                firstName: 'Attr',
                lastName: 'Test',
                email: 'attr@test.com',
                profilePicture: 'https://example.com/pic.jpg',
                age: 30,
                gender: 'Male',
                bloodType: 'A+',
                height: 175,
                weight: 70,
                phoneNumber: '+1234567890',
                emergencyContact: 'Emergency Contact Info',
                address: '123 Test Street',
                allergies: '["Peanuts", "Shellfish"]',
                medicalConditions: '["Hypertension"]',
                notificationsEnabled: true,
                reminderSettings: '{"medication": true, "appointment": true}',
                privacySettings: '{"shareData": false}',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const response = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                'unique()',
                testProfile
            );
            
            console.log('✅ All attributes working correctly!');
            console.log('📋 Attribute test passed');
            
            // Clean up
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userProfileCollectionId,
                response.$id
            );
            
            return true;
            
        } catch (error) {
            console.error('❌ Attribute test failed:', error.message);
            
            // Check for specific attribute errors
            if (error.message.includes('attribute')) {
                console.error('🚨 Missing or incorrectly configured attributes detected!');
            }
            
            return false;
        }
    }
    
    // Run all tests
    static async runAllTests() {
        console.log('🚀 Starting Appwrite User Profile Collection Verification...\n');
        
        const test1 = await this.testCollectionAccess();
        const test2 = await this.testCreateProfile();
        const test3 = await this.testAttributeStructure();
        
        console.log('\n📊 Test Results Summary:');
        console.log(`Collection Access: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Profile Creation: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Attribute Structure: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
        
        if (test1 && test2 && test3) {
            console.log('\n🎉 All tests passed! Your User Profile collection is ready!');
            return true;
        } else {
            console.log('\n⚠️ Some tests failed. Please check the configuration.');
            return false;
        }
    }
}

export default ProfileVerificationTest;
