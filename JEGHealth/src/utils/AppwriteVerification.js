import { databases, appwriteConfig, account, ID, Query } from '../../lib/appwrite';

export class AppwriteVerification {
  static async runAllTests() {
    console.log('🚀 Starting Appwrite Verification Tests...\n');

    const results = {
      collectionAccess: await this.verifyCollectionAccess(),
      profileCreation: await this.verifyProfileCreation(),
      attributeStructure: await this.verifyAttributeStructure(),
    };

    console.log('\n📊 Test Results Summary:');
    console.log('Collection Access:', results.collectionAccess.success ? '✅ PASS' : '❌ FAIL');
    console.log('Profile Creation:', results.profileCreation.success ? '✅ PASS' : '❌ FAIL');
    console.log('Attribute Structure:', results.attributeStructure.success ? '✅ PASS' : '❌ FAIL');

    const allPassed = Object.values(results).every(result => result.success);
    console.log(allPassed ? '\n🎉 All tests passed!' : '\n⚠️ Some tests failed. Please check the configuration.');

    return results;
  }

  static async verifyCollectionAccess() {
    try {
      console.log('🔍 Testing collection access...');
      
      // First check if user is authenticated
      try {
        const user = await account.get();
        console.log('✅ User authenticated:', user.email, 'ID:', user.$id);
      } catch (authError) {
        console.log('❌ User not authenticated:', authError.message);
        return {
          success: false,
          error: 'User not authenticated. Please log in first.',
          details: authError
        };
      }
      
      // Try to list documents (empty list is fine)
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userProfileCollectionId,
        [Query.limit(1)]
      );
      
      console.log('✅ Collection access successful');
      return {
        success: true,
        message: 'Collection accessible',
        data: response
      };
    } catch (error) {
      console.log('❌ Collection access failed:', error.message);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  static async verifyProfileCreation() {
    try {
      console.log('🔍 Testing profile creation...');
      
      // Get current user
      const user = await account.get();
      console.log('User for profile creation:', user.$id, user.email);
      
      // Try to create a test profile
      const testProfile = {
        userId: user.$id,
        firstName: 'Test',
        lastName: 'User',
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Attempting to create profile with data:', testProfile);
      console.log('Database ID:', appwriteConfig.databaseId);
      console.log('Collection ID:', appwriteConfig.userProfileCollectionId);

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userProfileCollectionId,
        ID.unique(),
        testProfile
      );

      console.log('✅ Profile creation successful');
      
      // Clean up - delete the test profile
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userProfileCollectionId,
        response.$id
      );
      
      console.log('✅ Test profile cleaned up');
      
      return {
        success: true,
        message: 'Profile creation works',
        data: response
      };
    } catch (error) {
      console.log('❌ Profile creation failed:', error.message);
      console.log('Error type:', error.type);
      console.log('Error code:', error.code);
      console.log('Full error details:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  static async verifyAttributeStructure() {
    try {
      console.log('🔍 Testing attribute structure...');
      
      // Test by trying to create a document with all expected attributes
      const user = await account.get();
      
      const fullTestProfile = {
        // Required fields
        userId: user.$id,
        firstName: 'John',
        lastName: 'Doe',
        email: user.email,
        
        // Optional fields to test all attributes
        profilePicture: 'https://example.com/profile.jpg',
        age: 30,
        gender: 'Male',
        bloodType: 'O+',
        height: 175,
        weight: 70,
        phoneNumber: '+1234567890',
        emergencyContact: 'Jane Doe - +0987654321',
        address: '123 Main St, City, Country',
        allergies: JSON.stringify(['Peanuts', 'Shellfish']),
        medicalConditions: JSON.stringify(['Hypertension']),
        notificationsEnabled: true,
        reminderSettings: JSON.stringify({medication: true, appointment: true}),
        privacySettings: JSON.stringify({shareWithDoctors: true}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userProfileCollectionId,
        ID.unique(),
        fullTestProfile
      );

      console.log('✅ All attributes work correctly');
      
      // Clean up
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userProfileCollectionId,
        response.$id
      );

      return {
        success: true,
        message: 'All attributes structured correctly',
        data: response
      };
    } catch (error) {
      console.log('❌ Attribute test failed:', error.message);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }
}

export default AppwriteVerification;
