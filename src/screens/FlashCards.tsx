import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Select,
  VStack,
  HStack,
  useToast,
  Card,
  CardBody,
  Progress,
  IconButton,
} from '@chakra-ui/react'
import { RepeatIcon, ArrowBackIcon, ArrowForwardIcon, ChevronLeftIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { loadVault, Vault, Day, Set, Word } from '../lib/storage'
import EmptyState from '../components/EmptyState'

type DeckCard = { front: string; back: string; hint?: string }

export default function FlashCards() {
  const navigate = useNavigate()
  const toast = useToast()
  const [vault, setVault] = useState<Vault | null>(null)
  const [days, setDays] = useState<Day[]>([])
  const [selectedDayId, setSelectedDayId] = useState<string>('all')
  const [selectedSetId, setSelectedSetId] = useState<string>('all')

  const [deck, setDeck] = useState<DeckCard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    try {
      const v = loadVault()
      setVault(v)
      setDays(v.days)
    } catch (e) {
      toast({ title: 'Depolama okunamadı', status: 'error', duration: 2000 })
    }
  }, [toast])

  const activeDeck = useMemo(() => {
    if (!vault) return []
    const filteredDays = selectedDayId === 'all' ? vault.days : vault.days.filter(d => d.id === selectedDayId)
    const allSets: Set[] = filteredDays.flatMap(d => d.sets)
    const filteredSets = selectedSetId === 'all' ? allSets : allSets.filter(s => s.id === selectedSetId)
    const words: Word[] = filteredSets.flatMap(s => s.words)
    return words.map(w => ({ front: w.eng, back: w.tr, hint: w.synonym }))
  }, [vault, selectedDayId, selectedSetId])

  useEffect(() => {
    setDeck(activeDeck)
    setIndex(0)
    setFlipped(false)
  }, [activeDeck])

  function prev() {
    setIndex(i => (i > 0 ? i - 1 : deck.length > 0 ? deck.length - 1 : 0))
    setFlipped(false)
  }
  function next() {
    setIndex(i => (i < deck.length - 1 ? i + 1 : deck.length > 0 ? 0 : 0))
    setFlipped(false)
  }
  function flip() {
    setFlipped(f => !f)
  }
  function shuffle() {
    const arr = [...deck]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setDeck(arr)
    setIndex(0)
    setFlipped(false)
  }

  const current = deck[index]
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0

  return (
    <Box
      minH="100vh"
      w="100%"
      p={{ base: 4, md: 8 }}
      pt={{ base: 8, md: 12 }}
    >
      <Flex direction="column" align="center" justify="flex-start" w="100%" gap={8}>
        <VStack spacing={3} w="100%" maxW="500px" align="center">
          <Heading
            size="xl"
            fontWeight="extrabold"
            textAlign="center"
            bgGradient="linear(to-r, deepSea.duskBlue, deepSea.lavenderGrey)"
            bgClip="text"
          >
            Flash Kartlar
          </Heading>
          <Button
            as={Link}
            to="/"
            variant="ghost"
            size="md"
            leftIcon={<ChevronLeftIcon />}
            color="deepSea.lavenderGrey"
            _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
          >
            Deftere Dön
          </Button>
        </VStack>

        {/* Filters */}
        <HStack spacing={4} w="100%" maxW="600px" wrap="wrap" justify="center">
          <Select
            value={selectedDayId}
            onChange={(e) => { setSelectedDayId(e.target.value); setSelectedSetId('all') }}
            bg="rgba(27, 38, 59, 0.3)"
            borderColor="whiteAlpha.200"
            color="white"
            borderRadius="xl"
            maxW="200px"
            _focus={{ borderColor: 'deepSea.lavenderGrey' }}
          >
            <option value="all" style={{ color: 'black' }}>Tüm Günler</option>
            {days.map((d) => (
              <option key={d.id} value={d.id} style={{ color: 'black' }}>{d.name}</option>
            ))}
          </Select>
          <Select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            bg="rgba(27, 38, 59, 0.3)"
            borderColor="whiteAlpha.200"
            color="white"
            borderRadius="xl"
            maxW="200px"
            _focus={{ borderColor: 'deepSea.lavenderGrey' }}
          >
            <option value="all" style={{ color: 'black' }}>Tüm Setler</option>
            {(selectedDayId === 'all'
              ? days.flatMap(d => d.sets)
              : (days.find(d => d.id === selectedDayId)?.sets || [])
            ).map((s) => (
              <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.name}</option>
            ))}
          </Select>
        </HStack>

        {deck.length === 0 ? (
          <EmptyState
            title="Kart bulunamadı"
            description="Seçilen filtrelerde gösterilecek kelime yok."
          />
        ) : (
          <VStack spacing={6} w="full" maxW="500px">
            {/* Progress */}
            <Box w="full">
              <Flex justify="space-between" mb={2} fontSize="sm" color="deepSea.lavenderGrey">
                <Text>İlerleme</Text>
                <Text>{index + 1} / {deck.length}</Text>
              </Flex>
              <Progress value={progress} size="xs" colorScheme="blue" borderRadius="full" bg="whiteAlpha.100" />
            </Box>

            {/* Card Container */}
            <Box
              w="full"
              aspectRatio="16/10"
              sx={{ perspective: '1000px' }}
              cursor="pointer"
              onClick={flip}
              position="relative"
            >
              <motion.div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <Card
                  as={motion.div}
                  position="absolute"
                  inset={0}
                  sx={{ backfaceVisibility: 'hidden' }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.1)"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.1)"
                  boxShadow="xl"
                  borderRadius="2xl"
                >
                  <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={4}>
                    <Text fontSize="3xl" fontWeight="bold" textAlign="center">
                      {current?.front}
                    </Text>
                    {current?.hint && (
                      <Text fontSize="md" color="deepSea.lavenderGrey" fontStyle="italic">
                        ({current.hint})
                      </Text>
                    )}
                    <Text fontSize="xs" color="deepSea.lavenderGrey" position="absolute" bottom={4}>
                      Çevirmek için tıkla
                    </Text>
                  </CardBody>
                </Card>

                {/* Back */}
                <Card
                  as={motion.div}
                  position="absolute"
                  inset={0}
                  sx={{ backfaceVisibility: 'hidden' }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="deepSea.inkBlack"
                  style={{ transform: 'rotateY(180deg)' }}
                  border="1px solid rgba(255,255,255,0.1)"
                  boxShadow="xl"
                  borderRadius="2xl"
                >
                  <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="white">
                      {current?.back}
                    </Text>
                  </CardBody>
                </Card>
              </motion.div>
            </Box>

            {/* Controls */}
            <HStack spacing={4} w="full" justify="center">
              <IconButton
                aria-label="Önceki"
                icon={<ArrowBackIcon />}
                onClick={(e) => { e.stopPropagation(); prev() }}
                size="lg"
                isRound
                variant="ghost"
                fontSize="24px"
                color="deepSea.lavenderGrey"
                _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
              />
              <Button
                leftIcon={<RepeatIcon />}
                onClick={(e) => { e.stopPropagation(); shuffle() }}
                variant="outline"
                borderRadius="full"
                px={8}
                color="deepSea.lavenderGrey"
                borderColor="deepSea.lavenderGrey"
                _hover={{ bg: 'deepSea.duskBlue', color: 'white', borderColor: 'deepSea.duskBlue' }}
              >
                Karıştır
              </Button>
              <IconButton
                aria-label="Sonraki"
                icon={<ArrowForwardIcon />}
                onClick={(e) => { e.stopPropagation(); next() }}
                size="lg"
                isRound
                variant="ghost"
                fontSize="24px"
                color="deepSea.lavenderGrey"
                _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
              />
            </HStack>
          </VStack>
        )}
      </Flex>
    </Box>
  )
}