import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';
import { ManifestService } from '../services/manifestService';
import { ManifestWithDetailsDto, ManifestItemDto } from '../types/manifest';

type ManifestDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManifestDetails'>;
type ManifestDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ManifestDetails'>;

interface Props {
  navigation: ManifestDetailsScreenNavigationProp;
  route: ManifestDetailsScreenRouteProp;
}

export default function ManifestDetailsScreen({ navigation, route }: Props) {
  const { manifestId } = route.params;
  const [manifest, setManifest] = useState<ManifestWithDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifestDetails();
  }, [manifestId]);

  const loadManifestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const manifestData = await ManifestService.getManifestDetails(manifestId);
      setManifest(manifestData);
      
    } catch (error) {
      console.error('Error loading manifest details:', error);
      setError('Failed to load manifest details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAsset = (assetId: number) => {
    navigation.navigate('SignatureCapture', { manifestId, assetId });
  };

  const handleFinishPacking = async () => {
    try {
      Alert.alert(
        'Finish Packing',
        'Are you sure you want to finish packing this manifest? This will create a kit and move the manifest to packed status.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Finish Packing',
            style: 'default',
            onPress: async () => {
              try {
                await ManifestService.finishPacking(manifestId);
                Alert.alert('Success', 'Manifest packing completed successfully!', [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back or refresh the data
                      navigation.goBack();
                    },
                  },
                ]);
              } catch (error) {
                console.error('Error finishing packing:', error);
                Alert.alert('Error', 'Failed to finish packing. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleFinishPacking:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'in_progress':
        return COLORS.info;
      default:
        return COLORS.secondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading manifest details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.errorText}>
              Error
            </Text>
            <Text variant="bodyLarge" style={styles.centerText}>
              {error}
            </Text>
            <Button
              mode="contained"
              onPress={loadManifestDetails}
              style={styles.button}
            >
              Retry
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (!manifest) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">No manifest data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Manifest Header */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.manifestTitle}>
            {manifest.manifestNumber}
          </Text>
          <View style={styles.statusContainer}>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(manifest.status) }]}
              textStyle={{ color: getStatusColor(manifest.status) }}
            >
              {manifest.status}
            </Chip>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Poll Site:</Text>
            <Text variant="bodyMedium" style={styles.value}>{manifest.pollSiteDisplayName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Election ID:</Text>
            <Text variant="bodyMedium" style={styles.value}>{manifest.electionId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Items:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {manifest.packedCount} / {manifest.itemCount} packed
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Created:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {new Date(manifest.createdDate).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Assets List */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Assets ({manifest.items.length})
          </Text>
        </Card.Content>
      </Card>

      {manifest.items.map((item: ManifestItemDto) => (
        <Card key={item.manifestItemId} style={styles.assetCard}>
          <Card.Content>
            <View style={styles.assetHeader}>
              <Text variant="titleMedium" style={styles.assetTitle}>
                {item.assetType}
              </Text>
              <Chip
                mode="outlined"
                style={[
                  styles.packedChip,
                  { borderColor: item.isPacked ? COLORS.success : COLORS.warning }
                ]}
                textStyle={{ color: item.isPacked ? COLORS.success : COLORS.warning }}
              >
                {item.isPacked ? 'Packed' : 'Pending'}
              </Chip>
            </View>
            
            <View style={styles.assetInfo}>
              <Text variant="bodyMedium" style={styles.assetDetail}>
                Serial: {item.assetSerialNumber}
              </Text>
              {item.sealNumber && (
                <Text variant="bodyMedium" style={styles.assetDetail}>
                  Seal: {item.sealNumber}
                </Text>
              )}
              {item.packedDate && (
                <Text variant="bodyMedium" style={styles.assetDetail}>
                  Packed: {new Date(item.packedDate).toLocaleDateString()}
                </Text>
              )}
            </View>
            
            <Button
              mode="contained"
              onPress={() => handleSignAsset(item.assetId)}
              style={styles.signButton}
              icon="pen"
            >
              Sign for Asset
            </Button>
          </Card.Content>
        </Card>
      ))}

      {/* Finish Packing Button */}
      {manifest.status.toLowerCase() === 'readyforpacking' || manifest.status.toLowerCase() === 'partiallypacked' ? (
        <Card style={styles.finishPackingCard}>
          <Card.Content>
            <View style={styles.finishPackingContainer}>
              <Text variant="bodyMedium" style={styles.progressText}>
                Progress: {manifest.packedCount} of {manifest.itemCount} items packed
              </Text>
              <Button
                mode="contained"
                onPress={handleFinishPacking}
                disabled={manifest.packedCount !== manifest.itemCount}
                style={[
                  styles.finishPackingButton,
                  manifest.packedCount === manifest.itemCount ? styles.finishPackingButtonEnabled : styles.finishPackingButtonDisabled
                ]}
                icon="package-variant-closed"
              >
                Finish Packing
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : null}

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  assetCard: {
    marginBottom: 12,
  },
  errorCard: {
    width: '100%',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
  },
  manifestTitle: {
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.primary,
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusChip: {
    backgroundColor: COLORS.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  value: {
    color: COLORS.textSecondary,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  packedChip: {
    backgroundColor: COLORS.surface,
  },
  assetInfo: {
    marginBottom: 16,
  },
  assetDetail: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  signButton: {
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.danger,
  },
  centerText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  bottomPadding: {
    height: 32,
  },
  finishPackingCard: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  finishPackingContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  finishPackingButton: {
    minWidth: 200,
  },
  finishPackingButtonEnabled: {
    backgroundColor: COLORS.success,
  },
  finishPackingButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
});
