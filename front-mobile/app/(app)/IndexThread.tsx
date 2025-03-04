import React from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import Navbar from '@/components/Threads/Navbar';  // Adjust if necessary
import Feed from '@/components/Threads/Feed';    // Adjust if necessary

const Index = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar component */}
      <Navbar />

      {/* Feed component */}
      <ScrollView contentContainerStyle={styles.feedContainer}>
        <Feed />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',  // Equivalent of bg-gray-50 in Tailwind
  },
  feedContainer: {
    paddingTop: 24,   // Adjust pt-24
    paddingBottom: 12, // Adjust pb-12
    paddingHorizontal: 16, // Adjust px-4
  },
});

export default Index;
