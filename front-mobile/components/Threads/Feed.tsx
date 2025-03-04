import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { posts } from '@/types/lib/data';
import Post from '@/components/Threads/Post';
import CreatePost from '@/components/Threads/CreatePost';
import Icon from 'react-native-vector-icons/Feather'; // Assuming you're using Feather icons

const Feed = () => {
  const [sortBy, setSortBy] = useState<'latest' | 'trending'>('latest');
  const [filter, setFilter] = useState<string | null>(null);

  // Filtered and sorted posts
  const filteredPosts = posts
    .filter((post) => {
      if (!filter) return true;
      return post.author.role === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.upvotes - a.upvotes;
      }
    });

  const handleFilterClick = (newFilter: string | null) => {
    setFilter(newFilter === filter ? null : newFilter);
  };

  return (
    <View style={styles.container}>
      <CreatePost />

      <View style={styles.filterContainer}>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === 'latest' && styles.activeSortButton,
            ]}
            onPress={() => setSortBy('latest')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'latest' && styles.activeSortButtonText,
              ]}
            >
              Latest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === 'trending' && styles.activeSortButton,
            ]}
            onPress={() => setSortBy('trending')}
          >
            <Icon name="trending-up" size={16} color={sortBy === 'trending' ? '#fff' : '#6b7280'} />
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'trending' && styles.activeSortButtonText,
              ]}
            >
              Trending
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterDropdown}>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter" size={16} color="#6b7280" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          <View style={styles.filterMenu}>
            <TouchableOpacity
              style={[
                styles.filterMenuItem,
                filter === 'admin' && styles.activeFilterMenuItem,
              ]}
              onPress={() => handleFilterClick('admin')}
            >
              <Text
                style={[
                  styles.filterMenuItemText,
                  filter === 'admin' && styles.activeFilterMenuItemText,
                ]}
              >
                Administration
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterMenuItem,
                filter === 'teacher' && styles.activeFilterMenuItem,
              ]}
              onPress={() => handleFilterClick('teacher')}
            >
              <Text
                style={[
                  styles.filterMenuItemText,
                  filter === 'teacher' && styles.activeFilterMenuItemText,
                ]}
              >
                Teachers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterMenuItem,
                filter === 'student' && styles.activeFilterMenuItem,
              ]}
              onPress={() => handleFilterClick('student')}
            >
              <Text
                style={[
                  styles.filterMenuItemText,
                  filter === 'student' && styles.activeFilterMenuItemText,
                ]}
              >
                Students
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Post post={item} />}
          contentContainerStyle={styles.postList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No posts found</Text>
          <Text style={styles.emptyStateText}>Try adjusting your filters</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#3b82f6',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeSortButtonText: {
    color: '#fff',
  },
  filterDropdown: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  filterMenu: {
    position: 'absolute',
    right: 0,
    top: 40,
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    padding: 8,
  },
  filterMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeFilterMenuItem: {
    backgroundColor: '#dbeafe',
  },
  filterMenuItemText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeFilterMenuItemText: {
    color: '#3b82f6',
  },
  postList: {
    paddingBottom: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default Feed;