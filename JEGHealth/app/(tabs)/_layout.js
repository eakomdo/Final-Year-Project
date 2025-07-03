import { Colors } from '../../src/constants/colors';

// Update your tab navigator options:
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Your tab screens */}
    </Tabs>
  );
}