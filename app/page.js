'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Zap, Flame, Trophy, Star, Clock, Play, Pause,
  Plus, ChevronRight, Sparkles, Brain, Coffee, Target,
  CheckCircle2, Circle, ArrowLeft,
  AlertTriangle, Gift, Crown, Shield, Award,
  Timer, Lightbulb, Heart, Check, Loader2,
  Dumbbell, BookOpen, Code, Globe, Music, Users,
  GraduationCap, Briefcase
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
  easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  hard: 'bg-red-500/15 text-red-400 border-red-500/20',
}
const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

// ========== AI TASK BREAKDOWN ==========
const TASK_TEMPLATES = {
  study: [
    { title: 'Review key concepts and notes', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Create a mind map of main topics', time: 12, difficulty: 'easy', xp: 18 },
    { title: 'Practice problems - easy set', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Tackle challenging practice questions', time: 20, difficulty: 'hard', xp: 35 },
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
  if (lower.includes('study') || lower.includes('test') || lower.includes('exam')) return 'study'
  if (lower.includes('read') || lower.includes('chapter') || lower.includes('book')) return 'read'
  if (lower.includes('write') || lower.includes('essay') || lower.includes('paper')) return 'write'
  if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra')) return 'math'
  return 'default'
}

function generateMicroTasks(parentTask) {
  const type = detectTaskType(parentTask)
  const templates = TASK_TEMPLATES[type]
  const subject = parentTask.replace(/^(study for |read |write |finish |complete |do |work on )/i, '').trim()
  return templates.map((t, i) => ({
    id: uuidv4(),
    parentTask,
    title: `${t.title}`,
    subtitle: subject,
    estimatedTime: t.time,
    difficulty: t.difficulty,
    xpReward: t.xp,
    completed: false,
    order: i,
  }))
}

// ========== STORAGE ==========
const STORAGE_KEY = 'focusflow_v2'
function getDefaultState() {
  return {
    profile: { name: '', xp: 0, level: 1, streak: 0, lastActiveDate: null, badges: ['starter'], tasksCompleted: 0, studyHours: 4, goals: [], age: '' },
    tasks: [],
    completedTasks: [],
    hasOnboarded: false,
    isAuthenticated: false,
  }
}
function loadState() {
  if (typeof window === 'undefined') return getDefaultState()
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...getDefaultState(), ...JSON.parse(s) } : getDefaultState() } catch { return getDefaultState() }
}
function saveState(state) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

// ========== CONFETTI ==========
function fireConfetti() {
  import('canvas-confetti').then((m) => {
    const confetti = m.default
    const end = Date.now() + 1500
    const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#a855f7']
    ;(function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  })
}
function fireTaskConfetti() {
  import('canvas-confetti').then((m) => {
    m.default({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#8b5cf6', '#6366f1', '#3b82f6'] })
  })
}

// ========== PARTICLES BACKGROUND ==========
function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }}
        />
      ))}
    </div>
  )
}

// ========== GLOWING ORB ==========
function GlowingOrb({ size = 180, children }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ transform: 'scale(1.8)' }} />
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-purple-600/20 to-indigo-600/10 blur-xl" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-500/10" />
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ========== PROGRESS RING ==========
function ProgressRing({ radius, stroke, progress, color = '#8b5cf6' }) {
  const r = radius - stroke * 2
  const c = r * 2 * Math.PI
  const offset = c - (progress / 100) * c
  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle stroke="rgba(139,92,246,0.08)" fill="transparent" strokeWidth={stroke} r={r} cx={radius} cy={radius} />
      <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={c + ' ' + c} style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" r={r} cx={radius} cy={radius} />
    </svg>
  )
}

// ========== BRAIN LOGO ==========
function BrainLogo({ size = 40 }) {
  return (
    <div className="flex items-center gap-2">
      <Brain className="text-purple-400" style={{ width: size, height: size }} strokeWidth={1.5} />
    </div>
  )
}

