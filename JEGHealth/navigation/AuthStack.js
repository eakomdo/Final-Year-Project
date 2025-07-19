import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Import your existing screens
import HomeScreen from '../screens/HomeScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';

// New screens we'll create
import HealthMetricsScreen from '../screens/HealthMetricsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
const HomeStack = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="HomeMain" 
            component={HomeScreen} 
            options={{ title: 'Dashboard' }}
        />
        <Stack.Screen 
            name="HealthMetrics" 
            component={HealthMetricsScreen}
            options={{ title: 'Health Metrics' }}
        />
        <Stack.Screen 
            name="Medications" 
            component={MedicationsScreen}
            options={{ title: 'Medications' }}
        />
        <Stack.Screen 
            name="Appointments" 
            component={AppointmentsScreen}
            options={{ title: 'Appointments' }}
        />
    </Stack.Navigator>
);

// Health Stack
const HealthStack = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="HealthMain" 
            component={HealthMetricsScreen}
            options={{ title: 'Health Metrics' }}
        />
    </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="ProfileMain" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
        />
    </Stack.Navigator>
);

const MainTabNavigator = () => {
    const { getUserRole } = useAuth();
    const userRole = getUserRole();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Health':
                            iconName = focused ? 'heart' : 'heart-outline';
                            break;
                        case 'Chat':
                            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007BFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            
            {/* Show Health tab for patients and caretakers */}
            {(userRole === 'patient' || userRole === 'caretaker') && (
                <Tab.Screen name="Health" component={HealthStack} />
            )}
            
            <Tab.Screen name="Chat" component={ChatbotScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;