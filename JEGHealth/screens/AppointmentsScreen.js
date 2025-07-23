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
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../lib/database';
import NotificationService from '../src/services/NotificationService';

const AppointmentsScreen = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTab, setSelectedTab] = useState('upcoming'); // upcoming, past, all
    
    // Form state
    const [doctorName, setDoctorName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [appointmentTime, setAppointmentTime] = useState(new Date());
    const [appointmentType, setAppointmentType] = useState('consultation');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    // Reminder scheduling states
    const [reminderModalVisible, setReminderModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
    const [reminderType, setReminderType] = useState('1hour'); // '1hour', '24hours', 'custom'

    const appointmentTypes = [
        { value: 'consultation', label: 'General Consultation' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'routine_checkup', label: 'Routine Checkup' },
        { value: 'specialist', label: 'Specialist Visit' },
        { value: 'vaccination', label: 'Vaccination' },
        { value: 'diagnostic', label: 'Diagnostic Test' }
    ];

    const specialties = [
        'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
        'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics',
        'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
    ];

    useEffect(() => {
        loadAppointments();
    }, [selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reload when user becomes available
    useEffect(() => {
        if (user && !authLoading) {
            loadAppointments();
        }
    }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadAppointments = async () => {
        try {
            setLoading(true);
            if (!user || !user.$id) {
                console.warn('User not authenticated or user ID missing');
                setAppointments([]);
                return;
            }
            
            let options = { limit: 50 };
            
            if (selectedTab === 'upcoming') {
                options.upcoming = true;
            }

            const response = await DatabaseService.getUserAppointments(user.$id, options);
            let filteredAppointments = response.documents || [];

            if (selectedTab === 'past') {
                const now = new Date();
                filteredAppointments = filteredAppointments.filter(
                    appointment => new Date(appointment.appointment_date) < now
                );
            }

            setAppointments(filteredAppointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
            Alert.alert('Error', 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = async () => {
        try {
            if (!doctorName || !appointmentDate) {
                Alert.alert('Error', 'Please fill in required fields');
                return;
            }

            if (!user || !user.$id) {
                Alert.alert('Error', 'User not authenticated. Please log in again.');
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

            const appointmentData = {
                patientId: user.$id,
                doctorName,
                specialty: specialty || null,
                clinicName: clinicName || null,
                clinicAddress: clinicAddress || null,
                phoneNumber: phoneNumber || null,
                appointmentDate: combinedDateTime.toISOString(),
                appointmentType,
                reason: reason || null,
                notes: notes || null,
                status: 'scheduled'
            };

            await DatabaseService.createAppointment(appointmentData);
            
            // Reset form
            resetForm();
            setModalVisible(false);
            
            // Reload appointments
            loadAppointments();
            
            Alert.alert('Success', 'Appointment scheduled successfully');
        } catch (error) {
            console.error('Error adding appointment:', error);
            Alert.alert('Error', 'Failed to schedule appointment');
        }
    };

    const resetForm = () => {
        setDoctorName('');
        setSpecialty('');
        setClinicName('');
        setClinicAddress('');
        setPhoneNumber('');
        setAppointmentDate(new Date());
        setAppointmentTime(new Date());
        setAppointmentType('consultation');
        setReason('');
        setNotes('');
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
            const message = `You have an appointment with Dr. ${selectedAppointment.doctor_name} in 1 hour`;

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
            <View key={index} style={styles.appointmentCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.doctorName}>{appointment.doctor_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Text>
                    </View>
                </View>

                {appointment.specialty && (
                    <Text style={styles.specialty}>{appointment.specialty}</Text>
                )}

                <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.dateTimeText}>
                            {appointmentDateTime.toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.dateTimeText}>
                            {appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                {appointment.clinic_name && (
                    <View style={styles.clinicInfo}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.clinicText}>{appointment.clinic_name}</Text>
                    </View>
                )}

                {appointment.reason && (
                    <Text style={styles.reason}>Reason: {appointment.reason}</Text>
                )}

                <View style={styles.cardActions}>
                    {upcoming && (
                        <>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => openReminderModal(appointment)}
                            >
                                <Ionicons name="alarm-outline" size={16} color="#2D8B85" />
                                <Text style={[styles.actionText, { color: "#2D8B85" }]}>Set Reminder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="call-outline" size={16} color="#007BFF" />
                                <Text style={styles.actionText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="create-outline" size={16} color="#007BFF" />
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="close-outline" size={16} color="#dc3545" />
                                <Text style={[styles.actionText, { color: '#dc3545' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="information-circle-outline" size={16} color="#007BFF" />
                        <Text style={styles.actionText}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderTabButtons = () => (
        <View style={styles.tabContainer}>
            {[
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
                { key: 'all', label: 'All' }
            ].map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabButton, selectedTab === tab.key && styles.activeTab]}
                    onPress={() => setSelectedTab(tab.key)}
                >
                    <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading || authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D8B85" />
                <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="person-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Please log in to view your appointments</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Appointments</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {renderTabButtons()}

            <ScrollView style={styles.content}>
                {appointments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No appointments found</Text>
                        <Text style={styles.emptySubtext}>
                            Schedule your first appointment with a healthcare provider
                        </Text>
                    </View>
                ) : (
                    <View style={styles.appointmentsContainer}>
                        {appointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
                    </View>
                )}
            </ScrollView>

            {/* Add Appointment Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Schedule Appointment</Text>
                        <TouchableOpacity onPress={handleAddAppointment}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.label}>Doctor Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter doctor's name"
                            value={doctorName}
                            onChangeText={setDoctorName}
                        />

                        <Text style={styles.label}>Specialty</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={specialty}
                                onValueChange={setSpecialty}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select specialty" value="" />
                                {specialties.map((spec) => (
                                    <Picker.Item key={spec} label={spec} value={spec} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Appointment Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={appointmentType}
                                onValueChange={setAppointmentType}
                                style={styles.picker}
                            >
                                {appointmentTypes.map((type) => (
                                    <Picker.Item
                                        key={type.value}
                                        label={type.label}
                                        value={type.value}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Date *</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {appointmentDate.toLocaleDateString()}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Time *</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Ionicons name="time-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Clinic/Hospital Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter clinic or hospital name"
                            value={clinicName}
                            onChangeText={setClinicName}
                        />

                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter clinic address"
                            value={clinicAddress}
                            onChangeText={setClinicAddress}
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter contact number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Reason for Visit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Brief reason for the appointment"
                            value={reason}
                            onChangeText={setReason}
                        />

                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="Any additional notes..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </ScrollView>
                </View>

                {/* Date and Time Pickers */}
                {showDatePicker && (
                    <DateTimePicker
                        value={appointmentDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setAppointmentDate(selectedDate);
                        }}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={appointmentTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) setAppointmentTime(selectedTime);
                        }}
                    />
                )}
            </Modal>

            {/* Reminder Scheduling Modal */}
            <Modal
                visible={reminderModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Set Appointment Reminder</Text>
                        <TouchableOpacity onPress={scheduleAppointmentReminder}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.label}>Reminder Time</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowReminderTimePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Ionicons name="time-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Reminder Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={reminderType}
                                onValueChange={setReminderType}
                                style={styles.picker}
                            >
                                <Picker.Item label="1 hour before" value="1hour" />
                                <Picker.Item label="24 hours before" value="24hours" />
                                <Picker.Item label="Custom" value="custom" />
                            </Picker>
                        </View>
                    </View>
                </View>

                {/* Reminder Time Picker */}
                {showReminderTimePicker && (
                    <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowReminderTimePicker(false);
                            if (selectedTime) setReminderTime(selectedTime);
                        }}
                    />
                )}
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007BFF',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007BFF',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#007BFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    appointmentsContainer: {
        padding: 20,
    },
    appointmentCard: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
        color: '#007BFF',
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
        color: '#666',
    },
    clinicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    clinicText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    reason: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
        color: '#007BFF',
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
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
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
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cancelButton: {
        fontSize: 16,
        color: '#666',
    },
    saveButton: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: 'white',
    },
    picker: {
        height: 50,
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: 'white',
    },
    dateButtonText: {
        fontSize: 16,
        color: '#333',
    },
    notesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
});

export default AppointmentsScreen;