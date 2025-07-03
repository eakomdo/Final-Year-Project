// ...existing imports...
import { Colors } from '../constants/colors';

// Update the styles in your HealthScreen:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  statsContainer: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  connectedStatus: {
    color: Colors.success,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});