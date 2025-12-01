'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import { Upload, Download, X, Image as ImageIcon, Type, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'

export default function MemeGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(40)
  const [fontFamily, setFontFamily] = useState('Impact')
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const memeRef = useRef<HTMLDivElement>(null)

  const fontOptions = [
    { name: 'Impact', value: 'Impact, Arial Black, sans-serif' },
    { name: 'Arial Black', value: 'Arial Black, Arial, sans-serif' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  })

  const downloadMeme = async () => {
    if (!memeRef.current) return

    try {
      const canvas = await html2canvas(memeRef.current, {
        backgroundColor: null,
        scale: 2
      })
      const link = document.createElement('a')
      link.download = 'meme.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Meme downloaded!')
    } catch (error) {
      toast.error('Failed to download meme')
    }
  }

  const reset = () => {
    setImage(null)
    setTopText('')
    setBottomText('')
    setFontSize(40)
    setFontFamily('Impact')
    setTextColor('#ffffff')
    setStrokeColor('#000000')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Compact Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 mb-2 sm:mb-3 shadow-md">
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Meme Generator</h1>
            <p className="text-xs sm:text-sm text-gray-600 px-2">Create hilarious memes with custom text and images</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Controls - Compact Design */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
              {!image ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-10 text-center cursor-pointer transition-all touch-manipulation active:scale-95 ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 scale-95'
                      : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">or click to select a file</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900">Customize</h2>
                    <button
                      onClick={reset}
                      className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors touch-manipulation active:scale-95"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Top Text
                      </label>
                      <input
                        type="text"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        placeholder="Enter top text..."
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Bottom Text
                      </label>
                      <input
                        type="text"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        placeholder="Enter bottom text..."
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Font Size: <span className="text-primary-600 font-bold">{fontSize}px</span>
                      </label>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <input
                          type="number"
                          min="20"
                          max="100"
                          value={fontSize}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            if (value >= 20 && value <= 100) {
                              setFontSize(value)
                            }
                          }}
                          className="w-16 sm:w-20 px-2 py-1.5 text-xs sm:text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Font Style
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white transition-all"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Text Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-9 sm:h-10 rounded-xl cursor-pointer border-2 border-gray-200"
                          />
                          <span className="text-xs text-gray-600 font-mono hidden sm:inline">{textColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Stroke Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="w-full h-9 sm:h-10 rounded-xl cursor-pointer border-2 border-gray-200"
                          />
                          <span className="text-xs text-gray-600 font-mono hidden sm:inline">{strokeColor}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={downloadMeme}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg transition-all flex items-center justify-center space-x-2 touch-manipulation active:scale-95"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Download Meme</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Preview - Compact Design */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 md:p-5">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Preview</h2>
                {image && (
                  <span className="text-xs text-gray-500 hidden sm:inline">Live Preview</span>
                )}
              </div>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                {image ? (
                  <div
                    ref={memeRef}
                    className="relative bg-white"
                    style={{ maxWidth: '100%' }}
                  >
                    <img src={image} alt="Meme" className="w-full h-auto block" />
                    {topText && (
                      <div
                        className="absolute top-2 sm:top-4 left-0 right-0 text-center px-2 sm:px-4"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamily,
                          color: textColor,
                          textShadow: `-2px -2px 0 ${strokeColor}, 2px -2px 0 ${strokeColor}, -2px 2px 0 ${strokeColor}, 2px 2px 0 ${strokeColor}`,
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                        }}
                      >
                        {topText.toUpperCase()}
                      </div>
                    )}
                    {bottomText && (
                      <div
                        className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center px-2 sm:px-4"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamily,
                          color: textColor,
                          textShadow: `-2px -2px 0 ${strokeColor}, 2px -2px 0 ${strokeColor}, -2px 2px 0 ${strokeColor}, 2px 2px 0 ${strokeColor}`,
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                        }}
                      >
                        {bottomText.toUpperCase()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
                    <div className="text-center">
                      <Type className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm">Upload an image to start</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

