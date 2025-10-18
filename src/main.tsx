import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import { MantineProvider } from '@mantine/core'
import '@radix-ui/themes/styles.css'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <Theme>
        <App />
      </Theme>
    </MantineProvider>
  </StrictMode>,
)
