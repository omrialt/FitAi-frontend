import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import { MantineProvider, createTheme, DirectionProvider, useDirection } from '@mantine/core'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import '@radix-ui/themes/styles.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './index.css'
import './i18n'
import { dirFor } from './i18n'
import App from './App.tsx'

const mantineTheme = createTheme({
  // Rubik carries Hebrew glyphs; Inter stays primary for Latin text
  fontFamily: 'Inter, Rubik, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, monospace',
  primaryColor: 'indigo',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Inter, Rubik, system-ui, -apple-system, sans-serif',
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

function Root() {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter>
      <MantineProvider theme={mantineTheme}>
        <Theme>
          <DirectionSync />
          <App />
          <Toaster position="top-right" richColors dir={dirFor(i18n.language)} />
        </Theme>
      </MantineProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DirectionProvider>
      <Root />
    </DirectionProvider>
  </StrictMode>,
)
