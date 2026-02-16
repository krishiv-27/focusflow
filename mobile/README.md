# FocusFlow Mobile - React Native (Expo)

A beautiful, modern, mobile-first study productivity app built with React Native and Expo.

## Features

- **AI Task Breakdown** - Type a vague task like "Study for AP Calc test" and get 3-5 micro-tasks with time estimates, difficulty, and XP rewards
- **Focus Mode** - Pomodoro-style timer with progress ring animation
- **Burnout Detection** - Detects when you're struggling and offers to reduce time + bonus XP
- **Gamification** - XP, levels, streaks, and 7 unique badges
- **Google & Apple Sign In** - Quick authentication (currently mocked - see setup below)
- **Beautiful Dark UI** - Purple/blue gradient theme designed for Gen Z

## Quick Start

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npx expo install

# Start the dev server
npx expo start
```

Then:
- **iOS**: Scan QR code with Camera app or Expo Go
- **Android**: Scan QR code with Expo Go app
- **Web**: Press `w` to open in browser

## Setting Up Real Authentication

### Google Sign-In
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add your Expo redirect URI
4. Update `app/login.js` with your Google Client ID

### Apple Sign-In
1. Requires Apple Developer Account ($99/year)
2. Enable Sign in with Apple capability
3. Configure in Apple Developer Portal
4. Works only on real iOS devices

## Project Structure

```
mobile/
├── app/
│   ├── _layout.js        # Root layout + providers
│   ├── index.js          # Entry point / router
│   ├── login.js          # Auth screen
│   ├── onboarding.js     # Name entry
│   ├── focus.js          # Focus mode
│   └── (tabs)/
│       ├── _layout.js    # Tab navigator
│       ├── home.js       # Dashboard
│       ├── add.js        # AI task breakdown
│       └── profile.js    # Profile & badges
├── components/
│   ├── ProgressRing.js   # SVG progress ring
│   └── TaskCard.js       # Task list item
├── contexts/
│   └── AppContext.js     # Global state
└── lib/
    ├── constants.js      # Theme & config
    ├── storage.js        # AsyncStorage
    └── taskAI.js         # AI task engine
```

## Tech Stack

- **Expo SDK 52** - Latest Expo
- **Expo Router 4** - File-based navigation
- **React Native** - Cross-platform mobile
- **AsyncStorage** - Local persistence
- **Linear Gradient** - Beautiful gradients
- **React Native SVG** - Progress ring
- **Expo Haptics** - Tactile feedback

## Design

- Dark mode default
- Purple/blue gradient palette
- Rounded corners (20-24px)
- Glassmorphism cards
- Smooth animations
- Bottom tab navigation + stack for focus mode
