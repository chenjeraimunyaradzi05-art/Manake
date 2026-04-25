import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  columns?: 2 | 3 | 4;
  spacing?: number;
  showCaptions?: boolean;
  onImagePress?: (image: GalleryImage, index: number) => void;
}

/**
 * ImageGallery displays a grid of images with optional lightbox viewer.
 * Supports lazy loading, thumbnails, and fullscreen viewing.
 */
export function ImageGallery({
  images = [],
  style,
  columns = 3,
  spacing = 4,
  showCaptions = false,
  onImagePress,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const imageSize = useMemo(() => {
    const totalSpacing = spacing * (columns + 1);
    return (SCREEN_WIDTH - totalSpacing) / columns;
  }, [columns, spacing]);

  const handleImagePress = useCallback(
    (image: GalleryImage, index: number) => {
      if (onImagePress) {
        onImagePress(image, index);
      } else {
        setSelectedIndex(index);
      }
    },
    [onImagePress]
  );

  const handleCloseViewer = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <FontAwesome name="picture-o" size={32} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No images</Text>
      </View>
    );
  }

  // Special layout for 1-4 images
  if (images.length <= 4) {
    return (
      <>
        <View style={[styles.specialLayout, style]}>
          {images.length === 1 && (
            <TouchableOpacity
              style={styles.singleImage}
              onPress={() => handleImagePress(images[0], 0)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: images[0].thumbnail || images[0].uri }}
                style={styles.fullImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
          
          {images.length === 2 && (
            <View style={styles.twoImages}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.halfImage}
                  onPress={() => handleImagePress(img, idx)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: img.thumbnail || img.uri }}
                    style={styles.fullImage}
                    contentFit="cover"
                    transition={200}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {images.length === 3 && (
            <View style={styles.threeImages}>
              <TouchableOpacity
                style={styles.largeImage}
                onPress={() => handleImagePress(images[0], 0)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: images[0].thumbnail || images[0].uri }}
                  style={styles.fullImage}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
              <View style={styles.smallImagesColumn}>
                {images.slice(1).map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.smallImage}
                    onPress={() => handleImagePress(img, idx + 1)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: img.thumbnail || img.uri }}
                      style={styles.fullImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {images.length === 4 && (
            <View style={styles.fourImages}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quarterImage}
                  onPress={() => handleImagePress(img, idx)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: img.thumbnail || img.uri }}
                    style={styles.fullImage}
                    contentFit="cover"
                    transition={200}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {selectedIndex !== null && (
          <ImageViewer
            images={images}
            initialIndex={selectedIndex}
            onClose={handleCloseViewer}
          />
        )}
      </>
    );
  }

  // Grid layout for 5+ images
  return (
    <>
      <View style={[styles.gridContainer, { padding: spacing / 2 }, style]}>
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.gridItem,
              {
                width: imageSize,
                height: imageSize,
                margin: spacing / 2,
              },
            ]}
            onPress={() => handleImagePress(image, index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: image.thumbnail || image.uri }}
              style={styles.fullImage}
              contentFit="cover"
              transition={200}
            />
            {showCaptions && image.caption && (
              <View style={styles.captionOverlay}>
                <Text style={styles.captionText} numberOfLines={1}>
                  {image.caption}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedIndex !== null && (
        <ImageViewer
          images={images}
          initialIndex={selectedIndex}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
}

export interface ImageViewerProps {
  images?: GalleryImage[];
  initialIndex?: number;
  onClose?: () => void;
  style?: ViewStyle;
}

/**
 * Full-screen image viewer with swipe navigation.
 */
export function ImageViewer({
  images = [],
  initialIndex = 0,
  onClose,
  style,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsLoading(true);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsLoading(true);
  }, [images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.viewerContainer} onPress={onClose}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="times" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Image counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>

        {/* Main image */}
        <Pressable
          style={styles.imageWrapper}
          onPress={(e) => e.stopPropagation()}
        >
          {isLoading && (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="large"
              color={theme.colors.primary}
            />
          )}
          <Image
            source={{ uri: currentImage.uri }}
            style={styles.viewerImage}
            contentFit="contain"
            transition={200}
            onLoadEnd={() => setIsLoading(false)}
          />
        </Pressable>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={handlePrevious}
            >
              <FontAwesome name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={handleNext}
            >
              <FontAwesome name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* Caption */}
        {currentImage.caption && (
          <View style={styles.viewerCaptionContainer}>
            <Text style={styles.viewerCaptionText}>{currentImage.caption}</Text>
          </View>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  specialLayout: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  singleImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  twoImages: {
    flexDirection: "row",
    width: "100%",
    aspectRatio: 2,
  },
  halfImage: {
    flex: 1,
    marginHorizontal: 1,
  },
  threeImages: {
    flexDirection: "row",
    width: "100%",
    aspectRatio: 16 / 9,
  },
  largeImage: {
    flex: 2,
    marginRight: 2,
  },
  smallImagesColumn: {
    flex: 1,
  },
  smallImage: {
    flex: 1,
    marginVertical: 1,
  },
  fourImages: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    aspectRatio: 1,
  },
  quarterImage: {
    width: "49%",
    height: "49%",
    margin: "0.5%",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  captionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  captionText: {
    color: "#fff",
    fontSize: 10,
  },
  // Viewer styles
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  counterContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  counterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  viewerCaptionContainer: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
  },
  viewerCaptionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ImageGallery;
