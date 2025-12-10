// Scene.jsx
import { useMemo, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Frame from './Frame.jsx'
import TextFrame from './TextFrame.jsx'
import InstancedGrassField from './grass/InstancedGrassField.jsx'

// --------------------------------------------------------------------------
// SPATIAL CONSTANTS (Biomes, Distance, Heights)
// --------------------------------------------------------------------------

const BIOMES = {
  DATA:     { x: -700, z: -700 }, // Top-Left (Archival Patterns, Data-Terrain)
  ECOLOGY:  { x:  800, z:  300 }, // Right Landmass (Soil Futures, Resource Cycles)
  CARE:     { x: -200, z:  900 }, // Bottom Center (Community-Economy, Mutual Support)
  FORM:     { x: -1100, z:  400 }, // Far Left Ridge (Adaptive Forms, Soft Thresholds)
  DEFAULT:  { x: 0, z: 0 }
}

const TAG_MAP = {
  // Data Biome
  "archival patterns": BIOMES.DATA, "data-terrain": BIOMES.DATA,
  "spatial omissions": BIOMES.DATA, "trained vision": BIOMES.DATA,
  
  // Ecology Biome
  "soil futures": BIOMES.ECOLOGY, "resource cycles": BIOMES.ECOLOGY, 
  "wild-urban interface": BIOMES.ECOLOGY, "speculative-ecologies": BIOMES.ECOLOGY,
  "bio-based making": BIOMES.ECOLOGY,
  
  // Care Biome
   "mutual support": BIOMES.CARE, "neighborhood repair": BIOMES.CARE, "community-economy": BIOMES.CARE,
  "informal-support-networks": BIOMES.CARE, "local labor": BIOMES.CARE, "everyday infrastructure": BIOMES.CARE,

  // Form Biome
  "adaptive forms": BIOMES.FORM, "soft thresholds": BIOMES.FORM,
  "tactile patterning": BIOMES.FORM, "material legacies": BIOMES.FORM,
  "interior-atmospheres": BIOMES.FORM,
}

const TAG_VIEW_DISTANCE   = 38
const FOCUS_VIEW_DISTANCE = 24
const MIN_TARGET_Y        = 3
const MAX_TARGET_Y        = 10
const CAMERA_Y            = 10

// Terrain constants
const TERRAIN_MAX_HEIGHT = 200 // MUST MATCH displacementScale in Ground (exaggerated for more dramatic relief)
const SEA_LEVEL = 0.05       // Normalized height threshold (0-1) for 'water'

// Default camera view
// const DEFAULT_VIEW = {
//   pos: new THREE.Vector3(128.43009107433818, 45.78024724262386, -864.5800300573438),
//   target: new THREE.Vector3(-166.68060974986514, 0, -127.56061427519958)
// }

const DEFAULT_VIEW = {
  pos: new THREE.Vector3(51.71576006631756, 86.54579460696334, -922.3754110440516),
  target: new THREE.Vector3(-271.9365697426206, 0, -155.26313781358206)
}

// ---------------------------------------------------------------------------
// CAMERA VIEW LOGIC
// ---------------------------------------------------------------------------

function viewFromTagGround(tag) {
  const anchor = TAG_MAP[tag.toLowerCase()] || BIOMES.DEFAULT
  const anchorY = 0 
  
  const centerY = Math.max(
    MIN_TARGET_Y,
    Math.min(MAX_TARGET_Y, anchorY + 2)
  )
  const center = new THREE.Vector3(anchor.x, centerY, anchor.z)

  const dir2 = new THREE.Vector2(center.x, center.z).normalize()
  const back2 = dir2.clone().multiplyScalar(TAG_VIEW_DISTANCE)

  const pos = new THREE.Vector3(
    center.x + back2.x,
    CAMERA_Y,   
    center.z + back2.y
  )

  return { pos, target: center }
}

function viewFromFocusPosition(center) {
  if (!center) return DEFAULT_VIEW

  const lookY = Math.max(
    MIN_TARGET_Y,
    Math.min(MAX_TARGET_Y, center.y + 1.0)
  )

  const focus = new THREE.Vector3(center.x, lookY, center.z)

  const dir2 = new THREE.Vector2(focus.x, focus.z).normalize()
  const back2 = dir2.clone().multiplyScalar(FOCUS_VIEW_DISTANCE)

  const pos = new THREE.Vector3(
    focus.x + back2.x,
    CAMERA_Y,               
    focus.z + back2.y
  )

  return { pos, target: focus }
}

// Calculate optimal camera view to frame all highlighted projects
function viewFromHighlightedProjects(projects, highlightedIds, activeTag) {
  if (!highlightedIds || highlightedIds.size === 0) {
    return DEFAULT_VIEW
  }

  // Get positions of all highlighted projects
  const highlightedPositions = projects
    .filter(p => highlightedIds.has(p.id))
    .map(p => p.position)

  if (highlightedPositions.length === 0) {
    return DEFAULT_VIEW
  }

  const frameVisualSize = 80 // Approximate frame width in world units
  const framePadding = frameVisualSize * 0.6 // Extra padding to prevent overlap

  // Calculate bounding box with frame size padding
  let minX = Infinity, maxX = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  let avgY = 0

  highlightedPositions.forEach(([x, y, z]) => {
    // Expand bounds to include the frame's visual footprint
    minX = Math.min(minX, x - framePadding)
    maxX = Math.max(maxX, x + framePadding)
    minZ = Math.min(minZ, z - framePadding)
    maxZ = Math.max(maxZ, z + framePadding)
    avgY += y
  })
  avgY /= highlightedPositions.length

  // Calculate center and size of bounding box
  const centerX = (minX + maxX) / 2
  const centerZ = (minZ + maxZ) / 2
  const sizeX = maxX - minX
  const sizeZ = maxZ - minZ
  const maxSize = Math.max(sizeX, sizeZ)

  // Get biome anchor for this tag to position camera within biome area
  const biomeAnchor = TAG_MAP[activeTag?.toLowerCase()] || BIOMES.DEFAULT

  // Position camera at edge of frame cluster, looking inward to capture all frames
  // Calculate direction from biome anchor to frame center
  const dx = centerX - biomeAnchor.x
  const dz = centerZ - biomeAnchor.z
  const angle = Math.atan2(dz, dx)

  // Calculate required distance to fit all frames in FOV at walking height
  const fov = 80
  const fovRad = (fov * Math.PI) / 180
  const cameraY = 12 // Walking height
  const minDistance = (maxSize / 2) / Math.tan(fovRad / 2) * 1.2 // 20% padding

  // Project all frame positions onto angle axis to find the near edge
  const cosAngle = Math.cos(angle)
  const sinAngle = Math.sin(angle)

  let closestProjection = Infinity

  highlightedPositions.forEach(([x, y, z]) => {
    // Project from frame center relative to view center
    const dx = x - centerX
    const dz = z - centerZ
    const projection = cosAngle * dx + sinAngle * dz
    // Account for frame padding (frame extends this far along angle)
    closestProjection = Math.min(closestProjection, projection - framePadding)
  })

  // Position camera safely behind all frames
  const cameraDistance = Math.max(
    minDistance,
    Math.abs(closestProjection) + 30 // 30 unit safety buffer
  )

  const cameraX = centerX - cosAngle * cameraDistance
  const cameraZ = centerZ - sinAngle * cameraDistance

  return {
    pos: new THREE.Vector3(cameraX, cameraY, cameraZ),
    target: new THREE.Vector3(centerX, avgY, centerZ)
  }
}

// ---------------------------------------------------------------------------
// PROJECT POSITIONING (XZ ONLY) (Unchanged)
// ---------------------------------------------------------------------------

function getTargetXZ(project, index = 0) {
  const tags = project.tags || []
  
  let x = 0, z = 0
  let matchCount = 0

  tags.forEach(tag => {
    const cleanTag = tag.toLowerCase().trim()
    const anchor = TAG_MAP[cleanTag]
    
    if (anchor) {
      x += anchor.x
      z += anchor.z
      matchCount++
    }
  })

  if (matchCount > 0) {
    x /= matchCount
    z /= matchCount
  } else {
    const angle = Math.random() * Math.PI * 2
    const rad = 400
    x = Math.cos(angle) * rad
    z = Math.sin(angle) * rad
  }

  const seed = ((project.id || project.title || String(index))
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)) + (index * 137.508)  // Golden angle multiplier for better distribution
  
  const rand = n => ((Math.sin(seed * n) + 1) / 2) // 0..1

  const angle = (seed % 1) * Math.PI * 2
  const radius = 250 + (rand(5) * 350)  // Spread: 150-500 units (increased to reduce overlapping)

  let jitterX = Math.cos(angle) * radius
  let jitterZ = Math.sin(angle) * radius

  x += jitterX
  z += jitterZ

  return [x, z]
}

