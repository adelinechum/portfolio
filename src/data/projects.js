// src/data/projects.js
import csvContent from './tags.csv?raw' // ?raw forces it to load as text

// The Parsing Logic
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n')
  const projects = []
  
  // Skip header (i=1)
  for (let i = 1; i < lines.length; i++) {
    // Manual CSV parsing to properly handle empty fields and quoted values
    const row = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        inQuotes = !inQuotes
        current += char
      } else if (char === ',' && !inQuotes) {
        row.push(current)
        current = ''
      } else {
        current += char
      }
    }
    row.push(current) // Push last field

    if (row.length === 0) continue

    const clean = (str) => str ? str.replace(/^"|"$/g, '').trim() : ''

    // Map columns based on your CSV: Year, Name, Thematic Tags, People, Work Type
    
    const title = clean(row[0])
    const year = clean(row[1])
    const id = clean(row[2])
    const thumbnailPath = clean(row[3])
    const thumbnail = thumbnailPath ? `/assets/${thumbnailPath.replace(/^tags\//, '')}` : ''
    const url = clean(row[4])
    const rawTags = clean(row[5])
    const people = clean(row[6])
    const workType = clean(row[7])

    // DEBUG: Log one project to verify parsing
    if (title.includes('Care')) {
      console.log('UNITS OF CARE DEBUG:', { row, title, year, id, thumbnail, url, rowLength: row.length })
    }
    
    // Generate ID
    // const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    // Thematic tags only (for display)
    const thematicTags = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    // Combine 'thematic tags' and 'work type' into one array (for filtering)
    const tags = [
        ...thematicTags,
        ...workType.split(',').map(t => t.trim().toLowerCase())
    ].filter(Boolean)

    projects.push({
      id,
      title,
      year,
      tags,
      thematicTags,
      people,
      thumbnail,
      url,
      hasTextFrame: Boolean(url && url.endsWith('.txt') && !thumbnail)
    })
  }
  return projects
}

// Export the processed data directly
export const PROJECTS = parseCSV(csvContent)