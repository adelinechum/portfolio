document.addEventListener('DOMContentLoaded', () => {
  // === CLICK-TO-OPEN =======================================================
  document.querySelectorAll('.thumbnails').forEach(el => {
    el.addEventListener('click', (e) => {
      const img = e.target.tagName === 'IMG' ? e.target : el.querySelector('img[id]');
      if (!img) return;
      const id = img.id;
      const map = {
        Flatten:      'https://centerforspatialresearch.github.io/summer2020_covidpolicies/',
        Paradise:     'https://adelinechum.github.io/rebuildingParadiseInterface/',
        SafeSpace:    './SafeSpace.html',
        Housing:      'https://adelinechum.github.io/36YearsOfHousing/',
        Furniture:    './Furniture.html',
        Care:         './Care.html',
        Quilted:      './Quilt.html',
        Pillow:       './Pillow.html',
        SteroidPlants:'./SteroidPlants.html',
        MoMa:         './Moma.html',
        Refactoring:  './Refactoring.html',
        Desert:       './Desert.html',
        Wetlands:     './Wetlands.html',
        Gaslink:      './Gaslink.html'
      };
      if (!map[id]) return;
      // clear any existing viewers
      document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
      const iframe = document.createElement('iframe');
      iframe.className = 'displayImages';
      iframe.src = map[id];
      iframe.style.display = 'flex';
      document.body.appendChild(iframe);
    });
  });

  // Close viewer on Esc
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
  });

  // === HIGHLIGHT FILTERS ====================================================
  const CATEGORY = {
    all: null,
    datavis:       ['highlightDatavis',     'lime'],
    designstudio:  ['highlightDesign',      '#ff00f7'],
    modelmaking:   ['highlightModelmaking', '#bfff00'],
    animation:     ['highlightAnimation',   'aqua'],
    exhibit:       ['highlightExhibit',     '#ff6a00'],
    pattern:       ['highlightViz',         '#999'] // if you use it
  };

  function applyHighlight(key) {
    const imgs = Array.from(document.querySelectorAll('#float-layer .thumbnails img'));
    if (!CATEGORY[key]) {
      imgs.forEach(img => { 
        img.style.borderColor = 'white';
        img.style.borderStyle = 'solid';
        img.style.borderWidth = '6px';
        img.style.opacity = '1';
      });
      return;
    }
    const [cls, color] = CATEGORY[key];
    imgs.forEach(img => {
      const active = img.classList.contains(cls);
      img.style.borderColor = active ? color : 'white';
      img.style.borderStyle = 'solid';
      img.style.borderWidth = '6px';
      img.style.opacity = active ? '1' : '0.6';
    });
  }

  document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.button').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      applyHighlight(e.currentTarget.id);
    });
  });

  // === FREE-FLOAT DRAG ======================================================
  const layer = document.getElementById('float-layer');
  if (!layer) return;

  const frames = Array.from(layer.querySelectorAll('.thumbnails.frame'));
  let active = null, startX = 0, startY = 0, origX = 0, origY = 0;

  frames.forEach(f => {
    f.addEventListener('pointerdown', (e) => {
      active = f;
      f.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      const r = f.getBoundingClientRect();
      const lr = layer.getBoundingClientRect();
      origX = r.left - lr.left;
      origY = r.top  - lr.top;
      f.style.zIndex = String(Date.now());
    });
    f.addEventListener('pointermove', (e) => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const nx = Math.max(0, Math.min(origX + dx, layer.clientWidth  - active.offsetWidth));
      const ny = Math.max(0, Math.min(origY + dy, layer.clientHeight - active.offsetHeight));
      active.style.left = nx + 'px';
      active.style.top  = ny + 'px';
    });
    f.addEventListener('pointerup', (e) => {
      if (!active) return;
      savePosition(active);
      active.releasePointerCapture(e.pointerId);
      active = null;
    });
  });

  restorePositions();
  restorePositions();

  // If at least one saved position exists, respect them;
  // otherwise, do a fresh pack by year.
  const anySaved = frames.some(el => localStorage.getItem('framePos:' + (el.dataset.id || el.id)));
  if (!anySaved) packFrames();
  else {
    // still make sure the layer is tall enough after restore
    (function autoGrowLayer(){
      const rects = frames.map(el => el.getBoundingClientRect());
      if (!rects.length) return;
      const lr = layer.getBoundingClientRect();
      const maxBottom = Math.max(...rects.map(r => r.bottom)) - lr.top;
      layer.style.minHeight = Math.ceil(maxBottom + 24) + 'px';
    })();
  }

  // Re-pack if the window resizes and nothing has been saved yet
  window.addEventListener('resize', () => {
    const anySavedNow = frames.some(el => localStorage.getItem('framePos:' + (el.dataset.id || el.id)));
    if (!anySavedNow) packFrames();
  });

  autoGrowLayer();      // set layer min-height to fit packed frames

  function keyFor(el){ return 'framePos:' + (el.dataset.id || el.id); }

  function savePosition(el){
    localStorage.setItem(keyFor(el), JSON.stringify({ left: el.style.left, top: el.style.top }));
  }
  function restorePositions(){
    frames.forEach(el => {
      const saved = JSON.parse(localStorage.getItem(keyFor(el)) || 'null');
      if (saved) { el.style.left = saved.left; el.style.top = saved.top; }
    });
  }
  function packFrames() {
  // config
  const gutter = 16;           // space between frames
  const step   = 12;           // x-search step in px to try positions
  const padL   = 16, padT = 16;

    // Use a safe width
  let containerW = layer.clientWidth || layer.getBoundingClientRect().width || window.innerWidth || 1024;
  containerW = Math.max(containerW, 320);  // minimum working width

  // sort: older first (placed earlier = further “back”),
  // then stable by data-id to keep consistent
  const sorted = [...frames].sort((a, b) => {
    const ya = parseInt(a.dataset.year || '9999', 10);
    const yb = parseInt(b.dataset.year || '9999', 10);
    if (ya !== yb) return ya - yb;          // older first
    return (a.dataset.id || '').localeCompare(b.dataset.id || '');
  });

  // skyline: keep already-placed rects
  const placed = [];

  // helper: rect from element’s intended position
  const rectAt = (el, left, top) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    return { left, top, right: left + w, bottom: top + h, w, h, el };
  };

  // test overlap with any placed rect (with gutter)
  const overlaps = (r) => {
    for (const p of placed) {
      const sepH = r.right + gutter <= p.left || p.right + gutter <= r.left;
      const sepV = r.bottom + gutter <= p.top  || p.bottom + gutter <= r.top;
      if (!(sepH || sepV)) return true;
    }
    return false;
  };

  // scanline placement for each card
  const maxX = layer.clientWidth;
  let maxBottom = 0;

  for (const el of sorted) {
    // start from the left, try x positions across the layer
    let best = null;

    for (let x = padL; x + el.offsetWidth + padL <= maxX; x += step) {
      // drop down until it doesn't overlap anything already placed
      let y = padT;
      let probe = rectAt(el, x, y);
      // push down while we overlap any existing rectangle
      while (overlaps(probe)) {
        // find the first conflicting rect and push just below it
        let pushed = false;
        for (const p of placed) {
          const sepH = probe.right + gutter <= p.left || p.right + gutter <= probe.left;
          if (!sepH && probe.top < p.bottom + gutter) {
            y = p.bottom + gutter;
            probe = rectAt(el, x, y);
            pushed = true;
            break;
          }
        }
        if (!pushed) break; // safety
      }

      // choose placement with minimal y; tiebreaker: minimal x
      if (!best || probe.top < best.top || (probe.top === best.top && probe.left < best.left)) {
        best = probe;
      }
    }

    // place the element
    if (!best) {
      // if too wide, pin to left and stack
      best = rectAt(el, padL, maxBottom + gutter);
    }
    el.style.left = best.left + 'px';
    el.style.top  = best.top  + 'px';
    placed.push(best);
    maxBottom = Math.max(maxBottom, best.bottom);
  }

  // z-index: older (sorted earlier) behind newer
  sorted.forEach((el, i) => {
    el.style.zIndex = String(100 + i); // small base to keep above page bg
  });

  // grow layer to fit packed frames
  layer.style.minHeight = Math.ceil(maxBottom + gutter) + 'px';
}

  function autoGrowLayer(){
    // compute bounds of all frames and set layer height so nothing overflows
    const rects = frames.map(el => el.getBoundingClientRect());
    if (!rects.length) return;
    const lr = layer.getBoundingClientRect();
    const maxBottom = Math.max(...rects.map(r => r.bottom)) - lr.top;
    layer.style.minHeight = Math.ceil(maxBottom + 24) + 'px';
  }

  // Recompute layer height if window resized (frames may wrap differently after auto-pack)
  window.addEventListener('resize', () => { autoGrowLayer(); });
});

