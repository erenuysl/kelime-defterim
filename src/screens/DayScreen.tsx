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
  Card,
  CardBody,
  VStack,
} from "@chakra-ui/react"
import { AddIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons"
import { listSets, createSet, renameSet, deleteSet, getDay } from "../lib/storage"
import type { Day as V2Day, Set as V2Set } from "../lib/storage"
import ConfirmDialog from "../components/ConfirmDialog"
import EmptyState from "../components/EmptyState"

export default function DayScreen() {
  const { id: routeId, dayId: nestedDayId } = useParams()
  const dayId = nestedDayId || routeId
  const navigate = useNavigate()
  const toast = useToast()

  const [sets, setSets] = useState<V2Set[]>([])
  const [dayName, setDayName] = useState("")
  const [dateISO, setDateISO] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  const handleDeleteSet = () => {
    if (!dayId || !deleteId) return
    deleteSet(dayId as string, deleteId)
    setSets(listSets(dayId as string))
    setDeleteId(null)
    toast({ title: "Set silindi", status: "warning" })
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      p={{ base: 4, md: 8 }}
      pt={{ base: 8, md: 12 }}
    >
      <Flex direction="column" align="center" justify="flex-start" w="100%" gap={6}>
        <Flex gap={3} justify="space-between" w="100%" maxW="1200px" mx="auto" my={4} align="center">
          <Button
            leftIcon={<ChevronLeftIcon />}
            variant="ghost"
            size="lg"
            onClick={() => navigate("/")}
            color="deepSea.lavenderGrey"
            _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
          >
            Geri Dön
          </Button>
          <Button
            variant="solid"
            size="lg"
            onClick={handleCreateSet}
            leftIcon={<AddIcon />}
            boxShadow="lg"
          >
            Yeni Set
          </Button>
        </Flex>

        <Box textAlign="center" w="100%" maxW="900px" mx="auto" mb={8}>
          <Heading
            size="2xl"
            fontWeight="extrabold"
            textAlign="center"
            mb={2}
            bgGradient="linear(to-r, deepSea.duskBlue, deepSea.lavenderGrey)"
            bgClip="text"
          >
            {dayName}
          </Heading>
          {dateISO && (
            <Text fontSize="lg" color="deepSea.lavenderGrey">
              {dateISO}
            </Text>
          )}
        </Box>

        {sets.length === 0 ? (
          <EmptyState
            title="Bu güne ait set bulunamadı"
            description="Yeni bir set oluşturarak kelimelerini gruplayabilirsin."
          />
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            w="100%"
            maxW="1200px"
            mx="auto"
          >
            {sets.map((s) => (
              <Card key={s.id} variant="elevated">
                <CardBody>
                  <Flex justify="space-between" align="flex-start" mb={4}>
                    <Text fontWeight="bold" fontSize="xl" noOfLines={1} title={s.name}>
                      {s.name}
                    </Text>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<HamburgerIcon />}
                        size="sm"
                        variant="ghost"
                        borderRadius="full"
                        color="deepSea.lavenderGrey"
                        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                      />
                      <MenuList>
                        <MenuItem icon={<EditIcon />} onClick={() => handleRenameSet(s.id)}>
                          Yeniden Adlandır
                        </MenuItem>
                        <MenuItem icon={<DeleteIcon />} color="red.400" onClick={() => setDeleteId(s.id)}>
                          Sil
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  <VStack align="flex-start" spacing={1} mb={6}>
                    <Text fontSize="3xl" fontWeight="bold" color="deepSea.duskBlue">
                      {s.words.length}
                    </Text>
                    <Text fontSize="sm" color="deepSea.lavenderGrey" textTransform="uppercase">
                      Kelime
                    </Text>
                  </VStack>

                  <Button
                    rightIcon={<ChevronRightIcon />}
                    variant="outline"
                    w="100%"
                    onClick={() => navigate(`/day/${dayId}/set/${s.id}`)}
                    _hover={{ bg: 'deepSea.duskBlue', color: 'white', borderColor: 'deepSea.duskBlue' }}
                  >
                    Aç
                  </Button>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Flex>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSet}
        title="Seti Sil"
        description="Bu seti ve içindeki kelimeleri silmek istediğine emin misin?"
      />
    </Box>
  )
}