// ---------------------------------------------------------------------------
// CAMERA CONTROLLER & NAVIGATORS (Defined before Scene)
// ---------------------------------------------------------------------------

function CameraController({ activeTag, focusCenter, controlsRef, highlighted, terrainItems, defaultView }) {
  const { camera } = useThree()
  const animRef = useRef(null)

  function computeTargetView() {
    if (focusCenter) {
      return viewFromFocusPosition(focusCenter)
    }
    if (activeTag && activeTag !== 'all' && highlighted) {
      // Frame all highlighted projects from within the biome area
      return viewFromHighlightedProjects(terrainItems, highlighted, activeTag)
    }
    return defaultView
  }

  useEffect(() => {
    // console.log('🎥 Camera Update Triggered - activeTag:', activeTag)

    if (!controlsRef.current) {
      const { pos, target } = defaultView
      camera.position.copy(pos)
      camera.lookAt(target)
      console.log('📍 Initial Camera Setup:', {
        position: pos.toArray(),
        target: target.toArray()
      })
      return
    }

    const fromPos = camera.position.clone()
    const fromTarget = controlsRef.current.target.clone()
    const { pos: toPos, target: toTarget } = computeTargetView()

    // Log camera movement
    // console.log('📍 Current camera:', {
    //   position: fromPos.toArray(),
    //   target: fromTarget.toArray()
    // })
    // console.log('📍 Moving to:', {
    //   position: toPos.toArray(),
    //   target: toTarget.toArray()
    // })

    const duration = 2.0
    animRef.current = {
      startTime: performance.now(),
      duration,
      fromPos,
      fromTarget,
      toPos: toPos.clone(),
      toTarget: toTarget.clone(),
    }
  }, [activeTag, focusCenter, defaultView])

  useFrame(() => {
    const anim = animRef.current
    if (!anim) return

    const now = performance.now()
    const t = Math.min(1, (now - anim.startTime) / (anim.duration * 1000))
    const ease = t * t * (3 - 2 * t)

    camera.position.lerpVectors(anim.fromPos, anim.toPos, ease)
    camera.updateProjectionMatrix()

    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(anim.fromTarget, anim.toTarget, ease)
      controlsRef.current.update()
    }

    if (t >= 1) {
      animRef.current = null
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableZoom
      minDistance={50}
      maxDistance={1500}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.PAN
      }}
      onChange={() => {
        if (controlsRef.current) {
          // console.log('🎮 Manual Camera Movement:', {
          //   position: camera.position.toArray(),
          //   target: controlsRef.current.target.toArray()
          // })
        }
      }}
    />
  )
}