// ========== SPLASH SCREEN ==========
function SplashView({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center relative overflow-hidden">
      <Particles />
      <div className="animate-scale-in flex flex-col items-center gap-4">
        <GlowingOrb size={120}>
          <Brain className="w-12 h-12 text-purple-400" strokeWidth={1.5} />
        </GlowingOrb>
        <div className="flex items-center gap-2 mt-4">
          <Brain className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
          <span className="text-white font-bold text-xl tracking-widest uppercase">FocusFlow</span>
        </div>
      </div>
    </div>
  )
}

// ========== WELCOME VIEW ==========
function WelcomeView({ onStart }) {
  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      <Particles />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-12">
          <Brain className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
          <span className="text-white font-bold text-sm tracking-widest uppercase">FocusFlow</span>
        </div>

        <div className="animate-float mb-10">
          <GlowingOrb size={200}>
            <Brain className="w-16 h-16 text-purple-400" strokeWidth={1.5} />
          </GlowingOrb>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Focus on your mission.
        </h1>
        <p className="text-white/30 text-center max-w-xs mb-12">
          AI-powered study tool that breaks big tasks into small wins
        </p>
      </div>

      <Button
        onClick={onStart}
        className="relative z-10 w-full max-w-sm h-14 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-lg transition-all"
      >
        Get Started <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  )
}

// ========== LOGIN VIEW ==========
function LoginView({ onLogin }) {
  const [loading, setLoading] = useState(null)

  const handleAuth = async (provider) => {
    setLoading(provider)
    await new Promise(r => setTimeout(r, 1200))
    onLogin(provider)
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      <Particles />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="animate-float mb-10">
          <GlowingOrb size={160}>
            <Brain className="w-12 h-12 text-purple-400" strokeWidth={1.5} />
          </GlowingOrb>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Welcome to FocusFlow</h1>
        <p className="text-white/30 text-sm mb-4">The #1 Focus App for Students</p>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-3 pb-4">
        <button
          onClick={() => handleAuth('apple')}
          disabled={loading !== null}
          className="w-full h-14 rounded-2xl bg-white text-black font-semibold text-base flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {loading === 'apple' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
          )}
          Continue with Apple
        </button>

        <button
          onClick={() => handleAuth('google')}
          disabled={loading !== null}
          className="w-full h-14 rounded-2xl bg-white/[0.06] border border-white/10 text-white font-semibold text-base flex items-center justify-center gap-3 hover:bg-white/[0.1] transition-all disabled:opacity-50"
        >
          {loading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          )}
          Continue with Google
        </button>

        <button
          onClick={() => handleAuth('guest')}
          disabled={loading !== null}
          className="w-full py-3 text-white/30 text-sm hover:text-white/50 transition-colors disabled:opacity-50"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  )
}

