import { NextResponse } from 'next/server';

// Simple API route for FocusFlow
// Currently the app uses client-side state, but this provides
// the API structure for future MongoDB integration

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return NextResponse.json(data, { status, headers });
}

// Task breakdown AI templates
const TASK_TEMPLATES = {
  study: [
    { title: 'Review key concepts and notes', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Summarize main topics', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Practice problems - easy set', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Practice problems - challenging set', time: 20, difficulty: 'hard', xp: 35 },
    { title: 'Self-quiz and review mistakes', time: 10, difficulty: 'medium', xp: 20 },
  ],
  read: [
    { title: 'Skim headings and key points', time: 8, difficulty: 'easy', xp: 10 },
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
  default: [
    { title: 'Break down and plan approach', time: 10, difficulty: 'easy', xp: 15 },
    { title: 'Work on first chunk', time: 15, difficulty: 'medium', xp: 25 },
    { title: 'Work on main section', time: 20, difficulty: 'hard', xp: 35 },
    { title: 'Review and wrap up', time: 10, difficulty: 'easy', xp: 15 },
  ],
};

function detectTaskType(input) {
  const lower = input.toLowerCase();
  if (lower.includes('study') || lower.includes('test') || lower.includes('exam')) return 'study';
  if (lower.includes('read') || lower.includes('chapter') || lower.includes('book')) return 'read';
  if (lower.includes('write') || lower.includes('essay') || lower.includes('paper')) return 'write';
  return 'default';
}

export async function GET(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api', '');

  if (path === '/health' || path === '/') {
    return jsonResponse({ status: 'ok', app: 'FocusFlow API', version: '1.0.0' });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api', '');

  if (path === '/tasks/breakdown') {
    try {
      const body = await request.json();
      const { task } = body;

      if (!task) {
        return jsonResponse({ error: 'Task description is required' }, 400);
      }

      const type = detectTaskType(task);
      const templates = TASK_TEMPLATES[type];
      const subject = task.replace(/^(study for |read |write |finish |complete |do |work on )/i, '').trim();

      const microTasks = templates.map((t, i) => ({
        id: crypto.randomUUID(),
        parentTask: task,
        title: `${t.title}${subject ? ` — ${subject}` : ''}`,
        estimatedTime: t.time,
        difficulty: t.difficulty,
        xpReward: t.xp,
        completed: false,
        order: i,
      }));

      return jsonResponse({ success: true, tasks: microTasks });
    } catch (error) {
      return jsonResponse({ error: 'Failed to process task' }, 500);
    }
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200, headers });
}