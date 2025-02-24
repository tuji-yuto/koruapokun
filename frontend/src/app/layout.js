'use client';

import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from '../theme';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => prefersDarkMode ? darkTheme : lightTheme,
    [prefersDarkMode]
  );

  return (
    <html lang="ja">
      <head>
        <title>VS Project - KPI管理ダッシュボード</title>
        <meta name="description" content="KPI管理ダッシュボードアプリケーション" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
