import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, Dimensions,
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
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleAuth = async (provider) => {
    setLoading(provider);
    await new Promise((r) => setTimeout(r, 1200));
    setAuth({
      name: 'Student',
      email: provider === 'google' ? 'student@gmail.com' : provider === 'apple' ? 'student@icloud.com' : '',
      avatar: null,
      provider,
    });
    setLoading(null);
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      {/* Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <View key={i} style={[styles.particle, {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 1 + Math.random() * 2,
          height: 1 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.15,
        }]} />
      ))}

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <Ionicons name="brain" size={18} color={COLORS.primaryLight} />
            <Text style={styles.logoText}>FOCUSFLOW</Text>
          </View>

          {/* Glowing Orb */}
          <Animated.View style={[styles.orbContainer, { transform: [{ translateY: floatAnim }] }]}>
            <View style={styles.orbGlow} />
            <View style={styles.orbInner}>
              <Ionicons name="brain" size={48} color={COLORS.primaryLight} />
            </View>
          </Animated.View>

          <Text style={styles.title}>Welcome to FocusFlow</Text>
          <Text style={styles.subtitle}>The #1 Focus App for Students</Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={styles.appleBtn}
            onPress={() => handleAuth('apple')}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            {loading === 'apple' ? (
              <Ionicons name="reload" size={20} color="#000" />
            ) : (
              <Ionicons name="logo-apple" size={22} color="#000" />
            )}
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => handleAuth('google')}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            {loading === 'google' ? (
              <Ionicons name="reload" size={20} color="#fff" />
            ) : (
              <Text style={{ fontSize: 18 }}>🌐</Text>
            )}
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAuth('guest')}
            disabled={loading !== null}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
  },
  safe: { flex: 1, paddingHorizontal: SPACING.xxl },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xxxl,
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
    letterSpacing: 3,
  },
  orbContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
  },
  orbGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  orbInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.3)',
  },
  authSection: {
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
  },
  appleBtn: {
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  appleBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#000',
  },
  googleBtn: {
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  googleBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#fff',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.25)',
  },
});
