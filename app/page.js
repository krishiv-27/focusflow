'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Zap, Flame, Trophy, Star, Clock, Play, Pause, SkipForward,
  Plus, ChevronRight, Sparkles, Brain, Coffee, Target,
  CheckCircle2, Circle, ArrowLeft, Volume2, VolumeX,
  RotateCcw, AlertTriangle, Gift, Crown, Shield, Award,
  Timer, TrendingUp, Lightbulb, Heart, X, Check, Loader2
} from 'lucide-react'

// ========== CONSTANTS ==========
const BADGES = [
  { id: 'starter', name: 'Starter', icon: Star, requirement: 0, color: 'from-gray-400 to-gray-500' },
  { id: 'focused', name: 'Focused', icon: Target, requirement: 100, color: 'from-blue-400 to-blue-600' },
  { id: 'streak3', name: 'On Fire', icon: Flame, requirement: 3, type: 'streak', color: 'from-orange-400 to-red-500' },
  { id: 'elite', name: 'Elite', icon: Crown, requirement: 500, color: 'from-purple-400 to-purple-600' },
  { id: 'grinder', name: 'Grinder', icon: Shield, requirement: 1000, color: 'from-yellow-400 to-amber-500' },
]

const DIFFICULTY_COLORS = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

// ========== AI TASK BREAKDOWN ==========
const TASK_TEMPLATES = {
  study: [
    { title: 'Review key concepts and notes', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Summarize main topics in your own words', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Practice problems - easy set', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Practice problems - challenging set', time: 20, difficulty: 'hard', xp: 35 },
    { title: 'Self-quiz and review mistakes', time: 10, difficulty: 'medium', xp: 20 },
  ],
  read: [
    { title: 'Skim through headings and key points', time: 8, difficulty: 'easy', xp: 10 },
    { title: 'Read first half carefully', time: 15, difficulty: 'medium', xp: 20 },
    { title: 'Read second half and take notes', time: 15, difficulty: 'medium', xp: 20 },
    { title: 'Write a brief summary', time: 10, difficulty: 'easy', xp: 15 },
  ],
  write: [
    { title: 'Brainstorm and outline key ideas', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Write the introduction', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Write body paragraphs', time: 25, difficulty: 'hard', xp: 40 },
    { title: 'Write conclusion and proofread', time: 15, difficulty: 'medium', xp: 25 },
  ],
  project: [
    { title: 'Plan project structure and goals', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Research and gather resources', time: 15, difficulty: 'medium', xp: 20 },
    { title: 'Work on main deliverable', time: 25, difficulty: 'hard', xp: 40 },
    { title: 'Review and polish work', time: 15, difficulty: 'medium', xp: 25 },
  ],
  math: [
    { title: 'Review formulas and theorems', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Solve practice problems set A', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Tackle harder problems set B', time: 20, difficulty: 'hard', xp: 35 },
    { title: 'Check answers and understand mistakes', time: 10, difficulty: 'easy', xp: 15 },
  ],
  default: [
    { title: 'Break down and plan approach', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Work on first chunk', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Work on main section', time: 20, difficulty: 'hard', xp: 35 },
    { title: 'Review and wrap up', time: 10, difficulty: 'easy', xp: 15 },
  ],
}

function detectTaskType(input) {
  const lower = input.toLowerCase()
  if (lower.includes('study') || lower.includes('test') || lower.includes('exam') || lower.includes('quiz')) return 'study'
  if (lower.includes('read') || lower.includes('chapter') || lower.includes('book')) return 'read'
  if (lower.includes('write') || lower.includes('essay') || lower.includes('paper') || lower.includes('report')) return 'write'
  if (lower.includes('project') || lower.includes('presentation') || lower.includes('build')) return 'project'
  if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra') || lower.includes('geometry')) return 'math'
  return 'default'
}

function generateMicroTasks(parentTask) {
  const type = detectTaskType(parentTask)
  const templates = TASK_TEMPLATES[type]
  const subject = parentTask.replace(/^(study for |read |write |finish |complete |do |work on )/i, '').trim()
  
  return templates.map((t, i) => ({
    id: uuidv4(),
    parentTask: parentTask,
    title: `${t.title}${subject ? ` — ${subject}` : ''}`,
    estimatedTime: t.time,
    difficulty: t.difficulty,
    xpReward: t.xp,
    completed: false,
    order: i,
  }))
}

// ========== STORAGE HELPERS ==========
const STORAGE_KEY = 'focusflow_data'

function getDefaultState() {
  return {
    profile: {
      name: 'Student',
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: ['starter'],
      tasksCompleted: 0,
    },
    tasks: [],
    completedTasks: [],
    hasOnboarded: false,
  }
}

function loadState() {
  if (typeof window === 'undefined') return getDefaultState()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...getDefaultState(), ...parsed }
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
  return getDefaultState()
}

function saveState(state) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

// ========== CONFETTI ==========
function fireConfetti() {
  import('canvas-confetti').then((module) => {
    const confetti = module.default
    const end = Date.now() + 1500
    const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#a855f7', '#60a5fa']
    ;(function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  })
}

function fireTaskConfetti() {
  import('canvas-confetti').then((module) => {
    const confetti = module.default
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8b5cf6', '#6366f1', '#3b82f6'],
    })
  })
}

