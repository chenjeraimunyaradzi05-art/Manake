import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants';
import { useConnectivity } from '../../hooks';

interface NoInternetBannerProps {
  /** Whether to show the banner when offline. Defaults to true */
  show?: boolean;
}

/**
 * A banner that appears at the top of the screen when there's no internet connection
 */
export function NoInternetBanner({ show = true }: NoInternetBannerProps) {
  const { hasInternet, isLoading } = useConnectivity();

  // Don't show while still checking connectivity
  if (isLoading) return null;

  // Don't show if we have internet or if show is false
  if (hasInternet || !show) return null;

  return (
    <Animated.View style={styles.container}>
      <View style={styles.content}>
        <FontAwesome name="wifi" size={16} color="#fff" style={styles.icon} />
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
    opacity: 0.9,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NoInternetBanner;