// --- Edge Hover Drift Component (FIXED: Defined BEFORE use) ---
function EdgeHoverDrift({
  controlsRef,
  maxStrafe = 60,
  maxForward = 20,
  maxBackward = 8,
  deadZoneX = 0.6,
  deadZoneY = 0.4,
  smooth = 0.12,
  terrainFn = null
}) {
  const { camera, gl } = useThree()
  const inside = useRef(false)
  const nx = useRef(0)
  const ny = useRef(0)
  const vx = useRef(0)
  const vz = useRef(0)

  useEffect(() => {
    const el = gl.domElement
    const onEnter = () => { inside.current = true }
    const onLeave = () => { inside.current = false; vx.current = vz.current = 0 }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      nx.current = -(x * 2 - 1)
      ny.current = -(y * 2 - 1)
    }
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointermove', onMove)
    }
  }, [gl])

  useFrame((_, dt) => {
    if (!inside.current) return

    const x = nx.current
    const ax = Math.abs(x)
    let targetX = 0
    if (ax > deadZoneX) {
      const t = (ax - deadZoneX) / (1 - deadZoneX)
      targetX = Math.sign(x) * maxStrafe * t
    }

    const y = ny.current
    const ay = Math.abs(y)
    let targetZ = 0
    if (ay > deadZoneY) {
      const t = (ay - deadZoneY) / (1 - deadZoneY)
      if (y > 0) targetZ = maxForward * t
      else        targetZ = -maxBackward * t
    }

    let terrainFactor = 1
    if (terrainFn) terrainFactor = terrainFn(camera.position.y) || 1

    vx.current = THREE.MathUtils.lerp(vx.current, targetX * terrainFactor, smooth)
    vz.current = THREE.MathUtils.lerp(vz.current, targetZ * terrainFactor, smooth)

    if (Math.abs(vx.current) < 1e-3 && Math.abs(vz.current) < 1e-3) return

    const fwd = new THREE.Vector3()
    camera.getWorldDirection(fwd)
    fwd.y = 0; if (fwd.lengthSq() === 0) return; fwd.normalize()
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).negate()

    const delta = new THREE.Vector3()
      .addScaledVector(right, vx.current * dt)
      .addScaledVector(fwd,  vz.current * dt)

    camera.position.add(delta)
    controlsRef.current?.target.add(delta)
    controlsRef.current?.update()
  })

  return null
}


