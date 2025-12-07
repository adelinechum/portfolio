import { useState, useEffect } from 'react'
import { Billboard, Html } from '@react-three/drei'

export default function TextFrame({
  title,
  url,  // URL to .txt file like "../projects/kinne.txt"
  position = [0, 0, 0],
  highlighted = true,
  tags = [],
  onTagClick,
  people = '',
}) {
  const [hovered, setHovered] = useState(false)
  const [textContent, setTextContent] = useState('Loading...')

  // Load text content from URL
  useEffect(() => {
    if (!url) return

    // Convert relative iframe URL to absolute path for fetch
    const fetchUrl = url.replace('../projects/', '/projects/')

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) throw new Error('File not found')
        return response.text()
      })
      .then(text => setTextContent(text))
      .catch(error => {
        console.error(`Failed to load ${fetchUrl}:`, error)
        setTextContent('Error loading content')
      })
  }, [url])

  const cardStyle = {
    width: '1500px',
    height: '1000px',  // Fixed height for consistency
    borderRadius: '12px',
    overflow: 'visible',
    // border: highlighted ? '0px solid #c6d2ba' : 'none',
    cursor: 'default',
    background: 'rgba(0, 0, 0, 0.3)',
    transform: hovered ? 'scale(1.04)' : 'scale(1)',
    boxSizing: 'border-box',
    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
    // borderColor: hovered ? '#c6d2ba' : (highlighted ? '#c6d2ba' : 'transparent'),
    // boxShadow: hovered
    //   ? '0 0 26px rgba(151, 184, 167, 0.55)'
    //   : (highlighted ? '0 0 16px rgba(151, 184, 167, 0.5)' : '0 4px 16px rgba(0,0,0,0.35)'),
    filter: highlighted ? 'brightness(1)' : 'brightness(0.4) grayscale(0.5)',
    opacity: highlighted ? 1 : 0.5,
  }

  const textContainerStyle = {
    width: '100%',
    height: '100%',
    padding: '60px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    color: '#fff',
    fontFamily: '"Google Sans Code", monospace',
    fontSize: '24px',
    lineHeight: '1.25',
    whiteSpace: 'pre-wrap',  // Preserve line breaks and paragraph spacing from .txt file
  }

  return (
    <Billboard position={position} follow castShadow receiveShadow>
      <Html
        transform
        distanceFactor={35}
        position={[0, 0, 0]}
        zIndexRange={[100, 0]}
      >
        <style>{`
          .text-frame-scroll::-webkit-scrollbar {
            width: 12px;
          }
          .text-frame-scroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
          }
          .text-frame-scroll::-webkit-scrollbar-thumb {
            background: rgba(100, 100, 100, 0.8);
            border-radius: 6px;
          }
          .text-frame-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(150, 150, 150, 0.9);
          }
          .text-frame-scroll {
            scrollbar-color: rgba(100, 100, 100, 0.8) rgba(0, 0, 0, 0.3);
            scrollbar-width: thin;
          }
        `}</style>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '2000px',
        }}>
          {/* Text Card */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={cardStyle}
          >
            <div className="text-frame-scroll" style={textContainerStyle}>
              {textContent}
            </div>
          </div>

          {/* Caption - same as Frame.jsx */}
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
              {/* Tags - same rendering as Frame.jsx */}
              {tags && tags.length > 0 && tags.slice(0, 5).flatMap((tag, i, arr) => {
                const elements = [
                  <span
                    key={`tag-${i}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onTagClick) onTagClick(tag)
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
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
                  elements.push(<span key={`separator-${i}`} style={{ opacity: 0.5 }}>●</span>)
                }
                return elements
              })}

              {/* Separator */}
              {people && tags && tags.length > 0 && (
                <span style={{ margin: '0 4px', opacity: 0.5 }}>║</span>
              )}

              {/* People - same rendering as Frame.jsx */}
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
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
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
                    elements.push(<span key={`person-separator-${i}`} style={{ opacity: 0.5 }}>●</span>)
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
