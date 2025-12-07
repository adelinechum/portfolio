import { useMemo } from 'react'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

export default function GrassBlade({
  position,
  texture,
  color = [1, 1, 1],
  scale = 10,
  opacity = 0.9
}) {
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
      color: new THREE.Color(...color),
      opacity: opacity,
    })
  }, [texture, color, opacity])

  return (
    <Billboard position={position}>
      <mesh material={material}>
        <planeGeometry args={[scale * 100, scale * 100]} />
      </mesh>
    </Billboard>
  )
}
