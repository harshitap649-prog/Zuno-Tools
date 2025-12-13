import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import Toaster from '@/components/Toaster'
import Navbar from '@/components/Navbar'
import AdCleanup from '@/components/AdCleanup'
import AdScriptBlocker from '@/components/AdScriptBlocker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zuno Tools - All-in-One Professional Tools Platform',
  description: 'Professional tools for image editing, PDF conversion, AI-powered utilities, and more. Background remover, image resizer, PDF tools, meme generator, AI resume builder, and study tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode````
}) {
  return (
    <html lang="en">
      <Script
        id="block-160x600-ads"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Remove any iframe or element with 160x600 dimensions
              const remove160x600 = () => {
                const nodes = document.querySelectorAll('*');
                nodes.forEach((node) => {
                  const el = node;
                  if (!(el instanceof HTMLElement)) return;
                  const w = el.offsetWidth || 0;
                  const h = el.offsetHeight || 0;
                  if ((w === 160 && h === 600) || (w >= 155 && w <= 165 && h >= 595 && h <= 605)) {
                    el.remove();
                  }
                });
              };

              // Override appendChild to block 160x600 iframes/scripts
              const originalAppendChild = Node.prototype.appendChild;
              Node.prototype.appendChild = function(child) {
                try {
                  if (child && child.tagName === 'IFRAME') {
                    const w = child.getAttribute('width');
                    const h = child.getAttribute('height');
                    if ((w === '160' && h === '600') || (child.offsetWidth === 160 && child.offsetHeight === 600)) {
                      return child;
                    }
                  }
                  if (child && child.tagName === 'SCRIPT' && child.src) {
                    if (child.src.includes('highperformanceformat') || child.src.includes('banner')) {
                      return child;
                    }
                  }
                } catch (e) {}
                return originalAppendChild.call(this, child);
              };

              // Block atOptions with 160x600
              let atOptionsValue = undefined;
              Object.defineProperty(window, 'atOptions', {
                configurable: true,
                get() {
                  return atOptionsValue;
                },
                set(v) {
                  if (v && v.height === 600 && v.width === 160) {
                    return;
                  }
                  atOptionsValue = v;
                }
              });

              // Run immediately and repeatedly early
              remove160x600();
              const interval = setInterval(remove160x600, 400);
              window.addEventListener('load', remove160x600);
              document.addEventListener('DOMContentLoaded', remove160x600);
            })();
          `,
        }}
      />
      <body className={inter.className}>
        <AdScriptBlocker />
        <AdCleanup />
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}

