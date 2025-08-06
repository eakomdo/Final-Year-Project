/**
 * User ID extraction test script
 */

console.log('=== Testing User ID Extraction ===');

// Various user object formats from different backends
const userObjects = [
  // Django REST Framework format
  {
    name: 'Django REST user',
    user: {
      id: 123,
      email: 'user@example.com',
      profile: {
        id: 456,
        contact: '123456789'
      }
    }
  },
  // JWT token payload format
  {
    name: 'JWT token user',
    user: {
      sub: 'auth0|123456',
      email: 'user@example.com'
    }
  },
  // Appwrite format
  {
    name: 'Appwrite user',
    user: {
      $id: 'abcd1234',
      email: 'user@example.com'
    }
  },
  // Firebase format
  {
    name: 'Firebase user',
    user: {
      uid: 'firebase-uid-123',
      email: 'user@example.com'
    }
  },
  // MongoDB format
  {
    name: 'MongoDB user',
    user: {
      _id: '507f1f77bcf86cd799439011',
      email: 'user@example.com'
    }
  },
  // Django User with profile.user_id
  {
    name: 'Django with profile.user_id',
    user: {
      email: 'user@example.com',
      profile: {
        user_id: 789
      }
    }
  }
];

// Extract user ID function
function extractUserId(user) {
  if (!user) return null;
  
  // Try direct ID properties first
  if (user.id) return user.id;
  if (user.pk) return user.pk;
  if (user._id) return user._id;
  if (user.$id) return user.$id;
  if (user.uid) return user.uid;
  if (user.user_id) return user.user_id;
  if (user.sub) return user.sub;
  
  // Try profile
  if (user.profile?.id) return user.profile.id;
  if (user.profile?.user_id) return user.profile.user_id;
  
  return null;
}

// Test each user object
userObjects.forEach(testCase => {
  const userId = extractUserId(testCase.user);
  console.log(`\n${testCase.name}:`);
  console.log('User object:', JSON.stringify(testCase.user, null, 2));
  console.log('Extracted ID:', userId);
});

console.log('\n=== Recommendation ===');
console.log('Add this function to extract user ID:');
console.log(`
function extractUserId(user) {
  if (!user) return null;
  
  // Try direct ID properties first
  if (user.id) return user.id;
  if (user.pk) return user.pk;
  if (user._id) return user._id;
  if (user.$id) return user.$id;
  if (user.uid) return user.uid;
  if (user.user_id) return user.user_id;
  if (user.sub) return user.sub;
  
  // Try profile
  if (user.profile?.id) return user.profile.id;
  if (user.profile?.user_id) return user.profile.user_id;
  
  return null;
}
`);
