import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Flex,
  Button,
  SimpleGrid,
  VStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure,
  Card,
  CardBody,
  Tooltip,
} from "@chakra-ui/react"
import { AddIcon, ChevronRightIcon, HamburgerIcon, DeleteIcon, EditIcon, SettingsIcon } from "@chakra-ui/icons"
import { loadVault, saveVault, createDay, listDays, toTRDate } from "../lib/storage"
import ConfirmDialog from "../components/ConfirmDialog"
import EmptyState from "../components/EmptyState"
import Stats from "../components/Stats"
import SettingsModal from "../components/SettingsModal"

type V2Word = { id: string; eng: string; tr: string; synonym?: string; createdAt: string }
type V2Set = { id: string; name: string; createdAt: string; words: V2Word[] }
type V2Day = { id: string; name: string; dateISO: string; createdAt: string; sets: V2Set[] }

export default function HomeScreen() {
  const navigate = useNavigate()
  const toast = useToast()
  const [days, setDays] = useState<V2Day[]>([])
  const [stats, setStats] = useState({ totalDays: 0, totalSets: 0, totalWords: 0 })

  // Dialog states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()

  const refreshData = () => {
    const ds = listDays() as unknown as V2Day[]
    setDays(ds)

    // Calculate stats
    const totalSets = ds.reduce((acc, d) => acc + (d.sets?.length || 0), 0)
    const totalWords = ds.reduce((acc, d) => acc + (d.sets?.reduce((sAcc, s) => sAcc + (s.words?.length || 0), 0) || 0), 0)
    setStats({ totalDays: ds.length, totalSets, totalWords })
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleCreateDay = () => {
    const today = new Date()
    const dayName = toTRDate(today)

    // Check if day already exists
    const exists = days.some(d => d.name === dayName)
    if (exists) {
      toast({ title: "Bugün için defter zaten mevcut", status: "info", duration: 2000 })
      return
    }

    createDay(dayName, today)
    refreshData()
    toast({ title: `${dayName} oluşturuldu`, status: "success", duration: 2000 })
  }

  const handleDeleteDay = () => {
    if (!deleteId) return
    const v = loadVault()
    v.days = v.days.filter(d => d.id !== deleteId)
    saveVault(v)
    refreshData()
    setDeleteId(null)
    toast({ title: "Gün silindi", status: "info", duration: 1500 })
  }

  const handleRenameDay = (id: string, currentName: string) => {
    const nextName = window.prompt("Yeni gün adı:", currentName)?.trim()
    if (!nextName) return
    const v = loadVault()
    v.days = v.days.map(d => (d.id === id ? { ...d, name: nextName } : d))
    saveVault(v)
    refreshData()
    toast({ title: "Gün adı güncellendi", status: "success", duration: 1500 })
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      p={{ base: 4, md: 8 }}
      pt={{ base: 8, md: 12 }}
    >
      <Flex justify="flex-end" mb={4}>
        <Tooltip label="Ayarlar">
          <IconButton
            aria-label="Ayarlar"
            icon={<SettingsIcon />}
            variant="ghost"
            fontSize="20px"
            onClick={onSettingsOpen}
            borderRadius="full"
            color="deepSea.lavenderGrey"
            _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
          />
        </Tooltip>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={onSettingsClose}
          onDataChanged={refreshData}
        />
      </Flex>

      <Flex direction="column" align="center" justify="flex-start" w="100%" gap={10}>
        {/* Header Section */}
        <VStack spacing={6} w="100%" maxW="800px" textAlign="center">
          <Heading
            size="3xl"
            fontWeight="extrabold"
            bgGradient="linear(to-r, deepSea.duskBlue, deepSea.lavenderGrey)"
            bgClip="text"
            letterSpacing="tight"
          >
            Kelime Defterim
          </Heading>
          <Text fontSize="lg" color="deepSea.lavenderGrey" maxW="600px">
            Yeni bir dil öğrenme yolculuğunda kelimelerini düzenle, tekrar et ve geliştir.
          </Text>

          <Stats {...stats} />

          <Button
            size="lg"
            variant="solid"
            leftIcon={<AddIcon />}
            onClick={handleCreateDay}
            mt={4}
            px={8}
            h="60px"
            fontSize="lg"
            boxShadow="xl"
            _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
          >
            Bugünü Ekle
          </Button>
        </VStack>

        {/* Days Grid */}
        {days.length === 0 ? (
          <EmptyState
            title="Henüz gün eklenmemiş"
            description="Başlamak için 'Bugünü Ekle' butonuna tıkla."
          />
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            w="100%"
            maxW="1200px"
            mx="auto"
            px={4}
          >
            {days.map((day) => (
              <Card
                key={day.id}
                variant="elevated"
                role="group"
                cursor="pointer"
                onClick={() => navigate(`/day/${day.id}`)}
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl', borderColor: 'deepSea.duskBlue' }}
              >
                <CardBody>
                  <Flex justify="space-between" align="flex-start" mb={4}>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="bold" fontSize="xl" noOfLines={1} title={day.name}>
                        {day.name}
                      </Text>
                      <Text fontSize="xs" color="deepSea.lavenderGrey">
                        {day.dateISO}
                      </Text>
                    </VStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<HamburgerIcon />}
                        size="sm"
                        variant="ghost"
                        borderRadius="full"
                        onClick={(e) => e.stopPropagation()}
                        color="deepSea.lavenderGrey"
                        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                      />
                      <MenuList onClick={(e) => e.stopPropagation()}>
                        <MenuItem icon={<EditIcon />} onClick={() => handleRenameDay(day.id, day.name)}>
                          Yeniden Adlandır
                        </MenuItem>
                        <MenuItem icon={<DeleteIcon />} color="red.400" onClick={() => setDeleteId(day.id)}>
                          Sil
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  <Flex justify="space-between" align="center" mt={6}>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="2xl" fontWeight="bold" color="deepSea.duskBlue">
                        {day.sets?.length || 0}
                      </Text>
                      <Text fontSize="xs" color="deepSea.lavenderGrey" textTransform="uppercase">
                        Set
                      </Text>
                    </VStack>
                    <Button
                      rightIcon={<ChevronRightIcon />}
                      variant="ghost"
                      size="sm"
                      color="deepSea.lavenderGrey"
                      _groupHover={{ color: 'deepSea.duskBlue', transform: 'translateX(5px)' }}
                    >
                      Aç
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Flex>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteDay}
        title="Günü Sil"
        description="Bu günü ve içindeki tüm setleri silmek istediğine emin misin?"
      />
    </Box>
  )
}