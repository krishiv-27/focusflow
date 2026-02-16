import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, Dimensions, Platform, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import ProgressRing from '../components/ProgressRing';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, DIFFICULTY_CONFIG } from '../lib/constants';

const { width } = Dimensions.get('window');

export default function FocusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { completeTask, addXP, addFocusMinutes } = useApp();

  const task = params.taskData ? JSON.parse(params.taskData) : null;

  const [timeLeft, setTimeLeft] = useState(task ? task.estimatedTime * 60 : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [idleCount, setIdleCount] = useState(0);
  const [showBurnout, setShowBurnout] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [bonusXP, setBonusXP] = useState(0);
  const [completed, setCompleted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const totalTime = task ? task.estimatedTime * 60 : 1;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const handlePause = () => {
    setIsRunning(false);
    const newCount = pauseCount + 1;
    setPauseCount(newCount);
    try { Vibration.vibrate(50); } catch(e) {}
    if (newCount >= 3 || idleCount >= 2) {
      setShowBurnout(true);
    }
  };

  const handleDistracted = () => {
    const newCount = idleCount + 1;
    setIdleCount(newCount);
    try { Vibration.vibrate(50); } catch(e) {}
    if (newCount >= 2 || pauseCount >= 3) {
      setShowBurnout(true);
    }
  };

  const handleBurnoutAccept = () => {
    const reduced = Math.max(60, Math.floor(timeLeft * 0.7));
    setTimeLeft(reduced);
    setBonusXP(15);
    setShowBurnout(false);
  };

  const handleComplete = () => {
    setCompleted(true);
    setIsRunning(false);
    const totalXP = (task?.xpReward || 0) + bonusXP;
    if (task) {
      completeTask(task.id);
      addXP(totalXP);
      const minutesSpent = Math.round((totalTime - timeLeft) / 60);
      addFocusMinutes(minutesSpent);
    }
    try { Vibration.vibrate([0, 100, 50, 100]); } catch(e) {}
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!task) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text }}>No task selected</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary, marginTop: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const diff = DIFFICULTY_CONFIG[task.difficulty];

  // Completion screen
  if (completed) {
    return (
      <LinearGradient colors={['#0f0c29', '#1a1145', '#0f172a']} style={styles.container}>
        <SafeAreaView style={styles.completedContainer}>
          <Animated.View style={[styles.completedContent, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.completedIcon}
            >
              <Ionicons name="checkmark-circle" size={48} color="#fff" />
            </LinearGradient>
            <Text style={styles.completedTitle}>Task Complete!</Text>
            <Text style={styles.completedXP}>You earned {(task.xpReward || 0) + bonusXP} XP</Text>
            {bonusXP > 0 && (
              <View style={styles.bonusBadge}>
                <Ionicons name="gift" size={16} color={COLORS.warning} />
                <Text style={styles.bonusText}>+{bonusXP} Bonus XP for pushing through!</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>Back to Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#1a1145', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="flash" size={12} color={COLORS.primary} />
              <Text style={styles.xpBadgeText}>+{(task.xpReward || 0) + bonusXP}</Text>
            </View>
          </View>
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskLabel}>Currently focusing on</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {task.subtitle && <Text style={styles.taskSubtitle}>{task.subtitle}</Text>}
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <ProgressRing radius={width * 0.3} strokeWidth={10} progress={progress}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
            </ProgressRing>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.mainControls}>
            {!isRunning ? (
              <TouchableOpacity onPress={() => setIsRunning(true)} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.playBtn}
                >
                  <Ionicons name="play" size={22} color="#fff" />
                  <Text style={styles.playBtnText}>
                    {timeLeft === totalTime ? 'Start' : 'Resume'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePause} style={styles.pauseBtn} activeOpacity={0.8}>
                <Ionicons name="pause" size={22} color="#fff" />
                <Text style={styles.pauseBtnText}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleComplete} style={styles.doneBtn} activeOpacity={0.8}>
              <Ionicons name="checkmark" size={20} color={COLORS.success} />
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryControls}>
            <TouchableOpacity onPress={handleDistracted} style={styles.secondaryBtn}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.textDim} />
              <Text style={styles.secondaryBtnText}>Feeling distracted?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsRunning(false); setShowBreak(true); }} style={styles.secondaryBtn}>
              <Ionicons name="cafe-outline" size={16} color={COLORS.textDim} />
              <Text style={styles.secondaryBtnText}>Take micro-break</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Burnout Modal */}
        {showBurnout && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalIconRow}>
                <View style={styles.modalIcon}>
                  <Ionicons name="heart" size={24} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Hey, it's okay!</Text>
                  <Text style={styles.modalSubtitle}>Burnout detected</Text>
                </View>
              </View>
              <Text style={styles.modalBody}>
                Looks like you're struggling. That's totally normal!{' '}
                Let me make this easier for you.
              </Text>
              <TouchableOpacity onPress={handleBurnoutAccept} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.modalPrimaryBtn}
                >
                  <Ionicons name="gift" size={18} color="#fff" />
                  <Text style={styles.modalPrimaryBtnText}>Reduce time + Bonus XP</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowBurnout(false)} style={styles.modalSecondaryBtn}>
                <Text style={styles.modalSecondaryBtnText}>I can push through</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Break Modal */}
        {showBreak && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modal, { alignItems: 'center' }]}>
              <View style={[styles.modalIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)', marginBottom: SPACING.lg }]}>
                <Ionicons name="cafe" size={32} color={COLORS.accent} />
              </View>
              <Text style={styles.modalTitle}>Micro Break</Text>
              <Text style={[styles.modalBody, { textAlign: 'center', marginVertical: SPACING.lg }]}>
                Take 2 minutes. Stretch. Breathe.{' '}
                Look at something far away. You got this.
              </Text>
              <TouchableOpacity onPress={() => setShowBreak(false)} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.modalPrimaryBtn}
                >
                  <Text style={styles.modalPrimaryBtnText}>I'm ready to continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  diffBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  diffText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  xpBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  taskInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  taskLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  taskTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  taskSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  controls: {
    paddingBottom: SPACING.xxxl,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 56,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
  },
  playBtnText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#fff',
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 56,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pauseBtnText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#fff',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    height: 56,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
  },
  doneBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.success,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  secondaryBtnText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  completedContent: {
    alignItems: 'center',
  },
  completedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  completedTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  completedXP: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxl,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xxl,
  },
  bonusText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
  },
  backBtn: {
    height: 56,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    zIndex: 50,
  },
  modal: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.xxl,
  },
  modalIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  modalPrimaryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#fff',
  },
  modalSecondaryBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  modalSecondaryBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
});
