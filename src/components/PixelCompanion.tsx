'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Position {
  x: number
  y: number
}

interface Velocity {
  x: number
  y: number
}

interface Platform {
  x: number
  y: number
  width: number
  height: number
  id: string
  type: 'box' | 'ground' | 'element'
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface JumpTrajectory {
  startX: number
  startY: number
  vx: number
  vy: number
  landingX: number
  landingY: number
  canReach: boolean
}

const messages = [
  '嗨，你好！',
  '随便逛逛吧，别客气。',
  '看到感兴趣的文章就点进去看看。',
  '有什么想法可以留言讨论。',
  '写代码嘛，开心最重要。',
  'Bug 什么的，写了就有，修了就好。',
  '今天也要好好写代码哦！',
  '累了就休息，别硬撑。',
  '这个博客是我用业余时间写的，可能有不完善的地方。',
  '有什么建议欢迎告诉我！',
]

// Physics constants
const GRAVITY = 0.5
const JUMP_FORCE = -11
const MOVE_SPEED = 1.2
const MAX_SPEED = 5
const MAX_FALL_SPEED = 8
const FRICTION = 0.92
const AIR_RESISTANCE = 0.98
const COMPANION_SIZE = 32
const COMPANION_RADIUS = 16
const HITBOX_RADIUS = 12 // Actual collision radius (smaller than visual 16)
const HITBOX_OFFSET_Y = 2 // Sprite is slightly above center

// Behavior constants
const MOUSE_TIMEOUT = 2000
const MAX_JUMP_ATTEMPTS = 3
const GROUND_BUFFER = 3 // Allow landing slightly below platform top
const IDLE_COOLDOWN = 2500 // Minimum time between actions (ms)

export function PixelCompanion() {
  // Position & Physics
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 })
  const velocityRef = useRef<Velocity>({ x: 0, y: 0 })
  const positionRef = useRef<Position>({ x: 100, y: 100 })
  
  // State
  const [isMoving, setIsMoving] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [showMessage, setShowMessage] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(messages[0])
  const [isVisible, setIsVisible] = useState(true)
  const [isGrounded, setIsGrounded] = useState(false)
  const [state, setState] = useState<'following' | 'idle' | 'falling' | 'walking' | 'planning' | 'at_top'>('following')
  const [targetPlatform, setTargetPlatform] = useState<Platform | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [debugTrajectory, setDebugTrajectory] = useState<JumpTrajectory | null>(null)
  
  // AI State
  const jumpAttemptsRef = useRef(0)
  const currentPlatformRef = useRef<Platform | null>(null)
  const plannedJumpRef = useRef<JumpTrajectory | null>(null)
  
  // Refs
  const platformsRef = useRef<Platform[]>([])
  const mousePosRef = useRef<Position>({ x: 0, y: 0 })
  const lastMouseMoveRef = useRef<number>(Date.now())
  const frameRef = useRef<number | null>(null)
  const particleIdRef = useRef(0)
  const lastActionTimeRef = useRef<number>(0) // Track when we last jumped/moved
  const hasReachedTopRef = useRef<boolean>(false) // Track if reached top
  const topmostYRef = useRef<number>(100) // Dynamic topmost platform Y position
  const headerElementRef = useRef<HTMLElement | null>(null) // Reference to header element

  // ============================================
  // PLATFORM DETECTION
  // ============================================
  
  const isElementVisible = (el: Element, rect: DOMRect): boolean => {
    // Must have actual size
    if (rect.width <= 0 || rect.height <= 0) return false
    
    // Must be in viewport (at least partially visible)
    const inViewport = !(
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > window.innerWidth
    )
    if (!inViewport) return false
    
    const style = window.getComputedStyle(el)
    
    // Basic visibility checks
    if (style.display === 'none') return false
    if (style.visibility === 'hidden' || style.visibility === 'collapse') return false
    if (parseFloat(style.opacity) < 0.1) return false
    
    // Must have actual background or content to be a valid platform
    // Skip elements that are just transparent containers
    const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                          style.backgroundColor !== 'transparent'
    const hasBorder = parseFloat(style.borderTopWidth) > 0 ||
                      parseFloat(style.borderBottomWidth) > 0 ||
                      parseFloat(style.borderLeftWidth) > 0 ||
                      parseFloat(style.borderRightWidth) > 0
    const hasBoxShadow = style.boxShadow !== 'none'
    
    // For interactive elements, always consider them visible
    const isInteractive = el.tagName === 'BUTTON' || 
                          el.tagName === 'A' || 
                          el.tagName === 'INPUT' ||
                          el.tagName === 'TEXTAREA'
    
    // For images, check if loaded
    if (el.tagName === 'IMG') {
      const img = el as HTMLImageElement
      if (!img.complete || img.naturalWidth === 0) return false
    }
    
    // Must have some visual presence or be interactive
    return hasBackground || hasBorder || hasBoxShadow || isInteractive
  }
  
  const scanPlatforms = useCallback(() => {
    const platforms: Platform[] = []
    const seenPositions = new Set<string>()
    
    // Helper to add platform with deduplication
    const addPlatform = (x: number, y: number, width: number, height: number, id: string, type: 'box' | 'ground' | 'element') => {
      // Round position for deduplication
      const key = `${Math.round(x / 20)},${Math.round(y / 20)}`
      if (seenPositions.has(key)) return
      seenPositions.add(key)
      
      platforms.push({ x, y, width, height, id, type })
    }
    
    // 1. Data-platform elements (explicitly marked)
    document.querySelectorAll('[data-platform]').forEach((el, i) => {
      const rect = el.getBoundingClientRect()
      if (isElementVisible(el, rect) && rect.width > 30 && rect.height > 15) {
        addPlatform(rect.left, rect.top, rect.width, rect.height, `platform-${i}`, 'box')
      }
    })
    
    // 2. Comprehensive element selectors
    const selectors = [
      // Interactive elements (more inclusive - all links not just with href)
      'button', 'a', 'a[href]', 'input', 'textarea', 'select',
      // Layout containers  
      'header', 'nav', 'footer', 'aside', 'main', 'article', 'section',
      // Content elements - all headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Text elements
      'p', 'span',
      'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'dl', 'dt', 'dd',
      'strong', 'em', 'b', 'i', 'mark', 'small', 'sub', 'sup',
      // Media
      'img', 'figure', 'figcaption', 'video', 'audio',
      // Tables
      'table', 'tr', 'td', 'th',
      // Form
      'form', 'fieldset', 'legend', 'label',
      // Common class patterns
      '.pixel-border', '.pixel-card',
      '[class*="card"]', '[class*="box"]', 
      '[class*="button"]', '[class*="btn"]',
      '[class*="title"]', '[class*="heading"]', '[class*="header"]',
      '[class*="text"]', '[class*="content"]', '[class*="body"]',
      '[class*="post"]', '[class*="item"]', '[class*="entry"]',
      '[class*="tag"]', '[class*="badge"]', '[class*="pill"]',
      '[class*="nav"]', '[class*="menu"]', '[class*="sidebar"]',
      '[class*="widget"]', '[class*="block"]', '[class*="panel"]',
      '[class*="container"]', '[class*="wrapper"]', '[class*="inner"]',
      // Divs with specific styling (added last as catch-all)
      'div[class*="bg-"]', 'div[style*="background"]',
    ]
    
    selectors.forEach((selector, selectorIdx) => {
      document.querySelectorAll(selector).forEach((el, elIdx) => {
        const rect = el.getBoundingClientRect()
        
        // Skip if not visible in DOM sense
        if (!isElementVisible(el, rect)) return
        
        // Size thresholds - be more inclusive
        // Text elements can be smaller
        const isTextElement = ['P', 'SPAN', 'LI', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'EM', 'B', 'I', 'MARK', 'SMALL'].includes(el.tagName)
        const minWidth = isTextElement ? 15 : 30
        const minHeight = isTextElement ? 8 : 15
        const maxWidth = window.innerWidth * 0.95
        
        if (rect.width < minWidth || rect.height < minHeight) return
        if (rect.width > maxWidth) return
        
        // Skip if would completely cover another platform (full overlap)
        const hasFullOverlap = platforms.some(p => 
          rect.left >= p.x - 5 &&
          rect.right <= p.x + p.width + 5 &&
          rect.top >= p.y - 5 &&
          rect.bottom <= p.y + p.height + 5
        )
        if (hasFullOverlap) return
        
        addPlatform(
          rect.left, 
          rect.top, 
          rect.width, 
          rect.height, 
          `${selector.replace(/[^a-zA-Z0-9]/g, '')}-${selectorIdx}-${elIdx}`,
          'element'
        )
      })
    })
    
    // 3. Screen floor (always add)
    addPlatform(0, window.innerHeight - 10, window.innerWidth, 10, 'floor', 'ground')
    
    // 4. Explicit header platforms if header exists
    const header = document.querySelector('header')
    headerElementRef.current = header as HTMLElement
    if (header) {
      const rect = header.getBoundingClientRect()
      if (isElementVisible(header, rect)) {
        // Header top as a platform (can land on it)
        addPlatform(rect.left, rect.top, rect.width, 5, 'header-top', 'ground')
        // Header bottom as platform too  
        addPlatform(rect.left, rect.bottom, rect.width, 5, 'header-bottom', 'ground')
      }
    }
    
    // 5. Text line detection - create platforms on text lines
    // This allows landing on actual text content
    const isTextParentVisible = (el: Element): boolean => {
      const rect = el.getBoundingClientRect()
      // Must have size
      if (rect.width <= 0 || rect.height <= 0) return false
      // Must be in viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) return false
      
      const style = window.getComputedStyle(el)
      // Basic visibility only - don't require background/border for text
      if (style.display === 'none') return false
      if (style.visibility === 'hidden' || style.visibility === 'collapse') return false
      if (parseFloat(style.opacity) < 0.1) return false
      
      return true
    }
    
    const textWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Only accept text nodes with actual content
          const text = node.textContent?.trim()
          if (!text || text.length < 2) return NodeFilter.FILTER_REJECT
          
          // Check parent is visible (looser check for text)
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          
          if (!isTextParentVisible(parent)) return NodeFilter.FILTER_REJECT
          
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )
    
    const textRanges: { x: number; y: number; width: number; height: number }[] = []
    let textNode: Node | null
    
    while (textNode = textWalker.nextNode()) {
      const range = document.createRange()
      const text = textNode.textContent || ''
      
      // Sample the text at intervals to get line positions
      // Sample every few characters instead of every word for performance
      const sampleInterval = Math.max(10, Math.floor(text.length / 3))
      
      for (let i = 0; i < text.length; i += sampleInterval) {
        const endIndex = Math.min(i + 5, text.length)
        
        try {
          range.setStart(textNode, i)
          range.setEnd(textNode, endIndex)
          
          const rects = range.getClientRects()
          for (let j = 0; j < rects.length; j++) {
            const rect = rects[j]
            // Text lines need reasonable size
            if (rect.width >= 20 && rect.height >= 10 && rect.height <= 50) {
              // Round position for deduplication
              const roundedX = Math.round(rect.left / 15) * 15
              const roundedY = Math.round(rect.top / 5) * 5
              
              const isDuplicate = textRanges.some(r => 
                Math.abs(r.x - roundedX) < 15 && Math.abs(r.y - roundedY) < 5
              )
              if (!isDuplicate && textRanges.length < 100) { // Limit to 100 text platforms
                textRanges.push({
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height
                })
              }
            }
          }
        } catch { }
      }
    }
    
    // Add text lines as platforms
    textRanges.forEach((r, i) => {
      addPlatform(r.x, r.y, r.width, r.height, `text-${i}`, 'element')
    })
    
    // 6. Add some strategic edge points for better navigation
    // Left and right screen edges at various heights
    for (let y = 100; y < window.innerHeight - 100; y += 150) {
      addPlatform(0, y, 20, 5, `edge-left-${y}`, 'ground')
      addPlatform(window.innerWidth - 20, y, 20, 5, `edge-right-${y}`, 'ground')
    }
    
    // Find the topmost platform (highest point) - excluding floor and edges
    let minY = window.innerHeight
    for (const p of platforms) {
      if (p.id !== 'floor' && !p.id.startsWith('edge-') && p.y < minY && p.y > 10) {
        minY = p.y
      }
    }
    if (minY < window.innerHeight) {
      topmostYRef.current = minY
    }
    
    platformsRef.current = platforms
  }, [])

  // ============================================
  // COLLISION DETECTION
  // ============================================
  
  const checkCollision = useCallback((pos: Position): { 
    platform: Platform | null, 
    onTop: boolean, 
    groundY: number 
  } => {
    // Use smaller hitbox for more precise collision
    const hitboxBottom = pos.y + HITBOX_RADIUS + HITBOX_OFFSET_Y
    
    for (const platform of platformsRef.current) {
      // Horizontal overlap check - using smaller radius
      const horizontalOverlap = (
        pos.x + HITBOX_RADIUS > platform.x &&
        pos.x - HITBOX_RADIUS < platform.x + platform.width
      )
      
      if (!horizontalOverlap) continue
      
      // Vertical collision - landing on top
      const platformTop = platform.y
      const distanceToTop = hitboxBottom - platformTop
      
      // Landing conditions:
      // 1. Within buffer distance below platform
      // 2. Within reasonable distance above platform  
      // 3. Moving downward or nearly stopped
      // Note: Allow larger buffer for thin text lines
      const isThinPlatform = platform.height < 15
      const buffer = isThinPlatform ? GROUND_BUFFER + 8 : GROUND_BUFFER + 3
      
      if (
        distanceToTop >= -10 && 
        distanceToTop <= buffer &&
        velocityRef.current.y >= -3
      ) {
        return { 
          platform, 
          onTop: true, 
          groundY: platformTop - HITBOX_OFFSET_Y // Adjust for offset
        }
      }
    }
    
    return { platform: null, onTop: false, groundY: 0 }
  }, [])

  // ============================================
  // JUMP TRAJECTORY SIMULATION
  // ============================================
  
  const simulateJump = useCallback((
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): JumpTrajectory | null => {
    // Try different initial velocities to find a valid trajectory
    const vxOptions = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
    
    for (const vx of vxOptions) {
      // Calculate required initial vy to reach target height
      // Using: y = y0 + vy*t + 0.5*g*t^2
      // At peak: vy + g*t = 0 => t = -vy/g
      // y_max = y0 + vy*(-vy/g) + 0.5*g*(vy/g)^2 = y0 - vy^2/(2g)
      
      const dy = targetY - startY
      const dx = targetX - startX
      
      // Time to reach target x (if moving horizontally)
      let timeToTarget: number
      if (Math.abs(vx) < 0.1) {
        if (Math.abs(dx) > 20) continue // Can't reach horizontally
        timeToTarget = 10 // Just go straight up
      } else {
        timeToTarget = dx / vx
        if (timeToTarget < 5 || timeToTarget > 60) continue // Too fast or too slow
      }
      
      // Calculate required vy
      // y = y0 + vy*t + 0.5*g*t^2
      // vy = (y - y0 - 0.5*g*t^2) / t
      const vy = (dy - 0.5 * GRAVITY * timeToTarget * timeToTarget) / timeToTarget
      
      // Check if jump force is reasonable
      if (vy < JUMP_FORCE * 1.5 || vy > 2) continue // Too high or need to fall
      
      // Simulate the trajectory
      let simX = startX
      let simY = startY
      let simVx = vx
      let simVy = vy
      let landed = false
      let landingX = 0
      let landingY = 0
      
      for (let step = 0; step < 120; step++) {
        simX += simVx
        simY += simVy
        simVy += GRAVITY
        
        // Check if we hit any platform
        for (const platform of platformsRef.current) {
          if (platform.id === 'floor' && simY < window.innerHeight - 100) continue
          
          // Check landing on platform (with larger tolerance for thin text lines)
          const isThinPlatform = platform.height < 15
          const verticalTolerance = isThinPlatform ? 15 : 10
          const onPlatform = (
            simX + HITBOX_RADIUS > platform.x &&
            simX - HITBOX_RADIUS < platform.x + platform.width &&
            simY + HITBOX_RADIUS + HITBOX_OFFSET_Y >= platform.y - verticalTolerance &&
            simY + HITBOX_RADIUS + HITBOX_OFFSET_Y <= platform.y + verticalTolerance &&
            simVy >= -1 // Allow slightly upward velocity for thin platforms
          )
          
          if (onPlatform) {
            // Check if this is close to our target
            const distToTarget = Math.sqrt(
              (simX - targetX) ** 2 + (platform.y - targetY) ** 2
            )
            
            if (distToTarget < 80) {
              landed = true
              landingX = simX
              landingY = platform.y
            }
            break
          }
        }
        
        if (landed) break
        
        // Check if fell off screen
        if (simY > window.innerHeight + 50) break
      }
      
      if (landed) {
        return {
          startX,
          startY,
          vx,
          vy,
          landingX,
          landingY,
          canReach: true
        }
      }
    }
    
    return null
  }, [])

  // ============================================
  // PATHFINDING
  // ============================================
  
  const findReachablePlatforms = useCallback((fromPos: Position): Platform[] => {
    const reachable: Platform[] = []
    
    for (const platform of platformsRef.current) {
      if (platform.id === 'floor') continue
      
      // Check if platform is in reasonable range
      const centerX = platform.x + platform.width / 2
      const dx = Math.abs(centerX - fromPos.x)
      const dy = Math.abs(platform.y - (fromPos.y - HITBOX_RADIUS - HITBOX_OFFSET_Y))
      
      // Maximum jump range
      if (dx > 300 || dy > 200) continue
      
      // Check if we can actually jump there
      const trajectory = simulateJump(
        fromPos.x,
        fromPos.y - HITBOX_RADIUS - HITBOX_OFFSET_Y,
        centerX,
        platform.y
      )
      
      if (trajectory) {
        reachable.push(platform)
      }
    }
    
    return reachable
  }, [simulateJump])

  const findBestNextPlatform = useCallback((fromPos: Position): { platform: Platform | null, trajectory: JumpTrajectory | null } => {
    let bestPlatform: Platform | null = null
    let bestTrajectory: JumpTrajectory | null = null
    let bestScore = -Infinity
    
    const reachable = findReachablePlatforms(fromPos)
    
    for (const platform of reachable) {
      const centerX = platform.x + platform.width / 2
      const trajectory = simulateJump(
        fromPos.x,
        fromPos.y - COMPANION_RADIUS,
        centerX,
        platform.y
      )
      
      if (!trajectory) continue
      
      // Score based on:
      // 1. Higher is better (prioritize upward movement until reaching top)
      // 2. Horizontal distance (prefer closer)
      // 3. Trajectory efficiency
      const dx = Math.abs(centerX - fromPos.x)
      const dy = platform.y - (fromPos.y - HITBOX_RADIUS - HITBOX_OFFSET_Y) // negative means upward
      const landingError = Math.abs(trajectory.landingX - centerX)
      
      // Strong preference for higher platforms (lower y value)
      // Until we reach the top, we always want to go up
      const heightBonus = dy < 0 ? Math.abs(dy) * 2 : -dy * 3 // Much higher score for upward platforms
      
      const score = heightBonus - dx * 0.3 - Math.abs(trajectory.vy) * 0.5 - landingError * 0.2
      
      if (score > bestScore) {
        bestScore = score
        bestPlatform = platform
        bestTrajectory = trajectory
      }
    }
    
    return { platform: bestPlatform, trajectory: bestTrajectory }
  }, [findReachablePlatforms, simulateJump])

  // ============================================
  // EFFECTS & VISUALS
  // ============================================
  
  const spawnDust = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: x + (Math.random() - 0.5) * 20,
        y: y + HITBOX_RADIUS + HITBOX_OFFSET_Y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        life: 30,
        color: Math.random() > 0.5 ? 'var(--pixel-purple)' : 'var(--pixel-cyan)',
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [])

  // ============================================
  // PHYSICS UPDATE
  // ============================================
  
  const updatePhysics = useCallback(() => {
    const now = Date.now()
    const timeSinceMouseMove = now - lastMouseMoveRef.current
    
    // State transitions
    if (state === 'following' && timeSinceMouseMove > MOUSE_TIMEOUT) {
      setState('idle')
      plannedJumpRef.current = null
    }
    
    // Following state
    if (state === 'following') {
      const dx = mousePosRef.current.x - positionRef.current.x
      const dy = mousePosRef.current.y - positionRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist > 80) {
        velocityRef.current.x += (dx / dist) * 0.3
        velocityRef.current.y += (dy / dist) * 0.3
        setIsMoving(true)
      } else {
        velocityRef.current.x *= 0.9
        velocityRef.current.y *= 0.9
        if (Math.abs(velocityRef.current.x) < 0.5 && Math.abs(velocityRef.current.y) < 0.5) {
          setIsMoving(false)
        }
      }
      
      velocityRef.current.x *= AIR_RESISTANCE
      velocityRef.current.y *= AIR_RESISTANCE
      
      if (Math.abs(dx) > 5) {
        setDirection(dx > 0 ? 'right' : 'left')
      }
    }
    
    // Idle state - plan next move
    if (state === 'idle') {
      const collision = checkCollision(positionRef.current)
      const timeSinceLastAction = now - lastActionTimeRef.current
      const currentY = positionRef.current.y
      
      // Check if we're inside header element
      const isInsideHeader = headerElementRef.current && (
        currentY >= headerElementRef.current.getBoundingClientRect().top - 10 &&
        currentY <= headerElementRef.current.getBoundingClientRect().bottom + 10
      )
      
      // Check if we've reached the topmost platform
      // If at or near the top, OR inside header, enter at_top state to prevent further upward jumps
      const isAtTop = currentY <= topmostYRef.current + 30 || isInsideHeader
      
      if (isAtTop) {
        hasReachedTopRef.current = true
        setState('at_top')
      } else if (!collision.onTop) {
        setState('falling')
      } else {
        currentPlatformRef.current = collision.platform
        
        // Check cooldown before taking action
        if (timeSinceLastAction > IDLE_COOLDOWN) {
          // Find best platform to jump to (always prefer higher ones)
          const { platform, trajectory } = findBestNextPlatform(positionRef.current)
          
          // Only jump if there's a higher platform available (and we're not at top)
          if (platform && trajectory && platform.y < currentY - 20 && Math.random() > 0.2) {
            setTargetPlatform(platform)
            plannedJumpRef.current = trajectory
            setDebugTrajectory(trajectory)
            setState('planning')
            jumpAttemptsRef.current = 0
            lastActionTimeRef.current = now
          } else {
            // Just walk around on current platform
            setIsMoving(false)
            velocityRef.current.x *= 0.5
            
            // Small chance to jump randomly if stuck
            if (Math.random() > 0.98 && isGrounded) {
              const walkDir = Math.random() > 0.5 ? 1 : -1
              velocityRef.current.y = JUMP_FORCE * 0.7
              velocityRef.current.x = walkDir * 2
              setState('falling')
              lastActionTimeRef.current = now
            }
          }
        } else {
          // Still in cooldown, just idle
          setIsMoving(false)
          velocityRef.current.x *= 0.9
        }
      }
    }
    
    // At top state - can only walk left/right, no jumping
    if (state === 'at_top') {
      const collision = checkCollision(positionRef.current)
      const currentY = positionRef.current.y
      
      // Check if still in header area
      const stillInHeader = headerElementRef.current && (
        currentY >= headerElementRef.current.getBoundingClientRect().top - 10 &&
        currentY <= headerElementRef.current.getBoundingClientRect().bottom + 10
      )
      
      // If we fall off but are still near the top or in header, try to land back
      if (!collision.onTop) {
        // Check if we're still near top or in header (might be falling onto another element)
        if (currentY <= topmostYRef.current + 50 || stillInHeader) {
          // Allow falling to find another platform at top level
          setState('falling')
        } else {
          // Fell too far or out of header, reset top status
          hasReachedTopRef.current = false
          setState('falling')
        }
      } else {
        currentPlatformRef.current = collision.platform
        
        // Just walk back and forth on the top platform
        setIsMoving(true)
        
        // Simple back and forth movement
        if (positionRef.current.x < 100) {
          setDirection('right')
          velocityRef.current.x = MOVE_SPEED
        } else if (positionRef.current.x > window.innerWidth - 100) {
          setDirection('left')
          velocityRef.current.x = -MOVE_SPEED
        } else {
          // Continue in current direction with some randomness
          if (Math.random() > 0.98) {
            setDirection(d => d === 'right' ? 'left' : 'right')
          }
          velocityRef.current.x = direction === 'right' ? MOVE_SPEED : -MOVE_SPEED
        }
        
        velocityRef.current.x *= FRICTION
      }
    }
    
    // Planning state - move to optimal jump position
    if (state === 'planning' && plannedJumpRef.current) {
      const trajectory = plannedJumpRef.current
      const dx = trajectory.startX - positionRef.current.x
      
      if (Math.abs(dx) > 5) {
        // Move towards optimal jump position
        velocityRef.current.x += (dx > 0 ? 1 : -1) * 0.2
        setDirection(dx > 0 ? 'right' : 'left')
        setIsMoving(true)
      } else {
        // At optimal position, execute jump
        velocityRef.current.x = trajectory.vx
        velocityRef.current.y = trajectory.vy
        setState('falling')
        setIsGrounded(false)
      }
    }
    
    // Falling/Walking state
    if (state === 'falling' || state === 'walking') {
      velocityRef.current.y += GRAVITY
      velocityRef.current.y = Math.min(velocityRef.current.y, MAX_FALL_SPEED)
      
      const collision = checkCollision(positionRef.current)
      
      if (collision.onTop && velocityRef.current.y >= 0) {
        // Landed!
        velocityRef.current.y = 0
        positionRef.current.y = collision.groundY - HITBOX_RADIUS - HITBOX_OFFSET_Y + 1
        setIsGrounded(true)
        currentPlatformRef.current = collision.platform
        
        spawnDust(positionRef.current.x, positionRef.current.y)
        
        // Check if we reached top or landed in header after landing
        const landedInHeader = headerElementRef.current && (
          positionRef.current.y >= headerElementRef.current.getBoundingClientRect().top - 10 &&
          positionRef.current.y <= headerElementRef.current.getBoundingClientRect().bottom + 10
        )
        
        if (positionRef.current.y <= topmostYRef.current + 30 || landedInHeader) {
          hasReachedTopRef.current = true
          setState('at_top')
        } else {
          hasReachedTopRef.current = false
          setState('idle')
        }
        
        plannedJumpRef.current = null
        setDebugTrajectory(null)
        lastActionTimeRef.current = Date.now()
      } else {
        setIsGrounded(false)
        setIsMoving(true)
      }
    }
    
    // Limit velocity
    velocityRef.current.x = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velocityRef.current.x))
    
    // Update position
    positionRef.current.x += velocityRef.current.x
    positionRef.current.y += velocityRef.current.y
    
    // Screen boundaries
    if (positionRef.current.x < 20) {
      positionRef.current.x = 20
      velocityRef.current.x *= -0.5
    }
    if (positionRef.current.x > window.innerWidth - 20) {
      positionRef.current.x = window.innerWidth - 20
      velocityRef.current.x *= -0.5
    }
    // Only prevent going completely off-screen top (allow jumping to header)
    if (positionRef.current.y < 0) {
      positionRef.current.y = 0
      velocityRef.current.y = Math.max(0, velocityRef.current.y)
    }
    if (positionRef.current.y > window.innerHeight - 10) {
      positionRef.current.y = window.innerHeight - 10
      velocityRef.current.y = 0
      setIsGrounded(true)
      setState('idle')
    }
    
    setPosition({ ...positionRef.current })
  }, [state, isGrounded, checkCollision, findBestNextPlatform, spawnDust])

  // ============================================
  // LIFECYCLE
  // ============================================
  
  useEffect(() => {
    const animate = () => {
      updatePhysics()
      
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            life: p.life - 1,
          }))
          .filter(p => p.life > 0)
      )
      
      frameRef.current = requestAnimationFrame(animate)
    }
    
    frameRef.current = requestAnimationFrame(animate)
    
    const scanInterval = setInterval(scanPlatforms, 1500)
    scanPlatforms()
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      clearInterval(scanInterval)
    }
  }, [updatePhysics, scanPlatforms])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
      lastMouseMoveRef.current = Date.now()
      
      // If at top and mouse moves, reset to allow jumping again
      if (state === 'at_top') {
        hasReachedTopRef.current = false
        setState('following')
        setTargetPlatform(null)
        plannedJumpRef.current = null
      } else if (state !== 'following') {
        setState('following')
        setTargetPlatform(null)
        plannedJumpRef.current = null
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [state])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && state !== 'following') {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        setCurrentMessage(randomMessage)
        setShowMessage(true)
        setTimeout(() => setShowMessage(false), 4000)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [state])

  const handleClick = useCallback(() => {
    velocityRef.current.y = JUMP_FORCE * 0.9
    velocityRef.current.x = (Math.random() - 0.5) * 4
    setState('falling')
    setIsGrounded(false)
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    setCurrentMessage(randomMessage)
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 4000)
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsVisible(window.innerWidth > 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-[9996]"
          style={{
            left: p.x,
            top: p.y,
            width: 4,
            height: 4,
            backgroundColor: p.color,
            opacity: p.life / 30,
          }}
        />
      ))}

      {/* Debug Trajectory */}
      {debugTrajectory && state === 'planning' && (
        <svg
          className="fixed inset-0 pointer-events-none z-[9995]"
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1={debugTrajectory.startX}
            y1={debugTrajectory.startY + COMPANION_RADIUS}
            x2={debugTrajectory.landingX}
            y2={debugTrajectory.landingY}
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <circle
            cx={debugTrajectory.landingX}
            cy={debugTrajectory.landingY}
            r="6"
            fill="#059669"
            opacity="0.5"
          />
        </svg>
      )}

      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-[9998] pointer-events-none"
            style={{
              left: position.x + (direction === 'right' ? 40 : -200),
              top: position.y - 70,
              width: 180,
            }}
          >
            <div className="pixel-border bg-white p-3 shadow-lg">
              <p className="font-pixel text-[8px] text-[var(--pixel-dark)] leading-relaxed">
                {currentMessage}
              </p>
            </div>
            <div
              className="absolute bottom-[-8px] w-0 h-0"
              style={{
                left: direction === 'right' ? '20px' : 'auto',
                right: direction === 'left' ? '20px' : 'auto',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid var(--pixel-purple)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion */}
      <motion.div
        className="fixed z-[9997] cursor-pointer"
        style={{
          left: position.x - COMPANION_RADIUS,
          top: position.y - COMPANION_RADIUS,
          width: COMPANION_SIZE,
          height: COMPANION_SIZE,
        }}
        onClick={handleClick}
        animate={{
          scaleY: isMoving ? [1, 0.9, 1] : 1,
          rotate: state === 'falling' && !isGrounded ? (direction === 'right' ? 12 : -12) : 0,
        }}
        transition={{
          scaleY: { duration: 0.15, repeat: isMoving ? Infinity : 0 },
          rotate: { duration: 0.3 },
        }}
      >
        <div
          className="relative"
          style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 16 16"
            className="drop-shadow-md"
          >
            {/* Body */}
            <rect x="4" y="2" width="8" height="10" fill="#059669" />
            <rect x="3" y="3" width="1" height="8" fill="#059669" />
            <rect x="12" y="3" width="1" height="8" fill="#059669" />
            <rect x="2" y="5" width="1" height="5" fill="#059669" />
            <rect x="13" y="5" width="1" height="5" fill="#059669" />
            
            {/* Bottom */}
            {isMoving && isGrounded ? (
              <>
                <rect x="2" y="11" width="2" height="1" fill="#059669" />
                <rect x="6" y="12" width="2" height="1" fill="#059669" />
                <rect x="10" y="11" width="2" height="1" fill="#059669" />
              </>
            ) : (
              <>
                <rect x="3" y="11" width="1" height="1" fill="#059669" />
                <rect x="5" y="12" width="2" height="1" fill="#059669" />
                <rect x="9" y="12" width="2" height="1" fill="#059669" />
                <rect x="12" y="11" width="1" height="1" fill="#059669" />
              </>
            )}
            
            {/* Eyes */}
            <rect x="5" y="5" width="2" height="3" fill="white" />
            <rect x="9" y="5" width="2" height="3" fill="white" />
            <rect x={direction === 'right' ? "6" : "5"} y="6" width="1" height="1" fill="#1a1a2e" />
            <rect x={direction === 'right' ? "10" : "9"} y="6" width="1" height="1" fill="#1a1a2e" />
            
            {/* Highlight */}
            <rect x="4" y="3" width="2" height="1" fill="#34d399" />
            
            {/* Status indicator */}
            {state === 'planning' && (
              <rect x="7" y="1" width="2" height="1" fill="#fbbf24" />
            )}
            {state === 'falling' && !isGrounded && (
              <rect x="7" y="1" width="2" height="1" fill="#f97316" />
            )}
            {state === 'at_top' && (
              <rect x="7" y="1" width="2" height="1" fill="#3b82f6" />
            )}
            {isGrounded && state !== 'at_top' && (
              <rect x="7" y="1" width="2" height="1" fill="#4ade80" />
            )}
          </svg>
        </div>
      </motion.div>
    </>
  )
}
