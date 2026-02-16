import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, DIFFICULTY_CONFIG } from '../lib/constants';

export default function TaskCard({ task, onComplete, onFocus, onDelete }) {
  const diff = DIFFICULTY_CONFIG[task.difficulty];

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => onComplete?.(task.id)} style={styles.checkBtn}>
          <View style={styles.circle}>
            <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.2)" />
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
          {task.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{task.subtitle}</Text>
          )}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{task.estimatedTime}m</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg, borderColor: diff.border }]}>
              <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flash" size={11} color={COLORS.primary} />
              <Text style={[styles.metaText, { color: COLORS.primaryLight }]}>+{task.xpReward} XP</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => onFocus?.(task)} style={styles.focusBtn}>
          <Ionicons name="play" size={14} color={COLORS.primary} />
          <Text style={styles.focusBtnText}>Focus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkBtn: {
    marginTop: 2,
    marginRight: SPACING.md,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  diffBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  diffText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  focusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  focusBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
