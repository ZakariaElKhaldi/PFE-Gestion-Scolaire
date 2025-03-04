import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { currentUser } from '@/types/lib/data';
import Icon from 'react-native-vector-icons/Feather'; // Assuming you're using Feather icons

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isPreviewingImage, setIsPreviewingImage] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    console.log('Post created:', { title, content, imageUrl });

    // Reset form
    setTitle('');
    setContent('');
    setImageUrl('');
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setIsExpanded(false);
  };

  const handleAddImage = () => {
    Alert.prompt(
      'Add Image',
      'Enter the image URL:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (url) => {
            if (url) setImageUrl(url);
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
        {!isExpanded ? (
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setIsExpanded(true)}
          >
            <Text style={styles.createPostText}>Create a post...</Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />
        )}
      </View>

      {isExpanded && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="What would you like to share?"
            value={content}
            onChangeText={setContent}
            style={styles.contentInput}
            multiline
            numberOfLines={4}
            autoFocus
          />

          {imageUrl && (
            <View style={styles.imagePreviewContainer}>
              {isPreviewingImage ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: imageUrl }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.closePreviewButton}
                    onPress={() => setIsPreviewingImage(false)}
                  >
                    <Icon name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUrlContainer}>
                  <Text style={styles.imageUrlText} numberOfLines={1}>
                    {imageUrl.length > 50
                      ? `${imageUrl.substring(0, 50)}...`
                      : imageUrl}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsPreviewingImage(true)}
                    style={styles.previewButton}
                  >
                    <Text style={styles.previewButtonText}>Preview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setImageUrl('')}
                    style={styles.removeImageButton}
                  >
                    <Icon name="x" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.actionsContainer}>
            <View style={styles.leftActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddImage}
              >
                <Icon name="image" size={20} color="#6b7280" />
                <Text style={styles.actionButtonText}>Add Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="link" size={20} color="#6b7280" />
                <Text style={styles.actionButtonText}>Add Link</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.postButton, !title.trim() && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  createPostText: {
    color: '#6b7280',
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  formContainer: {
    marginTop: 8,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  closePreviewButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 4,
  },
  imageUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageUrlText: {
    flex: 1,
    color: '#6b7280',
  },
  previewButton: {
    marginLeft: 8,
  },
  previewButtonText: {
    color: '#3b82f6',
  },
  removeImageButton: {
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    color: '#6b7280',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
  },
  postButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  postButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
});

export default CreatePost;