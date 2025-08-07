import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Button, Text, Card, RadioButton, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';
import { ChainOfCustodyService } from '../services/chainOfCustodyService';
import { CreateSignatureInput, CreateChainOfCustodyEventInput, SignatureFormData } from '../types/chainOfCustody';

type SignatureCaptureScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignatureCapture'>;
type SignatureCaptureScreenRouteProp = RouteProp<RootStackParamList, 'SignatureCapture'>;

interface Props {
  navigation: SignatureCaptureScreenNavigationProp;
  route: SignatureCaptureScreenRouteProp;
}

export default function SignatureCaptureScreen({ navigation, route }: Props) {
  const { manifestId, assetId } = route.params;
  const [formData, setFormData] = useState<SignatureFormData>({
    signerName: '',
    role: 'From',
    notes: '',
    signatureImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [signatureText, setSignatureText] = useState('');

  const handleSubmit = async () => {
    if (!formData.signerName.trim()) {
      Alert.alert('Validation Error', 'Please enter the signer name.');
      return;
    }

    if (!signatureText.trim()) {
      Alert.alert('Validation Error', 'Please provide a signature.');
      return;
    }

    try {
      setLoading(true);

      // First, create a chain of custody event
      const custodyEventData: CreateChainOfCustodyEventInput = {
        electionId: 1, // TODO: Get from manifest data
        assetId: assetId,
        fromParty: formData.role === 'From' ? formData.signerName : 'System',
        toParty: formData.role === 'To' ? formData.signerName : 'System',
        notes: formData.notes || undefined,
        eventType: 'Transfer',
        manifestId: manifestId,
      };

      console.log('Creating custody event:', custodyEventData);
      const custodyEventResponse = await ChainOfCustodyService.logCustodyEvent(custodyEventData);
      console.log('Custody event created:', custodyEventResponse);

      // Create a simple signature URL (in production, this would be a real signature image)
      const signatureImageUrl = `data:text/plain;base64,${btoa(signatureText)}`;

      // Then, submit the signature
      const signatureData: CreateSignatureInput = {
        chainOfCustodyEventId: custodyEventResponse.id || custodyEventResponse.eventId || 1, // Handle different response formats
        signedBy: formData.signerName,
        signatureType: 'Digital',
        signatureImageUrl: signatureImageUrl,
      };

      console.log('Submitting signature:', signatureData);
      const signatureResponse = await ChainOfCustodyService.submitSignature(signatureData);
      console.log('Signature submitted:', signatureResponse);

      Alert.alert(
        'Success',
        'Digital signature has been captured and submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Error submitting signature:', error);
      Alert.alert(
        'Error',
        'Failed to submit the signature. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Digital Signature Capture
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Asset ID: {assetId} | Manifest ID: {manifestId}
          </Text>
        </Card.Content>
      </Card>

      {/* Form Fields */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Signer Information
          </Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="Signer Name *"
            value={formData.signerName}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, signerName: text }))}
          />

          <Text variant="bodyMedium" style={styles.radioLabel}>
            Role *
          </Text>
          <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <RadioButton
                value="From"
                status={formData.role === 'From' ? 'checked' : 'unchecked'}
                onPress={() => setFormData(prev => ({ ...prev, role: 'From' }))}
              />
              <Text variant="bodyMedium">From (Transferring)</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="To"
                status={formData.role === 'To' ? 'checked' : 'unchecked'}
                onPress={() => setFormData(prev => ({ ...prev, role: 'To' }))}
              />
              <Text variant="bodyMedium">To (Receiving)</Text>
            </View>
          </View>

          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, notes: text }))}
            multiline
            numberOfLines={3}
          />
        </Card.Content>
      </Card>

      {/* Signature Text */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Digital Signature *
          </Text>
          <Text variant="bodyMedium" style={styles.signatureInstructions}>
            Type your full name as your digital signature.
          </Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type your full name here"
            value={signatureText}
            onChangeText={setSignatureText}
          />
          
          <Text variant="bodySmall" style={styles.note}>
            Note: Advanced signature capture will be available in a future update.
          </Text>
        </Card.Content>
      </Card>

      {/* Submit Button */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={loading || !signatureText.trim() || !formData.signerName.trim()}
            style={styles.submitButton}
            icon="check"
          >
            {loading ? 'Submitting...' : 'Submit Signature'}
          </Button>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Processing signature...</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    color: COLORS.primary,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureInstructions: {
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  note: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: 32,
  },
});
