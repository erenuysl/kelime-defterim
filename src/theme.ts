import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  deepSea: {
    inkBlack: '#0d1b2a',
    prussianBlue: '#1b263b',
    duskBlue: '#415a77',
    lavenderGrey: '#778da9',
    alabasterGrey: '#e0e1dd',
  },
}

const styles = {
  global: (props: any) => ({
    'html, body, #root': {
      height: '100%',
    },
    body: {
      bg: mode(
        'deepSea.alabasterGrey', // Light mode background (though app seems dark-first)
        'linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%)' // Ink Black to Prussian Blue
      )(props),
      color: mode('deepSea.inkBlack', 'deepSea.alabasterGrey')(props),
      transition: 'background 0.3s ease',
      fontFamily: 'Poppins, system-ui, sans-serif',
    },
  }),
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'xl',
    },
    variants: {
      solid: (props: any) => ({
        bg: mode('deepSea.duskBlue', 'deepSea.duskBlue')(props),
        color: 'white',
        _hover: {
          bg: mode('deepSea.prussianBlue', 'deepSea.lavenderGrey')(props),
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          bg: mode('deepSea.inkBlack', 'deepSea.prussianBlue')(props),
          transform: 'translateY(0)',
        },
      }),
      ghost: (props: any) => ({
        color: mode('deepSea.duskBlue', 'deepSea.lavenderGrey')(props),
        _hover: {
          bg: mode('blackAlpha.100', 'whiteAlpha.100')(props),
          color: mode('deepSea.prussianBlue', 'deepSea.alabasterGrey')(props),
        },
      }),
      outline: (props: any) => ({
        borderColor: mode('deepSea.duskBlue', 'deepSea.lavenderGrey')(props),
        color: mode('deepSea.duskBlue', 'deepSea.lavenderGrey')(props),
        _hover: {
          bg: mode('blackAlpha.50', 'whiteAlpha.100')(props),
        },
      }),
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: mode('white', 'rgba(27, 38, 59, 0.4)')(props), // Prussian Blue with opacity
        backdropFilter: 'blur(12px)',
        borderRadius: '2xl',
        border: '1px solid',
        borderColor: mode('blackAlpha.100', 'whiteAlpha.100')(props),
        boxShadow: mode('lg', '0 8px 32px rgba(13, 27, 42, 0.5)')(props), // Ink Black shadow
        p: 5,
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: mode('xl', '0 12px 40px rgba(13, 27, 42, 0.6)')(props),
          borderColor: mode('deepSea.duskBlue', 'deepSea.lavenderGrey')(props),
        },
      },
    }),
  },
  Input: {
    variants: {
      filled: (props: any) => ({
        field: {
          bg: mode('white', 'rgba(27, 38, 59, 0.3)')(props), // Prussian Blue with opacity
          borderColor: mode('gray.200', 'rgba(119, 141, 169, 0.2)')(props), // Lavender Grey with opacity
          color: mode('deepSea.inkBlack', 'deepSea.alabasterGrey')(props),
          _placeholder: {
            color: mode('gray.500', 'whiteAlpha.400')(props),
          },
          _focus: {
            borderColor: 'deepSea.lavenderGrey',
            bg: mode('white', 'rgba(27, 38, 59, 0.5)')(props),
          },
          _hover: {
            bg: mode('gray.50', 'rgba(27, 38, 59, 0.4)')(props),
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Heading: {
    baseStyle: (props: any) => ({
      color: mode('deepSea.inkBlack', 'deepSea.alabasterGrey')(props),
    }),
  },
  Text: {
    baseStyle: (props: any) => ({
      color: mode('deepSea.prussianBlue', 'deepSea.alabasterGrey')(props),
    }),
  },
  Menu: {
    baseStyle: (props: any) => ({
      list: {
        bg: mode('white', 'deepSea.prussianBlue')(props),
        borderColor: mode('gray.200', 'whiteAlpha.200')(props),
      },
      item: {
        bg: 'transparent',
        _hover: {
          bg: mode('gray.100', 'whiteAlpha.100')(props),
        },
        _focus: {
          bg: mode('gray.100', 'whiteAlpha.100')(props),
        },
      },
    }),
  },
}

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  fonts: {
    heading: 'Poppins, system-ui, sans-serif',
    body: 'Poppins, system-ui, sans-serif',
  },
})

export default theme
