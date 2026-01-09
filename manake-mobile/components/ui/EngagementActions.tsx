import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';
import { theme } from '../../constants';

export interface EngagementButtonProps {
  onPress?: () => void;
  count?: number;
  style?: ViewStyle;
}

export function LikeButton({ onPress, style }: EngagementButtonProps) {
  return (
    <View style={style}>
      <Button title="Like" onPress={onPress ?? (() => {})} variant="ghost" icon="heart" />
    </View>
  );
}

export function CommentButton({ onPress, style }: EngagementButtonProps) {
  return (
    <View style={style}>
      <Button title="Comment" onPress={onPress ?? (() => {})} variant="ghost" icon="comment" />
    </View>
  );
}

export function ShareButton({ onPress, style }: EngagementButtonProps) {
  return (
    <View style={style}>
      <Button title="Share" onPress={onPress ?? (() => {})} variant="ghost" icon="share" />
    </View>
  );
}

export function BookmarkButton({ onPress, style }: EngagementButtonProps) {
  return (
    <View style={style}>
      <Button title="Save" onPress={onPress ?? (() => {})} variant="ghost" icon="bookmark" />
    </View>
  );
}

export interface EngagementActionsProps {
  style?: ViewStyle;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export function EngagementActions({ style, onLike, onComment, onShare, onBookmark }: EngagementActionsProps) {
  return (
    <View style={[styles.container, style]}>
      <LikeButton onPress={onLike} />
      <CommentButton onPress={onComment} />
      <ShareButton onPress={onShare} />
      <BookmarkButton onPress={onBookmark} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
});

export default EngagementActions;
