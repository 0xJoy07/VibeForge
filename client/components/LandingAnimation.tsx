'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface LandingAnimationProps {
  onComplete?: () => void
}

export default function LandingAnimation({ onComplete }: LandingAnimationProps) {
  const [mounted, setMounted] = useState(true)

  // Individual step visibility states
  const [gridVisible, setGridVisible] = useState(false)
  const [scan1Active, setScan1Active] = useState(false)
  const [scan2Active, setScan2Active] = useState(false)
  const [ringsVisible, setRingsVisible] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [wordmarkVisible, setWordmarkVisible] = useState(false)
  const [taglineVisible, setTaglineVisible] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)
  const [chipsVisible, setChipsVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const schedule = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay)
    timers.current.push(t)
  }

  useEffect(() => {
    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      const t = setTimeout(() => {
        setMounted(false)
        onComplete?.()
      }, 600)
      timers.current.push(t)
      return
    }

    // Step 1 — grid fades in (0ms)
    schedule(() => setGridVisible(true), 0)

    // Step 2 — first scan sweep (300ms)
    schedule(() => {
      setScan1Active(true)
      schedule(() => setScan1Active(false), 1100)
    }, 300)

    // Step 3 — rings fade in (650ms)
    schedule(() => setRingsVisible(true), 650)

    // Step 4 — logo scales in (850ms)
    schedule(() => setLogoVisible(true), 850)

    // Step 5 — wordmark slides up (1050ms)
    schedule(() => setWordmarkVisible(true), 1050)

    // Step 6 — tagline slides up (1220ms)
    schedule(() => setTaglineVisible(true), 1220)

    // Step 7 — audio bars appear (1380ms)
    schedule(() => setBarsVisible(true), 1380)

    // Step 8 — second scan sweep (1750ms)
    schedule(() => {
      setScan2Active(true)
      schedule(() => setScan2Active(false), 1100)
    }, 1750)

    // Step 9 — corner chips (1950ms)
    schedule(() => setChipsVisible(true), 1950)

    // Step 10 — fade out (3100ms)
    schedule(() => setFadeOut(true), 3100)

    // Step 11 — unmount (3600ms)
    schedule(() => {
      setMounted(false)
      onComplete?.()
    }, 3600)

    return () => {
      timers.current.forEach(clearTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null

  const barDurations = ['0.38s', '0.44s', '0.35s', '0.50s', '0.41s', '0.46s', '0.39s']
  const barDelays    = ['0s', '0.06s', '0.12s', '0.18s', '0.24s', '0.30s', '0.36s']

  return (
    <>
      <style>{`
        @keyframes vf-pulse-ring {
          0%, 100% { transform: scale(1);    opacity: 0.4; }
          50%       { transform: scale(1.07); opacity: 0.8; }
        }
        @keyframes vf-bar-bounce {
          0%, 100% { height: 6px;  }
          50%       { height: 22px; }
        }
        @keyframes vf-scan {
          from { top: -2px;   }
          to   { top: 100vh;  }
        }
        .vf-scan-line {
          position: fixed;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #22c55e, transparent);
          box-shadow: 0 0 12px 3px rgba(34,197,94,0.35);
          animation: vf-scan 1.1s cubic-bezier(0.4, 0, 0.6, 1) forwards;
          pointer-events: none;
          z-index: 10001;
        }
        .vf-ring {
          position: absolute;
          border-radius: 50%;
          animation: vf-pulse-ring 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Root overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'var(--vf-bg)',
          overflow: 'hidden',
          opacity: fadeOut ? 0 : 1,
          transition: fadeOut ? 'opacity 0.5s ease' : undefined,
          pointerEvents: fadeOut ? 'none' : 'auto',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 55% at 50% 42%, var(--vf-glow-core) 0%, var(--vf-glow-out) 45%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            opacity: gridVisible ? 0.8 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Scan line 1 */}
        {scan1Active && <div className="vf-scan-line" key="scan1" />}

        {/* Scan line 2 */}
        {scan2Active && <div className="vf-scan-line" key="scan2" />}

        {/* Corner chips */}
        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => {
          const text = {
            'top-left':     'vibeforge v2.0',
            'top-right':    'scan.engine / ready',
            'bottom-left':  'security · slop · perf',
            'bottom-right': 'grade: A – F',
          }[pos]

          const style: React.CSSProperties = {
            position: 'absolute',
            fontFamily: 'monospace',
            fontSize: '10px',
            color: 'var(--vf-muted)',
            letterSpacing: '0.06em',
            opacity: chipsVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            whiteSpace: 'nowrap',
            ...(pos === 'top-left'     && { top: 18,    left: 18 }),
            ...(pos === 'top-right'    && { top: 18,    right: 18 }),
            ...(pos === 'bottom-left'  && { bottom: 18, left: 18 }),
            ...(pos === 'bottom-right' && { bottom: 18, right: 18 }),
          }

          return <div key={pos} style={style}>{text}</div>
        })}

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* Logo + pulse rings */}
          <div
            style={{
              position: 'relative',
              width: 96,
              height: 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: logoVisible ? 1 : 0,
              transform: logoVisible ? 'scale(1)' : 'scale(0.72)',
              transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Ring 1 */}
            {ringsVisible && (
              <div
                className="vf-ring"
                style={{
                  inset: -10,
                  border: '1.5px solid rgba(34,197,94,0.25)',
                  animationDuration: '2.4s',
                  animationDelay: '0s',
                }}
              />
            )}

            {/* Ring 2 */}
            {ringsVisible && (
              <div
                className="vf-ring"
                style={{
                  inset: -22,
                  border: '1px solid rgba(34,197,94,0.12)',
                  animationDuration: '2.4s',
                  animationDelay: '0.5s',
                }}
              />
            )}

            {/* Logo image or VF fallback */}
            {!logoError ? (
              <Image
                src="/logo.png"
                alt="VibeForge"
                width={88}
                height={88}
                priority
                onError={() => setLogoError(true)}
                style={{
                  borderRadius: 18,
                  boxShadow: '0 0 0 1px var(--vf-green-dim), 0 0 28px 6px rgba(34,197,94,0.15)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 18,
                  background: 'var(--vf-surface)',
                  border: '1px solid var(--vf-green-dim)',
                  boxShadow: '0 0 0 1px var(--vf-green-dim), 0 0 28px 6px rgba(34,197,94,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--vf-green-lt)',
                  letterSpacing: '-1px',
                }}
              >
                VF
              </div>
            )}
          </div>

          {/* Wordmark */}
          <div
            style={{
              marginTop: 28,
              textAlign: 'center',
              opacity: wordmarkVisible ? 1 : 0,
              transform: wordmarkVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
          >
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: '-1.5px',
                lineHeight: 1,
                color: 'var(--vf-white)',
              }}
            >
              Vibe<span style={{ color: 'var(--vf-green-lt)' }}>Forge</span>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              marginTop: 10,
              opacity: taglineVisible ? 1 : 0,
              transform: taglineVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--vf-muted)',
            }}
          >
            AI-powered codebase scanner
          </div>

          {/* Audio bar visualizer */}
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 5,
              height: 22,
              opacity: barsVisible ? 0.7 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {barDurations.map((dur, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  borderRadius: 2,
                  background: 'var(--vf-green)',
                  animation: barsVisible
                    ? `vf-bar-bounce ${dur} ${barDelays[i]} ease-in-out infinite`
                    : 'none',
                  height: 6,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
