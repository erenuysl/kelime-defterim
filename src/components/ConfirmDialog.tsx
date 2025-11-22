import React, { useRef } from 'react'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
} from '@chakra-ui/react'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    colorScheme?: string
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Sil',
    cancelText = 'İptal',
    colorScheme = 'red',
}: ConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null)

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef as React.RefObject<HTMLButtonElement>}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay backdropFilter="blur(10px)">
                <AlertDialogContent
                    bg="rgba(255,255,255,0.1)"
                    _dark={{ bg: 'rgba(20, 20, 40, 0.9)' }}
                    backdropFilter="blur(20px)"
                    borderRadius="2xl"
                    boxShadow="0 20px 50px rgba(0,0,0,0.5)"
                    border="1px solid rgba(255,255,255,0.1)"
                >
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        {title}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {description}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="xl">
                            {cancelText}
                        </Button>
                        <Button colorScheme={colorScheme} onClick={onConfirm} ml={3} borderRadius="xl">
                            {confirmText}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
