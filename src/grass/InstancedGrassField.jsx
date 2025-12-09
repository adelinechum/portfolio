import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import GrassBiomeLayer from './GrassBiomeLayer.jsx'

const BIOMES = {
  DATA:     { x: -700, z: -700 },
  ECOLOGY:  { x:  800, z:  300 },
  CARE:     { x: -200, z:  900 },
  FORM:     { x: -1100, z:  400 },
}

const BIOME_COLORS = {
  DATA:     [0.45, 0.55, 0.8],  // Cool blue tint
  ECOLOGY:  [0.3, 0.5, 0.3],  // Green tint
  CARE:     [0.7, 0.6, 0.5],  // Warm earthy tint
  FORM:     [0.45, 0.45, 0.75],  // Neutral gray-purple tint
}

export default function InstancedGrassField({ heightMapTexture }) {
  // Load single grass texture for all biomes (color variation via tinting)
  const grassTexture = useTexture('../assets/grass.png')

  const biomeBlades = useMemo(() => {
    if (!heightMapTexture?.image) return {
      DATA: [],
      ECOLOGY: [],
      CARE: [],
      FORM: []
    }

    // Initialize biome blade arrays
    const blades = {
      DATA: [],
      ECOLOGY: [],
      CARE: [],
      FORM: []
    }

    const img = heightMapTexture.image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const w = canvas.width = img.width
    const h = canvas.height = img.height
    ctx.drawImage(img, 0, 0, w, h)
    const imgData = ctx.getImageData(0, 0, w, h).data

    // Helper to get terrain height - MUST match Ground component processing
    const getTerrainHeight = (worldX, worldZ) => {
      const u = (worldX + 3000) / 4000
      const v = (worldZ + 3000) / 4000
      const px = Math.floor(u * w)
      const py = Math.floor(v * h)
      if (px < 0 || px >= w || py < 0 || py >= h) return 0
      const index = (py * w + px) * 4

      // Apply same gamma correction as Ground component
      let heightValue = imgData[index] / 255
      const threshold = 0.01
      const mult = 10
      const gamma = 20

      if (heightValue > threshold) {
        const s = (heightValue - threshold) / (1 - threshold)
        const shaped = Math.pow(s, gamma)
        const boosted01 = Math.min(1, shaped * mult)
        heightValue = threshold + boosted01 * (1 - threshold)
      }
      heightValue = Math.max(0, Math.min(1, heightValue))

      // Apply displacementScale (200) and displacementBias (-20) from Ground
      return (heightValue * 200) - 20
    }

    // Helper to find closest biome and blend factor
    const getBiomeBlend = (x, z) => {
      const distances = Object.entries(BIOMES).map(([name, pos]) => {
        const dist = Math.hypot(x - pos.x, z - pos.z)
        return { name, dist }
      })
      distances.sort((a, b) => a.dist - b.dist)

      const closest = distances[0]
      const secondClosest = distances[1]

      // Blend factor (0 = pure closest biome, 1 = equal blend)
      const blendRadius = 400  // Distance over which to blend
      const blendFactor = Math.min(1, closest.dist / blendRadius)

      return {
        biome: closest.name,
        secondBiome: secondClosest?.name,
        blendFactor: blendFactor,
      }
    }

    // Generate grass blade positions
    const density = 5500  // Number of grass clumps
    const spread = 2500  // Spread across terrain (avoid edges)

    for (let i = 0; i < density; i++) {
      const x = (Math.random() - 0.5) * spread
      const z = (Math.random() - 0.5) * spread
      const y = getTerrainHeight(x, z)  // Height includes displacement bias

      const { biome, secondBiome, blendFactor } = getBiomeBlend(x, z)

      // Get color for primary biome
      const color = BIOME_COLORS[biome]

      // Blend color if near biome boundary (preserve exact blending from original)
      let finalColor = [...color]
      if (blendFactor > 0.3 && secondBiome) {
        const secondColor = BIOME_COLORS[secondBiome]
        const blend = (blendFactor - 0.3) / 0.7  // Normalize to 0-1
        finalColor = [
          color[0] * (1 - blend) + secondColor[0] * blend,
          color[1] * (1 - blend) + secondColor[1] * blend,
          color[2] * (1 - blend) + secondColor[2] * blend,
        ]
      }

      // Add blade to its primary biome
      blades[biome].push({
        position: [x, y, z],
        color: finalColor,
        scale: 0.8 + Math.random() * 0.4,  // Vary size
        opacity: 0.7 + Math.random() * 0.3,  // Vary opacity
      })
    }

    return blades
  }, [heightMapTexture])

  return (
    <group>
      <GrassBiomeLayer
        biomeName="DATA"
        blades={biomeBlades.DATA}
        texture={grassTexture}
        baseColor={BIOME_COLORS.DATA}
      />
      <GrassBiomeLayer
        biomeName="ECOLOGY"
        blades={biomeBlades.ECOLOGY}
        texture={grassTexture}
        baseColor={BIOME_COLORS.ECOLOGY}
      />
      <GrassBiomeLayer
        biomeName="CARE"
        blades={biomeBlades.CARE}
        texture={grassTexture}
        baseColor={BIOME_COLORS.CARE}
      />
      <GrassBiomeLayer
        biomeName="FORM"
        blades={biomeBlades.FORM}
        texture={grassTexture}
        baseColor={BIOME_COLORS.FORM}
      />
    </group>
  )
}
