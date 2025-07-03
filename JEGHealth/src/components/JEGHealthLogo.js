import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const JEGHealthLogo = ({ size = 'normal', style = {} }) => {
  const isHero = size === 'hero';
  const isLarge = size === 'large';
  
  const getStyles = () => {
    if (isHero) {
      return {
        container: styles.heroContainer,
        iconContainer: styles.heroIconContainer,
        icon: styles.heroIcon,
        text: styles.heroText,
        healthText: styles.heroHealthText,
      };
    } else if (isLarge) {
      return {
        container: styles.largeContainer,
        iconContainer: styles.largeIconContainer,
        icon: styles.largeIcon,
        text: styles.largeText,
        healthText: styles.largeHealthText,
      };
    } else {
      return {
        container: styles.normalContainer,
        iconContainer: styles.normalIconContainer,
        icon: styles.normalIcon,
        text: styles.normalText,
        healthText: styles.normalHealthText,
      };
    }
  };

  const logoStyles = getStyles();

  return (
    <View style={[logoStyles.container, style]}>
      <View style={logoStyles.iconContainer}>
        <Ionicons name="heart" style={logoStyles.icon} />
      </View>
      <Text style={logoStyles.text}>
        JEG<Text style={logoStyles.healthText}>Health</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Normal size (navigation, forms)
  normalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Reduced from 12 to bring closer
  },
  normalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.logoIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6, // Reduced padding to make heart larger in circle
    borderWidth: 2,
    borderColor: Colors.textOnPrimary, // White border around circle
  },
  normalIcon: {
    fontSize: 18, // Increased from 16 to make heart more visible
    color: Colors.textOnPrimary, // White heart outline
  },
  normalText: {
    fontSize: 24, // text-2xl equivalent
    fontWeight: 'bold',
    color: Colors.logoTextPrimary,
  },
  normalHealthText: {
    color: Colors.logoTextSecondary,
  },

  // Large size (headers, cards)
  largeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Reduced from 16 to bring closer
  },
  largeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.logoIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8, // Reduced padding
    borderWidth: 2,
    borderColor: Colors.textOnPrimary, // White border around circle
  },
  largeIcon: {
    fontSize: 26, // Increased from 24 to make heart more visible
    color: Colors.textOnPrimary, // White heart outline
  },
  largeText: {
    fontSize: 32, // text-3xl equivalent
    fontWeight: 'bold',
    color: Colors.logoTextPrimary,
  },
  largeHealthText: {
    color: Colors.logoTextSecondary,
  },

  // Hero size (main landing, welcome screens)
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Reduced from 20 to bring closer
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.logoIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.textOnPrimary,
    // Replace shadow props with boxShadow
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    // Keep elevation for Android
    elevation: 3,
  },
  heroIcon: {
    fontSize: 34, // Increased from 32 to make heart more visible
    color: Colors.textOnPrimary, // White heart outline
  },
  heroText: {
    fontSize: 48, // text-5xl equivalent
    fontWeight: 'bold',
    color: Colors.logoTextPrimary,
    letterSpacing: 0.5,
  },
  heroHealthText: {
    color: Colors.logoTextSecondary,
  },
});

export default JEGHealthLogo;