import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const JEGHealthSplash = ({ onAnimationComplete }) => {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotsAnimation = useRef([
    new Animated.Value(0),
    new Animated.Value(0), 
    new Animated.Value(0)
  ]).current;
  const floatingIcons = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    // Start animations sequence
    startSplashAnimation();
  }, []);

  const startSplashAnimation = () => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade in
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Floating icons animation
    floatingIcons.forEach((anim, index) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000 + index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2000 + index * 200,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, index * 300);
    });

    // Loading dots animation
    setTimeout(() => {
      startDotsAnimation();
    }, 800);

    // Complete animation after duration
    setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3500);
  };

  const startDotsAnimation = () => {
    const animateDot = (index) => {
      Animated.sequence([
        Animated.timing(dotsAnimation[index], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnimation[index], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Loop the animation
        setTimeout(() => animateDot(index), 600);
      });
    };

    dotsAnimation.forEach((_, index) => {
      setTimeout(() => animateDot(index), index * 200);
    });
  };

  const getFloatingIconStyle = (index) => {
    const translateY = floatingIcons[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    return {
      transform: [{ translateY }],
      opacity: floatingIcons[index].interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.7, 0.3],
      }),
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#A7F3D0']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Background Elements */}
      <View style={styles.backgroundElements}>
        {/* Large decorative circles */}
        <Animated.View style={[styles.decorativeCircle1, { opacity: 0.2 }]} />
        <Animated.View style={[styles.decorativeCircle2, { opacity: 0.3 }]} />
        <Animated.View style={[styles.decorativeCircle3, { opacity: 0.25 }]} />
      </View>

      {/* Floating Medical Icons */}
      <View style={styles.floatingIconsContainer}>
        <Animated.View style={[styles.floatingIcon1, getFloatingIconStyle(0)]}>
          <Ionicons name="heart" size={24} color="#2DD4BF" />
        </Animated.View>
        <Animated.View style={[styles.floatingIcon2, getFloatingIconStyle(1)]}>
          <Ionicons name="shield-checkmark" size={20} color="#34D399" />
        </Animated.View>
        <Animated.View style={[styles.floatingIcon3, getFloatingIconStyle(2)]}>
          <Ionicons name="pulse" size={20} color="#14B8A6" />
        </Animated.View>
        <Animated.View style={[styles.floatingIcon4, getFloatingIconStyle(3)]}>
          <Ionicons name="flash" size={16} color="#10B981" />
        </Animated.View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Outer glow ring */}
          <View style={styles.outerGlow} />
          
          {/* Logo background */}
          <View style={styles.logoBackground}>
            {/* Inner gradient circle */}
            <LinearGradient
              colors={['#14B8A6', '#10B981']}
              style={styles.logoGradient}
            >
              {/* Logo content */}
              <View style={styles.logoContent}>
                <Ionicons name="heart" size={32} color="white" />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* App Name and Content */}
        <Animated.View style={[styles.textContent, { opacity: textOpacity }]}>
          {/* App Name */}
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>JEGHealth</Text>
            
            {/* Decorative line with icons */}
            <View style={styles.decorativeLine}>
              <Ionicons name="pulse" size={20} color="#14B8A6" />
              <View style={styles.gradientLine} />
              <Ionicons name="heart" size={20} color="#10B981" />
            </View>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>
              Your Digital Healthcare{'\n'}
              <Text style={styles.taglineAccent}>Companion</Text>
            </Text>
          </View>

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <View style={styles.dotsContainer}>
              {dotsAnimation.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: anim,
                      transform: [
                        {
                          scale: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.5],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Bottom text */}
        <Animated.View style={[styles.bottomText, { opacity: textOpacity }]}>
          <Text style={styles.bottomTagline}>
            SECURE • RELIABLE • INNOVATIVE
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2DD4BF',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    right: width * 0.15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34D399',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.3,
    right: width * 0.2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#14B8A6',
  },
  floatingIconsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon1: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.15,
  },
  floatingIcon2: {
    position: 'absolute',
    top: height * 0.35,
    right: width * 0.25,
  },
  floatingIcon3: {
    position: 'absolute',
    bottom: height * 0.35,
    left: width * 0.3,
  },
  floatingIcon4: {
    position: 'absolute',
    bottom: height * 0.25,
    right: width * 0.3,
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  outerGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#14B8A6',
    opacity: 0.2,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#CCFBF1',
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0F766E',
    marginBottom: 8,
    textAlign: 'center',
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradientLine: {
    width: 60,
    height: 2,
    backgroundColor: '#14B8A6',
    marginHorizontal: 8,
  },
  taglineContainer: {
    marginBottom: 32,
  },
  tagline: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  taglineAccent: {
    color: '#0F766E',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
    marginHorizontal: 4,
  },
  bottomText: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  bottomTagline: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default JEGHealthSplash;
