'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Globe, Loader2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IPAddressInfo() {
  const [ipInfo, setIpInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchIPInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      const ip = data.ip

      // Get more detailed info
      const infoResponse = await fetch(`https://ipapi.co/${ip}/json/`)
      const info = await infoResponse.json()

      setIpInfo({
        ip: ip,
        city: info.city || 'N/A',
        region: info.region || 'N/A',
        country: info.country_name || 'N/A',
        countryCode: info.country_code || 'N/A',
        timezone: info.timezone || 'N/A',
        isp: info.org || 'N/A',
        latitude: info.latitude || 'N/A',
        longitude: info.longitude || 'N/A',
      })
      toast.success('IP information retrieved!')
    } catch (error) {
      console.error('IP fetch error:', error)
      toast.error('Failed to fetch IP information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIPInfo()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">IP Address Info</h1>
            <p className="text-gray-900">Get information about your IP address</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              </div>
            ) : ipInfo ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Your IP Address</p>
                      <p className="text-3xl font-bold text-gray-900">{ipInfo.ip}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ipInfo.ip)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">City</p>
                    <p className="text-lg font-semibold text-gray-900">{ipInfo.city}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">Region</p>
                    <p className="text-lg font-semibold text-gray-900">{ipInfo.region}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">Country</p>
                    <p className="text-lg font-semibold text-gray-900">{ipInfo.country}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">Country Code</p>
                    <p className="text-lg font-semibold text-gray-900">{ipInfo.countryCode}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">Timezone</p>
                    <p className="text-lg font-semibold text-gray-900">{ipInfo.timezone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">ISP/Organization</p>
                    <p className="text-lg font-semibold text-gray-900">{ipInfo.isp}</p>
                  </div>
                  {ipInfo.latitude !== 'N/A' && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 mb-1">Latitude</p>
                        <p className="text-lg font-semibold text-gray-900">{ipInfo.latitude}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 mb-1">Longitude</p>
                        <p className="text-lg font-semibold text-gray-900">{ipInfo.longitude}</p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={fetchIPInfo}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Globe className="h-5 w-5" />
                  <span>Refresh IP Info</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-900">Failed to load IP information</p>
                <button
                  onClick={fetchIPInfo}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

