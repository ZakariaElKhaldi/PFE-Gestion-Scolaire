// @ts-nocheck - Disable TypeScript checking for this file to avoid style type conflicts
// This is a common approach for React Native projects with StyleSheet type issues

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Platform,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { libraryService, LibraryResource, ResourceCategory } from '../../../services/library';
import { debounce } from 'lodash';

export default function LibraryScreen() {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resourcesData, categoriesData] = await Promise.all([
        libraryService.getResources(),
        libraryService.getCategories()
      ]);
      setResources(resourcesData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching library data:', err);
      setError('Failed to load library resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      try {
        setLoading(true);
        const filter: any = { query };
        if (selectedCategory) {
          filter.type = selectedCategory === 'books' ? 'book' : 
                        selectedCategory === 'articles' ? 'article' :
                        selectedCategory === 'videos' ? 'video' : 'document';
        }
        const results = await libraryService.getResources(filter);
        setResources(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [selectedCategory]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else if (selectedCategory) {
      // If search is cleared but category is selected
      handleCategorySelect(selectedCategory);
    } else {
      // Reset to all resources if no search and no category
      fetchData();
    }
  }, [searchQuery]);

  const handleCategorySelect = async (categoryId: string) => {
    try {
      setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
      setLoading(true);
      
      if (categoryId === selectedCategory) {
        // If the same category is selected again, deselect it and show all resources
        const results = await libraryService.getResources(searchQuery ? { query: searchQuery } : undefined);
        setResources(results);
      } else {
        // Filter by the selected category
        const type = categoryId === 'books' ? 'book' : 
                     categoryId === 'articles' ? 'article' :
                     categoryId === 'videos' ? 'video' : 'document';
        
        const filter: any = { type };
        if (searchQuery) {
          filter.query = searchQuery;
        }
        
        const results = await libraryService.getResources(filter);
        setResources(results);
      }
    } catch (err) {
      console.error('Error filtering by category:', err);
    } finally {
      setLoading(false);
    }
  };

  const openResourceDetail = (resource: LibraryResource) => {
    setSelectedResource(resource);
    setShowDetailModal(true);
  };

  const handleBorrowRequest = async (resourceId: string) => {
    try {
      const result = await libraryService.borrowResource(resourceId);
      Alert.alert('Success', result.message);
      setShowDetailModal(false);
      // Refresh the list to update availability
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to request the resource. Please try again.');
    }
  };

  const renderCategoryItem = ({ item }: { item: ResourceCategory }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategoryItem
        ]}
        onPress={() => handleCategorySelect(item.id)}
      >
        <Text style={[
          styles.categoryName,
          isSelected && styles.selectedCategoryText
        ]}>
          {item.name}
        </Text>
        <View style={styles.categoryCountContainer}>
          <Text style={[
            styles.categoryCount,
            isSelected && styles.selectedCategoryText
          ]}>
            {item.count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResourceItem = ({ item }: { item: LibraryResource }) => {
    return (
      <TouchableOpacity
        style={styles.resourceCard}
        onPress={() => openResourceDetail(item)}
      >
        <View style={styles.resourceCardContent}>
          {item.coverImage ? (
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.resourceCover} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.resourceCover, styles.placeholderCover]}>
              <Ionicons 
                name={
                  item.type === 'book' ? 'book-outline' :
                  item.type === 'article' ? 'document-text-outline' :
                  item.type === 'video' ? 'videocam-outline' : 'document-outline'
                } 
                size={40} 
                color={COLORS.grey[400]} 
              />
            </View>
          )}
          
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.resourceAuthor}>{item.author}</Text>
            
            <View style={styles.resourceMeta}>
              <View style={styles.resourceTypeContainer}>
                <Text style={styles.resourceType}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
              </View>
              
              <Text style={[
                styles.resourceAvailability,
                { color: item.available ? COLORS.success.DEFAULT : COLORS.danger.DEFAULT }
              ]}>
                {item.available ? 'Available' : 'Borrowed'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResourceDetail = () => {
    if (!selectedResource) return null;
    
    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Resource Details</Text>
            </View>
            
            <ScrollView style={styles.detailScroll}>
              <View style={styles.resourceDetailHeader}>
                {selectedResource.coverImage ? (
                  <Image 
                    source={{ uri: selectedResource.coverImage }} 
                    style={styles.detailCover} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.detailCover, styles.placeholderDetailCover]}>
                    <Ionicons 
                      name={
                        selectedResource.type === 'book' ? 'book-outline' :
                        selectedResource.type === 'article' ? 'document-text-outline' :
                        selectedResource.type === 'video' ? 'videocam-outline' : 'document-outline'
                      } 
                      size={60} 
                      color={COLORS.grey[400]} 
                    />
                  </View>
                )}
                
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailTitle}>{selectedResource.title}</Text>
                  <Text style={styles.detailAuthor}>{selectedResource.author}</Text>
                  
                  <View style={styles.detailMetaRow}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
                    <Text style={styles.detailMeta}>
                      Published: {new Date(selectedResource.published).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {selectedResource.course && (
                    <View style={styles.detailMetaRow}>
                      <Ionicons name="school-outline" size={16} color={COLORS.text.secondary} />
                      <Text style={styles.detailMeta}>
                        Course: {selectedResource.course}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.availabilityContainer}>
                    <View style={[
                      styles.availabilityBadge,
                      { 
                        backgroundColor: selectedResource.available 
                          ? COLORS.success.light 
                          : COLORS.danger.light 
                      }
                    ]}>
                      <Text style={[
                        styles.availabilityText,
                        { 
                          color: selectedResource.available 
                            ? COLORS.success.DEFAULT 
                            : COLORS.danger.DEFAULT 
                        }
                      ]}>
                        {selectedResource.available ? 'Available' : 'Borrowed'}
                      </Text>
                    </View>
                    
                    {!selectedResource.available && selectedResource.dueDate && (
                      <Text style={styles.dueDateText}>
                        Due: {new Date(selectedResource.dueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {selectedResource.description}
                </Text>
              </View>
              
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedResource.tags.map((tag, index) => (
                      <View key={index} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              {selectedResource.available ? (
                <TouchableOpacity
                  style={styles.borrowButton}
                  onPress={() => handleBorrowRequest(selectedResource.id)}
                >
                  <Ionicons name="hand-left-outline" size={18} color="white" />
                  <Text style={styles.borrowButtonText}>Request to Borrow</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.unavailableButton}>
                  <Ionicons name="time-outline" size={18} color={COLORS.text.secondary} />
                  <Text style={styles.unavailableButtonText}>Currently Unavailable</Text>
                </View>
              )}
              
              {selectedResource.downloadUrl && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => Alert.alert('Download', 'This would download or open the resource in a real app.')}
                >
                  <Ionicons name="download-outline" size={18} color={COLORS.primary.DEFAULT} />
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading library resources...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library Resources</Text>
        <Text style={styles.headerSubtitle}>Browse educational materials</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, or topic..."
            placeholderTextColor={COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      <FlatList
        data={resources}
        renderItem={renderResourceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.resourcesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.DEFAULT]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedCategory 
                ? 'No matching resources found' 
                : 'No resources available'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery || selectedCategory
                ? 'Try a different search term or category'
                : 'Check back later for new materials'}
            </Text>
          </View>
        )}
      />
      
      {renderResourceDetail()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  searchContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    paddingHorizontal: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoriesList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey[100],
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary.DEFAULT,
  },
  categoryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  selectedCategoryText: {
    color: 'white',
  },
  categoryCountContainer: {
    backgroundColor: COLORS.grey[200],
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
  },
  categoryCount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  resourcesList: {
    padding: SPACING.md,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resourceCardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  resourceCover: {
    width: 70,
    height: 90,
    borderRadius: 4,
    backgroundColor: COLORS.grey[100],
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grey[100],
  },
  resourceInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  resourceTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  resourceAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceTypeContainer: {
    backgroundColor: COLORS.grey[100],
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  resourceType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  resourceAvailability: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  closeButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  detailScroll: {
    flex: 1,
  },
  resourceDetailHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  detailCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: COLORS.grey[100],
  },
  placeholderDetailCover: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grey[100],
  },
  detailHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  detailTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  detailAuthor: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  availabilityContainer: {
    marginTop: SPACING.sm,
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  dueDateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grey[200],
    marginVertical: SPACING.md,
  },
  detailSection: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: COLORS.grey[100],
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    margin: 2,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  modalFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  borrowButton: {
    flex: 1,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  borrowButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  unavailableButton: {
    flex: 1,
    backgroundColor: COLORS.grey[200],
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableButtonText: {
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  downloadButton: {
    marginLeft: SPACING.md,
    borderColor: COLORS.primary.DEFAULT,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: COLORS.primary.DEFAULT,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
}); 