// ========== PROGRESS RING COMPONENT ==========
function ProgressRing({ radius, stroke, progress, color = '#8b5cf6' }) {
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        stroke="rgba(139, 92, 246, 0.1)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}

// ========== LANDING PAGE ==========
function LandingView({ onStart }) {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-lg mx-auto animate-fade-in">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">FocusFlow</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-violet-300 to-blue-300">
            Study Smarter.
          </span>
          <br />
          <span className="text-white/90">Not Harder.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-white/50 mb-10 leading-relaxed max-w-md mx-auto">
          AI-powered productivity that adapts to you. Break big tasks into small wins. Stay focused. Level up.
        </p>

        {/* CTA */}
        <Button
          onClick={onStart}
          size="lg"
          className="gradient-primary text-white font-semibold px-8 py-6 text-lg rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 border-0"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Focusing
        </Button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { icon: Brain, label: 'AI Tasks' },
            { icon: Timer, label: 'Focus Mode' },
            { icon: Trophy, label: 'Gamified' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5">
              <f.icon className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-white/40">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== ONBOARDING ==========
function OnboardingView({ onComplete }) {
  const [name, setName] = useState('')

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to FocusFlow</h2>
          <p className="text-white/50">What should we call you?</p>
        </div>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl h-14 text-center text-lg mb-4 focus:border-purple-500/50 focus:ring-purple-500/20"
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onComplete(name.trim())}
          autoFocus
        />

        <Button
          onClick={() => name.trim() && onComplete(name.trim())}
          disabled={!name.trim()}
          className="w-full gradient-primary text-white font-semibold h-14 rounded-2xl text-lg border-0 disabled:opacity-30"
        >
          Let's Go
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ========== DASHBOARD ==========
function DashboardView({ state, dispatch, onStartFocus, onAddTask }) {
  const { profile, tasks } = state
  const pendingTasks = tasks.filter(t => !t.completed)
  const xpForNextLevel = profile.level * 100
  const xpProgress = ((profile.xp % 100) / 100) * 100
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const earnedBadges = BADGES.filter(b => {
    if (b.type === 'streak') return profile.streak >= b.requirement
    return profile.xp >= b.requirement
  })

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    setIsGenerating(true)
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 800))
    const microTasks = generateMicroTasks(newTask.trim())
    dispatch({ type: 'ADD_TASKS', payload: microTasks })
    setNewTask('')
    setIsGenerating(false)
    setShowAddTask(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen gradient-bg px-4 pb-24 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/40 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-white">{profile.name} <span className="inline-block animate-float">✨</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{profile.streak}</span>
            </div>
          </div>
        </div>

        {/* XP Card */}
        <div className="rounded-3xl gradient-card border border-white/5 p-5 mb-6 glow-purple">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl gradient-primary">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/40">Level {profile.level}</p>
                <p className="text-sm font-semibold text-white">{profile.xp} XP</p>
              </div>
            </div>
            <span className="text-xs text-white/30">{Math.round(xpProgress)}% to Level {profile.level + 1}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full gradient-xp transition-all duration-700 ease-out"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{profile.tasksCompleted}</p>
            <p className="text-[10px] text-white/40">Completed</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{profile.streak}</p>
            <p className="text-[10px] text-white/40">Day Streak</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3 text-center">
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{earnedBadges.length}</p>
            <p className="text-[10px] text-white/40">Badges</p>
          </div>
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white/60 mb-3">Your Badges</h3>
            <div className="flex gap-2 flex-wrap">
              {earnedBadges.map(badge => (
                <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center`}>
                    <badge.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/70">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/60">Today's Tasks</h3>
          <span className="text-xs text-white/30">{pendingTasks.length} remaining</span>
        </div>

        {pendingTasks.length === 0 && !showAddTask ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
            <Lightbulb className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-1">No tasks yet</p>
            <p className="text-white/25 text-xs">Add a task to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task, i) => (
              <div
                key={task.id}
                className="group rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      dispatch({ type: 'COMPLETE_TASK', payload: task.id })
                      fireTaskConfetti()
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <Circle className="w-5 h-5 text-white/20 hover:text-purple-400 transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 mb-1.5 leading-snug">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-white/30">
                        <Clock className="w-3 h-3" />
                        {task.estimatedTime}m
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[task.difficulty]}`}>
                        {DIFFICULTY_LABELS[task.difficulty]}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-purple-400">
                        <Zap className="w-3 h-3" />
                        +{task.xpReward} XP
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStartFocus(task)}
                    className="flex-shrink-0 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 h-8 px-3"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    <span className="text-xs">Focus</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Task Section */}
        {showAddTask ? (
          <div className="mt-4 rounded-2xl bg-white/[0.03] border border-purple-500/20 p-4 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white/70">AI Task Breakdown</span>
            </div>
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder='e.g. "Study for AP Calc test"'
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl mb-3 focus:border-purple-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
              disabled={isGenerating}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => { setShowAddTask(false); setNewTask('') }}
                variant="ghost"
                className="flex-1 rounded-xl text-white/40 hover:text-white/60"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                disabled={!newTask.trim() || isGenerating}
                className="flex-1 gradient-primary text-white rounded-xl border-0"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Break it Down</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowAddTask(true)}
            className="w-full mt-4 rounded-2xl h-12 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-white/40 hover:text-white/60 transition-all"
            variant="ghost"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  )
}

// ========== FOCUS MODE ==========
function FocusView({ task, state, dispatch, onBack }) {
  const [timeLeft, setTimeLeft] = useState(task.estimatedTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pauseCount, setPauseCount] = useState(0)
  const [idleCount, setIdleCount] = useState(0)
  const [showBurnoutAlert, setShowBurnoutAlert] = useState(false)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false)
  const [bonusXP, setBonusXP] = useState(0)
  const [completed, setCompleted] = useState(false)
  const totalTime = task.estimatedTime * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            clearInterval(intervalRef.current)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const handlePause = () => {
    setIsRunning(false)
    const newPauseCount = pauseCount + 1
    setPauseCount(newPauseCount)
    if (newPauseCount >= 3 || idleCount >= 2) {
      setShowBurnoutAlert(true)
    }
  }

  const handleIdle = () => {
    const newIdleCount = idleCount + 1
    setIdleCount(newIdleCount)
    if (newIdleCount >= 2 || pauseCount >= 3) {
      setShowBurnoutAlert(true)
    }
  }

  const handleBurnoutSwitch = () => {
    // Reduce remaining time by 30% and offer bonus XP
    const reduced = Math.max(60, Math.floor(timeLeft * 0.7))
    setTimeLeft(reduced)
    setBonusXP(10)
    setShowBurnoutAlert(false)
  }

  const handleMicroBreak = () => {
    setIsRunning(false)
    setShowBreakSuggestion(true)
  }

  const handleComplete = () => {
    setCompleted(true)
    const totalXP = task.xpReward + bonusXP
    dispatch({ type: 'COMPLETE_TASK', payload: task.id })
    dispatch({ type: 'ADD_XP', payload: totalXP })
    fireConfetti()
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (completed) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-6">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Task Complete!</h2>
          <p className="text-white/50 mb-6">You earned {task.xpReward + bonusXP} XP</p>
          {bonusXP > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">+{bonusXP} Bonus XP for pushing through!</span>
            </div>
          )}
          <Button
            onClick={onBack}
            className="gradient-primary text-white font-semibold px-8 py-6 text-lg rounded-2xl border-0"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col px-6 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${DIFFICULTY_COLORS[task.difficulty]} rounded-full border`}>
            {DIFFICULTY_LABELS[task.difficulty]}
          </Badge>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">+{task.xpReward + bonusXP} XP</span>
          </div>
        </div>
      </div>

      {/* Task Title */}
      <div className="text-center mb-8">
        <p className="text-sm text-white/40 mb-2">Currently focusing on</p>
        <h2 className="text-xl font-semibold text-white leading-snug">{task.title}</h2>
      </div>

      {/* Timer Ring */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="relative">
          <ProgressRing radius={120} stroke={8} progress={progress} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
            <span className="text-xs text-white/30 mt-1">{Math.round(progress)}% complete</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <Button
              onClick={() => setIsRunning(true)}
              className="gradient-primary text-white font-semibold h-14 px-10 rounded-2xl text-lg border-0 shadow-lg shadow-purple-500/25"
            >
              <Play className="w-5 h-5 mr-2" />
              {timeLeft === totalTime ? 'Start' : 'Resume'}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="bg-white/10 text-white font-semibold h-14 px-10 rounded-2xl text-lg border-0 hover:bg-white/15"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleComplete}
            variant="ghost"
            className="h-14 px-6 rounded-2xl text-emerald-400 hover:bg-emerald-500/10"
          >
            <Check className="w-5 h-5 mr-1" />
            Done
          </Button>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleIdle}
            variant="ghost"
            className="rounded-xl text-white/30 hover:text-white/50 text-xs h-9"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Feeling distracted?
          </Button>
          <Button
            onClick={handleMicroBreak}
            variant="ghost"
            className="rounded-xl text-white/30 hover:text-white/50 text-xs h-9"
          >
            <Coffee className="w-3.5 h-3.5 mr-1.5" />
            Take micro-break
          </Button>
        </div>
      </div>

      {/* Burnout Alert Modal */}
      {showBurnoutAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#1a1a2e] border border-white/10 p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Hey, it's okay!</h3>
                <p className="text-xs text-white/40">Burnout detected</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">
              Looks like you're struggling. That's totally normal! Let me make this easier for you.
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleBurnoutSwitch}
                className="w-full gradient-primary text-white rounded-2xl h-12 border-0"
              >
                <Gift className="w-4 h-4 mr-2" />
                Reduce time + Bonus XP
              </Button>
              <Button
                onClick={() => setShowBurnoutAlert(false)}
                variant="ghost"
                className="w-full rounded-2xl h-12 text-white/40"
              >
                I can push through
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Break Suggestion Modal */}
      {showBreakSuggestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#1a1a2e] border border-white/10 p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Micro Break</h3>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                Take 2 minutes. Stretch. Breathe. Look at something far away. You got this.
              </p>
              <Button
                onClick={() => setShowBreakSuggestion(false)}
                className="gradient-primary text-white rounded-2xl h-12 px-8 border-0"
              >
                I'm ready to continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== MAIN APP ==========
function reducer(state, action) {
  let newState = { ...state }

  switch (action.type) {
    case 'SET_NAME':
      newState.profile = { ...newState.profile, name: action.payload }
      newState.hasOnboarded = true
      break
    case 'ADD_TASKS':
      newState.tasks = [...newState.tasks, ...action.payload]
      break
    case 'COMPLETE_TASK': {
      const task = newState.tasks.find(t => t.id === action.payload)
      if (task && !task.completed) {
        newState.tasks = newState.tasks.map(t =>
          t.id === action.payload ? { ...t, completed: true } : t
        )
        newState.completedTasks = [...(newState.completedTasks || []), { ...task, completed: true, completedAt: new Date().toISOString() }]
        newState.profile = {
          ...newState.profile,
          tasksCompleted: newState.profile.tasksCompleted + 1,
        }
      }
      break
    }
    case 'ADD_XP': {
      const newXP = newState.profile.xp + action.payload
      const newLevel = Math.floor(newXP / 100) + 1
      const leveledUp = newLevel > newState.profile.level
      
      // Update streak
      const today = new Date().toDateString()
      const lastActive = newState.profile.lastActiveDate
      let newStreak = newState.profile.streak
      if (lastActive !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        if (lastActive === yesterday.toDateString()) {
          newStreak += 1
        } else if (!lastActive) {
          newStreak = 1
        } else {
          newStreak = 1
        }
      }

      newState.profile = {
        ...newState.profile,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastActiveDate: today,
      }

      // Check badges
      const badges = [...newState.profile.badges]
      if (newXP >= 100 && !badges.includes('focused')) badges.push('focused')
      if (newXP >= 500 && !badges.includes('elite')) badges.push('elite')
      if (newXP >= 1000 && !badges.includes('grinder')) badges.push('grinder')
      if (newStreak >= 3 && !badges.includes('streak3')) badges.push('streak3')
      newState.profile.badges = badges

      if (leveledUp) {
        setTimeout(() => fireConfetti(), 300)
      }
      break
    }
    case 'RESET':
      return getDefaultState()
    default:
      break
  }

  saveState(newState)
  return newState
}

export default function App() {
  const [state, dispatch] = useCustomReducer()
  const [currentView, setCurrentView] = useState('loading')
  const [focusTask, setFocusTask] = useState(null)

  useEffect(() => {
    const loaded = loadState()
    dispatch({ type: 'INIT', payload: loaded })
    if (!loaded.hasOnboarded) {
      setCurrentView('landing')
    } else {
      setCurrentView('dashboard')
    }
  }, [])

  const handleStart = () => setCurrentView('onboarding')

  const handleOnboardingComplete = (name) => {
    dispatch({ type: 'SET_NAME', payload: name })
    setCurrentView('dashboard')
  }

  const handleStartFocus = (task) => {
    setFocusTask(task)
    setCurrentView('focus')
  }

  const handleBackToDashboard = () => {
    setFocusTask(null)
    setCurrentView('dashboard')
  }

  if (currentView === 'loading') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-pulse">
          <Brain className="w-12 h-12 text-purple-400" />
        </div>
      </div>
    )
  }

  if (currentView === 'landing') {
    return <LandingView onStart={handleStart} />
  }

  if (currentView === 'onboarding') {
    return <OnboardingView onComplete={handleOnboardingComplete} />
  }

  if (currentView === 'focus' && focusTask) {
    return (
      <FocusView
        task={focusTask}
        state={state}
        dispatch={dispatch}
        onBack={handleBackToDashboard}
      />
    )
  }

  return (
    <DashboardView
      state={state}
      dispatch={dispatch}
      onStartFocus={handleStartFocus}
    />
  )
}

// Custom reducer hook that handles both init and actions
function useCustomReducer() {
  const [state, setState] = useState(getDefaultState())

  const dispatch = useCallback((action) => {
    if (action.type === 'INIT') {
      setState(action.payload)
      return
    }
    setState(prev => reducer(prev, action))
  }, [])

  return [state, dispatch]
}