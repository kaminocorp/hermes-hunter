/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': '#0a0a0a',
        'terminal-text': '#e5e5e5',
        'terminal-green': '#22c55e',
        'terminal-blue': '#3b82f6',
        'terminal-amber': '#f59e0b',
        'terminal-red': '#ef4444',
        'hermes-primary': '#6366f1',
        'hermes-secondary': '#8b5cf6',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}