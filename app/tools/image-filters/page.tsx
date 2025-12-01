'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast' | 'invert' | 'saturate'

export default function ImageFilters() {
  const [image, setImage] = useState<string | null>(null)
  const [filteredImage, setFilteredImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('none')
  const [filterIntensity, setFilterIntensity] = useState(100)
  const { triggerPopunder } = usePopunderAd()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setFilteredImage(null)
        setFilter('none')
        setFilterIntensity(100)
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

  const applyFilter = () => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      if (filter === 'grayscale') {
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          const intensity = filterIntensity / 100
          data[i] = data[i] * (1 - intensity) + gray * intensity
          data[i + 1] = data[i + 1] * (1 - intensity) + gray * intensity
          data[i + 2] = data[i + 2] * (1 - intensity) + gray * intensity
        }
      } else if (filter === 'sepia') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const intensity = filterIntensity / 100
          
          data[i] = Math.min(255, (r * 0.393 + g * 0.769 + b * 0.189) * intensity + r * (1 - intensity))
          data[i + 1] = Math.min(255, (r * 0.349 + g * 0.686 + b * 0.168) * intensity + g * (1 - intensity))
          data[i + 2] = Math.min(255, (r * 0.272 + g * 0.534 + b * 0.131) * intensity + b * (1 - intensity))
        }
      } else if (filter === 'invert') {
        for (let i = 0; i < data.length; i += 4) {
          const intensity = filterIntensity / 100
          data[i] = data[i] * (1 - intensity) + (255 - data[i]) * intensity
          data[i + 1] = data[i + 1] * (1 - intensity) + (255 - data[i + 1]) * intensity
          data[i + 2] = data[i + 2] * (1 - intensity) + (255 - data[i + 2]) * intensity
        }
      } else if (filter === 'brightness') {
        const factor = (filterIntensity - 100) / 100
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + data[i] * factor))
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + data[i + 1] * factor))
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + data[i + 2] * factor))
        }
      } else if (filter === 'contrast') {
        const factor = (259 * (filterIntensity + 255)) / (255 * (259 - filterIntensity))
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
        }
      } else if (filter === 'saturate') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          const factor = filterIntensity / 100
          
          data[i] = Math.min(255, Math.max(0, gray + (r - gray) * factor))
          data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * factor))
          data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * factor))
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setFilteredImage(canvas.toDataURL('image/png'))
      toast.success('Filter applied successfully!')
    }
  }

  const downloadImage = () => {
    if (!filteredImage) return

    const link = document.createElement('a')
    link.download = `filtered-image.png`
    link.href = filteredImage
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
  }

  const reset = () => {
    setImage(null)
    setFilteredImage(null)
    setFilter('none')
    setFilterIntensity(100)
  }

  const filters: { name: string; value: FilterType }[] = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Invert', value: 'invert' },
    { name: 'Brightness', value: 'brightness' },
    { name: 'Contrast', value: 'contrast' },
    { name: 'Saturate', value: 'saturate' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Image Filters</h1>
            <p className="text-gray-900">Apply filters to your images</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
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
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Apply Filters</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Original</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Filtered</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center">
                      {filteredImage ? (
                        <img src={filteredImage} alt="Filtered" className="w-full h-auto max-h-[400px] object-contain" />
                      ) : (
                        <p className="text-gray-400">Select a filter and click "Apply Filter"</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Filter Type
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value as FilterType)
                        setFilteredImage(null)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {filters.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {filter !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Intensity: {filterIntensity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={filterIntensity}
                        onChange={(e) => {
                          setFilterIntensity(Number(e.target.value))
                          setFilteredImage(null)
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  <button
                    onClick={applyFilter}
                    disabled={filter === 'none'}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Apply Filter</span>
                  </button>
                </div>

                {filteredImage && (
                  <button
                    onClick={downloadImage}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Filtered Image</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

