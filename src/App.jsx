import React from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import HomeScreen from './screens/HomeScreen.tsx'
import FlashCards from './screens/FlashCards.tsx'
import DayScreen from './screens/DayScreen.tsx'
import SetScreen from './screens/SetScreen.tsx'
import AcademicPrintScreen from './screens/AcademicPrintScreen.tsx'

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

export function Layout() {
  const location = useLocation()
  return (
    <Flex align="stretch" justify="flex-start" minH="100vh" w="100%" direction="column" overflowX="hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Outlet />}>
            <Route path="/" element={<PageTransition><HomeScreen /></PageTransition>} />
            <Route path="/day/:id" element={<PageTransition><DayScreen /></PageTransition>} />
            <Route path="/day/:dayId/set/:setId" element={<PageTransition><SetScreen /></PageTransition>} />
            <Route path="/print/:dayId/:setId" element={<AcademicPrintScreen />} />
            <Route path="/flashcards" element={<PageTransition><FlashCards /></PageTransition>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Flex>
  )
}

function App() {
  return (
    <Layout />
  )
}

export default App
