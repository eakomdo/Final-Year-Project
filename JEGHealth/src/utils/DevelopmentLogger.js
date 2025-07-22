class DevelopmentLogger {
  static logStartupInfo() {
    // Production-like experience - minimal console output
    if (__DEV__) {
      console.log('🚀 JEGHealth initialized successfully');
    }
  }

  static logServiceStatus(serviceName, status, details = '') {
    // Only log errors or important status updates
    if (status === 'error' || status === 'warning') {
      const emoji = status === 'error' ? '❌' : '⚠️';
      console.log(`${emoji} ${serviceName}: ${details || status}`);
    }
  }
}

export default DevelopmentLogger;
