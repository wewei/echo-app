import React from 'react'
import { AppRouter } from './routes'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import '../shared/i18n'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppRouter />
      </Box>
    </ThemeProvider>
  )
}

export default App