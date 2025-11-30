import { useTheme } from '@/hooks/useTheme'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}