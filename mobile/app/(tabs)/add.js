import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, KeyboardAvoidingView,
  Platform, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, DIFFICULTY_CONFIG } from '../../lib/constants';
import { generateMicroTasks, getTaskTypeInfo } from '../../lib/taskAI';

export default function AddTaskScreen() {
  const [taskInput, setTaskInput] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskTypeInfo, setTaskTypeInfo] = useState(null);
  const { addTasks } = useApp();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleGenerate = async () => {
    if (!taskInput.trim()) return;
    Keyboard.dismiss();
    setIsGenerating(true);
    setGeneratedTasks([]);

    const typeInfo = getTaskTypeInfo(taskInput);
    setTaskTypeInfo(typeInfo);

    await new Promise((r) => setTimeout(r, 1000));

    const tasks = generateMicroTasks(taskInput.trim());
    setGeneratedTasks(tasks);
    setIsGenerating(false);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleAddAll = () => {
    if (generatedTasks.length > 0) {
      addTasks(generatedTasks);
      setTaskInput('');
      setGeneratedTasks([]);
      setTaskTypeInfo(null);
      router.push('/(tabs)/home');
    }
  };

  const handleRemoveTask = (id) => {
    setGeneratedTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const suggestions = [
    'Study for AP Calc test',
    'Write English essay',
    'Read Chapter 5 Biology',
    'Finish coding project',
    'Practice Spanish vocab',
    'History homework',
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="creation" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.headerTitle}>AI Task Breakdown</Text>
              <Text style={styles.headerSubtitle}>
                Describe what you need to do and I'll break it into
                manageable micro-tasks
              </Text>
            </View>

            {/* Input */}
            <View style={styles.inputSection}>
              <TextInput
                value={taskInput}
                onChangeText={setTaskInput}
                placeholder='e.g. "Study for AP Calc test"'
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.input}
                multiline
                maxLength={100}
                returnKeyType="done"
                onSubmitEditing={handleGenerate}
              />
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={!taskInput.trim() || isGenerating}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    taskInput.trim()
                      ? [COLORS.primary, COLORS.secondary]
                      : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.generateBtn}
                >
                  <MaterialCommunityIcons
                    name={isGenerating ? 'loading' : 'creation'}
                    size={18}
                    color={taskInput.trim() ? '#fff' : 'rgba(255,255,255,0.2)'}
                  />
                  <Text
                    style={[
                      styles.generateBtnText,
                      !taskInput.trim() && { color: 'rgba(255,255,255,0.2)' },
                    ]}
                  >
                    {isGenerating ? 'Generating...' : 'Break it Down'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Suggestions */}
            {!generatedTasks.length && !isGenerating && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>Try these:</Text>
                <View style={styles.suggestionsGrid}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionChip}
                      onPress={() => setTaskInput(s)}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Loading */}
            {isGenerating && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingDots}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
                  ))}
                </View>
                <Text style={styles.loadingText}>Breaking down your task...</Text>
              </View>
            )}

            {/* Generated Tasks */}
            {generatedTasks.length > 0 && (
              <Animated.View style={[styles.resultsSection, { opacity: fadeAnim }]}>
                {taskTypeInfo && (
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeEmoji}>{taskTypeInfo.emoji}</Text>
                    <Text style={styles.typeLabel}>{taskTypeInfo.label}</Text>
                    <Text style={styles.typeCount}>{generatedTasks.length} micro-tasks</Text>
                  </View>
                )}

                {generatedTasks.map((task, index) => {
                  const diff = DIFFICULTY_CONFIG[task.difficulty];
                  return (
                    <View key={task.id} style={styles.taskPreview}>
                      <View style={styles.taskNum}>
                        <Text style={styles.taskNumText}>{index + 1}</Text>
                      </View>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                          <View style={styles.taskMetaItem}>
                            <Ionicons name="time-outline" size={10} color={COLORS.textMuted} />
                            <Text style={styles.taskMetaText}>{task.estimatedTime}m</Text>
                          </View>
                          <View style={[styles.taskDiff, { backgroundColor: diff.bg }]}>
                            <Text style={[styles.taskDiffText, { color: diff.color }]}>{diff.label}</Text>
                          </View>
                          <View style={styles.taskMetaItem}>
                            <Ionicons name="flash" size={10} color={COLORS.primaryLight} />
                            <Text style={[styles.taskMetaText, { color: COLORS.primaryLight }]}>+{task.xpReward}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveTask(task.id)}>
                        <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.15)" />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    {generatedTasks.reduce((a, t) => a + t.estimatedTime, 0)}m ·{' '}
                    {generatedTasks.reduce((a, t) => a + t.xpReward, 0)} XP
                  </Text>
                </View>

                <TouchableOpacity onPress={handleAddAll} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addAllBtn}
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text style={styles.addAllBtnText}>Add All to Tasks</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  inputSection: {
    marginBottom: SPACING.xxl,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    minHeight: 56,
    marginBottom: SPACING.md,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  generateBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#fff',
  },
  suggestionsSection: {
    marginBottom: SPACING.xxl,
  },
  suggestionsTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
  resultsSection: {
    marginBottom: SPACING.xxl,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  typeCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  taskPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  taskNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskNumText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taskMetaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  taskDiff: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  taskDiffText: {
    fontSize: 9,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  totalValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  addAllBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#fff',
  },
});