document.getElementById('resetLayout').addEventListener('click', () => {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith("framePos:")) localStorage.removeItem(k);
  });
  location.reload();
});

// Utility: wait until images inside #float-layer have decoded, then run fn
async function afterImagesReady(fn) {
  const imgs = Array.from(layer.querySelectorAll('img'));
  // If no images, just run
  if (imgs.length === 0) { fn(); return; }

  // Wait for decode() where available; fall back to load/complete
  await Promise.all(imgs.map(img => {
    if ('decode' in img) return img.decode().catch(()=>{});
    if (img.complete) return Promise.resolve();
    return new Promise(res => img.addEventListener('load', res, {once:true}));
  }));

  // Also wait one RAF so layout settles (fonts, etc.)
  requestAnimationFrame(() => fn());
}

// Replace your old restore/pack block with this:
restorePositions();

// If any saved position exists, restore and just grow the layer height
const anySaved = frames.some(el => localStorage.getItem('framePos:' + (el.dataset.id || el.id)));

if (anySaved) {
  // ensure the layer is tall enough after restoring
  requestAnimationFrame(() => {
    const rects = frames.map(el => el.getBoundingClientRect());
    if (!rects.length) return;
    const lr = layer.getBoundingClientRect();
    const maxBottom = Math.max(...rects.map(r => r.bottom)) - lr.top;
    layer.style.minHeight = Math.ceil(maxBottom + 24) + 'px';
  });
} else {
  // FIRST LOAD: wait for images & layout, then pack
  afterImagesReady(() => {
    // If layer width is still tiny (e.g. 0–200px), delay once more
    const lw = layer.clientWidth || layer.getBoundingClientRect().width || 0;
    if (lw < 200) {
      requestAnimationFrame(() => packFrames());
    } else {
      packFrames();
    }
  });
}

// Repack only if nothing has been saved yet (first-time layout)
window.addEventListener('resize', () => {
  const anySavedNow = frames.some(el => localStorage.getItem('framePos:' + (el.dataset.id || el.id)));
  if (!anySavedNow) {
    // debounce: wait a tick for layout to settle
    clearTimeout(window.__packDebounce);
    window.__packDebounce = setTimeout(() => {
      packFrames();
    }, 100);
  }
});
