import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import { MantineProvider, createTheme, DirectionProvider, useDirection, useMantineColorScheme } from '@mantine/core'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import '@radix-ui/themes/styles.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './index.css'
import './i18n'
import { dirFor } from './i18n'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'

/**
 * Mantine theme, aligned to the FitAI design tokens.
 *
 * Most screens are built directly from the tokens in styles/theme.css, but the
 * heavier CRUD forms (edit training/nutrition plan) still use Mantine inputs —
 * converting those by hand would risk their validation and array handling for
 * little visual gain. Pointing Mantine's own palette at the same indigo ramp
 * keeps those surfaces consistent without touching them.
 *
 * The ramp brackets all four brand values the tokens define, so the same array
 * serves both schemes: light uses shade 6 (--color-primary) and dark uses
 * shade 4 (dark's lifted --color-primary), which is why `primaryShade` is
 * scheme-aware below. A single fixed shade cannot satisfy both — #4648d4 has
 * far too little contrast against a #0d0e12 background.
 */
const brandIndigo: [
  string, string, string, string, string,
  string, string, string, string, string,
] = [
  '#eeeefc',
  '#dcddff', // dark --color-on-primary-container
  '#c0c1ff',
  '#a3a5ff',
  '#8385ff', // dark --color-primary
  '#6063ee', // light --color-primary-container
  '#4648d4', // light --color-primary
  '#3739b0',
  '#2f31a6', // dark --color-primary-container
  '#14163a', // dark --color-on-primary
];

const UI_FONT = 'Heebo, Rubik, ui-sans-serif, system-ui, sans-serif';

const mantineTheme = createTheme({
  // Heebo leads: it has a real Hebrew cut, so the RTL half of the app is no
  // longer rendered by a fallback face. Rubik backs it up.
  fontFamily: UI_FONT,
  fontFamilyMonospace: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
  colors: { brandIndigo },
  primaryColor: 'brandIndigo',
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: 'md',
  headings: {
    fontFamily: UI_FONT,
    fontWeight: '700',
  },
});

/** Keeps <html> lang/dir and Mantine's direction in sync with the active language */
function DirectionSync() {
  const { i18n } = useTranslation();
  const { setDirection } = useDirection();

  useEffect(() => {
    const apply = (lng: string) => {
      const dir = dirFor(lng);
      document.documentElement.lang = lng;
      document.documentElement.dir = dir;
      setDirection(dir);
    };
    apply(i18n.language);
    i18n.on('languageChanged', apply);
    return () => i18n.off('languageChanged', apply);
  }, [i18n, setDirection]);

  return null;
}

/**
 * Radix Themes, kept in step with Mantine's colour scheme.
 *
 * Two things were wrong with a bare `<Theme>`:
 *   - it defaults to the light appearance and never hears about the theme
 *     toggle, so Radix-rendered surfaces (the dropdown menus) stayed light in
 *     dark mode;
 *   - it paints an *opaque* background on its root element. Screens wrapped in
 *     AppShell hid that behind the shell's own surface, but the ones without a
 *     shell — login, register, reset, verify, 404 — showed a white sheet over
 *     the token background, which is why those pages ignored the palette
 *     entirely. `hasBackground={false}` hands the background back to <body>,
 *     which already paints `--color-background`.
 */
function ThemedRadix({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  // Subscribing matters only for `auto`, but the listener is cheap and keeping
  // it unconditional avoids re-registering as the user toggles schemes.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const appearance =
    colorScheme === 'auto' ? (systemDark ? 'dark' : 'light') : colorScheme;

  return (
    <Theme appearance={appearance} hasBackground={false}>
      {children}
    </Theme>
  );
}

function Root() {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter>
      <MantineProvider theme={mantineTheme}>
        <ThemedRadix>
          <DirectionSync />
          <App />
          <Toaster position="top-right" richColors dir={dirFor(i18n.language)} />
        </ThemedRadix>
      </MantineProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Outside every provider on purpose: a throw inside MantineProvider,
        Radix's Theme or i18n would otherwise escape the boundary and blank the
        page, which is the exact failure this exists to prevent. */}
    <ErrorBoundary>
      <DirectionProvider>
        <Root />
      </DirectionProvider>
    </ErrorBoundary>
  </StrictMode>,
)
