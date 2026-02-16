import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../lib/constants';

export default function Index() {
  const { state, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Navigation based on auth state
    if (!state.isAuthenticated) {
      router.replace('/login');
    } else if (!state.hasOnboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, state.isAuthenticated, state.hasOnboarded]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
