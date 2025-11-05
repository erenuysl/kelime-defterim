import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Flex,
  Button,
  SimpleGrid,
  Center,
  VStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react"
import { AddIcon, ChevronRightIcon, HamburgerIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons"
import { loadVault, saveVault, createDay, listDays, toTRDate } from "../lib/storage"

type V2Word = { id: string; eng: string; tr: string; synonym?: string; createdAt: string }
type V2Set = { id: string; name: string; createdAt: string; words: V2Word[] }
type V2Day = { id: string; name: string; dateISO: string; createdAt: string; sets: V2Set[] }

export default function HomeScreen() {
  const navigate = useNavigate()
  const toast = useToast()
  const [days, setDays] = useState<V2Day[]>([])

  useEffect(() => {
    const v = loadVault()
    // V2 listDays() without args returns Day[]
    const ds = listDays() as unknown as V2Day[]
    setDays(ds)
  }, [])

  const handleCreateDay = () => {
    const today = new Date()
    const dayName = toTRDate(today)
    // createDay persist to vault internally
    const created = createDay(dayName, today)
    // refresh list from storage
    const ds = listDays() as unknown as V2Day[]
    setDays(ds)
    toast({ title: `${dayName} oluşturuldu`, status: "success", duration: 2000 })
  }

  const handleDeleteDay = (id: string) => {
    const v = loadVault()
    v.days = v.days.filter(d => d.id !== id)
    saveVault(v)
    const ds = listDays() as unknown as V2Day[]
    setDays(ds)
    toast({ title: "Gün silindi", status: "info", duration: 1500 })
  }

  const handleRenameDay = (id: string, currentName: string) => {
    const nextName = window.prompt("Yeni gün adı:", currentName)?.trim()
    if (!nextName) return
    const v = loadVault()
    v.days = v.days.map(d => (d.id === id ? { ...d, name: nextName } : d))
    saveVault(v)
    const ds = listDays() as unknown as V2Day[]
    setDays(ds)
    toast({ title: "Gün adı güncellendi", status: "success", duration: 1500 })
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      bgGradient="linear(to-b, #0b0923, #130e3b, #090621)"
      color="white"
      display="flex"
      flexDir="column"
      justifyContent="flex-start"
      alignItems="center"
      textAlign="center"
      p={{ base: 6, md: 10 }}
      gap={10}
    >
      <VStack spacing={4}>
        <Heading
          as="h1"
          size={{ base: "lg", md: "xl" }}
          fontWeight="extrabold"
          textAlign="center"
          mb={4}
          bgGradient="linear(to-r, #b794f4, #805ad5)"
          bgClip="text"
        >
          Kelime Defterim
        </Heading>
        <Button
          size="lg"
          colorScheme="purple"
          w="full"
          maxW="280px"
          h="48px"
          fontWeight="bold"
          borderRadius="xl"
          leftIcon={<AddIcon />}
          onClick={handleCreateDay}
        >
          Yeni Gün Oluştur
        </Button>
      </VStack>

      <Center w="100%">
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 6, md: 8 }}
          justifyItems="center"
          alignItems="center"
          w="100%"
          maxW="960px"
        >
          {days.map((day) => {
            const totalSets = day.sets?.length || 0
            const totalWords = day.sets?.reduce((sum, s) => sum + (s.words?.length || 0), 0) || 0
            return (
              <Box
                key={day.id}
                p={5}
                bg="rgba(255,255,255,0.06)"
                borderRadius="2xl"
                boxShadow="0 8px 30px rgba(0,0,0,0.35)"
                backdropFilter="blur(10px)"
                w="full"
                maxW="320px"
                mx="auto"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold" fontSize="lg">{day.name}</Text>
                  <Menu>
                    <MenuButton as={IconButton} icon={<HamburgerIcon />} size="sm" variant="ghost" />
                    <MenuList>
                      <MenuItem icon={<EditIcon />} onClick={() => handleRenameDay(day.id, day.name)}>Yeniden Adlandır</MenuItem>
                      <MenuItem icon={<DeleteIcon />} onClick={() => handleDeleteDay(day.id)}>Sil</MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
                <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                  {totalSets} set • {totalWords} kelime
                </Text>
                <Button
                  rightIcon={<ChevronRightIcon />}
                  colorScheme="purple"
                  size="lg"
                  h="48px"
                  borderRadius="xl"
                  mt={4}
                  w="100%"
                  onClick={() => navigate(`/day/${day.id}`)}
                >
                  Aç
                </Button>
              </Box>
            )
          })}
        </SimpleGrid>
      </Center>

      <Button
        as={Link}
        to="/flashcards"
        size="lg"
        colorScheme="purple"
        w="full"
        maxW="280px"
        h="48px"
        fontWeight="bold"
        borderRadius="xl"
        mt={{ base: 8, md: 10 }}
      >
        Flash Kartlar →
      </Button>
    </Box>
  )
}