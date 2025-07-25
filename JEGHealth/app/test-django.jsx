import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import DjangoConnectionTest from '../components/DjangoConnectionTest';

/**
 * Dedicated screen for testing Django backend connection
 * Access this screen to verify your backend integration
 */
export default function TestScreen() {
    return (
        <ScrollView style={styles.container}>
            <DjangoConnectionTest />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});
