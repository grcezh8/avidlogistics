import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import QRScannerScreen from './src/screens/QRScannerScreen';
import PackingScreen from './src/screens/PackingScreen';
import ManifestDetailsScreen from './src/screens/ManifestDetailsScreen';
import SignatureCaptureScreen from './src/screens/SignatureCaptureScreen';
import { COLORS } from './src/constants/colors';

export type RootStackParamList = {
  QRScanner: undefined;
  Packing: undefined;
  ManifestDetails: { manifestId: number };
  SignatureCapture: { manifestId: number; assetId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const theme = {
  colors: {
    primary: COLORS.primary,
    accent: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    disabled: COLORS.secondary,
    placeholder: COLORS.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: COLORS.text,
    notification: COLORS.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="QRScanner"
            screenOptions={{
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{
                title: 'AVID Chain of Custody',
                headerStyle: {
                  backgroundColor: COLORS.primary,
                },
              }}
            />
            <Stack.Screen
              name="Packing"
              component={PackingScreen}
              options={{
                title: 'Packing Manifests',
              }}
            />
            <Stack.Screen
              name="ManifestDetails"
              component={ManifestDetailsScreen}
              options={{
                title: 'Manifest Details',
              }}
            />
            <Stack.Screen
              name="SignatureCapture"
              component={SignatureCaptureScreen}
              options={{
                title: 'Digital Signature',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
