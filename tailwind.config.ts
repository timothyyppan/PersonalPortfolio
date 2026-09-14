import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        card: '#EFE9D8',
        cardRaised: '#F3EEDF',
        rule: '#C3BA9C',
        ruleSoft: '#E2DAC2',
        ink: '#14301E',
        inkSoft: '#55604F',
        flag: '#B8973F',
        mark: '#A8443A',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
