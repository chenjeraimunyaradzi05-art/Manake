import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../constants';
import { Card, Button, StoryCard, EmergencyWidget, Avatar } from '../../components';
import { useStoriesStore, useAuthStore } from '../../store';

const { width } = Dimensions.get('window');

const DAILY_QUOTES = [
  {
    quote: "Recovery is about progress, not perfection.",
    author: "Unknown",
  },
  {
    quote: "Every day is a new beginning. Take a deep breath and start again.",
    author: "Unknown",
  },
  {
    quote: "The only way out is through.",
    author: "Robert Frost",
  },
  {
    quote: "Healing takes courage, and we all have courage, even if we have to dig a little to find it.",
    author: "Tori Amos",
  },
  {
    quote: "You are not alone. You are seen. You are loved.",
    author: "Manake Foundation",
  },
];

const QUICK_LINKS = [
  { id: '1', title: 'Stories', icon: 'book' as const, route: '/(tabs)/stories', color: '#3b82f6' },
  { id: '2', title: 'Donate', icon: 'heart' as const, route: '/(tabs)/donate', color: '#10b981' },
  { id: '3', title: 'Programs', icon: 'graduation-cap' as const, route: '/(tabs)/stories', color: '#8b5cf6' },
  { id: '4', title: 'Contact', icon: 'phone' as const, route: '/(tabs)/profile', color: '#f59e0b' },
];

const STATS = [
  { id: '1', value: '500+', label: 'Lives Changed', icon: 'users' as const },
  { id: '2', value: '15+', label: 'Years of Service', icon: 'calendar' as const },
  { id: '3', value: '95%', label: 'Success Rate', icon: 'trophy' as const },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user, setDemoMode } = useAuthStore();
  const { featuredStories, loadMockData } = useStoriesStore();

  // Get random quote based on day
  const todayQuote = DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];

  useEffect(() => {
    loadMockData();
    if (!user) {
      setDemoMode();
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadMockData();
    setRefreshing(false);
  }, []);

  const handleStoryPress = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}
            </Text>
            <Text style={styles.welcomeText}>Welcome to Manake</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarContainer}
          >
            <Avatar 
              uri={user?.avatar} 
              name={user?.name} 
              size="medium"
              showBadge
            />
          </TouchableOpacity>
        </View>
        
        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Compassion. Healing. Hope.</Text>
        </View>
      </View>

      {/* Daily Inspiration Card */}
      <Card variant="elevated" style={styles.inspirationCard}>
        <View style={styles.inspirationHeader}>
          <FontAwesome name="quote-left" size={20} color={theme.colors.primary} />
          <Text style={styles.inspirationLabel}>Daily Inspiration</Text>
        </View>
        <Text style={styles.quoteText}>"{todayQuote.quote}"</Text>
        <Text style={styles.quoteAuthor}>— {todayQuote.author}</Text>
      </Card>

      {/* Emergency Widget */}
      <View style={styles.section}>
        <EmergencyWidget />
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickLinksGrid}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity 
              key={link.id}
              style={styles.quickLink}
              onPress={() => router.push(link.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: `${link.color}15` }]}>
                <FontAwesome name={link.icon} size={24} color={link.color} />
              </View>
              <Text style={styles.quickLinkText}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Impact Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Impact</Text>
        <View style={styles.statsContainer}>
          {STATS.map((stat) => (
            <View key={stat.id} style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome name={stat.icon} size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Stories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/stories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesScroll}
          >
            {featuredStories.map((story) => (
              <StoryCard 
                key={story.id}
                story={story}
                variant="featured"
                onPress={() => handleStoryPress(story.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Programs Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Programs</Text>
        <Card variant="elevated" style={styles.programsCard}>
          <View style={styles.programItem}>
            <View style={[styles.programIcon, { backgroundColor: '#10b98115' }]}>
              <FontAwesome name="medkit" size={22} color="#10b981" />
            </View>
            <View style={styles.programContent}>
              <Text style={styles.programTitle}>Residential Rehabilitation</Text>
              <Text style={styles.programDescription}>
                Comprehensive 90-day recovery programs with 24/7 support
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={theme.colors.textLight} />
          </View>
          <View style={styles.programDivider} />
          <View style={styles.programItem}>
            <View style={[styles.programIcon, { backgroundColor: '#3b82f615' }]}>
              <FontAwesome name="users" size={22} color="#3b82f6" />
            </View>
            <View style={styles.programContent}>
              <Text style={styles.programTitle}>Family Counseling</Text>
              <Text style={styles.programDescription}>
                Rebuild relationships and heal together as a family
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={theme.colors.textLight} />
          </View>
          <View style={styles.programDivider} />
          <View style={styles.programItem}>
            <View style={[styles.programIcon, { backgroundColor: '#8b5cf615' }]}>
              <FontAwesome name="briefcase" size={22} color="#8b5cf6" />
            </View>
            <View style={styles.programContent}>
              <Text style={styles.programTitle}>Skills Training</Text>
              <Text style={styles.programDescription}>
                Vocational training for sustainable employment
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={theme.colors.textLight} />
          </View>
        </Card>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <Card variant="elevated" style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Support Recovery</Text>
              <Text style={styles.ctaDescription}>
                Your donation helps transform lives and restore hope to families.
              </Text>
            </View>
            <Button 
              title="Donate Now" 
              onPress={() => router.push('/(tabs)/donate')}
              icon="heart"
              size="medium"
            />
          </View>
        </Card>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌱 Building brighter futures, one life at a time
        </Text>
      </View>
    </ScrollView>
  );
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  taglineContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  // Inspiration Card
  inspirationCard: {
    marginHorizontal: 20,
    marginTop: -16,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inspirationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 8,
    textAlign: 'right',
  },
  // Section
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // Quick Links
  quickLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLink: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  // Featured Stories
  storiesScroll: {
    paddingRight: 20,
  },
  // Programs
  programsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programContent: {
    flex: 1,
  },
  programTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  programDescription: {
    fontSize: 12,
    color: theme.colors.textLight,
    lineHeight: 16,
  },
  programDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 78,
  },
  // CTA Section
  ctaSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  ctaCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  ctaDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
