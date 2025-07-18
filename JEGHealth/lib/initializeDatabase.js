import { databases, appwriteConfig } from './appwrite';
import { ID } from 'appwrite';

// Default roles to create
const defaultRoles = [
    {
        name: "patient",
        description: "Patient user with access to own health data",
        permissions: JSON.stringify({
            can_view_own_data: true,
            can_edit_profile: true,
            can_book_appointments: true,
            can_add_caretakers: true,
            can_message_doctor: true
        }),
        is_active: true
    },
    {
        name: "doctor",
        description: "Medical professional with patient access",
        permissions: JSON.stringify({
            can_view_patient_data: true,
            can_edit_medical_records: true,
            can_prescribe_medication: true,
            can_schedule_appointments: true,
            can_verify_health_metrics: true
        }),
        is_active: true
    },
    {
        name: "caretaker",
        description: "Caretaker with emergency access to patient data",
        permissions: JSON.stringify({
            can_view_patient_data: true,
            can_receive_alerts: true,
            can_contact_emergency: true,
            emergency_access_level: "high"
        }),
        is_active: true
    },
    {
        name: "admin",
        description: "System administrator with full access",
        permissions: JSON.stringify({
            can_manage_users: true,
            can_view_all_data: true,
            can_generate_reports: true,
            can_manage_system: true
        }),
        is_active: true
    }
];

export const initializeDefaultRoles = async () => {
    try {
        console.log('Initializing default roles...');
        
        for (const role of defaultRoles) {
            try {
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.roleCollectionId,
                    ID.unique(),
                    role
                );
                console.log(`Created role: ${role.name}`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`Role ${role.name} already exists`);
                } else {
                    console.error(`Error creating role ${role.name}:`, error);
                }
            }
        }
        
        console.log('Default roles initialization complete');
    } catch (error) {
        console.error('Error initializing default roles:', error);
        throw error;
    }
};