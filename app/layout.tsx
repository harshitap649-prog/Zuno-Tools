import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Toaster from '@/components/Toaster'
import Navbar from '@/components/Navbar'
import AdCleanup from '@/components/AdCleanup'

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block any ad scripts that try to create 160x600 ads
              (function() {
                const originalAppendChild = Node.prototype.appendChild;
                Node.prototype.appendChild = function(child) {
                  if (child.tagName === 'SCRIPT' && child.src) {
                    // Block scripts that might load 160x600 ads
                    if (child.src.includes('highperformanceformat') && 
                        (child.id && (child.id.includes('left') || child.id.includes('right')))) {
                      return child;
                    }
                  }
                  if (child.tagName === 'IFRAME') {
                    const width = child.getAttribute('width');
                    const height = child.getAttribute('height');
                    if (width === '160' && height === '600') {
                      return child;
                    }
                  }
                  return originalAppendChild.call(this, child);
                };
                
                // Block atOptions from setting 160x600
                Object.defineProperty(window, 'atOptions', {
                  set: function(value) {
                    if (value && value.height === 600 && value.width === 160) {
                      return; // Block 160x600 ads
                    }
                    Object.defineProperty(window, 'atOptions', {
                      value: value,
                      writable: true,
                      configurable: true
                    });
                  },
                  get: function() {
                    return undefined;
                  },
                  configurable: true
                });
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AdCleanup />
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}

