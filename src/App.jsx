import React from 'react'
import { Flex } from '@chakra-ui/react'
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen.tsx'
import FlashCards from './screens/FlashCards.tsx'
import DayScreen from './screens/DayScreen.tsx'
import SetScreen from './screens/SetScreen.tsx'

export function Layout() {
  return (
    <Flex align="stretch" justify="flex-start" minH="100vh" w="100vw" direction="column">
      <Outlet />
    </Flex>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/day/:id" element={<DayScreen />} />
        <Route path="/day/:dayId/set/:setId" element={<SetScreen />} />
        <Route path="/flashcards" element={<FlashCards />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
