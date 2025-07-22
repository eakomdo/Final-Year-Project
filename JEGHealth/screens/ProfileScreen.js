import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import StorageService from '../lib/storage';

const ProfileScreen = ({ navigation }) => {
    const { user, userProfile, userRole, logout, getUserRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileImageUri, setProfileImageUri] = useState(null);

    const roleName = getUserRole();

    useEffect(() => {
        // Load profile image if exists
        if (user?.profile_picture) {
            setProfileImageUri(user.profile_picture);
        }
    }, [user]);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const result = await logout();
                        if (!result.success) {
                            Alert.alert('Error', result.error);
                        }
                        setLoading(false);
                    }
                }
            ]
        );
    };

    const getProfileData = () => {
        if (!userProfile?.data) return {};
        
        try {
            return typeof userProfile.data === 'string' 
                ? JSON.parse(userProfile.data) 
                : userProfile.data;
        } catch (error) {
            console.error('Error parsing profile data:', error);
            return {};
        }
    };

    const profileData = getProfileData();

    const renderPersonalInfo = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.name || 'Not provided'}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone_number || 'Not provided'}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={[styles.infoValue, styles.roleText]}>
                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                </Text>
            </View>
        </View>
    );

    const renderRoleSpecificInfo = () => {
        switch (roleName) {
            case 'patient':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medical Information</Text>
                        
                        {profileData.date_of_birth && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Date of Birth</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(profileData.date_of_birth).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                        
                        {profileData.gender && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Gender</Text>
                                <Text style={styles.infoValue}>
                                    {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}
                                </Text>
                            </View>
                        )}
                        
                        {profileData.blood_type && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Blood Type</Text>
                                <Text style={styles.infoValue}>{profileData.blood_type}</Text>
                            </View>
                        )}
                        
                        {profileData.emergency_contact?.name && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Emergency Contact</Text>
                                <Text style={styles.infoValue}>
                                    {profileData.emergency_contact.name}
                                    {profileData.emergency_contact.phone && 
                                        ` - ${profileData.emergency_contact.phone}`
                                    }
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 'doctor':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Information</Text>
                        
                        {profileData.license_number && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>License Number</Text>
                                <Text style={styles.infoValue}>{profileData.license_number}</Text>
                            </View>
                        )}
                        
                        {profileData.specialty && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Specialty</Text>
                                <Text style={styles.infoValue}>{profileData.specialty}</Text>
                            </View>
                        )}
                        
                        {profileData.clinic_name && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Clinic/Hospital</Text>
                                <Text style={styles.infoValue}>{profileData.clinic_name}</Text>
                            </View>
                        )}
                        
                        {profileData.years_experience && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Years of Experience</Text>
                                <Text style={styles.infoValue}>{profileData.years_experience} years</Text>
                            </View>
                        )}
                    </View>
                );

            case 'caretaker':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Caretaker Information</Text>
                        
                        {profileData.relationship && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Relationship</Text>
                                <Text style={styles.infoValue}>{profileData.relationship}</Text>
                            </View>
                        )}
                        
                        {profileData.unique_code && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Unique Code</Text>
                                <Text style={[styles.infoValue, styles.uniqueCode]}>
                                    {profileData.unique_code}
                                </Text>
                            </View>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    const renderActionButtons = () => (
        <View style={styles.section}>
            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <Ionicons name="create-outline" size={20} color="#007BFF" />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('FileUpload')}
            >
                <Ionicons name="document-text-outline" size={20} color="#007BFF" />
                <Text style={styles.actionButtonText}>Manage Documents</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
            >
                <Ionicons name="settings-outline" size={20} color="#007BFF" />
                <Text style={styles.actionButtonText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Help', 'Help & Support coming soon!')}
            >
                <Ionicons name="help-circle-outline" size={20} color="#007BFF" />
                <Text style={styles.actionButtonText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#dc3545" />
                ) : (
                    <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                )}
                <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.profileImageContainer}>
                    {profileImageUri ? (
                        <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Ionicons name="person" size={40} color="#666" />
                        </View>
                    )}
                    <TouchableOpacity 
                        style={styles.editImageButton}
                        onPress={() => Alert.alert('Photo', 'Photo upload coming soon!')}
                    >
                        <Ionicons name="camera" size={16} color="white" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileRole}>
                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                </Text>
                
                {user?.is_verified && (
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#28A745" />
                        <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                )}
            </View>

            {/* Profile Information */}
            {renderPersonalInfo()}
            {renderRoleSpecificInfo()}
            {renderActionButtons()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    profileHeader: {
        backgroundColor: 'white',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editImageButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007BFF',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d4edda',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifiedText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#28A745',
        fontWeight: '600',
    },
    section: {
        backgroundColor: 'white',
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    roleText: {
        color: '#007BFF',
        fontWeight: '600',
    },
    uniqueCode: {
        fontFamily: 'monospace',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    actionButtonText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: '#dc3545',
    },
});

export default ProfileScreen;