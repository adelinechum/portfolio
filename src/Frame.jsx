import { useState } from 'react'
import { Billboard, Html } from '@react-three/drei'

export default function Frame({
  title,
  imageUrl,
  position = [0, 0, 0],
  onClick,
  highlighted = true,
  tags = [],
  onTagClick,
  people = '',
}) {
  const [hovered, setHovered] = useState(false)

  // Base card styling
  const cardStyle = {
    width: '2000px',
    height: '100%',
    borderRadius: '12px',
    overflow: 'visible',
    border: highlighted ? '3px solid #c6d2ba' : 'none',
    cursor: 'pointer',
    background: '#000',
    transform: hovered ? 'scale(1.04)' : 'scale(1)',
    boxSizing: 'border-box',
    transition:
      'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, filter 180ms ease, opacity 180ms ease',
    borderColor: hovered ? '#c6d2ba' : (highlighted ? '#c6d2ba' : 'transparent'),
    boxShadow: hovered
      ? '0 0 26px rgba(151, 184, 167, 0.85)'
      : (highlighted ? '0 0 16px rgba(151, 184, 167, 0.5)' : '0 4px 16px rgba(0,0,0,0.35)'),
    filter: hovered ? 'brightness(1.06) contrast(1.05)' : (highlighted ? 'brightness(1)' : 'brightness(0.4) grayscale(0.5)'),
    opacity: highlighted ? 1 : 0.5,
  }

  return (
    <Billboard position={position} follow castShadow receiveShadow>
      <Html
        transform
        distanceFactor={35}
        position={[0, 0, 0]}
        zIndexRange={[100, 0]}
      >
        {/* Flex container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '2000px',
        }}>
          {/* Card with image */}
          <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={cardStyle}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
          </div>

          {/* Caption - naturally positioned below image */}
          <div style={{
            paddingTop: '35px',
            fontSize: 48,
            color: 'white',
            fontFamily: '"Google Sans Code", monospace',
            textAlign: 'left',
            paddingLeft: '20px',
            pointerEvents: 'auto',
          }}>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>
              {title}
            </div>
            <div style={{
              fontSize: 36,
              opacity: 0.7,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              fontStyle: 'italic'
            }}>
              {/* Tags with ● separator */}
              {tags && tags.length > 0 && tags.slice(0, 5).flatMap((tag, i, arr) => {
                const elements = [
                  <span
                    key={`tag-${i}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onTagClick) onTagClick(tag)
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {tag}
                  </span>
                ]
                if (i < arr.length - 1) {
                  elements.push(
                    <span key={`separator-${i}`} style={{ opacity: 0.5 }}>●</span>
                  )
                }
                return elements
              })}

              {/* Separator between tags and people */}
              {people && tags && tags.length > 0 && (
                <span style={{ margin: '0 4px', opacity: 0.5 }}>║</span>
              )}

              {/* People - clickable names with ● separator */}
              {people && people.split(',')
                .map(p => p.trim())
                .filter(Boolean)
                .flatMap((person, i, arr) => {
                  const elements = [
                    <span
                      key={`person-${i}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onTagClick) onTagClick(person.toLowerCase())
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {person}
                    </span>
                  ]
                  if (i < arr.length - 1) {
                    elements.push(
                      <span key={`person-separator-${i}`} style={{ opacity: 0.5 }}>●</span>
                    )
                  }
                  return elements
                })}
            </div>
          </div>
        </div>
      </Html>
    </Billboard>
  )
}
