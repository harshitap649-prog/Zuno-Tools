'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Globe, Loader2, Copy, Check, Search, MapPin, Share2, Download, RefreshCw, Shield, Wifi, Server, Clock, X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface IPInfo {
  ip: string
  city: string
  region: string
  country: string
  countryCode: string
  timezone: string
  isp: string
  latitude: number | string
  longitude: number | string
  postal?: string
  currency?: string
  languages?: string
  asn?: string
  org?: string
  reverse?: string
  mobile?: boolean
  proxy?: boolean
  hosting?: boolean
}

export default function IPAddressInfo() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [customIP, setCustomIP] = useState('')
  const [showCustomIP, setShowCustomIP] = useState(false)
  const [ipHistory, setIpHistory] = useState<IPInfo[]>([])
  const [showMap, setShowMap] = useState(false)
  const { triggerPopunder } = usePopunderAd()
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  const normalizeIPData = (source: any, ipFallback: string): IPInfo => {
    return {
      ip: source.ip || source.query || ipFallback,
      city: source.city || source.city_name || 'N/A',
      region: source.region || source.regionName || source.region_code || 'N/A',
      country: source.country || source.country_name || 'N/A',
      countryCode: source.country_code || source.countryCode || 'N/A',
      timezone: source.timezone || source.timezone_name || 'N/A',
      isp: source.org || source.isp || source.connection?.isp || 'N/A',
      latitude: source.latitude ?? source.lat ?? 'N/A',
      longitude: source.longitude ?? source.lon ?? 'N/A',
      postal: source.postal || source.zip || undefined,
      currency: source.currency || source.currency_code || undefined,
      languages: source.languages || undefined,
      asn: source.asn || source.as || source.connection?.asn || undefined,
      org: source.org || source.connection?.org || undefined,
      mobile: source.mobile || source.connection?.mobile || false,
      proxy: source.proxy || source.security?.proxy || false,
      hosting: source.hosting || false,
      reverse: source.reverse || undefined,
    }
  }

  const fetchIPInfo = async (ipAddress?: string) => {
    if (loading) return
    setLoading(true)
    try {
      let ip = ipAddress

      // If no IP provided, get user's own IP
      if (!ip) {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ip = data.ip
      }

      // Validate IP format
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ip || !ipRegex.test(ip)) {
        toast.error('Invalid IP address format')
        setLoading(false)
        return
      }

      // Try multiple APIs for better data
      let info: any = null

      // 1) ipwho.is (reliable, CORS-friendly)
      try {
        const res = await fetch(`https://ipwho.is/${ip}`)
        const data = await res.json()
        if (data && data.success !== false) {
          info = {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country,
            country_code: data.country_code,
            timezone: data.timezone?.id,
            org: data.connection?.org,
            isp: data.connection?.isp,
            latitude: data.latitude,
            longitude: data.longitude,
            postal: data.postal,
            currency: data.currency?.code,
            languages: data.languages?.map((l: any) => l.name).join(', '),
            asn: data.connection?.asn,
            mobile: data.connection?.mobile,
            proxy: data.connection?.proxy,
            hosting: data.connection?.hosting,
          }
        }
      } catch {}

      // 2) ipapi.co fallback
      if (!info) {
        try {
          const infoResponse = await fetch(`https://ipapi.co/${ip}/json/`)
          const data = await infoResponse.json()
          if (!data.error) {
            info = data
          }
        } catch {}
      }

      // 3) ip-api.com fallback
      if (!info) {
        try {
          const fallbackResponse = await fetch(`https://ip-api.com/json/${ip}`)
          const fallbackData = await fallbackResponse.json()
          if (fallbackData && fallbackData.status === 'success') {
            info = fallbackData
          }
        } catch {}
      }

      if (!info) {
        throw new Error('Failed to fetch IP information')
      }

      const ipData = normalizeIPData(info, ip)

      setIpInfo(ipData)

      // Add to history
      if (!ipHistory.find(h => h.ip === ipData.ip)) {
        const updatedHistory = [ipData, ...ipHistory.slice(0, 9)] // Keep last 10
        setIpHistory(updatedHistory)
        localStorage.setItem('ip-lookup-history', JSON.stringify(updatedHistory))
      }
      
      setCustomIP('')
      setShowCustomIP(false)
      toast.success('IP information retrieved!')
      
      // Trigger popunder after successful lookup
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error) {
      console.error('IP fetch error:', error)
      toast.error('Failed to fetch IP information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('ip-lookup-history')
    if (saved) {
      try {
        setIpHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
    // Fetch own IP on mount (guard against unmounted)
    fetchIPInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareIPInfo = async () => {
    if (!ipInfo) return
    
    const text = `IP Address: ${ipInfo.ip}\nLocation: ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}\nISP: ${ipInfo.isp}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IP Address Information',
          text: text,
        })
        toast.success('Shared successfully!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(text)
        }
      }
    } else {
      copyToClipboard(text)
    }
  }

  const exportIPInfo = () => {
    if (!ipInfo) return
    
    const data = {
      ...ipInfo,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ip-info-${ipInfo.ip}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('IP information exported!')
  }

  const openMap = () => {
    if (!ipInfo || ipInfo.latitude === 'N/A' || ipInfo.longitude === 'N/A') {
      toast.error('Location data not available')
      return
    }
    
    const lat = typeof ipInfo.latitude === 'number' ? ipInfo.latitude : parseFloat(ipInfo.latitude as string)
    const lng = typeof ipInfo.longitude === 'number' ? ipInfo.longitude : parseFloat(ipInfo.longitude as string)
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates')
      return
    }
    
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(mapUrl, '_blank')
  }

  const lookupCustomIP = () => {
    if (!customIP.trim()) {
      toast.error('Please enter an IP address')
      return
    }
    fetchIPInfo(customIP.trim())
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 sm:mb-4">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">IP Address Info</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Get detailed information about any IP address</p>
          </div>

          {/* Custom IP Lookup */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={customIP}
                  onChange={(e) => setCustomIP(e.target.value)}
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                  onKeyPress={(e) => e.key === 'Enter' && lookupCustomIP()}
                />
              </div>
              <button
                onClick={lookupCustomIP}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95 disabled:opacity-50"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Lookup IP</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : ipInfo ? (
              <div className="space-y-4 sm:space-y-6">
                {/* IP Address Header */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">IP Address</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-all">{ipInfo.ip}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(ipInfo.ip)}
                        className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-all touch-manipulation active:scale-95"
                        title="Copy IP"
                      >
                        {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-blue-600" />}
                      </button>
                      <button
                        onClick={shareIPInfo}
                        className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-all touch-manipulation active:scale-95"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={exportIPInfo}
                        className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-all touch-manipulation active:scale-95"
                        title="Export"
                      >
                        <Download className="h-5 w-5 text-blue-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Security Indicators */}
                  {(ipInfo.proxy || ipInfo.hosting || ipInfo.mobile) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {ipInfo.proxy && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Proxy/VPN
                        </span>
                      )}
                      {ipInfo.hosting && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          Hosting
                        </span>
                      )}
                      {ipInfo.mobile && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          Mobile
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Location Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">City</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.city}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Region</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.region}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Country</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.country}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Country Code</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.countryCode}</p>
                  </div>
                  {ipInfo.postal && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Postal Code</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.postal}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Timezone</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.timezone}</p>
                  </div>
                </div>

                {/* Network Information */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <Wifi className="h-4 w-4 sm:h-5 sm:w-5" />
                    Network Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">ISP/Organization</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{ipInfo.isp}</p>
                    </div>
                    {ipInfo.asn && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">ASN</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.asn}</p>
                      </div>
                    )}
                    {ipInfo.currency && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Currency</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.currency}</p>
                      </div>
                    )}
                    {ipInfo.languages && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Languages</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.languages}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coordinates */}
                {ipInfo.latitude !== 'N/A' && ipInfo.longitude !== 'N/A' && (
                  <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      Coordinates
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Latitude</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.latitude}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Longitude</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{ipInfo.longitude}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => fetchIPInfo()}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Refresh</span>
                  </button>
                  {ipInfo.latitude !== 'N/A' && ipInfo.longitude !== 'N/A' && (
                    <button
                      onClick={openMap}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>View on Map</span>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-900 mb-4">Failed to load IP information</p>
                <button
                  onClick={() => fetchIPInfo()}
                  className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* IP Lookup History */}
          {ipHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Lookups
                </h3>
                <button
                  onClick={() => {
                    setIpHistory([])
                    localStorage.removeItem('ip-lookup-history')
                    toast.success('History cleared!')
                  }}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ipHistory.map((item, index) => (
                  <div
                    key={`${item.ip}-${index}`}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => fetchIPInfo(item.ip)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{item.ip}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.city}, {item.country}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        fetchIPInfo(item.ip)
                      }}
                      className="px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 touch-manipulation active:scale-95"
                    >
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

