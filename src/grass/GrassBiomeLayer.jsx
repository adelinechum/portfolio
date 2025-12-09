import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import grassVertexShader from './shaders/grassVertex.glsl?raw'
import grassFragmentShader from './shaders/grassFragment.glsl?raw'

export default function GrassBiomeLayer({
  biomeName,
  blades,
  texture,
  baseColor
}) {
  const meshRef = useRef()
  const { camera } = useThree()
  const frameCount = useRef(0)

  const count = blades.length

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        grassTexture: { value: texture },
        biomeColor: { value: new THREE.Color(...baseColor) },
      },
      vertexShader: grassVertexShader,
      fragmentShader: grassFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    })
  }, [texture, baseColor])

  // Create geometry and instance attributes
  const { geometry, positions } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(100, 100)

    // Arrays for instance attributes
    const colors = new Float32Array(count * 3)
    const opacities = new Float32Array(count)
    const scales = new Float32Array(count)
    const bladePositions = []

    // Set instance attributes from blade data
    blades.forEach((blade, i) => {
      colors[i * 3] = blade.color[0]
      colors[i * 3 + 1] = blade.color[1]
      colors[i * 3 + 2] = blade.color[2]
      opacities[i] = blade.opacity
      scales[i] = blade.scale
      bladePositions.push(new THREE.Vector3(...blade.position))
    })

    // Add instance attributes to geometry
    geom.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3))
    geom.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(opacities, 1))
    geom.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1))

    return { geometry: geom, positions: bladePositions }
  }, [blades, count])

  // Set up instance matrices
  useEffect(() => {
    if (!meshRef.current) return

    const dummy = new THREE.Object3D()

    blades.forEach((blade, i) => {
      dummy.position.set(...blade.position)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [blades])

  // LOD system with distance-based culling and update throttling
  useFrame(() => {
    if (!meshRef.current) return

    frameCount.current++

    const dummy = new THREE.Object3D()
    const tempMatrix = new THREE.Matrix4()

    for (let i = 0; i < count; i++) {
      const dist = camera.position.distanceTo(positions[i])
      const blade = blades[i]

      if (dist > 1500) {
        // LOD Culled: set scale to 0 to hide
        dummy.position.set(...blade.position)
        dummy.scale.set(0, 0, 0)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      } else if (dist > 900) {
        // LOD2: static orientation, no billboard updates
        // Keep existing matrix, only ensure visibility
        meshRef.current.getMatrixAt(i, tempMatrix)
        const currentScale = new THREE.Vector3()
        tempMatrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), currentScale)

        // If currently culled (scale 0), restore it
        if (currentScale.x === 0) {
          dummy.position.set(...blade.position)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        // Otherwise, don't update (static)
      } else if (dist > 400) {
        // LOD1: update every 2 frames (throttled billboard)
        if ((frameCount.current + i) % 2 === 0) {
          dummy.position.set(...blade.position)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          meshRef.current.setMatrixAt(i, dummy.matrix)
        }
      } else {
        // LOD0: update every frame (full billboard)
        dummy.position.set(...blade.position)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={true}
    >
    </instancedMesh>
  )
}
