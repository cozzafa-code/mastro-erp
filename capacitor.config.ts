import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mastro.erp',
  appName: 'MASTRO ERP',
  webDir: 'out',
  // Server config for live reload during development
  // Uncomment and set your local IP for dev:
  // server: {
  //   url: 'http://192.168.1.X:3000',
  //   cleartext: true,
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F2F1EC',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
    },
    StatusBar: {
      backgroundColor: '#1A1A1C',
      style: 'LIGHT',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      // iOS permissions
    },
  },
  ios: {
    scheme: 'MASTRO ERP',
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#F2F1EC',
    allowMixedContent: true,
  },
};

export default config;
