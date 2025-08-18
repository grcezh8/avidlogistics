import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { Text, Card, Searchbar, ActivityIndicator, Button, Chip } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { COLORS } from '../constants/colors';
import { ManifestService } from '../services/manifestService';
import { ManifestSummaryDto } from '../types/manifest';

type PackingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Packing'>;

interface Props {
  navigation: PackingScreenNavigationProp;
}

export default function PackingScreen({ navigation }: Props) {
  const [manifests, setManifests] = useState<ManifestSummaryDto[]>([]);
  const [filteredManifests, setFilteredManifests] = useState<ManifestSummaryDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadManifests = async () => {
    try {
      setLoading(true);
      const manifestsData = await ManifestService.getAllManifests();
      setManifests(manifestsData);
      setFilteredManifests(manifestsData);
    } catch (error) {
      console.error('Error loading manifests:', error);
      Alert.alert('Error', 'Failed to load manifests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadManifests();
    setRefreshing(false);
  };

  useEffect(() => {
    loadManifests();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredManifests(manifests);
    } else {
      const filtered = manifests.filter(manifest =>
        manifest.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manifest.manifestId.toString().includes(searchQuery) ||
        manifest.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredManifests(filtered);
    }
  }, [searchQuery, manifests]);

  const handleManifestPress = (manifest: ManifestSummaryDto) => {
    // Navigate to ManifestDetails which will then lead to Chain of Custody workflow
    navigation.navigate('ManifestDetails', { manifestId: manifest.manifestId });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return COLORS.warning;
      case 'ready':
        return COLORS.info;
      case 'packed':
        return COLORS.success;
      case 'delivered':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderManifestItem = ({ item }: { item: ManifestSummaryDto }) => (
    <Card style={styles.manifestCard} onPress={() => handleManifestPress(item)}>
      <Card.Content>
        <View style={styles.manifestHeader}>
          <Text variant="titleMedium" style={styles.manifestNumber}>
            {item.manifestNumber}
          </Text>
          <Chip 
            mode="outlined" 
            textStyle={{ color: getStatusColor(item.status) }}
            style={{ borderColor: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.manifestDetails}>
          <Text variant="bodyMedium" style={styles.detailText}>
            Manifest ID: {item.manifestId}
          </Text>
          <Text variant="bodyMedium" style={styles.detailText}>
            Election ID: {item.electionId}
          </Text>
          <Text variant="bodyMedium" style={styles.detailText}>
            Poll Site ID: {item.toPollSiteId}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Text variant="bodySmall" style={styles.progressText}>
            Progress: {item.packedCount} / {item.itemCount} items packed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: item.itemCount > 0 ? `${(item.packedCount / item.itemCount) * 100}%` : '0%',
                  backgroundColor: item.packedCount === item.itemCount ? COLORS.success : COLORS.primary
                }
              ]} 
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading manifests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Packing Manifests
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select a manifest to begin the Chain of Custody process
        </Text>
      </View>

      <Searchbar
        placeholder="Search manifests..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredManifests}
        renderItem={renderManifestItem}
        keyExtractor={(item) => item.manifestId.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              {searchQuery ? 'No manifests found matching your search.' : 'No manifests available.'}
            </Text>
            <Button mode="outlined" onPress={loadManifests} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  manifestCard: {
    marginBottom: 12,
    elevation: 2,
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  manifestNumber: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  manifestDetails: {
    marginBottom: 12,
  },
  detailText: {
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});
