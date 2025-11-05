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
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'
import { loadVault, Vault, Day, Set, Word } from '../lib/storage'

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

  const cardBg = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.06)')
  const borderClr = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.2)')

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
      <Flex direction="column" align="center" justify="flex-start" w="100%" gap={8}>
      <VStack spacing={3} w="100%" maxW="500px" align="center">
        <Heading
          size="lg"
          fontWeight="extrabold"
          textAlign="center"
          mb={4}
          bgGradient="linear(to-r, #b794f4, #805ad5)"
          bgClip="text"
        >
          Flash Kartlar
        </Heading>
        <Button as={Link} to="/" variant="ghost" size="lg" h="48px" borderRadius="xl">← Deftere Dön</Button>
      </VStack>

      {/* Filters */}
      <VStack spacing={3} w="100%" maxW="400px">
        <Select
          value={selectedDayId}
          onChange={(e) => { setSelectedDayId(e.target.value); setSelectedSetId('all') }}
          h="48px"
          fontSize="md"
          bg="rgba(255,255,255,0.05)"
          borderColor="rgba(255,255,255,0.2)"
          _focus={{ borderColor: "#b794f4", boxShadow: "0 0 0 1px #b794f4" }}
        >
          <option value="all">Tüm Günler</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Select
          value={selectedSetId}
          onChange={(e) => setSelectedSetId(e.target.value)}
          h="48px"
          fontSize="md"
          bg="rgba(255,255,255,0.05)"
          borderColor="rgba(255,255,255,0.2)"
          _focus={{ borderColor: "#b794f4", boxShadow: "0 0 0 1px #b794f4" }}
        >
          <option value="all">Tüm Setler</option>
          {(selectedDayId === 'all'
            ? days.flatMap(d => d.sets)
            : (days.find(d => d.id === selectedDayId)?.sets || [])
          ).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </VStack>

      {/* Card Container */}
      <Box
        className="card"
        position="relative"
        w="full"
        maxW="400px"
        mx="auto"
        aspectRatio="16/10"
        style={{ perspective: '1000px' }}
        mt={4}
        onClick={flip}
        cursor="pointer"
      >
        <Box
          className={`card-inner ${flipped ? 'flipped' : ''}`}
          w="100%"
          h="100%"
          position="relative"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s ease' }}
        >
          <Box
            className="card-face front"
            position="absolute"
            inset={0}
            bg="rgba(255,255,255,0.06)"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            boxShadow="0 8px 30px rgba(0,0,0,0.35)"
            backdropFilter="blur(10px)"
            display="flex"
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            sx={{ backfaceVisibility: 'hidden' }}
            textAlign="center"
            p={4}
          >
            {current ? (
              <>
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">{current.front}</Text>
                {current.hint && (
                  <Text fontSize="sm" color="whiteAlpha.600" mt={1}>Eş anlam: {current.hint}</Text>
                )}
              </>
            ) : (
              <Text opacity={0.8}>Kart bulunamadı</Text>
            )}
          </Box>

          <Box
            className="card-face back"
            position="absolute"
            inset={0}
            bg="rgba(255,255,255,0.06)"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            boxShadow="0 8px 30px rgba(0,0,0,0.35)"
            backdropFilter="blur(10px)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ backfaceVisibility: 'hidden' }}
            transform="rotateY(180deg)"
            textAlign="center"
            p={4}
          >
            {current ? (
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">{current.back}</Text>
            ) : (
              <Text opacity={0.8}>Kart bulunamadı</Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* Buttons */}
      <HStack spacing={3} mt={6} flexWrap="wrap" justify="center">
        <Button colorScheme="purple" size="lg" h="48px" borderRadius="xl" onClick={prev}>Önceki</Button>
        <Button colorScheme="purple" size="lg" h="48px" borderRadius="xl" onClick={flip} leftIcon={<RepeatIcon />}>Çevir</Button>
        <Button colorScheme="purple" size="lg" h="48px" borderRadius="xl" onClick={next}>Sonraki</Button>
        <Button colorScheme="purple" size="lg" h="48px" borderRadius="xl" onClick={shuffle}>Karıştır</Button>
      </HStack>

      {/* Index info */}
      <Text fontSize="sm" mt={2} color="gray.300">
        {deck.length > 0 ? `${index + 1} / ${deck.length}` : '0 / 0'}
      </Text>

      {/* CSS for flip and responsive aspect ratio */}
      <style>
        {`
          .card-inner.flipped { transform: rotateY(180deg); }
          .card-face { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
          @media (max-width: 480px) {
            .card { aspect-ratio: 3/4; }
          }
        `}
      </style>
      </Flex>
    </Box>
  )
}