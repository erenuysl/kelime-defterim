import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'

// Chakra custom theme: default to dark mode, with Poppins font and base colors
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      'html, body, #root': {
        height: '100%'
      },
      body: {
        bg: props.colorMode === 'light'
          ? 'linear-gradient(180deg, #f5f6fa 0%, #eaeef9 100%)'
          : 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        color: props.colorMode === 'light' ? '#312e81' : 'whiteAlpha.900',
        transition: 'background 0.3s ease',
        fontFamily: 'Poppins, system-ui, sans-serif',
      },
    }),
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
