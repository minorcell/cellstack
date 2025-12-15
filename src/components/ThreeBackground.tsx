'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleNet() {
  // Lower particle count to reduce per-frame CPU + GPU work
  const particleCount = 80
  const totalPoints = particleCount * particleCount
  const sep = 0.25

  const pointsRef = useRef<THREE.Points>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  // Global mouse/touch listener to ensure interaction works over text
  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      mouseRef.current = {
        x: (x / window.innerWidth) * 2 - 1,
        y: -(y / window.innerHeight) * 2 + 1,
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        updatePosition(event.touches[0].clientX, event.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const [positions, colors, baseCoords] = useMemo(() => {
    const pos = new Float32Array(totalPoints * 3)
    const cols = new Float32Array(totalPoints * 3)
    const base = new Float32Array(totalPoints * 2) // store x/y to avoid recalculating each frame
    const color = new THREE.Color()

    for (let i = 0; i < particleCount; i++) {
      for (let j = 0; j < particleCount; j++) {
        const index = (i * particleCount + j) * 3
        const baseIndex = (i * particleCount + j) * 2

        const x = (i - particleCount / 2) * sep
        const y = (j - particleCount / 2) * sep
        const z = 0

        pos[index] = x
        pos[index + 1] = y
        pos[index + 2] = z

        base[baseIndex] = x
        base[baseIndex + 1] = y

        const dist = Math.sqrt(x * x + y * y)
        const mix = Math.max(0, 1 - dist / 5)

        color.setHSL(0.6, 0.9, 0.2 + mix * 0.2)

        cols[index] = color.r
        cols[index + 1] = color.g
        cols[index + 2] = color.b
      }
    }
    return [pos, cols, base]
  }, [particleCount, sep, totalPoints])
  const baseCoordsRef = useRef(baseCoords)

  useFrame((state) => {
    const { clock, viewport } = state
    const time = clock.getElapsedTime()

    if (pointsRef.current) {
      // Smooth rotation recovery to initial angle (0,0,0)
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        0,
        0.05,
      )
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        0,
        0.05,
      )

      const positions = pointsRef.current.geometry.attributes.position
        .array as Float32Array

      // Use global mouse ref and convert to world coordinates
      const mouseX = (mouseRef.current.x * viewport.width) / 2
      const mouseY = (mouseRef.current.y * viewport.height) / 2

      const base = baseCoordsRef.current

      // Pre-calculate values used in loop
      const timeFactor1 = time * 0.8
      const timeFactor2 = time * 0.6
      const interactionRadius = 4.0
      const interactionRadiusSq = interactionRadius * interactionRadius

      for (let idx = 0; idx < totalPoints; idx++) {
        const positionIndex = idx * 3
        const baseIndex = idx * 2

        const x = base[baseIndex]
        const y = base[baseIndex + 1]

        // Base wave motion
        let z =
          Math.sin(x * 0.6 + timeFactor1) *
          Math.cos(y * 0.6 + timeFactor2) *
          0.8

        // Mouse interaction: calculate distance to mouse
        const dx = x - mouseX
        const dy = y - mouseY
        const distSq = dx * dx + dy * dy

        // Only apply interaction if within radius (using squared distance to avoid sqrt)
        if (distSq < interactionRadiusSq) {
          // Gaussian decay function for smooth bump
          const strength = 2.5 * Math.exp(-distSq / 3.0) // sigma^2 = 1.5
          z += strength
        }

        positions[positionIndex + 2] = z
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        vertexColors
        size={0.06} // 显著增加粒子大小 (0.035 -> 0.06)
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.9}
        // Removed AdditiveBlending to make it visible on white background
      />
    </Points>
  )
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-white overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
        eventSource={typeof window !== 'undefined' ? document.body : undefined}
      >
        <ParticleNet />
      </Canvas>

      {/* Gradients for all 4 sides */}
      <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-white to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-32 h-full bg-linear-to-r from-white to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-white to-transparent pointer-events-none"></div>
    </div>
  )
}
