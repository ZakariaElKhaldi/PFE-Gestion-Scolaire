import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  src: string;
  alt: string;
  online?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: object;
}

const sizes = {
  sm: 32, // 8 * 4
  md: 40, // 10 * 4
  lg: 48, // 12 * 4
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  online = false,
  size = 'md',
  style,
}) => {
  const imageSize = sizes[size];

  const handleImageError = (e: any) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=1D4ED8&color=fff`;
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: src }}
        style={[styles.avatar, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
        onError={handleImageError}
      />
      {online && <View style={styles.onlineIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981', // Success green color
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default Avatar;