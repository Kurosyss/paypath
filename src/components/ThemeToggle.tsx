'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-body)] hover:text-[var(--text-ink)] hover:border-[var(--text-mute)] transition-colors focus:outline-none cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[var(--text-ink)]" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-ink)]" />
      )}
    </button>
  );
}
