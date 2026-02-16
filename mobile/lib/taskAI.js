// Refined AI Task Breakdown Engine
// Detects task type from natural language and generates contextual micro-tasks

const TASK_TEMPLATES = {
  study: {
    keywords: ['study', 'test', 'exam', 'quiz', 'review', 'prepare', 'midterm', 'final'],
    tasks: [
      { title: 'Review class notes & highlight key concepts', time: 10, difficulty: 'easy', xp: 15 },
      { title: 'Create a mind map of main topics', time: 12, difficulty: 'easy', xp: 18 },
      { title: 'Practice problems — start with easier ones', time: 15, difficulty: 'medium', xp: 25 },
      { title: 'Tackle challenging practice questions', time: 20, difficulty: 'hard', xp: 35 },
      { title: 'Self-quiz: cover notes and test yourself', time: 10, difficulty: 'medium', xp: 22 },
    ],
  },
  math: {
    keywords: ['math', 'calc', 'calculus', 'algebra', 'geometry', 'trig', 'statistics', 'equation'],
    tasks: [
      { title: 'Review formulas and key theorems', time: 8, difficulty: 'easy', xp: 12 },
      { title: 'Work through example problems step-by-step', time: 12, difficulty: 'easy', xp: 18 },
      { title: 'Solve practice set — medium difficulty', time: 18, difficulty: 'medium', xp: 28 },
      { title: 'Challenge yourself with advanced problems', time: 22, difficulty: 'hard', xp: 38 },
      { title: 'Review mistakes and understand error patterns', time: 10, difficulty: 'medium', xp: 20 },
    ],
  },
  science: {
    keywords: ['science', 'physics', 'chemistry', 'biology', 'lab', 'experiment', 'hypothesis'],
    tasks: [
      { title: 'Read through key concepts and definitions', time: 10, difficulty: 'easy', xp: 15 },
      { title: 'Draw diagrams and label important parts', time: 12, difficulty: 'easy', xp: 18 },
      { title: 'Work through practice problems', time: 18, difficulty: 'medium', xp: 28 },
      { title: 'Connect concepts — explain how topics relate', time: 15, difficulty: 'hard', xp: 32 },
      { title: 'Create flashcards for quick review', time: 8, difficulty: 'easy', xp: 12 },
    ],
  },
  read: {
    keywords: ['read', 'chapter', 'book', 'article', 'textbook', 'passage', 'literature'],
    tasks: [
      { title: 'Skim headings, bold text, and summaries', time: 6, difficulty: 'easy', xp: 10 },
      { title: 'Read first section — annotate key ideas', time: 15, difficulty: 'medium', xp: 22 },
      { title: 'Read remaining sections with active notes', time: 18, difficulty: 'medium', xp: 25 },
      { title: 'Write a paragraph summary in your words', time: 10, difficulty: 'medium', xp: 20 },
    ],
  },
  write: {
    keywords: ['write', 'essay', 'paper', 'report', 'assignment', 'thesis', 'paragraph', 'draft'],
    tasks: [
      { title: 'Brainstorm ideas and create an outline', time: 10, difficulty: 'easy', xp: 15 },
      { title: 'Write a strong introduction paragraph', time: 12, difficulty: 'medium', xp: 22 },
      { title: 'Write body paragraphs with evidence', time: 25, difficulty: 'hard', xp: 42 },
      { title: 'Write conclusion and transition sentences', time: 12, difficulty: 'medium', xp: 22 },
      { title: 'Proofread and edit for clarity', time: 10, difficulty: 'easy', xp: 15 },
    ],
  },
  project: {
    keywords: ['project', 'presentation', 'build', 'create', 'design', 'poster', 'slideshow'],
    tasks: [
      { title: 'Define goals and plan deliverables', time: 10, difficulty: 'easy', xp: 15 },
      { title: 'Research and gather key resources', time: 15, difficulty: 'medium', xp: 22 },
      { title: 'Build the main deliverable', time: 25, difficulty: 'hard', xp: 40 },
      { title: 'Add finishing touches and visuals', time: 15, difficulty: 'medium', xp: 25 },
      { title: 'Review, practice, and prepare to present', time: 10, difficulty: 'easy', xp: 18 },
    ],
  },
  coding: {
    keywords: ['code', 'coding', 'program', 'programming', 'app', 'website', 'debug', 'function', 'algorithm'],
    tasks: [
      { title: 'Plan your approach and pseudocode', time: 8, difficulty: 'easy', xp: 12 },
      { title: 'Set up files and write boilerplate', time: 10, difficulty: 'easy', xp: 15 },
      { title: 'Implement core functionality', time: 25, difficulty: 'hard', xp: 40 },
      { title: 'Test and debug your code', time: 15, difficulty: 'medium', xp: 25 },
      { title: 'Clean up and add comments', time: 8, difficulty: 'easy', xp: 12 },
    ],
  },
  language: {
    keywords: ['spanish', 'french', 'vocab', 'vocabulary', 'grammar', 'language', 'conjugat', 'translate'],
    tasks: [
      { title: 'Review new vocabulary words', time: 8, difficulty: 'easy', xp: 12 },
      { title: 'Practice grammar rules with examples', time: 12, difficulty: 'medium', xp: 20 },
      { title: 'Write sentences using new words', time: 15, difficulty: 'medium', xp: 25 },
      { title: 'Quiz yourself on vocabulary', time: 10, difficulty: 'easy', xp: 15 },
    ],
  },
  history: {
    keywords: ['history', 'historical', 'war', 'revolution', 'civilization', 'era', 'timeline', 'ap history'],
    tasks: [
      { title: 'Read through key events and dates', time: 10, difficulty: 'easy', xp: 15 },
      { title: 'Create a timeline of important events', time: 12, difficulty: 'easy', xp: 18 },
      { title: 'Analyze cause and effect relationships', time: 18, difficulty: 'medium', xp: 28 },
      { title: 'Practice with past exam questions', time: 15, difficulty: 'hard', xp: 32 },
    ],
  },
  homework: {
    keywords: ['homework', 'hw', 'assignment', 'worksheet', 'workbook', 'due', 'finish'],
    tasks: [
      { title: 'Read instructions carefully', time: 5, difficulty: 'easy', xp: 8 },
      { title: 'Complete first half of questions', time: 15, difficulty: 'medium', xp: 22 },
      { title: 'Complete second half of questions', time: 15, difficulty: 'medium', xp: 22 },
      { title: 'Double-check answers and submit', time: 8, difficulty: 'easy', xp: 12 },
    ],
  },
  default: [
    { title: 'Break down the task and plan approach', time: 8, difficulty: 'easy', xp: 12 },
    { title: 'Work on the first chunk', time: 15, difficulty: 'medium', xp: 22 },
    { title: 'Tackle the main portion', time: 22, difficulty: 'hard', xp: 35 },
    { title: 'Review and finalize your work', time: 10, difficulty: 'easy', xp: 15 },
  ],
};

