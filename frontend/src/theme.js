import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#21CBF3',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1a1a',  // 明るめの黒に変更
      paper: '#2d2d2d',     // ダークモード用の背景色
    },
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#a5d6a7',
    },
    text: {
      primary: '#e0e0e0',   // 明るいテキスト色
      secondary: '#b0b0b0',
    },
  },
}); 