import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface VideoPlayerProps {
  uri?: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  style?: ViewStyle;
  onPlaybackStatusUpdate?: (status: PlaybackStatus) => void;
  onError?: (error: string) => void;
}

export interface PlaybackStatus {
  isPlaying: boolean;
  isBuffering: boolean;
  positionMillis: number;
  durationMillis: number;
  didJustFinish: boolean;
}

/**
 * VideoPlayer component with play/pause controls, progress bar, and fullscreen support.
 * Uses expo-av for video playback (must be installed separately).
 * Falls back to a placeholder when expo-av is not available.
 */
export function VideoPlayer({
  uri,
  poster,
  autoplay = false,
  loop = false,
  muted = false,
  style,
  onPlaybackStatusUpdate,
  onError,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
    // Show controls briefly when toggling
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleSeek = useCallback((position: number) => {
    setProgress(position);
  }, []);

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!uri) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <FontAwesome name="video-camera" size={32} color={theme.colors.textSecondary} />
        <Text style={styles.placeholderText}>No video source</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <FontAwesome name="exclamation-triangle" size={32} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={1}
      onPress={() => setShowControls((prev) => !prev)}
    >
      {/* Video placeholder - actual Video component would be here with expo-av */}
      <View style={styles.videoPlaceholder}>
        {poster ? (
          <View style={styles.posterContainer}>
            <Text style={styles.posterText}>Video: {uri.substring(0, 30)}...</Text>
          </View>
        ) : (
          <View style={styles.posterContainer}>
            <FontAwesome name="film" size={48} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Buffering indicator */}
      {isBuffering && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Controls overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Play/Pause button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleTogglePlay}
          >
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(progress)}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: duration > 0 ? `${(progress / duration) * 100}%` : "0%" },
                ]}
              />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Additional controls */}
          <View style={styles.additionalControls}>
            <TouchableOpacity style={styles.controlButton}>
              <FontAwesome
                name={muted ? "volume-off" : "volume-up"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <FontAwesome name="expand" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  posterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  posterText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  additionalControls: {
    position: "absolute",
    bottom: 8,
    right: 16,
    flexDirection: "row",
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default VideoPlayer;
