module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Modern Tech-WiFi Palette
        'bg-deep': '#080c14',         // Main Background (dark navy)
        'bg-surface': '#111827',       // Card/Container Surface
        'bg-elevated': '#1a2236',      // Elevated surfaces
        'border-subtle': '#1e293b',    // Subtle borders
        'accent-blue': '#3b82f6',      // Primary accent (wifi blue)
        'accent-cyan': '#06b6d4',      // Secondary accent (cyan)
        'gold': '#f59e0b',             // Money/Pesos color
        'gold-dark': '#b45309',        // Darker gold
        'text-primary': '#f1f5f9',     // Primary text
        'text-secondary': '#94a3b8',   // Secondary text
        'text-muted': '#64748b',       // Muted text
        'success': '#10b981',          // Success green
        'danger': '#ef4444',           // Danger red
        'warning': '#f59e0b',          // Warning amber
        'surface-hover': '#1e293b',    // Hover state
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'sm': '6px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'elevated': '0 4px 12px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
        'glow-gold': '0 0 20px rgba(245,158,11,0.15)',
      },
    },
  },
  plugins: [],
};