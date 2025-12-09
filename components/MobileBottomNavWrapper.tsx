'use client'

import { Suspense } from 'react'
import MobileBottomNav from './MobileBottomNav'

export default function MobileBottomNavWrapper() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNav />
    </Suspense>
  )
}

