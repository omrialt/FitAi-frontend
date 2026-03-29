import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import { MantineProvider, createTheme } from '@mantine/core'
import { Toaster } from 'sonner'
import '@radix-ui/themes/styles.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './index.css'
import App from './App.tsx'
import { preloadCriticalResources } from './utils/resourcePreload'

// React 19: Preload critical resources before rendering
preloadCriticalResources();

const mantineTheme = createTheme({
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, monospace',
  primaryColor: 'indigo',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider theme={mantineTheme}>
        <Theme>
          <App />
          <Toaster position="top-right" richColors />
        </Theme>
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
)
