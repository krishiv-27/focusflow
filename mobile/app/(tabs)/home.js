import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, BADGES, DIFFICULTY_CONFIG } from '../../lib/constants';
import TaskCard from '../../components/TaskCard';

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
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="brain" size={18} color={COLORS.primaryLight} />
            <Text style={styles.logoText}>FOCUSFLOW</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color={COLORS.warning} />
            <Text style={styles.streakNum}>{profile.streak}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); }} tintColor={COLORS.primary} />
          }
        >
          {/* Glowing Orb */}
          <View style={styles.orbSection}>
            <View style={styles.orbGlow} />
            <View style={styles.orbInner}>
              <Ionicons name="brain" size={40} color={COLORS.primaryLight} />
              <Text style={styles.orbLabel}>Level {profile.level}</Text>
            </View>
          </View>

          {/* Deep Work Card */}
          <View style={styles.deepWorkCard}>
            <View style={styles.deepWorkHeader}>
              <Text style={styles.deepWorkTitle}>Deep Work</Text>
              <View style={styles.xpBadge}>
                <Ionicons name="flash" size={12} color={COLORS.primary} />
                <Text style={styles.xpBadgeText}>{profile.xp} XP</Text>
              </View>
            </View>
            <Text style={styles.deepWorkSub}>Today's focus session</Text>

            {pendingTasks.length > 0 ? (
              <View style={styles.focusBtnRow}>
                <TouchableOpacity
                  onPress={() => handleFocus(pendingTasks[0])}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.startFocusBtn}
                  >
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.startFocusBtnText}>Start Focus</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.timeChip}>
                  <Text style={styles.timeChipText}>{pendingTasks[0].estimatedTime}m</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/add')}
                style={styles.addTaskBtn}
              >
                <Ionicons name="add" size={18} color="rgba(255,255,255,0.3)" />
                <Text style={styles.addTaskBtnText}>Add a Task to Start</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'checkmark-circle', color: COLORS.success, value: profile.tasksCompleted, label: 'DONE' },
              { icon: 'flame', color: COLORS.warning, value: profile.streak, label: 'STREAK' },
              { icon: 'trophy', color: '#FBBF24', value: earnedBadges.length, label: 'BADGES' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Ionicons name={stat.icon} size={16} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* XP Bar */}
          <View style={styles.xpBarCard}>
            <View style={styles.xpBarHeader}>
              <Text style={styles.xpBarLabel}>Level {profile.level}</Text>
              <Text style={styles.xpBarPercent}>{Math.round(xpProgress)}%</Text>
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

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
    letterSpacing: 3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  streakNum: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.warning,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },
  orbSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  orbGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    top: 0,
  },
  orbInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  orbLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.3)',
  },
  deepWorkCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  deepWorkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deepWorkTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#fff',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  xpBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  deepWorkSub: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.lg,
  },
  focusBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  startFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
  },
  startFocusBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#fff',
  },
  timeChip: {
    height: 48,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeChipText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.5)',
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addTaskBtnText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.3)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1,
    fontWeight: '600',
  },
  xpBarCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
  },
  xpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpBarLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.3)',
  },
  xpBarPercent: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.15)',
  },
  xpBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
