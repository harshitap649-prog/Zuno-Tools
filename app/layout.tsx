import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Toaster from '@/components/Toaster'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zuno Tools - All-in-One Professional Tools Platform',
  description: 'Professional tools for image editing, PDF conversion, AI-powered utilities, and more. Background remover, image resizer, PDF tools, meme generator, AI resume builder, and study tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}