function MobileJoystick({ controlsRef, maxSpeed = 80 }) {
  const { camera, gl } = useThree()
  const [isTouch, setIsTouch] = useState(false)
  const center = useRef({ x: 0, y: 0 })
  const vec = useRef(new THREE.Vector2(0, 0))
  const activeId = useRef(null)
  
  useEffect(() => {
      const mq = window.matchMedia('(pointer: coarse)')
      const update = () => setIsTouch(mq.matches)
      update()
      mq.addEventListener?.('change', update)
      return () => mq.removeEventListener?.('change', update)
    }, [])

  useFrame((_, dt) => {
    const v = vec.current
    if (v.lengthSq() === 0) return

    const fwd = new THREE.Vector3()
    camera.getWorldDirection(fwd)
    fwd.y = 0; if (fwd.lengthSq() === 0) return; fwd.normalize()
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).negate()

    const delta = new THREE.Vector3()
      .addScaledVector(right, v.x * maxSpeed * dt)
      .addScaledVector(fwd,  v.y * maxSpeed * dt)

    camera.position.add(delta)
    if (controlsRef.current) {
      controlsRef.current.target.add(delta)
      controlsRef.current.update()
    }
  })

  if (!isTouch) return null

  // Minimal inline UI
  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        bottom: 20,
        width: 120,
        height: 120,
        borderRadius: 60,
        border: '2px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0,0,0,0.15)',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 10
      }}
      onTouchStart={(e) => {
        const t = e.changedTouches[0]
        activeId.current = t.identifier
        const rect = e.currentTarget.getBoundingClientRect()
        center.current = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
      }}
      onTouchMove={(e) => {
        const t = [...e.changedTouches].find(t => t.identifier === activeId.current)
        if (!t) return
        const dx = t.clientX - center.current.x
        const dy = t.clientY - center.current.y
        const r = 50 // joystick radius
        const nx = THREE.MathUtils.clamp(dx / r, -1, 1)
        const ny = THREE.MathUtils.clamp(dy / r, -1, 1)
        // map: x = strafe, y = forward (invert so up = forward)
        vec.current.set(nx, -ny)
      }}
      onTouchEnd={(e) => {
        const ended = [...e.changedTouches].some(t => t.identifier === activeId.current)
        if (ended) { activeId.current = null; vec.current.set(0, 0) }
      }}
      onTouchCancel={() => { activeId.current = null; vec.current.set(0, 0) }}
    >
      {/* knob */}
      <div
        style={{
          position: 'absolute',
          left: 50, top: 50,
          width: 20, height: 20,
          marginLeft: -10, marginTop: -10,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.8)',
          transform: `translate(${vec.current.x * 50}px, ${-vec.current.y * 50}px)`,
          transition: activeId.current ? 'none' : 'transform 120ms ease'
        }}
      />
    </div>
  )
}


// ---------------------------------------------------------------------------
// GROUND (heightmap) (Defined before Scene)
// ---------------------------------------------------------------------------

