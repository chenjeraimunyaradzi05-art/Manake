import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants';

export type GalleryImage = {
  uri: string;
  thumbnail?: string;
  caption?: string;
  width?: number;
  height?: number;
};

export interface ImageGalleryProps {
  images?: GalleryImage[];
  style?: ViewStyle;
}

export function ImageGallery({ images, style }: ImageGalleryProps) {
  const count = images?.length ?? 0;
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{count} images</Text>
    </View>
  );
}

export interface ImageViewerProps {
  image?: GalleryImage;
  style?: ViewStyle;
}

export function ImageViewer({ style }: ImageViewerProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Image</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ImageGallery;
