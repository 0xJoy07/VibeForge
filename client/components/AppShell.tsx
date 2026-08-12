'use client'

import { useState } from 'react'
import LandingAnimation from '@/components/LandingAnimation'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  return (
    <>
      {!ready && <LandingAnimation onComplete={() => setReady(true)} />}
      <div
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: ready ? 'auto' : 'none',
        }}
      >
        {children}
      </div>
    </>
  )
}
