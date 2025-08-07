import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DatabaseService from '../lib/database';
import NotificationService from '../src/services/NotificationService';
import { appointmentsAPI, providersAPI } from '../api/services';
import { extractUserId } from '../utils/userUtils';

const AppointmentsScreen = () => {
    const { user, isLoading, isAuthenticated, validateToken } = useAuth();
    const authLoading = isLoading;
    const { theme } = useTheme(); // Add theme context
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showAppointmentTypePicker, setShowAppointmentTypePicker] = useState(false);
    const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
    const [selectedTab, setSelectedTab] = useState('upcoming'); // upcoming, past, all
    
    // Form state
    const [selectedProvider, setSelectedProvider] = useState(null); // Store full provider object
    const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
    const [availableProviders, setAvailableProviders] = useState([]);
    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
    const [specialty, setSpecialty] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [appointmentTime, setAppointmentTime] = useState(new Date());
    const [appointmentType, setAppointmentType] = useState('consultation');
    const [chiefComplaint, setChiefComplaint] = useState(''); // Changed from 'reason'
    const [notes, setNotes] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(30);
    
    // Dynamic data from API
    const [appointmentTypes, setAppointmentTypes] = useState([
        { value: 'consultation', label: 'General Consultation' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'routine_checkup', label: 'Routine Checkup' },
        { value: 'specialist', label: 'Specialist Visit' },
        { value: 'vaccination', label: 'Vaccination' },
        { value: 'diagnostic', label: 'Diagnostic Test' }
    ]);
    const [specialties, setSpecialties] = useState([
        'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
        'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics',
        'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
    ]);
    
    const [searchTimer, setSearchTimer] = useState(null);

    // Reminder scheduling states
    const [reminderModalVisible, setReminderModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
    const [showReminderTypePicker, setShowReminderTypePicker] = useState(false);
    const [reminderType, setReminderType] = useState('1hour'); // '1hour', '24hours', 'custom'

    // Edit appointment states
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editAppointmentDate, setEditAppointmentDate] = useState(new Date());
    const [editAppointmentTime, setEditAppointmentTime] = useState(new Date());
    const [editChiefComplaint, setEditChiefComplaint] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editAppointmentType, setEditAppointmentType] = useState('consultation');
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);
    const [showEditTimePicker, setShowEditTimePicker] = useState(false);
    const [showEditAppointmentTypePicker, setShowEditAppointmentTypePicker] = useState(false);

    // Utility function to get hospital information from provider object
    // Utility function to get hospital information from provider object or appointment data
    const getProviderHospital = (provider, appointment = null) => {
        // If we have appointment data with direct hospital info, use that first
        if (appointment) {
            const appointmentHospitalFields = [
                appointment.hospital_name,
                appointment.clinic_name,
                appointment.hospital,
                appointment.clinic,
                appointment.facility_name,
                appointment.location_name,
                appointment.healthcare_provider_hospital,
                appointment.healthcare_provider_clinic
            ];
            
            for (const field of appointmentHospitalFields) {
                if (field && typeof field === 'string' && field.trim() !== '') {
                    return field.trim();
                }
            }
        }
        
        // If no provider, return default
        if (!provider || typeof provider !== 'object') {
            return 'Hospital not specified';
        }
        
        // Check multiple possible field names for hospital information in provider
        const hospitalFields = [
            provider.hospital_names,
            provider.hospital_clinic, 
            provider.hospital,
            provider.clinic,
            provider.institution,
            provider.workplace,
            provider.facility,
            provider.location,
            provider.hospital_name,
            provider.clinic_name,
            provider.address,
            provider.full_address,
            provider.hospital_address
        ];
        
        // Find the first non-empty field
        for (const field of hospitalFields) {
            if (field && typeof field === 'string' && field.trim() !== '') {
                return field.trim();
            }
        }
        
        // If no hospital info found, try to provide a meaningful fallback
        // based on specialization or create a generic hospital name
        const specializationSource = provider.specialization || appointment?.specialty;
        if (specializationSource && typeof specializationSource === 'string') {
            const specialtyHospitals = {
                'Cardiology': 'Heart Institute',
                'Gynecology': 'Women\'s Health Center',
                'Pediatrics': 'Children\'s Hospital',
                'Orthopedics': 'Orthopedic Clinic',
                'Neurology': 'Neurological Center',
                'Oncology': 'Cancer Treatment Center',
                'Dermatology': 'Skin Care Clinic',
                'General Practice': 'General Medical Center',
                'Internal Medicine': 'Internal Medicine Clinic',
                'Emergency Medicine': 'Emergency Care Center'
            };
            
            const fallbackHospital = specialtyHospitals[specializationSource];
            if (fallbackHospital) {
                return fallbackHospital;
            }
        }
        
        return 'General Medical Center';
    };

    // Helper functions to get display labels
    const getAppointmentTypeLabel = (value) => {
        const type = appointmentTypes.find(t => t.value === value);
        return type ? type.label : value;
    };

    const getSpecialtyLabel = (value) => {
        return value || 'Select specialty';
    };

    const getReminderTypeLabel = (value) => {
        switch (value) {
            case '1hour': return '1 hour before';
            case '24hours': return '24 hours before';
            case 'custom': return 'Custom';
            default: return value;
        }
    };

    // Debug logging for user state
    useEffect(() => {
        console.log('=== AppointmentsScreen User State ===');
        console.log('User:', user?.email || 'No user');
        console.log('IsAuthenticated:', isAuthenticated);
        console.log('IsLoading:', isLoading);
        console.log('=====================================');
    }, [user, isAuthenticated, isLoading]);

    // API Integration Functions
    const loadBookingChoices = async () => {
        try {
            const response = await appointmentsAPI.getBookingChoices();
            if (response.data) {
                if (response.data.appointmentTypes) {
                    setAppointmentTypes(response.data.appointmentTypes);
                }
                if (response.data.specialties) {
                    setSpecialties(response.data.specialties);
                }
            }
        } catch (error) {
            console.log('Could not load booking choices from API, using defaults:', error);
            // Keep using the default values already set
        }
    };

    const searchProviders = async (query) => {
        // Clear existing timer
        if (searchTimer) {
            clearTimeout(searchTimer);
        }
        
        if (!query || query.length < 2) {
            setAvailableProviders([]);
            setShowDoctorDropdown(false);
            return;
        }
        
        // Set debounce timer
        const timer = setTimeout(async () => {
            try {
                console.log('Searching providers for query:', query);
                const response = await providersAPI.searchProviders(query);
                console.log('Provider search response:', response.data);
                
                let providers = [];
                
                // Handle different response structures
                if (response.data && response.data.suggestions && Array.isArray(response.data.suggestions)) {
                    // Handle Django backend format with suggestions array
                    providers = response.data.suggestions;
                } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
                    // Handle paginated results format
                    providers = response.data.results;
                } else if (response.data && Array.isArray(response.data)) {
                    // Handle direct array format
                    providers = response.data;
                }
                
                if (providers.length > 0) {
                    console.log('Provider data structure:', JSON.stringify(providers[0], null, 2));
                    setAvailableProviders(providers);
                    setShowDoctorDropdown(true);
                } else {
                    setAvailableProviders([]);
                    setShowDoctorDropdown(false);
                }
            } catch (error) {
                console.error('Error searching providers:', error);
                console.log('Error details:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
                // For development - show some mock providers if API fails
                if (__DEV__ && query.length > 1) {
                    const mockProviders = [
                        {
                            id: 'mock-1',
                            full_name: 'Daniel Smith',
                            specialization: 'Cardiology',
                            hospital_clinic: '37 Military Hospital',
                            years_of_experience: 15,
                            consultation_fee: '250.00'
                        },
                        {
                            id: 'mock-2', 
                            full_name: 'Sarah Johnson',
                            specialization: 'Pediatrics',
                            hospital_clinic: 'Children Hospital',
                            years_of_experience: 12,
                            consultation_fee: '180.00'
                        },
                        {
                            id: 'mock-3',
                            full_name: 'David Williams',
                            specialization: 'General Practice', 
                            hospital_clinic: '37 Military Hospital',
                            years_of_experience: 8,
                            consultation_fee: '150.00'
                        }
                    ].filter(provider => 
                        (provider.full_name || provider.name || '').toLowerCase().includes(query.toLowerCase()) ||
                        provider.specialization.toLowerCase().includes(query.toLowerCase())
                    );
                    
                    setAvailableProviders(mockProviders);
                    setShowDoctorDropdown(mockProviders.length > 0);
                    console.log('Using mock providers for development:', mockProviders);
                } else {
                    setAvailableProviders([]);
                    setShowDoctorDropdown(false);
                }
            }
        }, 300); // 300ms debounce
        
        setSearchTimer(timer);
    };

    const selectProvider = (provider) => {
        setSelectedProvider(provider);
        // Handle both 'name' and 'full_name' field formats
        const providerName = provider.name || provider.full_name || 'Unknown Doctor';
        setDoctorSearchQuery(providerName);
        setSpecialty(provider.specialization || '');
        setShowDoctorDropdown(false);
    };

    useEffect(() => {
        loadAppointments();
        loadBookingChoices(); // Load dynamic choices from API
    }, [selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reload when user becomes available
    useEffect(() => {
        if (user && !authLoading) {
            loadAppointments();
        }
    }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // Periodic authentication check - disabled to prevent aggressive logout behavior
    useEffect(() => {
        // Periodic authentication checks have been disabled to prevent
        // unnecessary logouts due to network issues or temporary server problems.
        // Authentication will still be handled by the global API interceptor
        // which will handle 401/403 responses appropriately.
        console.log('[useEffect] Periodic auth check disabled for stability');
    }, [user]); // Removed validateToken from dependencies since we don't use it

    const loadAppointments = async () => {
        try {
            setLoading(true);
            // Fix: Use user.id instead of user.$id for Django backend
            if (!user || !user.id) {
                console.warn('[loadAppointments] User not authenticated or user ID missing');
                console.warn('[loadAppointments] User object:', JSON.stringify(user, null, 2));
                setAppointments([]);
                return;
            }
            
            let params = { limit: 50 };
            
            // Try new API first
            try {
                const response = await appointmentsAPI.getAppointments(params);
                let filteredAppointments = response.data.results || response.data || [];

                // Debug: log appointment structure to understand hospital data
                if (filteredAppointments.length > 0) {
                    console.log('Appointment data structure:', JSON.stringify(filteredAppointments[0], null, 2));
                    if (filteredAppointments[0].healthcare_provider) {
                        console.log('Healthcare provider structure:', JSON.stringify(filteredAppointments[0].healthcare_provider, null, 2));
                    }
                }

                // Filter based on selected tab
                if (selectedTab === 'upcoming') {
                    const now = new Date();
                    filteredAppointments = filteredAppointments.filter(
                        appointment => new Date(appointment.appointment_date) > now
                    );
                } else if (selectedTab === 'past') {
                    const now = new Date();
                    filteredAppointments = filteredAppointments.filter(
                        appointment => new Date(appointment.appointment_date) < now
                    );
                }

                setAppointments(filteredAppointments);
            } catch (apiError) {
                console.log('New API failed, trying legacy DatabaseService:', apiError);
                
                // Check if it's an authentication error
                if (apiError.response?.status === 401 || apiError.response?.status === 403) {
                    console.error('Authentication error while loading appointments');
                    setAppointments([]);
                    return;
                }
                
                // Fallback to legacy DatabaseService
                if (selectedTab === 'upcoming') {
                    params.upcoming = true;
                }

                // Use the flexible userId for API calls
                const response = await DatabaseService.getUserAppointments(userId, params);
                let filteredAppointments = response.documents || [];

                if (selectedTab === 'past') {
                    const now = new Date();
                    filteredAppointments = filteredAppointments.filter(
                        appointment => new Date(appointment.appointment_date) < now
                    );
                }

                setAppointments(filteredAppointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            
            // Check if it's an authentication error
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.error('Authentication error while loading appointments');
                // The global auth handler will take care of logout
            } else {
                Alert.alert('Error', 'Failed to load appointments. Please try again.');
            }
            
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = async () => {
        try {
            console.log('Starting appointment creation...');
            console.log('[handleAddAppointment] Current auth state:', { 
                isAuthenticated, 
                hasUser: !!user,
                userFields: user ? Object.keys(user) : [],
                isLoading: authLoading 
            });
            
            // Check if user is loading
            if (authLoading) {
                console.log('[handleAddAppointment] Auth still loading, waiting...');
                Alert.alert('Please wait', 'Authentication is still loading...');
                return;
            }
            
            // Check authentication state first
            if (!isAuthenticated || !user) {
                console.error('[handleAddAppointment] User not authenticated or user data missing');
                Alert.alert(
                    'Authentication Required', 
                    'Please log in to book an appointment.',
                    [{
                        text: 'OK',
                        onPress: () => {
                            console.log('[handleAddAppointment] User not authenticated - redirecting to login');
                        }
                    }]
                );
                return;
            }

            // Extract user ID using multiple possible fields
            const userId = user?.id || user?._id || user?.pk || user?.$id || user?.user_id;
            
            console.log('[handleAddAppointment] User ID extraction:', {
                userId,
                availableFields: user ? Object.keys(user) : [],
                userEmail: user?.email,
                userUsername: user?.username
            });
            
            // Validate that we have essential user data
            if (!userId) {
                console.error('[handleAddAppointment] No valid user ID found');
                Alert.alert(
                    'User Data Error', 
                    'Unable to identify user. Please try logging out and back in.',
                    [{
                        text: 'OK',
                        onPress: () => {
                            console.log('[handleAddAppointment] User ID missing - need re-login');
                        }
                    }]
                );
                return;
            }

            // Validate required fields
            if (!selectedProvider || !appointmentDate) {
                Alert.alert('Error', 'Please select a doctor and appointment date');
                return;
            }

            if (!chiefComplaint.trim()) {
                Alert.alert('Error', 'Please provide the chief complaint');
                return;
            }

            // Combine date and time
            const combinedDateTime = new Date(
                appointmentDate.getFullYear(),
                appointmentDate.getMonth(),
                appointmentDate.getDate(),
                appointmentTime.getHours(),
                appointmentTime.getMinutes()
            );

            // Prepare appointment data for new API structure
            const appointmentData = {
                healthcare_provider: selectedProvider.id,
                appointment_date: combinedDateTime.toISOString(),
                appointment_type: appointmentType,
                chief_complaint: chiefComplaint,
                notes: notes || '',
                duration_minutes: durationMinutes,
                patient_id: userId // Add patient_id explicitly
            };

            console.log('Creating appointment with data:', appointmentData);

            // Try new API first with better error handling
            try {
                // Validate token before API call
                const token = await AsyncStorage.getItem('access_token');
                if (!token) {
                    console.error('[handleAddAppointment] No access token available');
                    throw new Error('No authentication token found');
                }
                
                console.log('[handleAddAppointment] Making API call to create appointment...');
                const response = await appointmentsAPI.createAppointment(appointmentData);
                console.log('Appointment created successfully:', response.data);
                
                // Success - reset form and reload
                resetForm();
                setModalVisible(false);
                loadAppointments();
                Alert.alert('Success', 'Appointment scheduled successfully');
                return;
                
            } catch (apiError) {
                console.log('New API call failed:', {
                    message: apiError.message,
                    status: apiError.response?.status,
                    statusText: apiError.response?.statusText,
                    data: apiError.response?.data
                });
                
                // Check if it's specifically an authentication/token error
                if (apiError.response?.status === 401 || 
                    apiError.response?.status === 403 || 
                    apiError.message.includes('token') ||
                    apiError.message.includes('Invalid token') ||
                    apiError.response?.data?.detail?.includes('token')) {
                    
                    console.log('[handleAddAppointment] Authentication error detected, trying token validation...');
                    
                    // Try token validation and refresh
                    try {
                        const isValidToken = await validateToken();
                        if (isValidToken) {
                            console.log('[handleAddAppointment] Token refreshed successfully, retrying API call...');
                            // Retry the API call with refreshed token
                            const retryResponse = await appointmentsAPI.createAppointment(appointmentData);
                            console.log('Retry appointment creation successful:', retryResponse.data);
                            
                            // Success after retry
                            resetForm();
                            setModalVisible(false);
                            loadAppointments();
                            Alert.alert('Success', 'Appointment scheduled successfully');
                            return;
                        } else {
                            console.error('[handleAddAppointment] Token validation/refresh failed');
                            throw new Error('Authentication failed. Please login again.');
                        }
                    } catch (tokenError) {
                        console.error('[handleAddAppointment] Token refresh failed:', tokenError);
                        throw new Error('Session expired. Please login again.');
                    }
                } else {
                    // For non-auth errors, try fallback to legacy method
                    console.log('[handleAddAppointment] Non-auth error, trying legacy method...');
                    const legacyData = {
                        patientId: userId,
                        doctorName: selectedProvider.name || selectedProvider.full_name || 'Unknown Doctor',
                        specialty: selectedProvider.specialization || '',
                        clinicName: getProviderHospital(selectedProvider),
                        clinicAddress: selectedProvider.hospital_address || selectedProvider.address || '',
                        phoneNumber: selectedProvider.phone || '',
                        appointmentDate: combinedDateTime.toISOString(),
                        appointmentType,
                        reason: chiefComplaint,
                        notes: notes || null,
                        status: 'scheduled'
                    };
                    
                    try {
                        await DatabaseService.createAppointment(legacyData);
                        console.log('[handleAddAppointment] Legacy method successful');
                        
                        // Success with legacy method
                        resetForm();
                        setModalVisible(false);
                        loadAppointments();
                        Alert.alert('Success', 'Appointment scheduled successfully');
                        return;
                    } catch (legacyError) {
                        console.error('[handleAddAppointment] Legacy method also failed:', legacyError);
                        throw legacyError;
                    }
                }
            }
            
        } catch (error) {
            console.error('[handleAddAppointment] Final error:', error);
            
            if (error.message.includes('token') || 
                error.message.includes('Invalid token') ||
                error.message.includes('Authentication failed') ||
                error.message.includes('Session expired')) {
                console.log('[handleAddAppointment] Token-related error, letting global auth handler manage');
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again.',
                    [{
                        text: 'OK',
                        onPress: () => console.log('[handleAddAppointment] User acknowledged session expiry')
                    }]
                );
                return;
            }
            
            // For other errors, show generic error message
            Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
        }
    };

    const resetForm = () => {
        // Clear search timer
        if (searchTimer) {
            clearTimeout(searchTimer);
            setSearchTimer(null);
        }
        
        setSelectedProvider(null);
        setDoctorSearchQuery('');
        setSpecialty('');
        setAppointmentDate(new Date());
        setAppointmentTime(new Date());
        setAppointmentType('consultation');
        setChiefComplaint('');
        setNotes('');
        setDurationMinutes(30);
        setAvailableProviders([]);
        setShowDoctorDropdown(false);
    };

    // Reminder scheduling functions
    const openReminderModal = (appointment) => {
        setSelectedAppointment(appointment);
        const appointmentDateTime = new Date(appointment.appointment_date);
        
        // Set default reminder time to 1 hour before appointment
        const defaultReminderTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
        setReminderTime(defaultReminderTime);
        setReminderModalVisible(true);
    };

    const scheduleAppointmentReminder = async () => {
        if (!selectedAppointment) return;

        try {
            const appointmentDateTime = new Date(selectedAppointment.appointment_date);
            const title = `Appointment Reminder`;
            const message = `You have an appointment with Dr. ${selectedAppointment.healthcare_provider_name || selectedAppointment.doctor_name} in 1 hour`;

            let reminderDateTime;
            if (reminderType === '1hour') {
                reminderDateTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
            } else if (reminderType === '24hours') {
                reminderDateTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
            } else {
                reminderDateTime = reminderTime;
            }

            // Check if reminder time is in the future
            if (reminderDateTime <= new Date()) {
                Alert.alert('Invalid Time', 'Please select a future time for your reminder');
                return;
            }

            const notificationId = await NotificationService.scheduleNotification({
                title,
                body: message,
                trigger: { date: reminderDateTime },
            });

            if (notificationId) {
                Alert.alert(
                    'Reminder Set', 
                    `You will be reminded on ${reminderDateTime.toLocaleDateString()} at ${reminderDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                );
                setReminderModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to schedule reminder');
            }
        } catch (error) {
            console.error('Error scheduling appointment reminder:', error);
            Alert.alert('Error', 'Failed to schedule reminder');
        }
    };

    // Utility function to make phone calls
    const makePhoneCall = (phoneNumber) => {
        if (!phoneNumber) {
            Alert.alert('No Phone Number', 'No phone number available for this appointment');
            return;
        }
        
        const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
        const phoneUrl = `tel:${cleanPhoneNumber}`;
        
        Linking.canOpenURL(phoneUrl)
            .then((supported) => {
                if (!supported) {
                    Alert.alert('Error', 'Phone calls are not supported on this device');
                } else {
                    return Linking.openURL(phoneUrl);
                }
            })
            .catch((err) => {
                console.error('Error making phone call:', err);
                Alert.alert('Error', 'Failed to make phone call');
            });
    };

    // Filter appointments by status and date
    const filterAppointments = (appointments) => {
        const now = new Date();
        const filtered = appointments.filter((appointment) => {
            const appointmentDateTime = new Date(appointment.appointment_date);
            
            switch (selectedTab) {
                case 'upcoming':
                    return appointmentDateTime > now && appointment.status !== 'cancelled';
                case 'past':
                    return appointmentDateTime <= now || appointment.status === 'completed';
                case 'all':
                default:
                    return true;
            }
        });

        // Sort appointments by date and time
        return filtered.sort((a, b) => {
            const dateA = new Date(a.appointment_date);
            const dateB = new Date(b.appointment_date);
            
            if (selectedTab === 'upcoming') {
                // For upcoming, sort by earliest first
                return dateA - dateB;
            } else if (selectedTab === 'past') {
                // For past, sort by most recent first
                return dateB - dateA;
            } else {
                // For all, sort by most recent first
                return dateB - dateA;
            }
        });
    };

    // Open edit appointment modal
    const openEditAppointment = (appointment) => {
        setEditingAppointment(appointment);
        
        const appointmentDateTime = new Date(appointment.appointment_date);
        setEditAppointmentDate(appointmentDateTime);
        setEditAppointmentTime(appointmentDateTime);
        setEditChiefComplaint(appointment.chief_complaint || appointment.reason || '');
        setEditNotes(appointment.notes || '');
        setEditAppointmentType(appointment.appointment_type || 'consultation');
        
        setEditModalVisible(true);
    };

    // Handle edit appointment submission
    const handleEditAppointment = async () => {
        if (!editingAppointment) return;

        try {
            console.log('Editing appointment:', editingAppointment.id);

            // Validate required fields
            if (!editChiefComplaint.trim()) {
                Alert.alert('Error', 'Please provide the chief complaint');
                return;
            }

            // Combine date and time
            const combinedDateTime = new Date(
                editAppointmentDate.getFullYear(),
                editAppointmentDate.getMonth(),
                editAppointmentDate.getDate(),
                editAppointmentTime.getHours(),
                editAppointmentTime.getMinutes()
            );

            const updateData = {
                appointment_date: combinedDateTime.toISOString(),
                appointment_type: editAppointmentType,
                chief_complaint: editChiefComplaint,
                notes: editNotes || '',
            };

            console.log('Updating appointment with data:', updateData);

            // Call API to update appointment
            const response = await appointmentsAPI.updateAppointment(editingAppointment.id, updateData);
            console.log('Appointment updated successfully:', response.data);

            // Close modal and reload appointments
            setEditModalVisible(false);
            setEditingAppointment(null);
            loadAppointments();
            
            Alert.alert('Success', 'Appointment updated successfully');

        } catch (error) {
            console.error('Error updating appointment:', error);
            Alert.alert('Error', 'Failed to update appointment. Please try again.');
        }
    };

    // Cancel appointment
    const handleCancelAppointment = (appointment) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await appointmentsAPI.cancelAppointment(appointment.id);
                            loadAppointments();
                            Alert.alert('Success', 'Appointment cancelled successfully');
                        } catch (error) {
                            console.error('Error cancelling appointment:', error);
                            Alert.alert('Error', 'Failed to cancel appointment');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return '#007BFF';
            case 'confirmed': return '#2D8B85';
            case 'completed': return '#6c757d';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const isUpcoming = (appointmentDate) => {
        return new Date(appointmentDate) > new Date();
    };

    const renderAppointmentCard = (appointment, index) => {
        const upcoming = isUpcoming(appointment.appointment_date);
        const appointmentDateTime = new Date(appointment.appointment_date);

        return (
            <View key={index} style={[styles.appointmentCard, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.doctorName, { color: theme.text }]}>
                        {appointment.healthcare_provider_name || appointment.doctor_name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Text>
                    </View>
                </View>

                {(appointment.healthcare_provider_specialization || appointment.specialty) && (
                    <Text style={[styles.specialty, { color: theme.primary }]}>
                        {appointment.healthcare_provider_specialization || appointment.specialty}
                    </Text>
                )}

                <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="calendar-outline" size={16} color={theme.subText} />
                        <Text style={[styles.dateTimeText, { color: theme.subText }]}>
                            {appointmentDateTime.toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="time-outline" size={16} color={theme.subText} />
                        <Text style={[styles.dateTimeText, { color: theme.subText }]}>
                            {appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.clinicInfo}>
                    <Ionicons name="location-outline" size={16} color={theme.subText} />
                    <Text style={[styles.clinicText, { color: theme.subText }]}>
                        {getProviderHospital(appointment.healthcare_provider, appointment)}
                    </Text>
                </View>

                {(appointment.chief_complaint || appointment.reason) && (
                    <Text style={[styles.reason, { color: theme.text }]}>
                        Chief Complaint: {appointment.chief_complaint || appointment.reason}
                    </Text>
                )}

                {appointment.duration_minutes && (
                    <Text style={[styles.duration, { color: theme.subText }]}>
                        Duration: {appointment.duration_minutes} minutes
                    </Text>
                )}

                <View style={[styles.cardActions, { borderTopColor: theme.divider }]}>
                    {upcoming && (
                        <>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => openReminderModal(appointment)}
                            >
                                <Ionicons name="alarm-outline" size={16} color={theme.primary} />
                                <Text style={[styles.actionText, { color: theme.primary }]}>Set Reminder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => makePhoneCall(appointment.healthcare_provider_phone || appointment.doctor_phone)}
                            >
                                <Ionicons name="call-outline" size={16} color={theme.primary} />
                                <Text style={[styles.actionText, { color: theme.primary }]}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => openEditAppointment(appointment)}
                            >
                                <Ionicons name="create-outline" size={16} color={theme.primary} />
                                <Text style={[styles.actionText, { color: theme.primary }]}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => handleCancelAppointment(appointment)}
                            >
                                <Ionicons name="close-outline" size={16} color="#dc3545" />
                                <Text style={[styles.actionText, { color: '#dc3545' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                        <Text style={[styles.actionText, { color: theme.primary }]}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderTabButtons = () => (
        <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
            {[
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
                { key: 'all', label: 'All' }
            ].map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tabButton, 
                        selectedTab === tab.key && { borderBottomColor: theme.primary }
                    ]}
                    onPress={() => setSelectedTab(tab.key)}
                >
                    <Text style={[
                        styles.tabText, 
                        { color: theme.subText },
                        selectedTab === tab.key && { color: theme.primary, fontWeight: '600' }
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading || authLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.text }]}>Loading appointments...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="person-outline" size={64} color={theme.subText} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>Please log in to view your appointments</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.divider }]}>
                <Text style={[styles.title, { color: theme.text }]}>My Appointments</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {renderTabButtons()}

            <ScrollView style={styles.content}>
                {appointments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color={theme.subText} />
                        <Text style={[styles.emptyText, { color: theme.text }]}>No appointments found</Text>
                        <Text style={[styles.emptySubtext, { color: theme.subText }]}>
                            Schedule your first appointment with a healthcare provider
                        </Text>
                    </View>
                ) : (
                    <View style={styles.appointmentsContainer}>
                        {filterAppointments(appointments).map((appointment, index) => renderAppointmentCard(appointment, index))}
                    </View>
                )}
            </ScrollView>

            {/* Add Appointment Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: '#f8f9fa' }]}>
                    <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.divider }]}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Schedule Appointment</Text>
                        <TouchableOpacity onPress={handleAddAppointment}>
                            <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.modalContent}
                        contentContainerStyle={styles.modalContentContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {__DEV__ && (
                            <View style={[styles.debugSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Text style={[styles.debugTitle, { color: theme.text }]}>Debug (Dev Mode)</Text>
                                <TouchableOpacity 
                                    style={[styles.debugButton, { backgroundColor: theme.primary }]}
                                    onPress={async () => {
                                        try {
                                            console.log('Testing API connection...');
                                            const testResponse = await providersAPI.getProviders({ limit: 1 });
                                            Alert.alert('API Test', 'Connection successful! Found ' + (testResponse.data.count || testResponse.data.length || 0) + ' providers.');
                                        } catch (error) {
                                            console.error('API test failed:', error);
                                            Alert.alert('API Test Failed', 'Error: ' + error.message + '\n\nUsing mock data instead.');
                                        }
                                    }}
                                >
                                    <Text style={styles.debugButtonText}>Test API Connection</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Doctor *</Text>
                        <View style={styles.autocompleteContainer}>
                            <TextInput
                                style={[styles.input, { 
                                    borderColor: theme.border, 
                                    backgroundColor: theme.card,
                                    color: theme.text 
                                }]}
                                placeholder="Search for a doctor..."
                                placeholderTextColor={theme.subText}
                                value={doctorSearchQuery}
                                onChangeText={(text) => {
                                    setDoctorSearchQuery(text);
                                    searchProviders(text);
                                }}
                                onFocus={() => {
                                    if (availableProviders.length > 0) {
                                        setShowDoctorDropdown(true);
                                    }
                                }}
                            />
                            {showDoctorDropdown && availableProviders.length > 0 && (
                                <View style={[styles.dropdownContainer, { 
                                    backgroundColor: theme.card, 
                                    borderColor: theme.border 
                                }]}>
                                    <ScrollView 
                                        style={styles.dropdownScroll}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        {availableProviders.map((provider) => (
                                            <TouchableOpacity
                                                key={provider.id}
                                                style={[styles.dropdownItem, { borderBottomColor: theme.divider }]}
                                                onPress={() => selectProvider(provider)}
                                            >
                                                <View style={styles.providerInfo}>
                                                    <Text style={[styles.providerName, { color: theme.text }]}>
                                                        {provider.name || provider.full_name || 'Unknown Doctor'}
                                                    </Text>
                                                    <Text style={[styles.providerSpecialty, { color: theme.subText }]}>
                                                        {provider.specialization}
                                                    </Text>
                                                    <Text style={[styles.providerHospital, { color: theme.subText }]}>
                                                        {getProviderHospital(provider)}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {selectedProvider && (
                            <View style={[styles.selectedProviderCard, { 
                                backgroundColor: theme.card, 
                                borderColor: theme.primary 
                            }]}>
                                <View style={styles.selectedProviderHeader}>
                                    <Text style={[styles.selectedProviderName, { color: theme.text }]}>
                                        {selectedProvider.name || selectedProvider.full_name || 'Unknown Doctor'}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            setSelectedProvider(null);
                                            setDoctorSearchQuery('');
                                            setSpecialty('');
                                        }}
                                        style={styles.removeProviderButton}
                                    >
                                        <Ionicons name="close" size={20} color={theme.subText} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.selectedProviderSpecialty, { color: theme.subText }]}>
                                    {selectedProvider.specialization}
                                </Text>
                                <Text style={[styles.selectedProviderHospital, { color: theme.subText }]}>
                                    {getProviderHospital(selectedProvider)}
                                </Text>
                            </View>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Specialty</Text>
                        <TextInput
                            style={[styles.input, { 
                                borderColor: theme.border, 
                                backgroundColor: selectedProvider ? '#f5f5f5' : theme.card,
                                color: selectedProvider ? theme.subText : theme.text 
                            }]}
                            placeholder="Specialty will be filled automatically"
                            placeholderTextColor={theme.subText}
                            value={specialty}
                            editable={!selectedProvider}
                            onChangeText={selectedProvider ? null : setSpecialty}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Appointment Type</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card 
                            }]}
                            onPress={() => setShowAppointmentTypePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                {getAppointmentTypeLabel(appointmentType)}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.subText} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card 
                            }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                {appointmentDate.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color={theme.subText} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.text }]}>Time *</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card 
                            }]}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                {appointmentTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}
                            </Text>
                            <Ionicons name="time-outline" size={20} color={theme.subText} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.text }]}>Hospital/Clinic</Text>
                        <TextInput
                            style={[styles.input, { 
                                borderColor: theme.border, 
                                backgroundColor: selectedProvider ? '#f5f5f5' : theme.card,
                                color: selectedProvider ? theme.subText : theme.text 
                            }]}
                            placeholder={selectedProvider ? "Hospital will be filled automatically" : "Enter hospital name"}
                            placeholderTextColor={theme.subText}
                            value={selectedProvider ? getProviderHospital(selectedProvider) : ''}
                            editable={false}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Chief Complaint *</Text>
                        <TextInput
                            style={[styles.input, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card,
                                color: theme.text 
                            }]}
                            placeholder="Describe the reason for this appointment"
                            placeholderTextColor={theme.subText}
                            value={chiefComplaint}
                            onChangeText={setChiefComplaint}
                            multiline
                            numberOfLines={3}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Duration (minutes)</Text>
                        <TextInput
                            style={[styles.input, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card,
                                color: theme.text 
                            }]}
                            placeholder="30"
                            placeholderTextColor={theme.subText}
                            value={durationMinutes.toString()}
                            onChangeText={(text) => setDurationMinutes(parseInt(text) || 30)}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card,
                                color: theme.text 
                            }]}
                            placeholder="Any additional notes..."
                            placeholderTextColor={theme.subText}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </ScrollView>
                </SafeAreaView>
                </KeyboardAvoidingView>

                {/* Date and Time Pickers */}
                <Modal
                    visible={showDatePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={[styles.datePickerModal, { backgroundColor: theme.card }]}>
                        <View style={[styles.pickerModalHeader, { borderBottomColor: theme.divider }]}>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={[styles.saveButton, { color: theme.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={appointmentDate}
                                mode="date"
                                display="spinner"
                                minimumDate={new Date()}
                                themeVariant="light"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setAppointmentDate(selectedDate);
                                }}
                                style={styles.dateTimePicker}
                            />
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={showTimePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={[styles.datePickerModal, { backgroundColor: theme.card }]}>
                        <View style={[styles.pickerModalHeader, { borderBottomColor: theme.divider }]}>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Time</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Text style={[styles.saveButton, { color: theme.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={appointmentTime}
                                mode="time"
                                display="spinner"
                                is24Hour={false}
                                themeVariant="light"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) setAppointmentTime(selectedTime);
                                }}
                                style={styles.dateTimePicker}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Specialty Picker Modal */}
                <Modal
                    visible={showSpecialtyPicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={styles.pickerModalOverlay}>
                        <View style={[styles.pickerModal, { backgroundColor: theme.card }]}>
                            <View style={[styles.pickerModalHeader, { borderBottomColor: theme.divider }]}>
                                <TouchableOpacity onPress={() => setShowSpecialtyPicker(false)}>
                                    <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Specialty</Text>
                                <TouchableOpacity onPress={() => setShowSpecialtyPicker(false)}>
                                    <Text style={[styles.saveButton, { color: theme.primary }]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.pickerModalContent}>
                                <TouchableOpacity
                                    style={[styles.pickerOption, specialty === '' && { backgroundColor: theme.primary + '20' }]}
                                    onPress={() => {
                                        setSpecialty('');
                                        setShowSpecialtyPicker(false);
                                    }}
                                >
                                    <Text style={[styles.pickerOptionText, { color: theme.text }]}>Select specialty</Text>
                                </TouchableOpacity>
                                {specialties.map((spec) => (
                                    <TouchableOpacity
                                        key={spec}
                                        style={[styles.pickerOption, specialty === spec && { backgroundColor: theme.primary + '20' }]}
                                        onPress={() => {
                                            setSpecialty(spec);
                                            setShowSpecialtyPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, { color: theme.text }]}>{spec}</Text>
                                        {specialty === spec && (
                                            <Ionicons name="checkmark" size={20} color={theme.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Appointment Type Picker Modal */}
                <Modal
                    visible={showAppointmentTypePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={styles.pickerModalOverlay}>
                        <View style={[styles.pickerModal, { backgroundColor: theme.card }]}>
                            <View style={[styles.pickerModalHeader, { borderBottomColor: theme.divider }]}>
                                <TouchableOpacity onPress={() => setShowAppointmentTypePicker(false)}>
                                    <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Appointment Type</Text>
                                <TouchableOpacity onPress={() => setShowAppointmentTypePicker(false)}>
                                    <Text style={[styles.saveButton, { color: theme.primary }]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.pickerModalContent}>
                                {appointmentTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[styles.pickerOption, appointmentType === type.value && { backgroundColor: theme.primary + '20' }]}
                                        onPress={() => {
                                            setAppointmentType(type.value);
                                            setShowAppointmentTypePicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, { color: theme.text }]}>{type.label}</Text>
                                        {appointmentType === type.value && (
                                            <Ionicons name="checkmark" size={20} color={theme.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </Modal>

            {/* Reminder Scheduling Modal */}
            <Modal
                visible={reminderModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: '#f8f9fa' }]}>
                    <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.divider }]}>
                        <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
                            <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Set Appointment Reminder</Text>
                        <TouchableOpacity onPress={scheduleAppointmentReminder}>
                            <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={[styles.label, { color: theme.text }]}>Reminder Time</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card 
                            }]}
                            onPress={() => setShowReminderTimePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                {reminderTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}
                            </Text>
                            <Ionicons name="time-outline" size={20} color={theme.subText} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.text }]}>Reminder Type</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { 
                                borderColor: theme.border, 
                                backgroundColor: theme.card 
                            }]}
                            onPress={() => setShowReminderTypePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                {getReminderTypeLabel(reminderType)}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.subText} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Reminder Time Picker */}
                <Modal
                    visible={showReminderTimePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={[styles.datePickerModal, { backgroundColor: theme.card }]}>
                        <View style={[styles.pickerModalHeader, { borderBottomColor: theme.divider }]}>
                            <TouchableOpacity onPress={() => setShowReminderTimePicker(false)}>
                                <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Reminder Time</Text>
                            <TouchableOpacity onPress={() => setShowReminderTimePicker(false)}>
                                <Text style={[styles.saveButton, { color: theme.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={reminderTime}
                                mode="time"
                                display="spinner"
                                is24Hour={false}
                                themeVariant="light"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) setReminderTime(selectedTime);
                                }}
                                style={styles.dateTimePicker}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Reminder Type Picker Modal */}
                <Modal
                    visible={showReminderTypePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={styles.pickerModalOverlay}>
                        <View style={[styles.pickerModal, { backgroundColor: theme.card }]}>
                            <View style={[styles.pickerModalHeader, { borderBottomColor: theme.divider }]}>
                                <TouchableOpacity onPress={() => setShowReminderTypePicker(false)}>
                                    <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Reminder Type</Text>
                                <TouchableOpacity onPress={() => setShowReminderTypePicker(false)}>
                                    <Text style={[styles.saveButton, { color: theme.primary }]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.pickerModalContent}>
                                {[
                                    { value: '1hour', label: '1 hour before' },
                                    { value: '24hours', label: '24 hours before' },
                                    { value: 'custom', label: 'Custom' }
                                ].map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[styles.pickerOption, reminderType === type.value && { backgroundColor: theme.primary + '20' }]}
                                        onPress={() => {
                                            setReminderType(type.value);
                                            setShowReminderTypePicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, { color: theme.text }]}>{type.label}</Text>
                                        {reminderType === type.value && (
                                            <Ionicons name="checkmark" size={20} color={theme.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </Modal>

            {/* Edit Appointment Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <SafeAreaView style={[styles.modalContainer, { backgroundColor: '#f8f9fa' }]}>
                        <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.divider }]}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Text style={[styles.cancelButton, { color: theme.subText }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Appointment</Text>
                            <TouchableOpacity onPress={handleEditAppointment}>
                                <Text style={[styles.saveButton, { color: theme.primary }]}>Update</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Appointment Date */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Appointment Date</Text>
                                <TouchableOpacity
                                    style={[styles.dateButton, { 
                                        borderColor: theme.border, 
                                        backgroundColor: theme.card 
                                    }]}
                                    onPress={() => setShowEditDatePicker(true)}
                                >
                                    <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                        {editAppointmentDate.toLocaleDateString()}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={20} color={theme.subText} />
                                </TouchableOpacity>
                            </View>

                            {/* Appointment Time */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Appointment Time</Text>
                                <TouchableOpacity
                                    style={[styles.dateButton, { 
                                        borderColor: theme.border, 
                                        backgroundColor: theme.card 
                                    }]}
                                    onPress={() => setShowEditTimePicker(true)}
                                >
                                    <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                        {editAppointmentTime.toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true 
                                        })}
                                    </Text>
                                    <Ionicons name="time-outline" size={20} color={theme.subText} />
                                </TouchableOpacity>
                            </View>

                            {/* Appointment Type */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Appointment Type</Text>
                                <TouchableOpacity
                                    style={[styles.dateButton, { 
                                        borderColor: theme.border, 
                                        backgroundColor: theme.card 
                                    }]}
                                    onPress={() => setShowEditAppointmentTypePicker(true)}
                                >
                                    <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                        {getAppointmentTypeLabel(editAppointmentType)}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={theme.subText} />
                                </TouchableOpacity>
                            </View>

                            {/* Chief Complaint */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Chief Complaint *</Text>
                                <TextInput
                                    style={[styles.textInput, { 
                                        borderColor: theme.border,
                                        backgroundColor: theme.card,
                                        color: theme.text
                                    }]}
                                    value={editChiefComplaint}
                                    onChangeText={setEditChiefComplaint}
                                    placeholder="Describe your main concern..."
                                    placeholderTextColor={theme.subText}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Additional Notes */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Additional Notes (Optional)</Text>
                                <TextInput
                                    style={[styles.textInput, { 
                                        borderColor: theme.border,
                                        backgroundColor: theme.card,
                                        color: theme.text
                                    }]}
                                    value={editNotes}
                                    onChangeText={setEditNotes}
                                    placeholder="Any additional information..."
                                    placeholderTextColor={theme.subText}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </KeyboardAvoidingView>

                {/* Edit Date Picker */}
                {showEditDatePicker && (
                    <DateTimePicker
                        value={editAppointmentDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowEditDatePicker(false);
                            if (selectedDate) {
                                setEditAppointmentDate(selectedDate);
                            }
                        }}
                    />
                )}

                {/* Edit Time Picker */}
                {showEditTimePicker && (
                    <DateTimePicker
                        value={editAppointmentTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowEditTimePicker(false);
                            if (selectedTime) {
                                setEditAppointmentTime(selectedTime);
                            }
                        }}
                    />
                )}

                {/* Edit Appointment Type Picker */}
                <Modal
                    visible={showEditAppointmentTypePicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={[styles.pickerModalContainer, { backgroundColor: theme.card }]}>
                        <View style={[styles.pickerHeader, { borderBottomColor: theme.divider }]}>
                            <TouchableOpacity onPress={() => setShowEditAppointmentTypePicker(false)}>
                                <Text style={[styles.pickerCancel, { color: theme.subText }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Appointment Type</Text>
                            <View style={{ width: 60 }} />
                        </View>
                        <ScrollView style={styles.pickerContent}>
                            {appointmentTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[styles.pickerOption, editAppointmentType === type.value && { backgroundColor: theme.primary + '20' }]}
                                    onPress={() => {
                                        setEditAppointmentType(type.value);
                                        setShowEditAppointmentTypePicker(false);
                                    }}
                                >
                                    <Text style={[styles.pickerOptionText, { color: theme.text }]}>{type.label}</Text>
                                    {editAppointmentType === type.value && (
                                        <Ionicons name="checkmark" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
            </Modal>
        </SafeAreaView>
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
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    appointmentsContainer: {
        padding: 20,
    },
    appointmentCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    specialty: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTimeText: {
        marginLeft: 4,
        fontSize: 14,
    },
    clinicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    clinicText: {
        marginLeft: 4,
        fontSize: 14,
    },
    reason: {
        fontSize: 14,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    duration: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    actionText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
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
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        fontSize: 16,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalContentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    dateButtonText: {
        fontSize: 16,
        flex: 1,
    },
    notesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerModal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    pickerModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    pickerModalContent: {
        maxHeight: 300,
    },
    pickerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    pickerOptionText: {
        fontSize: 16,
        flex: 1,
    },
    datePickerModal: {
        flex: 1,
        backgroundColor: 'white',
    },
    datePickerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    dateTimePicker: {
        width: '100%',
        height: 200,
    },
    // Autocomplete styles
    autocompleteContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        maxHeight: 200,
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dropdownScroll: {
        maxHeight: 200,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    providerSpecialty: {
        fontSize: 14,
        marginBottom: 2,
    },
    providerHospital: {
        fontSize: 12,
    },
    // Selected provider card styles
    selectedProviderCard: {
        borderWidth: 2,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#f8f9ff',
    },
    selectedProviderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedProviderName: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    removeProviderButton: {
        padding: 4,
    },
    selectedProviderSpecialty: {
        fontSize: 14,
        marginBottom: 4,
    },
    selectedProviderHospital: {
        fontSize: 14,
    },
    // Debug styles
    debugSection: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    debugButton: {
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    debugButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default AppointmentsScreen;