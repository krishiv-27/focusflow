# FocusFlow - Product Requirements Document v2

## Overview
FocusFlow is an AI-powered adaptive study system. Redesigned with Monk-style dark UI aesthetic.

## Design System
- **Background**: Pure dark (#080810)
- **Primary**: Purple (#8B5CF6)
- **Glowing Orbs**: Signature visual element
- **Particles**: Floating background particles
- **Style**: Monk-app inspired, minimal, dark, Gen Z focused
- **Brain Logo**: Used throughout as brand identity

## Features (Web + React Native)

### Auth Flow (MOCKED)
- Welcome screen with glowing orb + "Focus on your mission"
- Login with Google / Apple / Guest
- Multi-step onboarding (study hours slider, goals selection, age)
- AI loading animation with percentage
- Impact statement ("6 hours you could save")

### Dashboard
- Glowing brain orb with level indicator
- "Deep Work" card with Start Focus button
- Stats grid (Done, Streak, Badges)
- XP progress bar
- Bottom tab navigation (Home, +Add, Tasks, Profile)

### AI Task Breakdown
- 10 task categories with keyword scoring
- Generates contextual micro-tasks
- Time estimates, difficulty, XP rewards

### Focus Mode
- Timer inside glowing orb with progress ring
- Burnout detection (3+ pauses or 2+ idle)
- Micro-break suggestions
- Bonus XP for pushing through

### Gamification
- XP, levels (100 XP/level), streaks, 5+ badges
- Confetti on completion and level up
