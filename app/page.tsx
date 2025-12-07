'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  // Redirect to /tools page immediately
  useEffect(() => {
    router.replace('/tools')
  }, [router])

  // Return null to prevent rendering homepage content
  return null
}

