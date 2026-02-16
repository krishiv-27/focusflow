import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, BADGES } from '../../lib/constants';

// Map badge icon strings to actual icon components
const BADGE_ICONS = {
  star: { family: 'Ionicons', name: 'star' },
  target: { family: 'Ionicons', name: 'locate' },
  flame: { family: 'Ionicons', name: 'flame' },
  award: { family: 'Ionicons', name: 'ribbon' },
  crown: { family: 'MaterialCommunityIcons', name: 'crown' },
  shield: { family: 'Ionicons', name: 'shield' },
  zap: { family: 'Ionicons', name: 'flash' },
};

function BadgeIconComponent({ iconName, size, color }) {
  const config = BADGE_ICONS[iconName] || { family: 'Ionicons', name: 'star' };
  if (config.family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={config.name} size={size} color={color} />;
  }
  return <Ionicons name={config.name} size={size} color={color} />;
}

export default function ProfileScreen() {
  const { state, logout } = useApp();
  const router = useRouter();
  const { profile } = state;

  const allBadges = BADGES;
  const earnedBadgeIds = new Set(profile.badges);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'This will reset all your progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const totalFocusHours = Math.floor((profile.totalFocusMinutes || 0) / 60);
  const totalFocusMins = (profile.totalFocusMinutes || 0) % 60;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {profile.name ? profile.name[0].toUpperCase() : '?'}
              </Text>
            </LinearGradient>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>
              {profile.email || `Signed in as ${profile.authProvider || 'guest'}`}
            </Text>
            <View style={styles.levelBadge}>
              <Ionicons name="flash" size={14} color={COLORS.primary} />
              <Text style={styles.levelText}>Level {profile.level}</Text>
              <Text style={styles.xpText}>· {profile.xp} XP</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Tasks Done', value: profile.tasksCompleted, icon: 'checkmark-circle', color: COLORS.success },
              { label: 'Day Streak', value: profile.streak, icon: 'flame', color: COLORS.warning },
              { label: 'Focus Time', value: `${totalFocusHours}h ${totalFocusMins}m`, icon: 'time', color: COLORS.accent },
              { label: 'XP Earned', value: profile.xp, icon: 'flash', color: COLORS.primary },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Ionicons name={stat.icon} size={22} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Badges Collection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badge Collection</Text>
            <View style={styles.badgesGrid}>
              {allBadges.map((badge) => {
                const earned = earnedBadgeIds.has(badge.id) ||
                  (badge.type === 'streak' ? profile.streak >= badge.requirement :
                    badge.type === 'tasks' ? profile.tasksCompleted >= badge.requirement :
                      profile.xp >= badge.requirement);
                return (
                  <View
                    key={badge.id}
                    style={[styles.badgeItem, !earned && styles.badgeLocked]}
                  >
                    <LinearGradient
                      colors={earned ? badge.colors : ['#333', '#444']}
                      style={styles.badgeIcon}
                    >
                      {earned ? (
                        <BadgeIconComponent iconName={badge.icon} size={20} color="#fff" />
                      ) : (
                        <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.3)" />
                      )}
                    </LinearGradient>
                    <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeReq}>
                      {earned
                        ? 'Earned!'
                        : badge.type === 'streak'
                          ? `${badge.requirement}-day streak`
                          : badge.type === 'tasks'
                            ? `${badge.requirement} tasks`
                            : `${badge.requirement} XP`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            {[
              { icon: 'notifications-outline', label: 'Notifications', value: 'Coming soon' },
              { icon: 'moon-outline', label: 'Dark Mode', value: 'Always' },
              { icon: 'information-circle-outline', label: 'About', value: 'v1.0.0' },
            ].map((item, i) => (
              <View key={i} style={styles.settingItem}>
                <Ionicons name={item.icon} size={20} color={COLORS.textMuted} />
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  levelText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  xpText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xxxl,
  },
  statItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.xxxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: COLORS.textMuted,
  },
  badgeReq: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: SPACING.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  settingValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.error,
  },
});
