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
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../lib/database';

const HealthMetricsScreen = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMetricType, setSelectedMetricType] = useState('blood_pressure');
    const [metricValue, setMetricValue] = useState('');
    const [systolicValue, setSystolicValue] = useState('');
    const [diastolicValue, setDiastolicValue] = useState('');
    const [notes, setNotes] = useState('');

    const metricTypes = [
        { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
        { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
        { value: 'weight', label: 'Weight', unit: 'kg' },
        { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL' },
        { value: 'temperature', label: 'Temperature', unit: '°C' },
        { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%' }
    ];

    useEffect(() => {
        loadHealthMetrics();
    }, []);

    const loadHealthMetrics = async () => {
        try {
            setLoading(true);
            const response = await DatabaseService.getHealthMetrics(user.$id, { limit: 50 });
            setMetrics(response.documents || []);
        } catch (error) {
            console.error('Error loading health metrics:', error);
            Alert.alert('Error', 'Failed to load health metrics');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMetric = async () => {
        try {
            if (!metricValue && selectedMetricType !== 'blood_pressure') {
                Alert.alert('Error', 'Please enter a metric value');
                return;
            }

            if (selectedMetricType === 'blood_pressure' && (!systolicValue || !diastolicValue)) {
                Alert.alert('Error', 'Please enter both systolic and diastolic values');
                return;
            }

            const selectedType = metricTypes.find(type => type.value === selectedMetricType);
            
            const metricData = {
                patientId: user.$id,
                metricType: selectedMetricType,
                value: selectedMetricType === 'blood_pressure' ? 
                    parseFloat(systolicValue) : parseFloat(metricValue),
                unit: selectedType.unit,
                systolicValue: selectedMetricType === 'blood_pressure' ? 
                    parseFloat(systolicValue) : null,
                diastolicValue: selectedMetricType === 'blood_pressure' ? 
                    parseFloat(diastolicValue) : null,
                recordedAt: new Date().toISOString(),
                isManualEntry: true,
                notes: notes || null
            };

            await DatabaseService.createHealthMetric(metricData);
            
            // Reset form
            setMetricValue('');
            setSystolicValue('');
            setDiastolicValue('');
            setNotes('');
            setModalVisible(false);
            
            // Reload metrics
            loadHealthMetrics();
            
            Alert.alert('Success', 'Health metric added successfully');
        } catch (error) {
            console.error('Error adding health metric:', error);
            Alert.alert('Error', 'Failed to add health metric');
        }
    };

    const renderMetricInput = () => {
        if (selectedMetricType === 'blood_pressure') {
            return (
                <View>
                    <View style={styles.bloodPressureRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            placeholder="Systolic"
                            value={systolicValue}
                            onChangeText={setSystolicValue}
                            keyboardType="numeric"
                        />
                        <Text style={styles.separator}>/</Text>
                        <TextInput
                            style={[styles.input, { flex: 1, marginLeft: 10 }]}
                            placeholder="Diastolic"
                            value={diastolicValue}
                            onChangeText={setDiastolicValue}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            );
        }

        const selectedType = metricTypes.find(type => type.value === selectedMetricType);
        return (
            <TextInput
                style={styles.input}
                placeholder={`Enter ${selectedType?.label} (${selectedType?.unit})`}
                value={metricValue}
                onChangeText={setMetricValue}
                keyboardType="numeric"
            />
        );
    };

    const renderMetricCard = (metric, index) => {
        const metricType = metricTypes.find(type => type.value === metric.metric_type);
        const displayValue = metric.metric_type === 'blood_pressure' 
            ? `${metric.systolic_value}/${metric.diastolic_value}`
            : `${metric.value}`;

        return (
            <View key={index} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                    <Text style={styles.metricType}>
                        {metricType?.label || metric.metric_type}
                    </Text>
                    <Text style={styles.metricDate}>
                        {new Date(metric.recorded_at).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.metricValueRow}>
                    <Text style={styles.metricValue}>
                        {displayValue} {metric.unit}
                    </Text>
                    {metric.is_manual_entry && (
                        <Ionicons name="pencil" size={16} color="#666" />
                    )}
                </View>
                {metric.notes && (
                    <Text style={styles.metricNotes}>{metric.notes}</Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Loading health metrics...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Health Metrics</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {metrics.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No health metrics yet</Text>
                        <Text style={styles.emptySubtext}>
                            Start tracking your health by adding your first metric
                        </Text>
                    </View>
                ) : (
                    <View style={styles.metricsContainer}>
                        {metrics.map((metric, index) => renderMetricCard(metric, index))}
                    </View>
                )}
            </ScrollView>

            {/* Add Metric Modal */}
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
                        <Text style={styles.modalTitle}>Add Health Metric</Text>
                        <TouchableOpacity onPress={handleAddMetric}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.label}>Metric Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedMetricType}
                                onValueChange={setSelectedMetricType}
                                style={styles.picker}
                            >
                                {metricTypes.map((type) => (
                                    <Picker.Item
                                        key={type.value}
                                        label={type.label}
                                        value={type.value}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Value</Text>
                        {renderMetricInput()}

                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="Add any notes about this reading..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </ScrollView>
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
    metricsContainer: {
        padding: 20,
    },
    metricCard: {
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
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    metricDate: {
        fontSize: 14,
        color: '#666',
    },
    metricValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    metricNotes: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
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
    bloodPressureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    notesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
});

export default HealthMetricsScreen;