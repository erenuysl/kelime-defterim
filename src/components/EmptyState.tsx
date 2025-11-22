import React from 'react'
import { VStack, Text, Icon, Box } from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'

interface EmptyStateProps {
    title: string
    description?: string
    icon?: React.ElementType
}

export default function EmptyState({ title, description, icon = InfoIcon }: EmptyStateProps) {
    return (
        <Box
            p={8}
            textAlign="center"
            bg="rgba(255,255,255,0.03)"
            borderRadius="2xl"
            border="1px dashed rgba(255,255,255,0.1)"
            w="full"
            maxW="400px"
            mx="auto"
        >
            <VStack spacing={4}>
                <Icon as={icon} boxSize={10} color="gray.500" />
                <VStack spacing={1}>
                    <Text fontWeight="bold" fontSize="lg">
                        {title}
                    </Text>
                    {description && (
                        <Text fontSize="sm" color="gray.500">
                            {description}
                        </Text>
                    )}
                </VStack>
            </VStack>
        </Box>
    )
}
