/**
 * User ID extractor utility
 * 
 * This utility extracts a user ID from various user object formats
 * that might be returned by different authentication providers:
 * - Django REST Framework (id)
 * - JWT tokens (sub)
 * - Appwrite ($id)
 * - Firebase (uid)
 * - MongoDB (_id)
 * - Various profile object structures
 */

export function extractUserId(user) {
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
