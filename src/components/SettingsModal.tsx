import React, { useRef, useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Button,
    Text,
    useToast,
    Divider,
    Input,
    Box,
} from '@chakra-ui/react'
import { DownloadIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons'
import { loadVault, saveVault, KEY, Vault } from '../lib/storage'
import ConfirmDialog from './ConfirmDialog'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onDataChanged: () => void
}

export default function SettingsModal({ isOpen, onClose, onDataChanged }: SettingsModalProps) {
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showClearConfirm, setShowClearConfirm] = useState(false)

    const handleExport = () => {
        try {
            const v = loadVault()
            const dataStr = JSON.stringify(v, null, 2)
            const blob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `kelime-defterim-backup-${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast({ title: 'Yedek indirildi', status: 'success' })
        } catch (e) {
            toast({ title: 'Dışa aktarma hatası', status: 'error' })
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                if (json.version !== 2 || !Array.isArray(json.days)) {
                    throw new Error('Geçersiz yedek dosyası')
                }
                saveVault(json as Vault)
                toast({ title: 'Yedek geri yüklendi', status: 'success' })
                onDataChanged()
                onClose()
            } catch (err) {
                toast({ title: 'Yükleme başarısız', description: 'Dosya formatı hatalı olabilir.', status: 'error' })
            }
        }
        reader.readAsText(file)
        // Reset input
        e.target.value = ''
    }

    const handleClearData = () => {
        localStorage.removeItem(KEY)
        toast({ title: 'Tüm veriler silindi', status: 'info' })
        onDataChanged()
        setShowClearConfirm(false)
        onClose()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent
                    bg="rgba(20, 20, 40, 0.95)"
                    backdropFilter="blur(20px)"
                    borderRadius="2xl"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                >
                    <ModalHeader>Ayarlar & Veri</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Text fontSize="sm" color="gray.400" mb={2}>
                                    Veri Yönetimi
                                </Text>
                                <VStack spacing={3}>
                                    <Button
                                        leftIcon={<DownloadIcon />}
                                        w="full"
                                        onClick={handleExport}
                                        colorScheme="purple"
                                        variant="outline"
                                        justifyContent="flex-start"
                                        h="50px"
                                    >
                                        Yedeği İndir (JSON)
                                    </Button>

                                    <Button
                                        leftIcon={<AttachmentIcon />}
                                        w="full"
                                        onClick={handleImportClick}
                                        colorScheme="blue"
                                        variant="outline"
                                        justifyContent="flex-start"
                                        h="50px"
                                    >
                                        Yedekten Geri Yükle
                                    </Button>
                                    <Input
                                        type="file"
                                        ref={fileInputRef}
                                        display="none"
                                        accept=".json"
                                        onChange={handleFileChange}
                                    />
                                </VStack>
                            </Box>

                            <Divider borderColor="whiteAlpha.200" />

                            <Box>
                                <Text fontSize="sm" color="red.300" mb={2}>
                                    Tehlikeli Bölge
                                </Text>
                                <Button
                                    leftIcon={<DeleteIcon />}
                                    w="full"
                                    colorScheme="red"
                                    variant="ghost"
                                    justifyContent="flex-start"
                                    onClick={() => setShowClearConfirm(true)}
                                    _hover={{ bg: 'red.900', color: 'red.200' }}
                                >
                                    Tüm Verileri Sıfırla
                                </Button>
                            </Box>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <ConfirmDialog
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearData}
                title="Tüm Verileri Sil?"
                description="Bu işlem geri alınamaz. Tüm kelime defteriniz silinecek."
                confirmText="Evet, Hepsini Sil"
                colorScheme="red"
            />
        </>
    )
}
