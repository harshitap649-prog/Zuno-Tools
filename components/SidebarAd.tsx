'use client'

// Component completely disabled - all 160x600 sidebar ads removed
// This component now returns null to prevent any rendering
export default function SidebarAd({ position, adKey }: { position: 'left' | 'right', adKey: string }) {
  return null
}
