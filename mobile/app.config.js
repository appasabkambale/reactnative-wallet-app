import 'dotenv/config';

export default {
  expo: {
    name: "Cashence",
    slug: "Cashence",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "Cashence",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.appayya.Cashence",
      usesCleartextTraffic: true,
    },

    plugins: [
      "expo-font",
      "expo-web-browser",
      "expo-router",
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      [
        "@sentry/react-native/expo",
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "3792023f-dc14-4429-b5df-0f74739e9f7f",
      },
    },
  },
};
