import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadState, saveState, getDefaultState } from '../lib/storage';
import { BADGES } from '../lib/constants';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(getDefaultState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setIsLoading(false);
    });
  }, []);

  const persistState = useCallback((newState) => {
    setState(newState);
    saveState(newState);
  }, []);

  const setName = useCallback((name) => {
    setState((prev) => {
      const newState = {
        ...prev,
        profile: { ...prev.profile, name },
        hasOnboarded: true,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const setAuth = useCallback((authData) => {
    setState((prev) => {
      const newState = {
        ...prev,
        profile: {
          ...prev.profile,
          name: authData.name || prev.profile.name,
          email: authData.email || '',
          avatar: authData.avatar || null,
          authProvider: authData.provider || null,
        },
        isAuthenticated: true,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addTasks = useCallback((tasks) => {
    setState((prev) => {
      const newState = {
        ...prev,
        tasks: [...prev.tasks, ...tasks],
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const completeTask = useCallback((taskId) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return prev;

      const newState = {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        ),
        completedTasks: [
          ...(prev.completedTasks || []),
          { ...task, completed: true, completedAt: new Date().toISOString() },
        ],
        profile: {
          ...prev.profile,
          tasksCompleted: prev.profile.tasksCompleted + 1,
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addXP = useCallback((amount) => {
    setState((prev) => {
      const newXP = prev.profile.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.profile.level;

      const today = new Date().toDateString();
      const lastActive = prev.profile.lastActiveDate;
      let newStreak = prev.profile.streak;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastActive === yesterday.toDateString()) {
          newStreak += 1;
        } else if (!lastActive) {
          newStreak = 1;
        } else {
          newStreak = 1;
        }
      }

      const badges = [...prev.profile.badges];
      if (newXP >= 100 && !badges.includes('focused')) badges.push('focused');
      if (newXP >= 500 && !badges.includes('elite')) badges.push('elite');
      if (newXP >= 1000 && !badges.includes('grinder')) badges.push('grinder');
      if (newStreak >= 3 && !badges.includes('streak3')) badges.push('streak3');
      if (newStreak >= 7 && !badges.includes('streak7')) badges.push('streak7');
      if (prev.profile.tasksCompleted + 1 >= 10 && !badges.includes('centurion')) badges.push('centurion');

      const newState = {
        ...prev,
        profile: {
          ...prev.profile,
          xp: newXP,
          level: newLevel,
          streak: newStreak,
          lastActiveDate: today,
          badges,
        },
      };
      saveState(newState);
      return { ...newState, _leveledUp: leveledUp };
    });
  }, []);

  const addFocusMinutes = useCallback((minutes) => {
    setState((prev) => {
      const newState = {
        ...prev,
        profile: {
          ...prev.profile,
          totalFocusMinutes: (prev.profile.totalFocusMinutes || 0) + minutes,
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteTask = useCallback((taskId) => {
    setState((prev) => {
      const newState = {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const logout = useCallback(() => {
    const defaultState = getDefaultState();
    setState(defaultState);
    saveState(defaultState);
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        isLoading,
        setName,
        setAuth,
        addTasks,
        completeTask,
        addXP,
        addFocusMinutes,
        deleteTask,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
