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

const MedicationsScreen = () => {
    const { user } = useAuth();
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    
    // Form state
    const [medicationName, setMedicationName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('once_daily');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const [instructions, setInstructions] = useState('');
    const [reminderTimes, setReminderTimes] = useState(['08:00']);

    const frequencyOptions = [
        { value: 'once_daily', label: 'Once Daily' },
        { value: 'twice_daily', label: 'Twice Daily' },
        { value: 'three_times_daily', label: 'Three Times Daily' },
        { value: 'four_times_daily', label: 'Four Times Daily' },
        { value: 'every_other_day', label: 'Every Other Day' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'as_needed', label: 'As Needed' }
    ];

    useEffect(() => {
        loadMedications();
    }, []);

    const loadMedications = async () => {
        try {
            setLoading(true);
            const response = await DatabaseService.getUserMedications(user.$id);
            setMedications(response.documents || []);
        } catch (error) {
            console.error('Error loading medications:', error);
            Alert.alert('Error', 'Failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedication = async () => {
        try {
            if (!medicationName || !dosage) {
                Alert.alert('Error', 'Please fill in medication name and dosage');
                return;
            }

            const medicationData = {
                patientId: user.$id,
                medicationName,
                dosage,
                frequency,
                startDate: startDate.toISOString(),
                endDate: endDate ? endDate.toISOString() : null,
                instructions: instructions || null,
                reminderTimes: JSON.stringify(reminderTimes),
                isActive: true
            };

            await DatabaseService.createMedication(medicationData);
            
            // Reset form
            resetForm();
            setModalVisible(false);
            
            // Reload medications
            loadMedications();
            
            Alert.alert('Success', 'Medication added successfully');
        } catch (error) {
            console.error('Error adding medication:', error);
            Alert.alert('Error', 'Failed to add medication');
        }
    };

    const resetForm = () => {
        setMedicationName('');
        setDosage('');
        setFrequency('once_daily');
        setStartDate(new Date());
        setEndDate(null);
        setInstructions('');
        setReminderTimes(['08:00']);
    };

    const renderMedicationCard = (medication, index) => {
        const isActive = medication.is_active && 
            (!medication.end_date || new Date(medication.end_date) > new Date());

        return (
            <View key={index} style={[styles.medicationCard, !isActive && styles.inactiveCard]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.medicationName}>{medication.medication_name}</Text>
                    <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={styles.statusText}>
                            {isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>
                
                <Text style={styles.dosage}>Dosage: {medication.dosage}</Text>
                <Text style={styles.frequency}>
                    Frequency: {frequencyOptions.find(f => f.value === medication.frequency)?.label}
                </Text>
                
                <View style={styles.dateRow}>
                    <Text style={styles.dateText}>
                        Started: {new Date(medication.start_date).toLocaleDateString()}
                    </Text>
                    {medication.end_date && (
                        <Text style={styles.dateText}>
                            Ends: {new Date(medication.end_date).toLocaleDateString()}
                        </Text>
                    )}
                </View>

                {medication.instructions && (
                    <Text style={styles.instructions}>{medication.instructions}</Text>
                )}

                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="alarm-outline" size={16} color="#007BFF" />
                        <Text style={styles.actionText}>Reminders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="create-outline" size={16} color="#007BFF" />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Loading medications...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Medications</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {medications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="medical-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No medications yet</Text>
                        <Text style={styles.emptySubtext}>
                            Add your medications to track and get reminders
                        </Text>
                    </View>
                ) : (
                    <View style={styles.medicationsContainer}>
                        {medications.map((medication, index) => renderMedicationCard(medication, index))}
                    </View>
                )}
            </ScrollView>

            {/* Add Medication Modal */}
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
                        <Text style={styles.modalTitle}>Add Medication</Text>
                        <TouchableOpacity onPress={handleAddMedication}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.label}>Medication Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter medication name"
                            value={medicationName}
                            onChangeText={setMedicationName}
                        />

                        <Text style={styles.label}>Dosage *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 10mg, 1 tablet"
                            value={dosage}
                            onChangeText={setDosage}
                        />

                        <Text style={styles.label}>Frequency</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={frequency}
                                onValueChange={setFrequency}
                                style={styles.picker}
                            >
                                {frequencyOptions.map((option) => (
                                    <Picker.Item
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {startDate.toLocaleDateString()}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>End Date (Optional)</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {endDate ? endDate.toLocaleDateString() : 'Select end date'}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Instructions</Text>
                        <TextInput
                            style={[styles.input, styles.instructionsInput]}
                            placeholder="Special instructions (e.g., take with food)"
                            value={instructions}
                            onChangeText={setInstructions}
                            multiline
                        />
                    </ScrollView>
                </View>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) setStartDate(selectedDate);
                        }}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display="default"
                        minimumDate={startDate}
                        onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) setEndDate(selectedDate);
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
    content: {
        flex: 1,
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
    medicationsContainer: {
        padding: 20,
    },
    medicationCard: {
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
    inactiveCard: {
        opacity: 0.6,
        backgroundColor: '#f8f9fa',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    medicationName: {
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
    activeBadge: {
        backgroundColor: '#d4edda',
    },
    inactiveBadge: {
        backgroundColor: '#f8d7da',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    dosage: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: '600',
        marginBottom: 4,
    },
    frequency: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 12,
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
    instructionsInput: {
        height: 80,
        textAlignVertical: 'top',
    },
});

export default MedicationsScreen;