function detectTaskType(input) {
  const lower = input.toLowerCase();
  let bestMatch = 'default';
  let maxScore = 0;

  for (const [type, config] of Object.entries(TASK_TEMPLATES)) {
    if (type === 'default') continue;
    const score = config.keywords.reduce((acc, kw) => {
      return acc + (lower.includes(kw) ? 1 : 0);
    }, 0);
    if (score > maxScore) {
      maxScore = score;
      bestMatch = type;
    }
  }

  return bestMatch;
}

function extractSubject(input) {
  const prefixes = [
    'study for', 'study', 'read', 'write', 'finish', 'complete', 'do',
    'work on', 'prepare for', 'review', 'practice', 'learn',
  ];
  let subject = input.trim();
  for (const prefix of prefixes) {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    subject = subject.replace(regex, '');
  }
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

export function generateMicroTasks(parentTask) {
  const type = detectTaskType(parentTask);
  const config = TASK_TEMPLATES[type];
  const templates = Array.isArray(config) ? config : config.tasks;
  const subject = extractSubject(parentTask);

  const id = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

  return templates.map((t, i) => ({
    id: id(),
    parentTask,
    title: `${t.title}`,
    subtitle: subject,
    estimatedTime: t.time,
    difficulty: t.difficulty,
    xpReward: t.xp,
    completed: false,
    order: i,
    createdAt: new Date().toISOString(),
  }));
}

export function getTaskTypeInfo(input) {
  const type = detectTaskType(input);
  const typeLabels = {
    study: { label: 'Study Session', emoji: '📚' },
    math: { label: 'Math Practice', emoji: '🔢' },
    science: { label: 'Science Study', emoji: '🔬' },
    read: { label: 'Reading Session', emoji: '📖' },
    write: { label: 'Writing Task', emoji: '✍️' },
    project: { label: 'Project Work', emoji: '🎯' },
    coding: { label: 'Coding Session', emoji: '💻' },
    language: { label: 'Language Practice', emoji: '🌍' },
    history: { label: 'History Review', emoji: '🏛️' },
    homework: { label: 'Homework', emoji: '📝' },
    default: { label: 'Task', emoji: '✨' },
  };
  return typeLabels[type] || typeLabels.default;
}
