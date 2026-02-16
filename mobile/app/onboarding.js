import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Keyboard, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../lib/constants';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { setName: saveName, state } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pre-fill name from auth if available
    if (state.profile.name && state.profile.name !== 'Student') {
      setName(state.profile.name);
    }
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      Keyboard.dismiss();
      saveName(name.trim());
      router.replace('/(tabs)/home');
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#1a1145', '#1e1450', '#0f172a']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inner}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.iconContainer}
            >
              <Ionicons name="sparkles" size={36} color="#fff" />
            </LinearGradient>

            <Text style={styles.title}>Welcome to FocusFlow</Text>
            <Text style={styles.subtitle}>What should we call you?</Text>

            <View style={styles.inputContainer}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                style={styles.input}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                maxLength={20}
              />
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={name.trim() ? [COLORS.primary, COLORS.secondary] : ['#333', '#333']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, !name.trim() && styles.buttonDisabled]}
              >
                <Text style={[styles.buttonText, !name.trim() && styles.buttonTextDisabled]}>
                  Let's Go
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={name.trim() ? '#fff' : 'rgba(255,255,255,0.3)'}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  content: { alignItems: 'center' },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxxl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.xl,
    height: 58,
    paddingHorizontal: SPACING.xl,
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    width: '100%',
    minWidth: 280,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#fff',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
