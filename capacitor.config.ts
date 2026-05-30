import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abcflexpack.auditpro',
  appName: 'AuditPro',
  webDir: 'build',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1F3864',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1F3864'
    }
  }
};

export default config;
