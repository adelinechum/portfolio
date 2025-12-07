const TAGS = [
  { id: 'all', label: 'All' },

  // DATA Biome
  { id: 'archival patterns', label: 'Archival Patterns' },
  { id: 'data-terrain', label: 'Data Terrain' },
  { id: 'trained vision', label: 'Trained Vision' },
  { id: 'spatial omissions', label: 'Spatial Omissions' },

  // ECOLOGY Biome
  { id: 'soil futures', label: 'Soil Futures' },
  { id: 'resource cycles', label: 'Resource Cycles' },
  { id: 'wild-urban interface', label: 'Wild-Urban Interface' },
  { id: 'speculative-ecologies', label: 'Speculative Ecologies' },
  { id: 'bio-based making', label: 'Bio-Based Making' },

  // CARE Biome
  { id: 'community-economy', label: 'Community Economy' },
  { id: 'mutual support', label: 'Mutual Support' },
  { id: 'neighborhood repair', label: 'Neighborhood Repair' },
  { id: 'informal-support-networks', label: 'Informal Support Networks' },
  { id: 'everyday infrastructure', label: 'Everyday Infrastructure' },
  { id: 'local labor', label: 'Local Labor' },
  { id: 'care-economies', label: 'Care Economies' },

  // FORM Biome
  { id: 'adaptive forms', label: 'Adaptive Forms' },
  { id: 'soft thresholds', label: 'Soft Thresholds' },
  { id: 'material legacies', label: 'Material Legacies' },
  { id: 'tactile patterning', label: 'Tactile Patterning' },
  { id: 'interior-atmospheres', label: 'Interior Atmospheres' },
]

export default function Overlay({ search, setSearch, tag, setTag, onReset }) {
  const handleTagClick = (tagId) => {
    // If clicking "All" while it's already selected, trigger reset to restore camera
    if (tagId === 'all' && tag === 'all') {
      onReset && onReset()
    } else {
      setTag(tagId)
    }
  }

  return (
    <div className="navbar">
      <input
        className="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search title / year / tag…"
      />
      <div className="tags">
        {TAGS.map(t => (
          <button
            key={t.id}
            className={`chip ${tag === t.id ? 'active' : ''}`}
            onClick={() => handleTagClick(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
