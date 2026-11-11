import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} theme`}
      type="button"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
