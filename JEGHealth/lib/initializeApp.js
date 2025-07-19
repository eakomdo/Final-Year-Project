import DatabaseService from './database';

const defaultRoles = [
    {
        name: "patient",
        description: "Patient user with access to own health data",
        permissions: JSON.stringify({
            can_view_own_data: true,
            can_edit_profile: true,
            can_book_appointments: true,
            can_add_caretakers: true
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
            can_schedule_appointments: true
        }),
        is_active: true
    },
    {
        name: "caretaker",
        description: "Caretaker with emergency access to patient data",
        permissions: JSON.stringify({
            can_view_patient_data: true,
            can_receive_alerts: true,
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
            can_manage_system: true
        }),
        is_active: true
    }
];

export const initializeDefaultRoles = async () => {
    try {
        console.log('Initializing default roles...');
        
        for (const roleData of defaultRoles) {
            try {
                // Check if role already exists
                const existingRole = await DatabaseService.getRoleByName(roleData.name);
                
                if (!existingRole) {
                    await DatabaseService.createRole(roleData);
                    console.log(`✅ Created role: ${roleData.name}`);
                } else {
                    console.log(`ℹ️  Role already exists: ${roleData.name}`);
                }
            } catch (error) {
                console.error(`❌ Error creating role ${roleData.name}:`, error);
            }
        }
        
        console.log('Default roles initialization complete!');
    } catch (error) {
        console.error('Error initializing default roles:', error);
        throw error;
    }
};