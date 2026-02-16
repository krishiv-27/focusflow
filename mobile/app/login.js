import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Alert, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../lib/constants';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useApp();
  const [loading, setLoading] = useState(null);

  // MOCK AUTH - Replace with real OAuth credentials
  const handleGoogleSignIn = async () => {
    setLoading('google');
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 1200));
    setAuth({
      name: 'Student',
      email: 'student@gmail.com',
      avatar: null,
      provider: 'google',
    });
    setLoading(null);
    router.replace('/onboarding');
  };

  const handleAppleSignIn = async () => {
    setLoading('apple');
    await new Promise((r) => setTimeout(r, 1200));
    setAuth({
      name: 'Student',
      email: 'student@icloud.com',
      avatar: null,
      provider: 'apple',
    });
    setLoading(null);
    router.replace('/onboarding');
  };

  const handleSkip = () => {
    setAuth({
      name: 'Student',
      email: '',
      avatar: null,
      provider: 'guest',
    });
    router.replace('/onboarding');
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#1a1145', '#1e1450', '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Decorative circles */}
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />

        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.logoGradient}
            >
              <Ionicons name="sparkles" size={32} color="#fff" />
            </LinearGradient>
          </View>

          {/* Heading */}
          <Text style={styles.title}>
            <Text style={styles.titleGradient}>Study Smarter.</Text>
            {'\n'}
            <Text style={styles.titleWhite}>Not Harder.</Text>
          </Text>

          <Text style={styles.subtitle}>
            AI-powered productivity that adapts to you.{' '}
            Break big tasks into small wins.
          </Text>

          {/* Feature pills */}
          <View style={styles.features}>
            {[
              { icon: 'bulb-outline', label: 'AI Tasks' },
              { icon: 'timer-outline', label: 'Focus Mode' },
              { icon: 'trophy-outline', label: 'Gamified' },
            ].map((f, i) => (
              <View key={i} style={styles.featurePill}>
                <Ionicons name={f.icon} size={16} color={COLORS.primaryLight} />
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auth buttons */}
        <View style={styles.authSection}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.authBtn}
            onPress={handleGoogleSignIn}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            <View style={styles.authBtnContent}>
              {loading === 'google' ? (
                <View style={styles.authIcon}>
                  <Ionicons name="reload" size={20} color="#fff" />
                </View>
              ) : (
                <View style={[styles.authIcon, { backgroundColor: '#fff' }]}>
                  <Text style={{ fontSize: 18 }}>🌐</Text>
                </View>
              )}
              <Text style={styles.authBtnText}>
                {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Apple Sign In */}
          {Platform.OS === 'ios' || true ? (
            <TouchableOpacity
              style={[styles.authBtn, styles.appleBtnStyle]}
              onPress={handleAppleSignIn}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              <View style={styles.authBtnContent}>
                {loading === 'apple' ? (
                  <View style={styles.authIcon}>
                    <Ionicons name="reload" size={20} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.authIcon}>
                    <Ionicons name="logo-apple" size={22} color="#fff" />
                  </View>
                )}
                <Text style={styles.authBtnText}>
                  {loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Skip */}
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            disabled={loading !== null}
          >
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    top: -50,
    left: -80,
  },
  orb2: {
    width: 400,
    height: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    bottom: -100,
    right: -120,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.xxxl,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: SPACING.lg,
  },
  titleGradient: {
    color: COLORS.primaryLight,
  },
  titleWhite: {
    color: 'rgba(255,255,255,0.9)',
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: SPACING.xxxl,
  },
  features: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  featureText: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.35)',
  },
  authSection: {
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
  },
  authBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.xl,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  appleBtnStyle: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  authBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  authIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.3)',
  },
});
