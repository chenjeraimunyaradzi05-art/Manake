import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants';
import { Avatar, Button, Input } from '../../components';
import { useAuth } from '../../hooks';
import { useStoriesStore } from '../../store';
import { storiesApi } from '../../services/api';
import type { StoryComment } from '../../types';

const { width } = Dimensions.get('window');

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentStory, isLoading, fetchStoryById, likeStory, unlikeStory, clearCurrentStory } = useStoriesStore();
  const { user } = useAuth();

  const [comments, setComments] = useState<StoryComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStoryById(id);
    }
    
    return () => clearCurrentStory();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const run = async () => {
      setCommentsLoading(true);
      setCommentError(null);
      try {
        const resp = await storiesApi.getComments(id);
        if (!isMounted) return;
        if (resp.success) {
          setComments(resp.data);
        } else {
          setCommentError(resp.message || 'Failed to load comments');
        }
      } catch (e) {
        if (!isMounted) return;
        setCommentError(e instanceof Error ? e.message : 'Failed to load comments');
      } finally {
        if (isMounted) setCommentsLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleLike = () => {
    if (!currentStory) return;

    if (currentStory.isLiked) {
      unlikeStory(currentStory.id);
    } else {
      likeStory(currentStory.id);
    }
  };

  const handlePostComment = async () => {
    if (!id) return;
    const trimmed = commentText.trim();
    if (trimmed.length < 5) {
      setCommentError('Comment must be at least 5 characters');
      return;
    }
    if (!user?.name) {
      setCommentError('You must be logged in to comment');
      return;
    }

    setPostingComment(true);
    setCommentError(null);
    try {
      const resp = await storiesApi.addComment(id, { author: user.name, content: trimmed });
      if (resp.success) {
        setComments((prev) => [resp.data, ...prev]);
        setCommentText('');
        if (currentStory) {
          useStoriesStore.setState({
            currentStory: { ...currentStory, comments: (currentStory.comments || 0) + 1 },
          });
        }
      } else {
        setCommentError(resp.message || 'Failed to post comment');
      }
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleShare = async () => {
    if (!currentStory) return;
    
    try {
      await Share.share({
        message: `Check out this inspiring story from Manake: "${currentStory.title}" - Read more at manake.org/stories/${currentStory.slug}`,
        title: currentStory.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  if (!currentStory) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-circle" size={48} color={theme.colors.textLight} />
        <Text style={styles.errorTitle}>Story Not Found</Text>
        <Text style={styles.errorText}>The story you're looking for doesn't exist.</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

  const likeCount = currentStory.likes;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={18} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <FontAwesome name="share" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: currentStory.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {currentStory.category.toUpperCase().replace('-', ' ')}
              </Text>
            </View>
            <Text style={styles.title}>{currentStory.title}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Author Info */}
          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <Avatar 
                uri={currentStory.authorImage} 
                name={currentStory.author}
                size="medium"
              />
              <View style={styles.authorText}>
                <Text style={styles.authorName}>{currentStory.author}</Text>
                <Text style={styles.publishDate}>
                  {formatDate(currentStory.publishedAt)} • {currentStory.readTime} min read
                </Text>
              </View>
            </View>
          </View>

          {/* Engagement Bar */}
          <View style={styles.engagementBar}>
            <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
              <FontAwesome 
                name={currentStory.isLiked ? 'heart' : 'heart-o'} 
                size={22} 
                color={currentStory.isLiked ? theme.colors.danger : theme.colors.textLight} 
              />
              <Text style={[
                styles.engagementText,
                currentStory.isLiked && styles.engagementTextActive
              ]}>
                {likeCount}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.engagementButton}>
              <FontAwesome name="comment-o" size={22} color={theme.colors.textLight} />
              <Text style={styles.engagementText}>{currentStory.comments}</Text>
            </View>
            
            <TouchableOpacity style={styles.engagementButton} onPress={handleShare}>
              <FontAwesome name="share" size={22} color={theme.colors.textLight} />
              <Text style={styles.engagementText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Story Excerpt */}
          <View style={styles.excerptBox}>
            <FontAwesome name="quote-left" size={20} color={theme.colors.primary} />
            <Text style={styles.excerpt}>{currentStory.excerpt}</Text>
          </View>

          {/* Story Content */}
          <View style={styles.storyContent}>
            <Text style={styles.paragraph}>
              {currentStory.content || `This is the beginning of ${currentStory.author}'s journey. A story of resilience, hope, and transformation that started with a single step towards recovery.

When I first arrived at Manake Rehabilitation Center, I was at my lowest point. Years of struggle had taken their toll on my health, relationships, and sense of self-worth. But from the moment I walked through those doors, I felt something different – a genuine sense of care and understanding.

The team at Manake didn't just treat my addiction; they helped me understand its roots and gave me the tools to build a new life. Through counseling, peer support, and vocational training, I discovered strengths I never knew I had.

Today, I stand proud as a testament to what's possible when you have the right support. My family relationships are stronger than ever, I have meaningful employment, and most importantly, I have hope for the future.

To anyone reading this who is struggling: recovery is possible. It won't be easy, but with the right help and determination, you can reclaim your life. Manake was my turning point, and it could be yours too.`}
            </Text>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>

            <View style={styles.commentComposer}>
              <Input
                label="Add a comment"
                value={commentText}
                onChangeText={(t) => {
                  setCommentText(t);
                  if (commentError) setCommentError(null);
                }}
                placeholder="Write something supportive..."
                multiline
                numberOfLines={3}
                editable={!postingComment}
                containerStyle={styles.commentInputContainer}
              />
              {commentError && <Text style={styles.commentError}>{commentError}</Text>}
              <Button
                title={postingComment ? 'Posting...' : 'Post Comment'}
                onPress={handlePostComment}
                variant="primary"
                fullWidth
                loading={postingComment}
              />
            </View>

            {commentsLoading ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.commentsLoadingText}>Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <Text style={styles.noCommentsText}>Be the first to comment.</Text>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((c) => (
                  <View key={(c.id || c.createdAt) as string} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{c.author}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.commentBody}>{c.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tags */}
          {currentStory.tags && currentStory.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionTitle}>Topics</Text>
              <View style={styles.tagsContainer}>
                {currentStory.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Inspired by this story?</Text>
              <Text style={styles.ctaText}>
                Your donation helps provide the same life-changing support to others in need.
              </Text>
              <Button 
                title="Support Recovery"
                onPress={() => router.push('/(tabs)/donate')}
                icon="heart"
                fullWidth
              />
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navSection}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/stories')}
            >
              <FontAwesome name="arrow-left" size={16} color={theme.colors.primary} />
              <Text style={styles.navButtonText}>More Stories</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  // Header Buttons
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  // Hero
  heroContainer: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 36,
  },
  // Content
  content: {
    padding: 24,
  },
  // Author Section
  authorSection: {
    marginBottom: 20,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authorText: {},
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  publishDate: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  // Engagement Bar
  engagementBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 24,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engagementText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  engagementTextActive: {
    color: theme.colors.danger,
  },
  // Excerpt
  excerptBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginBottom: 24,
  },
  excerpt: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 26,
    fontStyle: 'italic',
    marginTop: 12,
  },
  // Story Content
  storyContent: {
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 17,
    color: theme.colors.text,
    lineHeight: 28,
  },
  // Comments
  commentsSection: {
    marginBottom: 24,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  commentComposer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  commentInputContainer: {
    marginBottom: 8,
  },
  commentError: {
    color: theme.colors.danger,
    fontSize: 12,
    marginBottom: 8,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  commentsLoadingText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  noCommentsText: {
    fontSize: 14,
    color: theme.colors.textLight,
    paddingVertical: 8,
  },
  commentsList: {
    gap: 10,
  },
  commentItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  commentDate: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  commentBody: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  // Tags
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  // CTA Section
  ctaSection: {
    marginBottom: 24,
  },
  ctaCard: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  // Navigation
  navSection: {
    paddingBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
