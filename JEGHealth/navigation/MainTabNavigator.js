// Profile Stack
const ProfileStack = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="ProfileMain" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
        />
        <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen 
            name="FileUpload" 
            component={FileUploadScreen}
            options={{ headerShown: false }}
        />
    </Stack.Navigator>
);