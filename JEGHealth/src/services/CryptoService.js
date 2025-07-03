class CryptoService {
  constructor() {
    this.nativeCryptoAvailable = false;
    console.log('CryptoService initialized for React Native environment');
  }

  generateSecureRandom(length = 16) {
    try {
      // In React Native/Expo Go, we use Math.random as fallback
      console.log('Using fallback random generation (not cryptographically secure in development)');
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    } catch (error) {
      console.log('Random generation failed, using basic fallback:', error.message);
      // Ultimate fallback
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    }
  }

  generateUUID() {
    try {
      // UUID generation using Math.random (sufficient for development)
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } catch (error) {
      console.log('UUID generation failed, using fallback:', error.message);
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  showSecurityWarning() {
    if (__DEV__) {
      console.warn('Using non-cryptographically secure random generation in development mode. Build a development build for production-grade security.');
    }
  }
}

export default new CryptoService();
