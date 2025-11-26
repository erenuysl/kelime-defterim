import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Box,
    Text,
    Heading,
    Flex,
    Divider,
    VStack,
    Button,
    useToast,
    HStack,
    Container,
    Icon,
    Badge,
    Switch,
    FormControl,
    FormLabel,
    Spacer
} from "@chakra-ui/react"
import { ChevronLeftIcon, DeleteIcon, DownloadIcon, InfoIcon } from "@chakra-ui/icons"
import { getSet, removeWord } from "../lib/storage"
import type { Word } from "../lib/storage"

export default function AcademicPrintScreen() {
    const { dayId, setId } = useParams()
    const navigate = useNavigate()
    const toast = useToast()

    const [words, setWords] = useState<Word[]>([])
    const [setName, setSetName] = useState("")

    // Toggle for Legacy Data
    const [showIncomplete, setShowIncomplete] = useState(false)

    useEffect(() => {
        if (!dayId || !setId) return
        const s = getSet(dayId, setId)
        if (s) {
            setWords(s.words)
            setSetName(s.name)
        }
    }, [dayId, setId])

    const handleDelete = (wordId: string) => {
        if (!dayId || !setId) return
        removeWord(dayId, setId, wordId)
        const s = getSet(dayId, setId)
        setWords(s?.words || [])
    }

    const handlePrint = () => {
        window.print()
    }

    // Filter words based on toggle
    const filteredWords = words.filter(w => {
        if (showIncomplete) return true
        // Only show words that have academic sentences (proxy for complete data)
        return w.academicSentences && w.academicSentences.length > 0
    })

    // Split words into chunks of 4 for each page
    const chunks = []
    for (let i = 0; i < filteredWords.length; i += 4) {
        chunks.push(filteredWords.slice(i, i + 4))
    }

    return (
        <Box minH="100vh" bg="#0f172a" fontFamily="'Inter', sans-serif"> {/* Deep Sea / Dark Mode Background */}
            {/* --- Control Panel (Hidden on Print) --- */}
            <Box
                className="no-print"
                bg="#0f172a"
                borderBottom="1px solid"
                borderColor="gray.700"
                py={4}
                px={6}
                position="sticky"
                top={0}
                zIndex={100}
                boxShadow="sm"
            >
                <Container maxW="container.xl">
                    <Flex
                        justify="space-between"
                        align="center"
                        wrap="wrap"
                        gap={4}
                        direction={{ base: 'column', md: 'row' }}
                    >
                        <HStack spacing={4} w={{ base: '100%', md: 'auto' }} justify={{ base: 'space-between', md: 'flex-start' }}>
                            <Button
                                leftIcon={<ChevronLeftIcon />}
                                onClick={() => navigate(-1)}
                                variant="ghost"
                                color="gray.300"
                                _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                                size="sm"
                            >
                                Back
                            </Button>
                            <VStack align={{ base: 'end', md: 'start' }} spacing={0}>
                                <Heading size="sm" color="white">Academic Builder</Heading>
                                <Text fontSize="xs" color="gray.400">Print Preview</Text>
                            </VStack>
                        </HStack>

                        {/* Spacer only visible on desktop */}
                        <Spacer display={{ base: 'none', md: 'block' }} />

                        <Flex
                            gap={4}
                            align="center"
                            w={{ base: '100%', md: 'auto' }}
                            justify={{ base: 'space-between', md: 'flex-end' }}
                            wrap="wrap"
                        >
                            <FormControl display="flex" alignItems="center" w="auto">
                                <FormLabel htmlFor="incomplete-toggle" mb="0" fontSize="sm" color="gray.300" mr={2} cursor="pointer">
                                    Include Incomplete
                                </FormLabel>
                                <Switch
                                    id="incomplete-toggle"
                                    colorScheme="purple"
                                    isChecked={showIncomplete}
                                    onChange={(e) => setShowIncomplete(e.target.checked)}
                                />
                            </FormControl>

                            <HStack spacing={3}>
                                <Badge colorScheme="purple" p={2} borderRadius="md" fontSize="sm">
                                    {filteredWords.length} Words
                                </Badge>
                                <Button
                                    colorScheme="gray"
                                    variant="solid"
                                    onClick={handlePrint}
                                    leftIcon={<DownloadIcon />}
                                    bg="white"
                                    color="gray.900"
                                    _hover={{ bg: 'gray.100' }}
                                    size="sm"
                                >
                                    Print
                                </Button>
                            </HStack>
                        </Flex>
                    </Flex>
                </Container>
            </Box>

            {/* --- Print Preview Area --- */}
            <Box p={8} className="print-area" display="flex" flexDirection="column" alignItems="center" minH="calc(100vh - 90px)">
                <style>
                    {`
            @media print {
              .no-print { display: none !important; }
              .page-break { page-break-after: always; }
              @page { size: A4 portrait; margin: 10mm; }
              body { background: white !important; -webkit-print-color-adjust: exact; }
              .print-area { padding: 0 !important; display: block !important; background: white !important; }
              .page-container {
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                width: 100% !important;
                height: 100% !important;
                transform: none !important;
              }
            }
            .page-container {
              width: 210mm;
              height: 297mm;
              background: white;
              margin-bottom: 2rem;
              padding: 10mm;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              display: grid;
              grid-template-columns: 1fr 1fr;
              grid-template-rows: 1fr 1fr;
              gap: 15px;
              position: relative;
            }
            /* Mobile Responsiveness */
            @media screen and (max-width: 850px) {
                .page-container {
                    transform: scale(0.45);
                    transform-origin: top center;
                    margin-bottom: -140mm; /* Compensate for scale gap */
                }
            }
          `}
                </style>

                {filteredWords.length === 0 && (
                    <VStack py={20} spacing={4} color="gray.400">
                        <Icon as={InfoIcon} boxSize={10} color="gray.500" />
                        <Text fontSize="xl" fontWeight="medium">No words to display</Text>
                        <Text>Add words in the Set screen or enable "Include Incomplete" to see legacy data.</Text>
                    </VStack>
                )}

                {chunks.map((chunk, pageIndex) => (
                    <Box key={pageIndex} className="page-container page-break">
                        {/* Watermark/Guide for screen view */}
                        <Text
                            className="no-print"
                            position="absolute"
                            top="-30px"
                            left="0"
                            color="gray.400"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            Page {pageIndex + 1} (A4 Preview)
                        </Text>

                        {chunk.map((word) => (
                            <Flex
                                key={word.id}
                                direction="column"
                                border="2px solid #1a202c"
                                p={6} // Increased padding
                                justify="space-between"
                                h="100%"
                                borderRadius="lg"
                                bg="white"
                                position="relative"
                                className="flashcard"
                                transition="all 0.2s"
                                _hover={{ borderColor: "purple.500", boxShadow: "md" }}
                                role="group"
                            >
                                {/* Delete Button (Hover only, hidden on print) */}
                                <Box
                                    position="absolute"
                                    top={3}
                                    right={3}
                                    className="no-print"
                                    opacity={0}
                                    _groupHover={{ opacity: 1 }}
                                    transition="opacity 0.2s"
                                    cursor="pointer"
                                    onClick={() => handleDelete(word.id)}
                                    bg="red.50"
                                    p={2}
                                    borderRadius="full"
                                    _hover={{ bg: "red.100" }}
                                >
                                    <DeleteIcon color="red.500" boxSize={4} />
                                </Box>

                                {/* Header */}
                                <Box>
                                    <Flex justify="space-between" align="baseline" mb={2} pr={8}>
                                        <Heading size="xl" fontFamily="'Merriweather', serif" letterSpacing="tight" color="gray.900" fontWeight="bold">
                                            {word.eng}
                                        </Heading>
                                        <Badge colorScheme="gray" fontSize="md" fontStyle="italic" px={2} borderRadius="full">
                                            {word.type || "?"}
                                        </Badge>
                                    </Flex>
                                    <Divider borderColor="gray.800" borderBottomWidth="2px" mb={4} opacity={1} />

                                    {/* Definition */}
                                    <Box mb={4}>
                                        <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>
                                            Definition
                                        </Text>
                                        <Text fontSize="md" lineHeight="1.5" fontWeight="500" color="gray.800" fontFamily="sans-serif">
                                            {word.engDefinition || "No definition available."}
                                        </Text>
                                    </Box>

                                    {/* Synonyms */}
                                    {word.synonym && (
                                        <Box mb={4}>
                                            <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>
                                                Synonyms
                                            </Text>
                                            <Text fontStyle="italic" fontSize="sm" color="gray.700">
                                                {word.synonym}
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {/* Sentences */}
                                <Box flex="1" my={2}>
                                    <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase" mb={2} letterSpacing="wider">
                                        Academic Context
                                    </Text>
                                    <VStack align="start" spacing={3}>
                                        {word.academicSentences && word.academicSentences.length > 0 ? (
                                            word.academicSentences.slice(0, 2).map((sentence, idx) => (
                                                <Box key={idx} pl={3} borderLeft="4px solid" borderColor="purple.400">
                                                    <Text fontSize="sm" color="gray.800" lineHeight="1.4" fontStyle="italic">
                                                        "{sentence}"
                                                    </Text>
                                                </Box>
                                            ))
                                        ) : (
                                            <Text fontSize="sm" color="gray.400" fontStyle="italic">No academic sentences available.</Text>
                                        )}
                                    </VStack>
                                </Box>

                                {/* Footer (Turkish) */}
                                <Box mt="auto" pt={4} borderTop="1px dashed #cbd5e0">
                                    <Text textAlign="center" fontWeight="800" fontSize="xl" color="gray.900">
                                        {word.tr}
                                    </Text>
                                </Box>
                            </Flex>
                        ))}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
