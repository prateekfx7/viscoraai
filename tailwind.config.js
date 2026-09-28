/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        control: {
          bg: "#0B0F17",
          panel: "#111827",
          panelHover: "#182234",
          card: "#131C2E",
          border: "#1E293B",
          borderHighlight: "#334155",
          muted: "#64748B",
          text: "#F8FAFC",
        },
        oil: {
          accent: "#F59E0B",
          flame: "#F97316",
          steam: "#38BDF8",
          success: "#10B981",
          warning: "#FBBF24",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
