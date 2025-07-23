import React, { useState, useEffect } from 'react';
import JEGHealthSplash from './SplashScreen';
import { useAuth } from '../../context/AuthContext';

const SplashWrapper = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoading } = useAuth();

  useEffect(() => {
    // Show splash for minimum duration even if auth loads quickly
    const minSplashTime = setTimeout(() => {
      if (!isLoading) {
        setShowSplash(false);
      }
    }, 3000); // Minimum 3 seconds

    return () => clearTimeout(minSplashTime);
  }, [isLoading]);

  // Hide splash when auth is done loading and minimum time has passed
  useEffect(() => {
    if (!isLoading && !showSplash) {
      setShowSplash(false);
    }
  }, [isLoading, showSplash]);

  const handleAnimationComplete = () => {
    if (!isLoading) {
      setShowSplash(false);
    }
  };

  if (showSplash) {
    return (
      <JEGHealthSplash onAnimationComplete={handleAnimationComplete} />
    );
  }

  return <>{children}</>;
};

export default SplashWrapper;