// ========== ONBOARDING FLOW ==========
function OnboardingView({ onComplete }) {
  const [step, setStep] = useState(0)
  const [studyHours, setStudyHours] = useState(4)
  const [goals, setGoals] = useState([])
  const [age, setAge] = useState('')
  const [name, setName] = useState('')
  const [loadingPercent, setLoadingPercent] = useState(0)
  const [yearsReclaim, setYearsReclaim] = useState(0)
  const totalSteps = 6

  const progressPercent = ((step + 1) / totalSteps) * 100

  const goalOptions = [
    { id: 'study', label: 'Study faster & ace school', icon: GraduationCap },
    { id: 'build', label: 'Build a project or business', icon: Briefcase },
    { id: 'fitness', label: 'Get fit & glow up', icon: Dumbbell },
    { id: 'read', label: 'Read more books', icon: BookOpen },
    { id: 'code', label: 'Learn to code', icon: Code },
    { id: 'present', label: 'Be more present IRL', icon: Users },
  ]

  const ageOptions = ['13 - 15', '16 - 17', '18 - 20', '21 - 25', '25+']

  const toggleGoal = (id) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  // Loading animation
  useEffect(() => {
    if (step === 3) {
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 8 + 2
        if (p >= 100) {
          p = 100
          clearInterval(interval)
          setYearsReclaim(Math.max(2, Math.round(studyHours * 1.5)))
          setTimeout(() => setStep(4), 500)
        }
        setLoadingPercent(Math.min(p, 100))
      }, 200)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0: // Study hours
        return (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              How much do you study daily?
            </h2>
            <p className="text-white/30 text-sm mb-12">On average, in hours</p>

            <div className="text-8xl font-black text-white mb-8 tabular-nums">{studyHours}</div>

            <div className="w-full max-w-xs flex items-center gap-4">
              <button
                onClick={() => setStudyHours(Math.max(1, studyHours - 1))}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xl hover:bg-white/10 transition"
              >-</button>
              <input
                type="range"
                min="1"
                max="12"
                value={studyHours}
                onChange={(e) => setStudyHours(parseInt(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <button
                onClick={() => setStudyHours(Math.min(12, studyHours + 1))}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xl hover:bg-white/10 transition"
              >+</button>
            </div>

            <button className="mt-6 text-white/20 text-sm hover:text-white/40">I don't know</button>
          </div>
        )

      case 1: // Goals
        return (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">
              What would you rather be doing?
            </h2>
            <p className="text-white/30 text-sm mb-8">Select one or multiple</p>

            <div className="space-y-3">
              {goalOptions.map((goal) => {
                const selected = goals.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${
                      selected
                        ? 'bg-white text-black border-white'
                        : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <goal.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{goal.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2: // Age
        return (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">How old are you?</h2>
            <p className="text-white/30 text-sm mb-8">So we can personalize your experience</p>

            <div className="space-y-3">
              {ageOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAge(opt)}
                  className={`w-full flex items-center justify-center px-5 py-4 rounded-2xl border transition-all ${
                    age === opt
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="font-medium">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 3: // Loading
        return (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <div className="mb-8">
              <GlowingOrb size={160}>
                <div className="relative">
                  <ProgressRing radius={60} stroke={4} progress={loadingPercent} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-purple-400" strokeWidth={1.5} />
                  </div>
                </div>
              </GlowingOrb>
            </div>
            <p className="text-white/40 text-sm mb-4">
              {loadingPercent < 40 ? 'Analyzing your study habits...' :
               loadingPercent < 70 ? 'Calculating your potential...' :
               loadingPercent < 95 ? 'Preparing your plan...' : 'Almost done!'}
            </p>
            <span className="text-5xl font-black text-white">{Math.round(loadingPercent)}%</span>
          </div>
        )

      case 4: // Impact
        return (
          <div className="flex-1 flex flex-col items-center justify-center animate-scale-in">
            <div className="mb-8">
              <GlowingOrb size={200}>
                <span className="text-7xl font-black text-white/20">{yearsReclaim}</span>
              </GlowingOrb>
            </div>
            <p className="text-white/50 text-lg text-center mb-2">With FocusFlow, you could save</p>
            <p className="text-white text-center mb-1">
              <span className="text-4xl font-black">{yearsReclaim} hours</span>
            </p>
            <p className="text-white/50 text-lg text-center mb-8">every week for what matters.</p>

            <Button
              onClick={handleNext}
              className="w-full max-w-sm h-14 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-lg"
            >
              That's amazing <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )

      case 5: // Name
        return (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <GlowingOrb size={100}>
              <Brain className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
            </GlowingOrb>
            <h2 className="text-2xl font-bold text-white mt-8 mb-2">What's your name?</h2>
            <p className="text-white/30 text-sm mb-8">So FocusFlow can greet you</p>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full max-w-xs bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 rounded-2xl h-14 text-center text-lg focus:border-purple-500/50 focus:ring-purple-500/20 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && onComplete({ name: name.trim(), studyHours, goals, age })}
              autoFocus
            />

            <Button
              onClick={() => name.trim() && onComplete({ name: name.trim(), studyHours, goals, age })}
              disabled={!name.trim()}
              className="w-full max-w-xs h-14 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-lg disabled:opacity-30"
            >
              Let's Go <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col px-6 py-6 relative overflow-hidden">
      <Particles />

      {/* Header with progress */}
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          {step > 0 && step !== 3 && step !== 4 && (
            <button onClick={() => setStep(Math.max(0, step - 1))} className="text-white/30 hover:text-white/60">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-sm mx-auto w-full">
        {renderStep()}
      </div>

      {/* Continue button (for steps 0-2) */}
      {step < 3 && (
        <div className="relative z-10 pb-4 max-w-sm mx-auto w-full">
          <Button
            onClick={handleNext}
            disabled={step === 1 && goals.length === 0}
            className="w-full h-14 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-lg disabled:opacity-30"
          >
            Continue <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ========== DASHBOARD ==========
function DashboardView({ state, dispatch, onStartFocus }) {
  const { profile, tasks } = state
  const pendingTasks = tasks.filter(t => !t.completed)
  const xpProgress = ((profile.xp % 100) / 100) * 100
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const earnedBadges = BADGES.filter(b => {
    if (b.type === 'streak') return profile.streak >= b.requirement
    return profile.xp >= b.requirement
  })

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 800))
    const microTasks = generateMicroTasks(newTask.trim())
    dispatch({ type: 'ADD_TASKS', payload: microTasks })
    setNewTask('')
    setIsGenerating(false)
    setShowAddTask(false)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  // Home tab
  const renderHome = () => (
    <div className="animate-fade-in">
      {/* Orb Section */}
      <div className="flex flex-col items-center py-6">
        <div className="animate-float">
          <GlowingOrb size={180}>
            <div className="flex flex-col items-center">
              <Brain className="w-10 h-10 text-purple-400 mb-2" strokeWidth={1.5} />
              <span className="text-xs text-white/30">Level {profile.level}</span>
            </div>
          </GlowingOrb>
        </div>
      </div>

      {/* Deep Work Section */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-bold text-lg">Deep Work</h3>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400">{profile.xp} XP</span>
          </div>
        </div>
        <p className="text-white/30 text-sm mb-4">Today's focus session</p>

        {pendingTasks.length > 0 ? (
          <div className="flex gap-2">
            <Button
              onClick={() => onStartFocus(pendingTasks[0])}
              className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold border-0"
            >
              <Play className="w-4 h-4 mr-2" /> Start Focus
            </Button>
            <Button
              variant="ghost"
              className="h-12 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60"
            >
              {pendingTasks[0].estimatedTime}m
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAddTask(true)}
            className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-white/40"
            variant="ghost"
          >
            <Plus className="w-4 h-4 mr-2" /> Add a Task to Start
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: CheckCircle2, color: 'text-emerald-400', value: profile.tasksCompleted, label: 'Done' },
          { icon: Flame, color: 'text-orange-400', value: profile.streak, label: 'Streak' },
          { icon: Trophy, color: 'text-yellow-400', value: earnedBadges.length, label: 'Badges' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* XP Bar */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-white/40">Level {profile.level}</span>
          <span className="text-white/20">{Math.round(xpProgress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>
    </div>
  )

  // Tasks tab
  const renderTasks = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Your Tasks</h3>
        <span className="text-xs text-white/30">{pendingTasks.length} remaining</span>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <Lightbulb className="w-10 h-10 text-purple-400/30 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No tasks yet</p>
          <p className="text-white/15 text-xs">Add a task to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <div key={task.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => { dispatch({ type: 'COMPLETE_TASK', payload: task.id }); dispatch({ type: 'ADD_XP', payload: task.xpReward }); fireTaskConfetti() }}
                  className="mt-0.5"
                >
                  <Circle className="w-5 h-5 text-white/15 hover:text-purple-400 transition" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 mb-0.5">{task.title}</p>
                  {task.subtitle && <p className="text-[10px] text-white/25 mb-1.5">{task.subtitle}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-white/25"><Clock className="w-3 h-3" />{task.estimatedTime}m</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[task.difficulty]}`}>{DIFFICULTY_LABELS[task.difficulty]}</span>
                    <span className="flex items-center gap-1 text-[10px] text-purple-400"><Zap className="w-3 h-3" />+{task.xpReward}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onStartFocus(task)} className="rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 h-8 px-3">
                  <Play className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task */}
      {showAddTask ? (
        <div className="mt-4 rounded-2xl bg-white/[0.03] border border-purple-500/20 p-4 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white/60">AI Task Breakdown</span>
          </div>
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder='e.g. "Study for AP Calc test"'
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 rounded-xl mb-3 focus:border-purple-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            autoFocus
            disabled={isGenerating}
          />
          <div className="flex gap-2">
            <Button onClick={() => { setShowAddTask(false); setNewTask('') }} variant="ghost" className="flex-1 rounded-xl text-white/30" disabled={isGenerating}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!newTask.trim() || isGenerating} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl border-0">
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Break it Down</>}
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAddTask(true)} className="w-full mt-4 rounded-xl h-12 bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/10 text-white/30" variant="ghost">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      )}
    </div>
  )

  // Profile tab
  const renderProfile = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-3">
          {profile.name ? profile.name[0].toUpperCase() : '?'}
        </div>
        <h3 className="text-xl font-bold text-white">{profile.name}</h3>
        <div className="flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Zap className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-purple-400 font-semibold">Level {profile.level} · {profile.xp} XP</span>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white/40 mb-3">Badge Collection</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {BADGES.map(badge => {
          const earned = badge.type === 'streak' ? profile.streak >= badge.requirement : profile.xp >= badge.requirement
          return (
            <div key={badge.id} className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] ${!earned ? 'opacity-30' : ''}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center`}>
                <badge.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-white/60 font-medium">{badge.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col relative overflow-hidden">
      <Particles />

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
          <span className="text-white font-bold text-sm tracking-wider uppercase">FocusFlow</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{profile.streak}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 pb-24 overflow-y-auto">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'profile' && renderProfile()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#080810]/95 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-lg mx-auto flex items-center justify-around py-3 px-4">
          {[
            { id: 'home', icon: Brain, label: 'Home' },
            { id: 'add', icon: Plus, label: 'Add', special: true },
            { id: 'tasks', icon: Target, label: 'Tasks' },
            { id: 'profile', icon: Crown, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'add') { setActiveTab('tasks'); setShowAddTask(true) }
                else setActiveTab(tab.id)
              }}
              className={`flex flex-col items-center gap-1 ${
                tab.special ? '' :
                activeTab === tab.id ? 'text-purple-400' : 'text-white/25 hover:text-white/40'
              } transition-colors`}
            >
              {tab.special ? (
                <div className="w-12 h-12 -mt-6 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <tab.icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== FOCUS MODE ==========
function FocusView({ task, dispatch, onBack }) {
  const [timeLeft, setTimeLeft] = useState(task.estimatedTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pauseCount, setPauseCount] = useState(0)
  const [idleCount, setIdleCount] = useState(0)
  const [showBurnout, setShowBurnout] = useState(false)
  const [showBreak, setShowBreak] = useState(false)
  const [bonusXP, setBonusXP] = useState(0)
  const [completed, setCompleted] = useState(false)
  const totalTime = task.estimatedTime * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setIsRunning(false); handleComplete(); return 0 }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning])

  const handlePause = () => {
    setIsRunning(false)
    const c = pauseCount + 1
    setPauseCount(c)
    if (c >= 3 || idleCount >= 2) setShowBurnout(true)
  }

  const handleComplete = () => {
    setCompleted(true)
    dispatch({ type: 'COMPLETE_TASK', payload: task.id })
    dispatch({ type: 'ADD_XP', payload: task.xpReward + bonusXP })
    fireConfetti()
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (completed) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <Particles />
        <div className="relative z-10 text-center animate-scale-in">
          <GlowingOrb size={120}>
            <CheckCircle2 className="w-12 h-12 text-white" />
          </GlowingOrb>
          <h2 className="text-3xl font-bold text-white mt-6 mb-2">Task Complete!</h2>
          <p className="text-white/40 mb-8">You earned {task.xpReward + bonusXP} XP</p>
          {bonusXP > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">+{bonusXP} Bonus XP!</span>
            </div>
          )}
          <Button onClick={onBack} className="w-full max-w-xs h-14 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col px-6 pt-6 pb-8 relative overflow-hidden max-w-lg mx-auto">
      <Particles />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white/60"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[task.difficulty]}`}>{DIFFICULTY_LABELS[task.difficulty]}</span>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400"><Zap className="w-3 h-3" />+{task.xpReward + bonusXP}</span>
        </div>
      </div>

      <div className="relative z-10 text-center mb-6">
        <p className="text-xs text-white/30 mb-2">Currently focusing on</p>
        <h2 className="text-lg font-semibold text-white">{task.title}</h2>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center">
        <GlowingOrb size={240}>
          <div className="relative">
            <ProgressRing radius={100} stroke={6} progress={progress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
              <span className="text-[10px] text-white/25 mt-1">{Math.round(progress)}%</span>
            </div>
          </div>
        </GlowingOrb>
      </div>

      <div className="relative z-10 space-y-3 pt-4">
        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <Button onClick={() => setIsRunning(true)} className="h-14 px-10 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg border-0 shadow-lg shadow-purple-500/25">
              <Play className="w-5 h-5 mr-2" /> {timeLeft === totalTime ? 'Start' : 'Resume'}
            </Button>
          ) : (
            <Button onClick={handlePause} className="h-14 px-10 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-lg border-0">
              <Pause className="w-5 h-5 mr-2" /> Pause
            </Button>
          )}
          <Button onClick={handleComplete} variant="ghost" className="h-14 px-6 rounded-2xl text-emerald-400 hover:bg-emerald-500/10">
            <Check className="w-5 h-5 mr-1" /> Done
          </Button>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => { setIdleCount(c => { const n = c + 1; if (n >= 2 || pauseCount >= 3) setShowBurnout(true); return n }) }} className="flex items-center gap-1.5 px-3 py-2 text-white/20 text-xs hover:text-white/40 transition">
            <AlertTriangle className="w-3.5 h-3.5" /> Feeling distracted?
          </button>
          <button onClick={() => { setIsRunning(false); setShowBreak(true) }} className="flex items-center gap-1.5 px-3 py-2 text-white/20 text-xs hover:text-white/40 transition">
            <Coffee className="w-3.5 h-3.5" /> Take micro-break
          </button>
        </div>
      </div>

      {/* Modals */}
      {showBurnout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#12122a] border border-white/10 p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Heart className="w-5 h-5 text-amber-400" /></div>
              <div><h3 className="text-lg font-semibold text-white">Hey, it's okay!</h3><p className="text-xs text-white/30">Burnout detected</p></div>
            </div>
            <p className="text-sm text-white/40 mb-5">Looks like you're struggling. Let me make this easier.</p>
            <Button onClick={() => { setTimeLeft(Math.max(60, Math.floor(timeLeft * 0.7))); setBonusXP(15); setShowBurnout(false) }} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 border-0 mb-2">
              <Gift className="w-4 h-4 mr-2" /> Reduce time + Bonus XP
            </Button>
            <Button onClick={() => setShowBurnout(false)} variant="ghost" className="w-full rounded-2xl h-12 text-white/30">I can push through</Button>
          </div>
        </div>
      )}
      {showBreak && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#12122a] border border-white/10 p-6 text-center animate-scale-in">
            <Coffee className="w-10 h-10 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Micro Break</h3>
            <p className="text-sm text-white/40 mb-6">Take 2 minutes. Stretch. Breathe. You got this.</p>
            <Button onClick={() => setShowBreak(false)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 px-8 border-0">Ready to continue</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== REDUCER ==========
function reducer(state, action) {
  let n = { ...state }
  switch (action.type) {
    case 'SET_PROFILE':
      n.profile = { ...n.profile, ...action.payload }
      n.hasOnboarded = true
      n.isAuthenticated = true
      break
    case 'ADD_TASKS':
      n.tasks = [...n.tasks, ...action.payload]
      break
    case 'COMPLETE_TASK': {
      const t = n.tasks.find(x => x.id === action.payload)
      if (t && !t.completed) {
        n.tasks = n.tasks.map(x => x.id === action.payload ? { ...x, completed: true } : x)
        n.completedTasks = [...(n.completedTasks || []), { ...t, completed: true }]
        n.profile = { ...n.profile, tasksCompleted: n.profile.tasksCompleted + 1 }
      }
      break
    }
    case 'ADD_XP': {
      const xp = n.profile.xp + action.payload
      const lv = Math.floor(xp / 100) + 1
      const up = lv > n.profile.level
      const today = new Date().toDateString()
      let streak = n.profile.streak
      if (n.profile.lastActiveDate !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1)
        streak = n.profile.lastActiveDate === y.toDateString() ? streak + 1 : 1
      }
      const badges = [...n.profile.badges]
      if (xp >= 100 && !badges.includes('focused')) badges.push('focused')
      if (xp >= 500 && !badges.includes('elite')) badges.push('elite')
      if (xp >= 1000 && !badges.includes('grinder')) badges.push('grinder')
      if (streak >= 3 && !badges.includes('streak3')) badges.push('streak3')
      n.profile = { ...n.profile, xp, level: lv, streak, lastActiveDate: today, badges }
      if (up) setTimeout(fireConfetti, 300)
      break
    }
    default: break
  }
  saveState(n)
  return n
}

// ========== MAIN APP ==========
export default function App() {
  const [state, setState] = useState(getDefaultState())
  const [view, setView] = useState('loading')
  const [focusTask, setFocusTask] = useState(null)

  const dispatch = useCallback((action) => {
    if (action.type === 'INIT') { setState(action.payload); return }
    setState(prev => reducer(prev, action))
  }, [])

  useEffect(() => {
    const loaded = loadState()
    dispatch({ type: 'INIT', payload: loaded })
    if (!loaded.isAuthenticated) setView('splash')
    else if (!loaded.hasOnboarded) setView('onboarding')
    else setView('dashboard')
  }, [])

  if (view === 'loading') return <div className="min-h-screen bg-[#080810] flex items-center justify-center"><Brain className="w-10 h-10 text-purple-400 animate-pulse" /></div>
  if (view === 'splash') return <SplashView onDone={() => setView('welcome')} />
  if (view === 'welcome') return <WelcomeView onStart={() => setView('login')} />
  if (view === 'login') return <LoginView onLogin={(provider) => { dispatch({ type: 'SET_PROFILE', payload: { authProvider: provider } }); setView('onboarding') }} />
  if (view === 'onboarding') return <OnboardingView onComplete={(data) => { dispatch({ type: 'SET_PROFILE', payload: data }); setView('dashboard') }} />
  if (view === 'focus' && focusTask) return <FocusView task={focusTask} dispatch={dispatch} onBack={() => { setFocusTask(null); setView('dashboard') }} />

  return <DashboardView state={state} dispatch={dispatch} onStartFocus={(t) => { setFocusTask(t); setView('focus') }} />
}
