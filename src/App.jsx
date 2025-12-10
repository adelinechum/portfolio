// App.jsx
import { useMemo, useState } from 'react'
import * as THREE from "three"
import Scene from './Scene.jsx'
import Overlay from './Overlay.jsx'
import { PROJECTS } from './data/projects.js'

export default function App() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('all')
  const [selected, setSelected] = useState(null) // iframe URL or null
  const [shuffleKey, setShuffleKey] = useState(0)

  const [moon, setMoon] = useState({
    enabled: true,
    intensity: 1,
    color: "#c6d2ba",
    elevation: 25, // degrees above horizon
    azimuth: 20,   // degrees around Y
    distance: 220, // how far from origin
  })
  const [open, setOpen] = useState(false)

  // Spherical → Cartesian for the light’s position
  const moonPos = useMemo(() => {
    const r = moon.distance
    const phi = THREE.MathUtils.degToRad(90 - moon.elevation) // 0=up
    const theta = THREE.MathUtils.degToRad(moon.azimuth)
    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi)
    const z = r * Math.sin(phi) * Math.sin(theta)
    return [x, y, z]
  }, [moon])

  // Check which projects match the current search/tag filters
  const highlighted = useMemo(() => {
    const q = search.trim().toLowerCase()

    // If tag is 'all' and no search query, highlight everything
    if (tag === 'all' && !q) {
      return null // null = all highlighted
    }

    const highlightedIds = new Set()

    PROJECTS.forEach(p => {
      const matchesTag = tag === 'all' ? true : p.tags.includes(tag)
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.people.toLowerCase().includes(q) ||
        String(p.year).includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))

      if (matchesTag && matchesSearch) {
        highlightedIds.add(p.id)
        // console.log(p, p.tag)
      }
    })

    return highlightedIds
  }, [search, tag])

  // Choose a project for the camera to "focus" on based on search
  const focusProjectId = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    const firstHighlighted = PROJECTS.find(p => highlighted.has(p.id))
    return firstHighlighted ? firstHighlighted.id : null
  }, [search, highlighted])

  return (
  <div className="app-root">
    <div className="top-bar">
      <div className="moon-wrap">
      <button
        className={`moon-button ${moon.enabled ? "on" : "off"}`}
        onClick={() => setOpen(o => !o)}
        title="About" 
      >
        welcome!
      </button>
          {open && (
            <div className="moon-dropdown" role="dialog">
              <div className="moon-drop-inner">
                <h3>about: adeline</h3>
                  <p className="width30">
                    designer | <a href="./assets/Adeline_Chum_CV_2024-11.pdf">CV avaliable here</a> <br></br>

                    previously: Assistant Director @ <a href="https://c4sr.columbia.edu/people">Center for Spatial Research (GSAPP)</a>, Adjunct Assistant Professor @ GSAPP Columbia University, Architectural Designer @ <a href="https://www.bsnarchitects.com/">Baird Sampson Neuert Architects</a>, <a href="https://www.williamsonwilliamson.com/arch/">Williamson Williamson Architect</a> (Toronto), <a href="https://crabstudio.com/">CRAB Studio</a>, Atmos Studio (London) and Parkin Architects. 
                    <br></br>
                    She received her MArch from Columbia, GSAPP, where she has received the GSAPP Visualization Award, William Kinne Fellows Travelling Prize for her proposal, What it Takes to Grow Our Buildings: Consequences of Mass Timber Production on Forestry and Land Management in Sweden, and the 'Avery 6' Award
                    {/* PDF of Adeline's CV is<a href="./assets/Adeline_Chum_CV_2024-11.pdf">here</a> */}
                  </p>
                  <h3 >about: site</h3>
                  
                  <p>welcome! navigate using the search filter and key tags or follow your cursor through the terrain, zoom in and out, and right click to look around.
                  </p>
                  <p> 
                  this place includes completed work, ongoing projects, working notes, and experimental ideas
                  </p>

              </div>
            </div>
          )}
        </div>
      </div>        

      <Overlay
        search={search}
        setSearch={setSearch}
        tag={tag}
        setTag={setTag}
        onReset={() => setShuffleKey(k => k + 1)}
        selected={selected}
        setSelected={setSelected}
      />

    {/* Canvas below the bar */}
    <div className="canvasWrap" key={shuffleKey}>
      <Scene
        projects={PROJECTS}
        highlighted={highlighted}
        onOpen={setSelected}
        activeTag={tag}
        focusProjectId={focusProjectId}
        moon={moon}
        moonPos={moonPos}
        setTag={setTag}
      />
    </div>

    {selected && (
      <div className="iframeContainer">
        <iframe
          className="displayImages"
          src={selected}
          title="project"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        />
        <button className="closeIframe" onClick={() => setSelected(null)}>✕</button>
      </div>
    )}
  </div>
)

}
