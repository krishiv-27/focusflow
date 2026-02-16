import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, BADGES, DIFFICULTY_CONFIG } from '../../lib/constants';
import TaskCard from '../../components/TaskCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, completeTask, addXP } = useApp();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { profile, tasks } = state;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const xpProgress = ((profile.xp % 100) / 100) * 100;

  const earnedBadges = BADGES.filter((b) => {
    if (b.type === 'streak') return profile.streak >= b.requirement;
    if (b.type === 'tasks') return profile.tasksCompleted >= b.requirement;
    return profile.xp >= b.requirement;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleCompleteTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      completeTask(taskId);
      addXP(task.xpReward);
    }
  };

  const handleFocus = (task) => {
    router.push({ pathname: '/focus', params: { taskId: task.id, taskData: JSON.stringify(task) } });
  };

  return (
    <LinearGradient
      colors={[COLORS.background, '#0d0d25', COLORS.background]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.nameText}>{profile.name} ✨</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color={COLORS.warning} />
              <Text style={styles.streakText}>{profile.streak}</Text>
            </View>
          </View>

          {/* XP Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <View style={styles.xpLeft}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  style={styles.xpIcon}
                >
                  <Ionicons name="flash" size={16} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={styles.xpLevelText}>Level {profile.level}</Text>
                  <Text style={styles.xpValueText}>{profile.xp} XP</Text>
                </View>
              </View>
              <Text style={styles.xpPercentText}>{Math.round(xpProgress)}% to Level {profile.level + 1}</Text>
            </View>
            <View style={styles.xpBarBg}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.max(xpProgress, 2)}%` }]}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'checkmark-circle', color: COLORS.success, value: profile.tasksCompleted, label: 'Completed' },
              { icon: 'flame', color: COLORS.warning, value: profile.streak, label: 'Day Streak' },
              { icon: 'trophy', color: '#FBBF24', value: earnedBadges.length, label: 'Badges' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Badges */}
          {earnedBadges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Badges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.badgesRow}>
                  {earnedBadges.map((badge) => (
                    <LinearGradient
                      key={badge.id}
                      colors={badge.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.badgeChip}
                    >
                      <Ionicons name={badge.icon} size={14} color="#fff" />
                      <Text style={styles.badgeText}>{badge.name}</Text>
                    </LinearGradient>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Tasks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              <Text style={styles.sectionCount}>{pendingTasks.length} remaining</Text>
            </View>

            {pendingTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bulb-outline" size={40} color="rgba(139, 92, 246, 0.3)" />
                <Text style={styles.emptyTitle}>No tasks yet</Text>
                <Text style={styles.emptySubtitle}>Tap + to add a task</Text>
              </View>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onFocus={handleFocus}
                />
              ))
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xxl,
  },
  greetingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  nameText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  streakText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.warning,
  },
  xpCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  xpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  xpIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpLevelText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  xpValueText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  xpPercentText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  xpBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sectionCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDim,
    marginTop: 4,
  },
});
