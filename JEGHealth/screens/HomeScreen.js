import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import DjangoDatabaseService from '../lib/djangoDatabase';

const HomeScreen = ({ navigation }) => {
    const { user, getUserRole, logout } = useAuth();
    const [recentMetrics, setRecentMetrics] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const userRole = getUserRole();

    const loadDashboardData = useCallback(async () => {
        try {
            if (userRole === 'patient') {
                // Load patient-specific data
                const metricsResponse = await DjangoDatabaseService.getHealthMetrics(
                    user.$id || user.id, 
                    { limit: 5 }
                );
                setRecentMetrics(metricsResponse.documents || []);

                const appointmentsResponse = await DjangoDatabaseService.getUserAppointments(
                    user.$id || user.id,
                    { upcoming: true, limit: 3 }
                );
                setUpcomingAppointments(appointmentsResponse.documents || []);
            }

            // Load notifications for all users
            const notificationsResponse = await DjangoDatabaseService.getUserNotifications(
                user.$id || user.id,
                { unreadOnly: true, limit: 5 }
            );
            setNotifications(notificationsResponse.documents || []);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }, [user, userRole]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

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
                        const result = await logout();
                        if (!result.success) {
                            Alert.alert('Error', result.error);
                        }
                    }
                }
            ]
        );
    };

    const renderQuickActions = () => {
        const actions = [];

        if (userRole === 'patient') {
            actions.push(
                {
                    title: 'Add Health Metric',
                    icon: 'heart-outline',
                    color: '#e74c3c',
                    onPress: () => navigation.navigate('HealthMetrics')
                },
                {
                    title: 'Medications',
                    icon: 'medical-outline',
                    color: '#3498db',
                    onPress: () => navigation.navigate('Medications')
                },
                {
                    title: 'Book Appointment',
                    icon: 'calendar-outline',
                    color: '#2D8B85',
                    onPress: () => navigation.navigate('Appointments')
                }
            );
        }

        actions.push({
            title: 'AI Health Chat',
            icon: 'chatbubble-ellipses-outline',
            color: '#9b59b6',
            onPress: () => navigation.navigate('Chat')
        });

        // Add test button for Django connection (remove this in production)
        if (__DEV__) {
            actions.push({
                title: 'Test Django',
                icon: 'bug-outline',
                color: '#e67e22',
                onPress: () => navigation.navigate('TestDjango')
            });
        }

        return (
            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.actionCard, { borderLeftColor: action.color }]}
                            onPress={action.onPress}
                        >
                            <Ionicons name={action.icon} size={24} color={action.color} />
                            <Text style={styles.actionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderRecentMetrics = () => {
        if (userRole !== 'patient' || recentMetrics.length === 0) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Health Metrics</Text>
                {recentMetrics.map((metric, index) => (
                    <View key={index} style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricType}>{metric.metric_type}</Text>
                            <Text style={styles.metricDate}>
                                {new Date(metric.recorded_at).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text style={styles.metricValue}>
                            {metric.value} {metric.unit}
                        </Text>
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('HealthMetrics')}
                >
                    <Text style={styles.viewAllText}>View All Metrics</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderUpcomingAppointments = () => {
        if (userRole !== 'patient' || upcomingAppointments.length === 0) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                {upcomingAppointments.map((appointment, index) => (
                    <View key={index} style={styles.appointmentCard}>
                        <Text style={styles.doctorName}>{appointment.doctor_name}</Text>
                        <Text style={styles.appointmentDate}>
                            {new Date(appointment.appointment_date).toLocaleString()}
                        </Text>
                        <Text style={styles.appointmentType}>{appointment.appointment_type}</Text>
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('Appointments')}
                >
                    <Text style={styles.viewAllText}>View All Appointments</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderNotifications = () => {
        if (notifications.length === 0) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Notifications</Text>
                {notifications.slice(0, 3).map((notification, index) => (
                    <View key={index} style={styles.notificationCard}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                            {notification.message}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Welcome back, {user?.name || 'User'}!
                    </Text>
                    <Text style={styles.roleText}>
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            {renderQuickActions()}

            {/* Recent Metrics */}
            {renderRecentMetrics()}

            {/* Upcoming Appointments */}
            {renderUpcomingAppointments()}

            {/* Notifications */}
            {renderNotifications()}
        </ScrollView>
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
        paddingTop: 60,
        backgroundColor: 'white',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    roleText: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    section: {
        margin: 20,
        marginTop: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    quickActions: {
        margin: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    metricCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
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
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    appointmentCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    appointmentDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    appointmentType: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: '500',
    },
    notificationCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
    },
    viewAllButton: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    viewAllText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default HomeScreen;