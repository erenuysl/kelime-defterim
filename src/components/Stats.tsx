import React from 'react'
import { SimpleGrid, Box, Text, Flex, Icon } from '@chakra-ui/react'
import { CalendarIcon, CopyIcon, EditIcon } from '@chakra-ui/icons'

interface StatsProps {
    totalDays: number
    totalSets: number
    totalWords: number
}

export default function Stats({ totalDays, totalSets, totalWords }: StatsProps) {
    const items = [
        { label: 'Gün', value: totalDays, icon: CalendarIcon, color: 'deepSea.lavenderGrey' },
        { label: 'Set', value: totalSets, icon: CopyIcon, color: 'deepSea.duskBlue' },
        { label: 'Kelime', value: totalWords, icon: EditIcon, color: 'deepSea.alabasterGrey' },
    ]

    return (
        <SimpleGrid columns={3} spacing={4} w="full" maxW="600px" mx="auto">
            {items.map((item, i) => (
                <Box
                    key={i}
                    bg="rgba(27, 38, 59, 0.3)"
                    p={4}
                    borderRadius="2xl"
                    textAlign="center"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255,255,255,0.05)"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-2px)', bg: 'rgba(27, 38, 59, 0.5)' }}
                >
                    <Flex direction="column" align="center" gap={2}>
                        <Icon as={item.icon} color={item.color} boxSize={5} />
                        <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                            {item.value}
                        </Text>
                        <Text fontSize="xs" color="deepSea.lavenderGrey" textTransform="uppercase" letterSpacing="wider">
                            {item.label}
                        </Text>
                    </Flex>
                </Box>
            ))}
        </SimpleGrid>
    )
}