function Ground({ setHeightMapTexture }) {
  // Using .jpg based on uploaded files
  const srcHeightMap = useTexture('../assets/heightmap.png')
  const [dispTex, setDispTex] = useState(null)
  const [normalTex, setNormalTex] = useState(null)

  useEffect(() => {
    // Pass the raw loaded texture object back for GPS logic
    if (srcHeightMap) {
        setHeightMapTexture(srcHeightMap)
    }

    if (!srcHeightMap.image) return

    const img = srcHeightMap.image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data

   // cliff edge city
    const threshold = 0.01;     
    const mult        = 10;   
    const gamma       = 20; 

    for (let i = 0; i < data.length; i += 4) {
      let h = data[i] / 255
      if (h > threshold) {
        const s = (h - threshold) / (1 - threshold);
        const shaped = Math.pow(s, gamma);
        const boosted01 = Math.min(1, shaped * mult);
        h = threshold + boosted01 * (1 - threshold);
      }
      h = Math.max(0, Math.min(1, h))

      const v = h * 255
      data[i]     = v 
      data[i + 1] = v 
      data[i + 2] = v 
    }

    ctx.putImageData(imgData, 0, 0)
    const disp = new THREE.CanvasTexture(canvas)
    disp.wrapS = disp.wrapT = THREE.ClampToEdgeWrapping
    disp.needsUpdate = true
    setDispTex(disp)
    
    // Normal map generation
    const nxCanvas = document.createElement('canvas')
    nxCanvas.width = canvas.width
    nxCanvas.height = canvas.height
    const nctx = nxCanvas.getContext('2d')
    nctx.drawImage(canvas, 0, 0)
    const nImg = nctx.getImageData(0,0,canvas.width,canvas.height)
    const out = nctx.createImageData(canvas.width, canvas.height)

    const w = canvas.width, h = canvas.height
    const getH = (x,y) => {
      x = Math.max(0, Math.min(w-1, x))
      y = Math.max(0, Math.min(h-1, y))
      const i = (y*w + x)*4
      return nImg.data[i] / 255 
    }
    const strength = 1 

    for (let y=0; y<h; y++){
      for (let x=0; x<w; x++){
        const hL = getH(x-1,y), hR = getH(x+1,y)
        const hD = getH(x,y+1), hU = getH(x,y-1)
        const dx = (hL - hR) * strength
        const dy = (hU - hD) * strength
        const nx = dx, ny = dy, nz = 1.0
        const inv = 1/Math.hypot(nx,ny,nz)
        const r = ((nx*inv)*0.5 + 0.5)*255
        const g = ((ny*inv)*0.5 + 0.5)*255
        const b = ((nz*inv)*0.5 + 0.5)*255
        const i = (y*w + x)*4
        out.data[i]   = r
        out.data[i+1] = g
        out.data[i+2] = b
        out.data[i+3] = 255
      }
    }
    nctx.putImageData(out,0,0)

    const ntex = new THREE.CanvasTexture(nxCanvas)
      ntex.wrapS = ntex.wrapT = THREE.ClampToEdgeWrapping
      ntex.needsUpdate = true
      setNormalTex(ntex)


  }, [srcHeightMap, setHeightMapTexture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <planeGeometry args={[4000, 4000, 512, 512]} />
      <meshStandardMaterial
        color={[8/255, 15/255, 25/255]}
        roughness={1}
        displacementMap={dispTex || srcHeightMap}
        displacementScale={TERRAIN_MAX_HEIGHT}
        displacementBias={-20}
        normalMap={normalTex || undefined}
        normalScale={new THREE.Vector2(2, 2)}
      />
    </mesh>
  )
}


// ---------------------------------------------------------------------------
// MAIN SCENE
// ---------------------------------------------------------------------------
export default function Scene({ projects, highlighted, onOpen, activeTag, focusProjectId, moon, moonPos, setTag }) {
  const controlsRef = useRef()
  const [heightMapTexture, setHeightMapTexture] = useState(null)
  const [terrainItems, setTerrainItems] = useState([])

  const focusCenter = useMemo(() => {
    if (!focusProjectId || !terrainItems.length) return null
    const item = terrainItems.find(i => i.id === focusProjectId)
    if (!item) return null
    const [x, y, z] = item.position
    return new THREE.Vector3(x, y, z)
  }, [focusProjectId, terrainItems])

  // --- CORE TERRAIN POSITIONING LOGIC (The "GPS") ---
  useEffect(() => {
    if (!projects.length || !heightMapTexture?.image) {
      setTerrainItems([])
      return
    }

    const img = heightMapTexture.image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const w = canvas.width = img.width
    const h = canvas.height = img.height
    ctx.drawImage(img, 0, 0, w, h)
    const imgData = ctx.getImageData(0, 0, w, h).data
    
    // Helper to get normalized height (0..1)
    const getTerrainHeight = (worldX, worldZ) => {
      const u = (worldX + 3000) / 4000
      const v = (worldZ + 3000) / 4000 
      
      const px = Math.floor(u * w)
      const py = Math.floor(v * h)
      
      if (px < 0 || px >= w || py < 0 || py >= h) return 0.5 
      
      const index = (py * w + px) * 4
      return imgData[index] / 255 
    }

    const calculated = projects.map((p, i) => {
      let [x, z] = getTargetXZ(p, i)
      
      let rawHeight = getTerrainHeight(x, z)
      
      // Water Avoidance: Nudge it towards the center until it hits land
      let safety = 0
      while(rawHeight < SEA_LEVEL && safety < 20) {
        x = x * 0.98
        z = z * 0.98
        rawHeight = getTerrainHeight(x, z)
        safety++
      }

      // Final Y position: Terrain Height + slight hover (0.5 units)
      const y = (rawHeight * TERRAIN_MAX_HEIGHT) + 0.5 

      return { ...p, position: [x, y, z] }
    })

    setTerrainItems(calculated)

  }, [projects, heightMapTexture])


  return (
    <Canvas
      camera={{ position: [0, 80, 250], fov: 80, near: 0.1, far: 5000 }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, 2]}
    >
      <CameraController
        activeTag={activeTag}
        focusCenter={focusCenter}
        controlsRef={controlsRef}
        highlighted={highlighted}
        terrainItems={terrainItems}
        defaultView={DEFAULT_VIEW}
      />

      <color attach="background" args={['#000000']} />
      <fogExp2 attach="fog" args={[0x000000, 0.0015]} />

      {/* Lighting */}
      <ambientLight intensity={1} color="#c6d2ba" />
      <directionalLight
        position={[-1200, 600, 200]}
        intensity={3}
        color="#c6d2ba"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-1100}
        shadow-camera-right={1100}
        shadow-camera-top={1100}
        shadow-camera-bottom={-1100}
        shadow-camera-near={50}
        shadow-camera-far={2200}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      {moon?.enabled && (
        <pointLight
          position={moonPos}
          intensity={moon.intensity*100}
          color={moon.color}
          castShadow={true}
          distance={1000}
          decay={2}
        />
      )}

      {/* Ground component */}
      <Ground setHeightMapTexture={setHeightMapTexture} />

      {/* Grass field component - renders AFTER ground for proper layering */}
      {heightMapTexture && (
        <InstancedGrassField heightMapTexture={heightMapTexture} />
      )}

      {/* Edge Hover Drift (Now defined earlier in the file) */}
      <EdgeHoverDrift
        controlsRef={controlsRef}
        maxStrafe={50}
        maxForward={18}
        maxBackward={6}
        deadZoneX={0.65}
        deadZoneY={0.40}
        smooth={0.12}
        // Speed factor: slows down if too high or too low, centered around y=10
        terrainFn={(y) => 1 - Math.min(0.5, Math.abs(y - 10) / 50)} 
     />

      <MobileJoystick controlsRef={controlsRef} />


      {/* project frames */}
      {terrainItems.map(item => {
        // console.log(item);
        const isHighlighted = highlighted?.has(item.id) ?? true
        return (
          <Billboard key={item.id} position={item.position}>
            {item.hasTextFrame ? (
              <TextFrame
                title={item.title}
                url={item.url}
                highlighted={isHighlighted}
                tags={item.thematicTags}
                onTagClick={(tag) => setTag && setTag(tag)}
                people={item.people}
                position={[0, 0, 0]}
              />
            ) : (
              <Frame
                title={item.title}
                imageUrl={item.thumbnail}
                onClick={() => onOpen && onOpen(item.url)}
                highlighted={isHighlighted}
                tags={item.thematicTags}
                onTagClick={(tag) => setTag && setTag(tag)}
                people={item.people}
              />
            )}

            {/* Surveyor's Stake / Stem (Visual grounding) */}
            <mesh position={[0, -2, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 4]} />
                <meshBasicMaterial color="#c6d2ba" opacity={0.6} transparent />
            </mesh>
          </Billboard>

        )
      })}
    </Canvas>
  )
}