'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 mb-3 sm:mb-4">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Meme Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create hilarious memes with custom text and images</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              {!image ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-sm text-gray-900">or click to select a file</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Customize Your Meme</h2>
                    <button
                      onClick={reset}
                      className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                    >
                      <X className="h-5 w-5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Top Text
                      </label>
                      <input
                        type="text"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        placeholder="Enter top text..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Bottom Text
                      </label>
                      <input
                        type="text"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        placeholder="Enter bottom text..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Font Size: {fontSize}px
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="flex-1"
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
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Font Style
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Stroke Color
                        </label>
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      onClick={downloadMeme}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Meme</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                {image ? (
                  <div
                    ref={memeRef}
                    className="relative"
                    style={{ maxWidth: '100%' }}
                  >
                    <img src={image} alt="Meme" className="w-full h-auto" />
                    {topText && (
                      <div
                        className="absolute top-4 left-0 right-0 text-center px-4"
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
                        className="absolute bottom-4 left-0 right-0 text-center px-4"
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
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <Type className="h-12 w-12 mx-auto mb-2" />
                      <p>Upload an image to start creating</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

