export const COLORS = {
  background: '#0B0B1E',
  backgroundLight: '#0F0F2D',
  card: '#151530',
  cardLight: '#1C1C42',
  cardBorder: 'rgba(139, 92, 246, 0.15)',
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  secondary: '#6366F1',
  accent: '#3B82F6',
  accentLight: '#60A5FA',
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  text: '#F1F5F9',
  textSecondary: 'rgba(241, 245, 249, 0.7)',
  textMuted: 'rgba(241, 245, 249, 0.4)',
  textDim: 'rgba(241, 245, 249, 0.2)',
  border: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  gradientStart: '#8B5CF6',
  gradientMid: '#6366F1',
  gradientEnd: '#3B82F6',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  huge: 36,
  giant: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const BADGES = [
  { id: 'starter', name: 'Starter', icon: 'star', requirement: 0, colors: ['#6B7280', '#9CA3AF'] },
  { id: 'focused', name: 'Focused', icon: 'target', requirement: 100, colors: ['#3B82F6', '#6366F1'] },
  { id: 'streak3', name: 'On Fire', icon: 'flame', requirement: 3, type: 'streak', colors: ['#F59E0B', '#EF4444'] },
  { id: 'centurion', name: 'Centurion', icon: 'award', requirement: 10, type: 'tasks', colors: ['#10B981', '#059669'] },
  { id: 'elite', name: 'Elite', icon: 'crown', requirement: 500, colors: ['#8B5CF6', '#7C3AED'] },
  { id: 'grinder', name: 'Grinder', icon: 'shield', requirement: 1000, colors: ['#F59E0B', '#D97706'] },
  { id: 'streak7', name: 'Unstoppable', icon: 'zap', requirement: 7, type: 'streak', colors: ['#EF4444', '#DC2626'] },
];

export const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  hard: { label: 'Hard', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
};
