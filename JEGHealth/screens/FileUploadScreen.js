import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    Modal,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import StorageService from '../lib/storage';

const FileUploadScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const fileCategories = [
        { key: 'all', label: 'All Files' },
        { key: 'profile', label: 'Profile Pictures' },
        { key: 'medical', label: 'Medical Documents' },
        { key: 'reports', label: 'Lab Reports' },
        { key: 'prescriptions', label: 'Prescriptions' },
        { key: 'insurance', label: 'Insurance' }
    ];

    useEffect(() => {
        loadUploadedFiles();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        }
    };

    const loadUploadedFiles = async () => {
        try {
            setLoading(true);
            // In a real app, you'd load this from your database
            // For now, we'll simulate with empty array
            setUploadedFiles([]);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const showUploadOptions = () => {
        Alert.alert(
            'Upload File',
            'Choose an option',
            [
                { text: 'Camera', onPress: openCamera },
                { text: 'Photo Library', onPress: openImagePicker },
                { text: 'Document', onPress: openDocumentPicker },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const openCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                uploadFile(result.assets[0], 'image');
            }
        } catch (error) {
            console.error('Error opening camera:', error);
            Alert.alert('Error', 'Failed to open camera');
        }
    };

    const openImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                uploadFile(result.assets[0], 'image');
            }
        } catch (error) {
            console.error('Error opening image picker:', error);
            Alert.alert('Error', 'Failed to open image picker');
        }
    };

    const openDocumentPicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                uploadFile(result.assets[0], 'document');
            }
        } catch (error) {
            console.error('Error opening document picker:', error);
            Alert.alert('Error', 'Failed to open document picker');
        }
    };

    const uploadFile = async (file, type) => {
        try {
            setLoading(true);

            // Create file object for Appwrite
            const fileToUpload = {
                name: file.name || `${type}_${Date.now()}`,
                type: file.mimeType || 'application/octet-stream',
                size: file.size || 0,
                uri: file.uri
            };

            let uploadResult;
            
            if (type === 'image') {
                uploadResult = await StorageService.uploadProfilePicture(fileToUpload);
            } else {
                uploadResult = await StorageService.uploadMedicalDocument(fileToUpload);
            }

            // Add to local state (in real app, you'd save to database)
            const newFile = {
                id: uploadResult.fileId,
                name: uploadResult.fileName,
                type: type,
                size: uploadResult.fileSize,
                url: uploadResult.fileUrl,
                uploadDate: new Date().toISOString(),
                category: type === 'image' ? 'profile' : 'medical'
            };

            setUploadedFiles(prev => [newFile, ...prev]);
            
            Alert.alert('Success', 'File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = async (file) => {
        Alert.alert(
            'Delete File',
            'Are you sure you want to delete this file?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            
                            // Determine bucket based on file type
                            const bucketId = file.category === 'profile' 
                                ? 'jeg_profile_pictures' 
                                : 'jeg_medical_documents';
                            
                            await StorageService.deleteFile(bucketId, file.id);
                            
                            setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                            
                            Alert.alert('Success', 'File deleted successfully');
                        } catch (error) {
                            console.error('Error deleting file:', error);
                            Alert.alert('Error', 'Failed to delete file');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const previewFile = (file) => {
        setSelectedFile(file);
        setPreviewModalVisible(true);
    };

    const getFileIcon = (file) => {
        if (file.type === 'image') {
            return 'image-outline';
        }
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'document-text-outline';
            case 'doc':
            case 'docx':
                return 'document-outline';
            case 'xls':
            case 'xlsx':
                return 'grid-outline';
            default:
                return 'document-outline';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderFileItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.fileItem}
            onPress={() => previewFile(item)}
        >
            <View style={styles.fileIcon}>
                <Ionicons name={getFileIcon(item)} size={32} color="#007BFF" />
            </View>
            
            <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.fileDetails}>
                    {formatFileSize(item.size)} • {new Date(item.uploadDate).toLocaleDateString()}
                </Text>
                <Text style={styles.fileCategory}>{item.category}</Text>
            </View>
            
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteFile(item)}
            >
                <Ionicons name="trash-outline" size={20} color="#dc3545" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderCategoryTabs = () => (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
        >
            {fileCategories.map(category => (
                <TouchableOpacity
                    key={category.key}
                    style={[
                        styles.categoryTab,
                        selectedCategory === category.key && styles.activeCategoryTab
                    ]}
                    onPress={() => setSelectedCategory(category.key)}
                >
                    <Text style={[
                        styles.categoryTabText,
                        selectedCategory === category.key && styles.activeCategoryTabText
                    ]}>
                        {category.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const filteredFiles = selectedCategory === 'all' 
        ? uploadedFiles 
        : uploadedFiles.filter(file => file.category === selectedCategory);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>My Documents</Text>
                <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={showUploadOptions}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#007BFF" />
                    ) : (
                        <Ionicons name="add" size={24} color="#007BFF" />
                    )}
                </TouchableOpacity>
            </View>

            {renderCategoryTabs()}

            <View style={styles.content}>
                {filteredFiles.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No files uploaded yet</Text>
                        <Text style={styles.emptySubtext}>
                            Tap the + button to upload your first document
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredFiles}
                        renderItem={renderFileItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* File Preview Modal */}
            <Modal
                visible={previewModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.previewModal}>
                    <View style={styles.previewHeader}>
                        <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                            <Text style={styles.closeButton}>Close</Text>
                        </TouchableOpacity>
                        <Text style={styles.previewTitle} numberOfLines={1}>
                            {selectedFile?.name}
                        </Text>
                        <TouchableOpacity onPress={() => Alert.alert('Download', 'Download feature coming soon!')}>
                            <Ionicons name="download-outline" size={24} color="#007BFF" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.previewContent}>
                        {selectedFile?.type === 'image' ? (
                            <Image 
                                source={{ uri: selectedFile.url }} 
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.documentPreview}>
                                <Ionicons name={getFileIcon(selectedFile)} size={80} color="#007BFF" />
                                <Text style={styles.documentName}>{selectedFile?.name}</Text>
                                <Text style={styles.documentInfo}>
                                    {formatFileSize(selectedFile?.size || 0)}
                                </Text>
                                <TouchableOpacity 
                                    style={styles.openButton}
                                    onPress={() => Alert.alert('Open', 'External app opening coming soon!')}
                                >
                                    <Text style={styles.openButtonText}>Open in External App</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    uploadButton: {
        padding: 8,
    },
    categoryTabs: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    activeCategoryTab: {
        backgroundColor: '#007BFF',
    },
    categoryTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeCategoryTabText: {
        color: 'white',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    fileIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    fileDetails: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    fileCategory: {
        fontSize: 12,
        color: '#007BFF',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    deleteButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    previewModal: {
        flex: 1,
        backgroundColor: 'white',
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        fontSize: 16,
        color: '#666',
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    previewContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    previewImage: {
        width: '100%',
        height: '80%',
    },
    documentPreview: {
        alignItems: 'center',
    },
    documentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    documentInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    openButton: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    openButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FileUploadScreen;