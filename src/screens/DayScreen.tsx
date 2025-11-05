import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react"
import { AddIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons"
import { listSets, createSet, renameSet, deleteSet, getDay } from "../lib/storage"
import type { Day as V2Day, Set as V2Set } from "../lib/storage"

export default function DayScreen() {
  const { id: routeId, dayId: nestedDayId } = useParams()
  const dayId = nestedDayId || routeId
  const navigate = useNavigate()
  const toast = useToast()

  const [sets, setSets] = useState<V2Set[]>([])
  const [dayName, setDayName] = useState("")
  const [dateISO, setDateISO] = useState("")

  useEffect(() => {
    if (!dayId) return
    const d = getDay(dayId as string) as V2Day | undefined
    if (d) {
      setDayName(d.name)
      setDateISO(d.dateISO)
      setSets(listSets(dayId as string))
    } else {
      navigate("/")
    }
  }, [dayId, navigate])

  const handleCreateSet = () => {
    if (!dayId) return
    const next = createSet(dayId as string, `Yeni Set ${sets.length + 1}`)
    setSets(listSets(dayId as string))
    toast({ title: `${next.name} eklendi`, status: "success", duration: 2000 })
  }

  const handleRenameSet = (setId: string) => {
    if (!dayId) return
    const newName = window.prompt("Yeni set adı:")?.trim()
    if (!newName) return
    const updated = renameSet(dayId as string, setId, newName)
    setSets(listSets(dayId as string))
    toast({ title: `Set adı '${updated.name}' olarak güncellendi`, status: "info" })
  }

  const handleDeleteSet = (setId: string) => {
    if (!dayId) return
    deleteSet(dayId as string, setId)
    setSets(listSets(dayId as string))
    toast({ title: "Set silindi", status: "warning" })
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      bgGradient="linear(to-b, #0b0923, #130e3b, #090621)"
      color="white"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="flex-start"
      textAlign="center"
      px={{ base: 4, md: 8 }}
      py={8}
      gap={10}
    >
      <Flex direction="column" align="center" justify="flex-start" w="100%" gap={6}>
        <Flex gap={3} justify="center" w="100%" maxW="900px" mx="auto" my={6} wrap="wrap">
          <Button leftIcon={<ChevronLeftIcon />} variant="ghost" size="lg" h="48px" borderRadius="xl" onClick={() => navigate("/")}>Geri Dön</Button>
          <Button colorScheme="purple" size="lg" h="48px" borderRadius="xl" onClick={handleCreateSet}>
            <AddIcon mr={2} /> Yeni Set
          </Button>
        </Flex>

        <Box textAlign="center" w="100%" maxW="900px" mx="auto">
          <Heading
            size="lg"
            fontWeight="extrabold"
            textAlign="center"
            mb={4}
            bgGradient="linear(to-r, #b794f4, #805ad5)"
            bgClip="text"
          >
            {dayName}
          </Heading>
          {dateISO && (
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>{dateISO}</Text>
          )}
        </Box>

        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 6, md: 8 }}
          justifyItems="center"
          w="100%"
          maxW="900px"
          mx="auto"
        >
          {sets.map((s) => (
            <Box
              key={s.id}
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
                <Text fontWeight="bold" fontSize="lg">{s.name}</Text>
                <Menu>
                  <MenuButton as={IconButton} icon={<HamburgerIcon />} size="sm" variant="ghost" />
                  <MenuList>
                    <MenuItem icon={<EditIcon />} onClick={() => handleRenameSet(s.id)}>Yeniden Adlandır</MenuItem>
                    <MenuItem icon={<DeleteIcon />} onClick={() => handleDeleteSet(s.id)}>Sil</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>{s.words.length} kelime</Text>
              <Button
                rightIcon={<ChevronRightIcon />}
                colorScheme="purple"
                size="lg"
                h="48px"
                borderRadius="xl"
                mt={4}
                w="100%"
                onClick={() => navigate(`/day/${dayId}/set/${s.id}`)}
              >
                Aç
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Flex>
    </Box>
  )
}