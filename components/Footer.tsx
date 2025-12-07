'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-pink-400 p-2 rounded-lg shadow-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Zuno Tools</span>
            </Link>
            <p className="text-gray-400 max-w-md">
              Your all-in-one professional tools platform. Transform images, create PDFs, 
              generate AI-powered content, and boost your productivity with our comprehensive suite of tools.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/tools/background-remover" className="hover:text-pink-300 transition-colors">Background Remover</Link></li>
              <li><Link href="/tools/image-resizer" className="hover:text-pink-300 transition-colors">Image Resizer</Link></li>
              <li><Link href="/tools/pdf-tools" className="hover:text-pink-300 transition-colors">PDF Tools</Link></li>
              <li><Link href="/tools/meme-generator" className="hover:text-pink-300 transition-colors">Meme Generator</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">AI Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/tools/ai-resume-builder" className="hover:text-pink-300 transition-colors">Resume Builder</Link></li>
              <li><Link href="/tools/ai-summarizer" className="hover:text-pink-300 transition-colors">AI Summarizer</Link></li>
              <li><Link href="/tools/text-to-speech" className="hover:text-pink-300 transition-colors">Text to Speech</Link></li>
              <li><Link href="/tools/english-improvement" className="hover:text-pink-300 transition-colors">English Improvement</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Zuno Tools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

