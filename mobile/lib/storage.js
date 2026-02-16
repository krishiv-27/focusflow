import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'focusflow_data';

export function getDefaultState() {
  return {
    profile: {
      name: '',
      email: '',
      avatar: null,
      authProvider: null,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: ['starter'],
      tasksCompleted: 0,
      totalFocusMinutes: 0,
    },
    tasks: [],
    completedTasks: [],
    hasOnboarded: false,
    isAuthenticated: false,
  };
}

export async function loadState() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...getDefaultState(), ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return getDefaultState();
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export async function clearState() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear state:', e);
  }
}
