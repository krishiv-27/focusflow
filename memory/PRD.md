# FocusFlow - Product Requirements Document

## Overview
FocusFlow is an AI-powered adaptive study system designed for high school students (especially those with ADHD or burnout). It breaks overwhelming assignments into small actionable tasks and gamifies productivity.

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS with custom dark theme
- shadcn/ui components
- Client-side state with localStorage
- canvas-confetti for animations

## Features Implemented

### 1. Landing Page
- Gradient background (purple/blue)
- "Study Smarter. Not Harder." headline
- CTA: "Start Focusing"
- Feature icons (AI Tasks, Focus Mode, Gamified)
- Floating decorative orbs

### 2. Onboarding
- Name entry with smooth transition
- Stored in localStorage

### 3. Dashboard
- Personalized greeting with time of day
- XP bar with level indicator
- Focus streak counter
- Stats grid (Completed, Day Streak, Badges)
- Badge display
- Daily tasks list with difficulty/XP labels
- Add Task button with AI breakdown

### 4. AI Task Breakdown
- Client-side rule-based "AI" that detects task type
- Supports: study, read, write, project, math, default
- Generates 3-5 micro-tasks with title, estimated time, difficulty, XP reward
- Also available via POST /api/tasks/breakdown API

### 5. Focus Mode
- Pomodoro-style countdown timer
- SVG progress ring animation
- Start/Pause/Done controls
- "Feeling distracted?" button
- "Take micro-break" button
- Task completion celebration with confetti

### 6. Burnout Detection
- Tracks pause count and idle reports
- Triggers after 3+ pauses or 2+ idle reports
- Offers: reduce time + bonus XP
- Micro-break suggestion modal

### 7. Gamification
- XP system (+10 to +40 per task)
- Level system (every 100 XP)
- Daily streak tracking
- Badge system: Starter, Focused (100XP), On Fire (3-day streak), Elite (500XP), Grinder (1000XP)
- Confetti animation on level up and task completion

## API Endpoints
- GET /api/health - Health check
- POST /api/tasks/breakdown - AI task breakdown
- OPTIONS /api/* - CORS preflight

## Design
- Dark mode default
- Soft blue/purple gradients
- Rounded 2xl corners
- Clean Inter typography
- Mobile-first responsive
- Smooth animations (fade, slide, scale)
