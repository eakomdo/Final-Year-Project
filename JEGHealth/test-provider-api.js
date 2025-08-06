#!/usr/bin/env node

/**
 * Test script for Provider API endpoints
 * This tests the newly implemented provider search and appointment booking functionality
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Adjust based on your backend URL
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testProviderEndpoints() {
    console.log('🧪 Testing Provider API Endpoints...\n');

    try {
        // Test 1: List all providers
        console.log('1. Testing GET /api/v1/providers/');
        const providersResponse = await api.get('/api/v1/providers/');
        console.log('✅ Success - Found', providersResponse.data.count, 'providers');
        
        if (providersResponse.data.results.length > 0) {
            const firstProvider = providersResponse.data.results[0];
            console.log('   Sample provider:', {
                id: firstProvider.id,
                name: firstProvider.full_name,
                specialty: firstProvider.specialization,
                hospital: firstProvider.hospital_clinic
            });
        }
        console.log();

        // Test 2: Search providers
        console.log('2. Testing Provider Search');
        const searchResponse = await api.get('/api/v1/providers/', {
            params: { search: 'Dr' }
        });
        console.log('✅ Success - Found', searchResponse.data.results.length, 'doctors matching "Dr"');
        console.log();

        // Test 3: Get appointment booking choices
        console.log('3. Testing GET /api/v1/appointments/frontend/choices/');
        const choicesResponse = await api.get('/api/v1/appointments/frontend/choices/');
        console.log('✅ Success - Appointment choices loaded:');
        console.log('   Types:', choicesResponse.data.appointmentTypes?.length || 0);
        console.log('   Specialties:', choicesResponse.data.specialties?.length || 0);
        console.log();

        // Test 4: Create appointment (if we have a provider)
        if (providersResponse.data.results.length > 0) {
            console.log('4. Testing POST /api/v1/appointments/create/');
            const testAppointment = {
                healthcare_provider: providersResponse.data.results[0].id,
                appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                appointment_type: 'consultation',
                chief_complaint: 'Test appointment from API test script',
                notes: 'Created by test script',
                duration_minutes: 45
            };

            const createResponse = await api.post('/api/v1/appointments/create/', testAppointment);
            console.log('✅ Success - Appointment created with ID:', createResponse.data.id);
            console.log();

            // Test 5: List user's appointments
            console.log('5. Testing GET /api/v1/appointments/');
            const appointmentsResponse = await api.get('/api/v1/appointments/');
            console.log('✅ Success - Found', appointmentsResponse.data.count, 'appointments');
            console.log();
        }

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);
    }
}

// Only run if called directly
if (require.main === module) {
    testProviderEndpoints();
}

module.exports = { testProviderEndpoints };
