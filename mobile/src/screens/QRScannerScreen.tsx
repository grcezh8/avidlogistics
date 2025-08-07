import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';
import { ManifestService } from '../services/manifestService';

type QRScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QRScanner'>;

interface Props {
  navigation: QRScannerScreenNavigationProp;
}

export default function QRScannerScreen({ navigation }: Props) {
  const [manifestUrl, setManifestUrl] = useState('');

  const handleSubmit = () => {
    if (!manifestUrl.trim()) {
      Alert.alert('Error', 'Please enter a manifest URL or ID');
      return;
    }

    try {
      // Try to extract manifest ID from URL, or use as direct ID
      let manifestId = ManifestService.extractManifestIdFromUrl(manifestUrl);
      
      if (!manifestId) {
        // If no ID extracted, try to parse as direct number
        const directId = parseInt(manifestUrl.trim(), 10);
        if (!isNaN(directId)) {
          manifestId = directId;
        }
      }

      if (!manifestId) {
        Alert.alert('Error', 'Could not extract manifest ID from input');
        return;
      }

      console.log('Navigating to manifest:', manifestId);
      navigation.navigate('ManifestDetails', { manifestId });
      
    } catch (error) {
      console.error('Error processing input:', error);
      Alert.alert('Error', 'Failed to process the input');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            AVID Chain of Custody
          </Text>
          <Text variant="bodyLarge" style={styles.instruction}>
            Enter a manifest URL or ID to begin the Chain of Custody process.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter manifest URL or ID (e.g., 1, 2, 3...)"
            value={manifestUrl}
            onChangeText={setManifestUrl}
            multiline
          />
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            Load Manifest
          </Button>
          
          <Text variant="bodySmall" style={styles.note}>
            Note: QR scanner will be available in a future update. For now, you can test with manifest IDs like 1, 2, or 3.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.primary,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginBottom: 16,
  },
  note: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
