document.addEventListener('DOMContentLoaded', () => {

  // ===========================================================================
  // CLICK-TO-OPEN (iframe overlay)
  // ===========================================================================
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
      document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
      const iframe = document.createElement('iframe');
      iframe.className = 'displayImages';
      iframe.src = map[id];
      iframe.style.display = 'flex';
      document.body.appendChild(iframe);
    });
  });

  // Close overlay on Esc
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
  });

  // ===========================================================================
  // CAPTIONS: data-title / data-year / data-tags → DOM
  // ===========================================================================
  const TAG_LABELS = {
    datavis: 'Data Visualization',
    designstudio: 'Design Studio',
    modelmaking: 'Models',
    animation: 'Animation',
    exhibit: 'Exhibit',
    pattern: 'Patterns'
  };
  const humanize = s => (s || '')
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());

  document.querySelectorAll('.thumbnails.frame').forEach(card => {
    const title = card.dataset.title || '';
    const year  = card.dataset.year || '';
    const tags  = (card.dataset.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const cap = card.querySelector('.caption');
    if (!cap) return;
    cap.innerHTML = `
      <div class="title">
        ${title} ${year ? `<span class="year">(${year})</span>` : ''}
      </div>
      <ul class="taglist">
        ${tags.map(t => `<li class="tag" data-tag="${t}">${TAG_LABELS[t] || humanize(t)}</li>`).join('')}
      </ul>
    `;
  });

  // ===========================================================================
  // 3D DEPTH (subtle) + FILTER COLORS
  // ===========================================================================
  const TAG_COLORS = {
    datavis: 'lime',
    designstudio: '#ff00f7',
    modelmaking: '#bfff00',
    animation: 'aqua',
    exhibit: '#ff6a00',
    pattern: '#999'
  };

  const layer  = document.getElementById('float-layer');
  if (!layer) return;
  const frames = Array.from(layer.querySelectorAll('.thumbnails.frame'));

  // Subtle depth per year (kept negative so items recede slightly)
  function computeZFromYear(year, minY, maxY, zMin = -220, zMax = -80) {
    const y = Math.max(minY, Math.min(maxY, year || minY));
    const t = (y - minY) / Math.max(1, (maxY - minY));
    return Math.round(zMin + t * (zMax - zMin));
  }
  const years = frames.map(f => parseInt(f.dataset.year || '0', 10)).filter(Boolean);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  frames.forEach(f => {
    const y = parseInt(f.dataset.year || String(minYear), 10);
    const z = computeZFromYear(y, minYear, maxYear);
    f.dataset.baseZ = String(z);
    f.style.setProperty('--z', z + 'px');
    f.style.transform = `translateZ(var(--z))`;
  });

  // ===========================================================================
  // SHUFFLE / RANDOM HELPERS
  // ===========================================================================
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function jitterFromId(card, amp = 6) {
    const seed = (card.dataset.id || card.id || 'x').split('').reduce((a,c)=>a + c.charCodeAt(0), 0);
    const r1 = ((seed * 9301 + 49297) % 233280) / 233280;
    const r2 = ((seed * 1379 +  2713) % 233280) / 233280;
    return { dx: (r1 - 0.5) * 2 * amp, dy: (r2 - 0.5) * 2 * amp };
  }
  function tinyAngle(card) {
    const seed = (card.dataset.id || card.id || 'x').length;
    return ((seed % 9) - 4) * 0.25; // -1..+1 deg
  }

  // ===========================================================================
  // COMPRESS TO VIEWPORT (iterative) – no scroll, keeps everything on-screen
  // ===========================================================================
  function ensureLogicalPos(f){
    if (f.dataset.lx == null || f.dataset.ly == null) {
      const left = parseFloat(f.style.left || '0');
      const top  = parseFloat(f.style.top  || '0');
      f.dataset.lx = String(left);
      f.dataset.ly = String(top);
    }
  }
  function measureLogicalBounds() {
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    frames.forEach(f => {
      ensureLogicalPos(f);
      const lx = parseFloat(f.dataset.lx);
      const ly = parseFloat(f.dataset.ly);
      const w = f.offsetWidth;
      const h = f.offsetHeight;
      if (lx < minL) minL = lx;
      if (ly < minT) minT = ly;
      if (lx + w > maxR) maxR = lx + w;
      if (ly + h > maxB) maxB = ly + h;
    });
    if (!isFinite(minL)) { minL = 0; minT = 0; maxR = layer.clientWidth; maxB = layer.clientHeight; }
    return { left:minL, top:minT, width: Math.max(1, maxR - minL), height: Math.max(1, maxB - minT) };
  }
  function _placeFramesWithScaleAndOffset(scale, offsetX, offsetY) {
    frames.forEach(f => {
      const lx = parseFloat(f.dataset.lx || '0');
      const ly = parseFloat(f.dataset.ly || '0');
      f.style.left = (lx * scale + offsetX) + 'px';
      f.style.top  = (ly * scale + offsetY) + 'px';
    });
  }
  function _measureVisualBounds() {
    const rects = frames.map(el => el.getBoundingClientRect());
    if (!rects.length) return null;
    const minL = Math.min(...rects.map(r => r.left));
    const minT = Math.min(...rects.map(r => r.top));
    const maxR = Math.max(...rects.map(r => r.right));
    const maxB = Math.max(...rects.map(r => r.bottom));
    return { left: minL, top: minT, right: maxR, bottom: maxB, width: maxR - minL, height: maxB - minT };
  }
  function compressToViewport(opts = {}) {
  const {
    pad = 24,
    safety = 0.98,
    mode = 'scale-then-center', // 'center-only' keeps shelf spacing
    minScale = 0.95             // only used if mode = 'center-only' and we MUST shrink
  } = opts;

  const nav = document.querySelector('.navbar');
  const navH = nav ? nav.offsetHeight : 0;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const availW = Math.max(1, vw - pad * 2);
  const availH = Math.max(1, vh - navH - pad * 2);

  const b = measureLogicalBounds();

  let scale = 1;
  if (mode === 'scale-then-center') {
    scale = Math.min(1, availW / b.width, availH / b.height) * safety;
  }

  let offsetX = Math.round((vw - b.width  * scale) / 2 - b.left * scale);
  let offsetY = Math.round(navH + (vh - navH - b.height * scale) / 2 - b.top * scale);

  _placeFramesWithScaleAndOffset(scale, offsetX, offsetY);

  // If we chose center-only but still overflow, allow a LITTLE shrink (clamped)
  if (mode === 'center-only') {
    const vb = _measureVisualBounds();
    if (vb) {
      const overL = Math.max(0, pad - vb.left);
      const overT = Math.max(0, navH + pad - vb.top);
      const overR = Math.max(0, vb.right  - (vw - pad));
      const overB = Math.max(0, vb.bottom - (vh - pad));
      const needsShrink = overL || overT || overR || overB;

      if (needsShrink) {
        const fitW = (vw - pad * 2) / vb.width;
        const fitH = (vh - navH - pad * 2) / vb.height;
        const shrink = Math.min(1, fitW, fitH) * safety;
        const newScale = Math.max(minScale, shrink); // don’t go below minScale

        if (newScale < 1) {
          offsetX = Math.round((vw - b.width  * newScale) / 2 - b.left * newScale);
          offsetY = Math.round(navH + (vh - navH - b.height * newScale) / 2 - b.top * newScale);
          _placeFramesWithScaleAndOffset(newScale, offsetX, offsetY);
        }
      }
    }
  }

  requestAnimationFrame(() => {
    const vb = _measureVisualBounds();
    if (!vb) return;
    const lr = layer.getBoundingClientRect();
    const maxBottom = vb.bottom - lr.top;
    layer.style.minHeight = Math.ceil(maxBottom + 24) + 'px';
  });
}


  // ===========================================================================
  // SHELF LAYOUT (multi-lane, perspective-aware)
  // ===========================================================================
  function getPerspectivePx() {
    const stage = document.querySelector('.grid-container');
    const p = stage ? getComputedStyle(stage).perspective : '';
    const n = parseFloat(p);
    return Number.isFinite(n) && n > 0 ? n : 1000; // gentle default
  }
  function visualScaleForZ(zPx) {
    const P = getPerspectivePx();
    return P / (P - zPx); // = 1 when z = 0
  }

  const SHELF_Z     = 0;    // same plane, avoids perspective growth
  const SHELF_ROT   = 0;
  const SHELF_SCALE = 1.0;

  function dockMatchesAtTop(
    matches,
    {
      padX = 24,
      padY = 16,
      gapX = 204,
      rowGap = 32,
      lanes = 1,
      overlapY = 0.55,
      minCols = 1
    } = {}
  ) {
    const nav = document.querySelector('.navbar');
    const navH = nav ? nav.offsetHeight : 0;
    
    const layerRect = layer.getBoundingClientRect();
    // const lineW = Math.max(1, layerRect.width - padX * 2);
    const lineW = Math.max(1, Math.min(layerRect.width, window.innerWidth) - padX * 2);

    const visScale = visualScaleForZ(SHELF_Z) * SHELF_SCALE; // = 1 with defaults
    let gapXVis    = gapX   * visScale;
    const rowGapVis= rowGap * visScale;

    const n = matches.length;
    const spacingBoost =
      n <= 4  ? 1.6 :
      n <= 8  ? 1.3 :
      n <= 14 ? 1.15 : 1.0;

    const maxItemWVis = Math.max(1, ...matches.map(m => m.offsetWidth * visScale * spacingBoost));
    const neededGap = (lineW - minCols * maxItemWVis) / Math.max(1, (minCols - 1));
    if (neededGap < gapXVis) gapXVis = Math.max(8, neededGap);

    lanes = Math.max(1, Math.floor(lanes));
    const laneX = new Array(lanes).fill(padX);
    const baseY = navH + padY;

    let shelfBottom = baseY;

    shuffle(matches).forEach(card => {
      const w  = card.offsetWidth;
      const h  = card.offsetHeight;
      const wV = w * visScale * spacingBoost;
      const hV = h * visScale;

      // pick lane with smallest current X
      let li = 0; for (let i = 1; i < lanes; i++) if (laneX[i] < laneX[li]) li = i;

      // wrap lane if overflow
      if ((laneX[li] - padX) + wV > lineW) laneX[li] = padX;

      const y = baseY + li * (hV * (1 - overlapY) + rowGapVis);

      // on shelf: top stacking, unified plane
      card.style.zIndex    = '10000';
      card.style.transform = `translateZ(${SHELF_Z}px) scale(${SHELF_SCALE}) rotate(${SHELF_ROT}deg)`;

      const jitterAmp = matches.length < 6 ? 300 : 100;
      const { dx, dy } = jitterFromId(card, jitterAmp);

      card.dataset.lx = String(laneX[li] + dx);
      card.dataset.ly = String(y + dy);

      laneX[li] += wV + gapXVis;
      shelfBottom = Math.max(shelfBottom, y + hV);
    });

    return { bottomY: shelfBottom };
  }

  function scatterOthers(others, topStartY = 240, padX = 32, gap = 18) {
    const maxW = window.innerWidth - padX;
    let x = padX;
    let y = topStartY;

    shuffle(others).forEach(card => {
      const w = card.offsetWidth;
      const h = card.offsetHeight;

      if (x + w > maxW) { x = padX; y += h + gap; }

      const { dx, dy } = jitterFromId(card, 300);
      const angle = tinyAngle(card);

      card.style.zIndex = '400';
      card.style.transform = `translateZ(var(--z)) rotate(${angle}deg)`;

      card.dataset.lx = String(x + dx);
      card.dataset.ly = String(y + dy);

      x += w + gap;
    });
  }

  // ===========================================================================
  // FILTER → layout (uses shelf.bottomY)
  // ===========================================================================
  function layoutShelfForTag(key) {
  const useAll = !key || key === 'all';
  const matches = [];
  const others  = [];

  // 1) Build sets (no compress calls here!)
  frames.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;

    if (useAll) {
      img.style.opacity = '1';
      img.style.borderColor = 'white';
      img.style.borderStyle = 'solid';
      img.style.borderWidth = '6px';
      card.style.filter = 'none';
      others.push(card);
    } else {
      const tags = (card.dataset.tags || '').split(',').map(s => s.trim()).filter(Boolean);
      const isMatch = tags.includes(key);

      if (isMatch) {
        matches.push(card);
        img.style.opacity = '1';
        img.style.borderColor = TAG_COLORS[key] || 'white';
        img.style.borderStyle = 'solid';
        img.style.borderWidth = '6px';
        card.style.filter = 'none';
      } else {
        others.push(card);
        img.style.opacity = '0.7';
        img.style.borderColor = 'white';
        img.style.borderStyle = 'solid';
        img.style.borderWidth = '6px';
        card.style.filter = 'saturate(0.85) brightness(0.95)';
      }
    }
  });

  // 2) Layout
  if (useAll) {
    const navH = document.querySelector('.navbar')?.offsetHeight || 0;
    scatterOthers(frames, navH + 140);
    // 3) Fit — allow scaling in "all" mode
    requestAnimationFrame(() => compressToViewport({ mode: 'scale-then-center' }));
  } else {
    const shelf = dockMatchesAtTop(matches, {
      padX: 24, padY: 16,
      gapX: 200,     // tweak and you'll see a real change now
      rowGap: 16,    // tweak
      lanes: 3,      // tweak
      overlapY: 0.15,// tweak
      minCols: 3
    });
    scatterOthers(others, Math.round(shelf.bottomY + 24));
    // 3) Fit — preserve shelf spacing (only shrink if it truly overflows)
    requestAnimationFrame(() => compressToViewport({ mode: 'center-only', minScale: 0.92 }));
  }
}


  // Buttons → dock/filter
  document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.button').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      layoutShelfForTag(e.currentTarget.id);
    });
  });

  // Reset overlay only (no position persistence)
  const resetBtn = document.getElementById('resetLayout');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
      const active = document.querySelector('.button.active');
      const key = active ? active.id : 'all';
      layoutShelfForTag(key);
    });
  }

  // ===========================================================================
  // DRAGGING (free-float) – updates logical positions, then re-fit
  // ===========================================================================
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
      f.style.zIndex = '20000'; // dragged card above all
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
      active.dataset.lx = String(parseFloat(active.style.left) || 0);
      active.dataset.ly = String(parseFloat(active.style.top)  || 0);
      active.releasePointerCapture(e.pointerId);
      active = null;
      requestAnimationFrame(() => compressToViewport());
    });
  });

  // ===========================================================================
  // INITIAL LAYOUT: treat as "all" (random scatter), then fit
  // ===========================================================================
  (async function afterImagesReady() {
    const imgs = Array.from(layer.querySelectorAll('img'));
    if (imgs.length) {
      await Promise.all(imgs.map(img => {
        if ('decode' in img) return img.decode().catch(()=>{});
        if (img.complete) return Promise.resolve();
        return new Promise(res => img.addEventListener('load', res, {once:true}));
      }));
    }
    layoutShelfForTag('all');
  })();

  // Re-fit on resize (re-layout current filter)
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.button.active');
    const key = activeBtn ? activeBtn.id : 'all';
    layoutShelfForTag(key);
  });

});

