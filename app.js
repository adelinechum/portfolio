document.addEventListener('DOMContentLoaded', () => {
  // --- 1) CLICK-TO-OPEN (vanilla) ------------------------------------------
  const thumbEls = Array.from(document.getElementsByClassName('thumbnails'));

  thumbEls.forEach(el => {
    el.addEventListener('click', openView, false);
  });

  function openView(e) {
    // Find the IMG that has the id we switch on (handles clicks on captions, wrappers)
    const img = e.target.tagName === 'IMG' ? e.target : e.currentTarget.querySelector('img[id]');
    if (!img) return;

    const viewID = img.id;

    switch (viewID) {
      case 'Flatten':
        addIframe('FlattenLink', 'https://centerforspatialresearch.github.io/summer2020_covidpolicies/');
        break;
      case 'Paradise':
        addIframe('ParadiseLink', 'https://adelinechum.github.io/rebuildingParadiseInterface/');
        break;
      case 'SafeSpace':
        addIframe('SafeSpaceLink', './SafeSpace.html');
        break;
      case 'Housing':
        addIframe('HousingLink', 'https://adelinechum.github.io/36YearsOfHousing/');
        break;
      case 'Furniture':
        addIframe('FurnitureLink', './Furniture.html');
        break;
      case 'Care':
        addIframe('CareLink', './Care.html');
        break;
      case 'Quilted':
        addIframe('QuiltedLink', './Quilt.html');
        break;
      case 'Pillow':
        addIframe('PillowLink', './Pillow.html');
        break;
      case 'SteroidPlants':
        addIframe('SteroidPlantsLink', './SteroidPlants.html');
        break;
      case 'MoMa':
        addIframe('MoMaLink', './Moma.html');
        break;
      case 'Refactoring':
        addIframe('RefactoringLink', './Refactoring.html');
        break;
      case 'Desert':
        addIframe('DesertLink', './Desert.html');
        break;
      case 'Wetlands':
        addIframe('WetlandsLink', './Wetlands.html');
        break;
      default:
        return;
    }
  }

  function addIframe(id, src) {
    // Remove any existing viewer first
    document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
    const iframe = document.createElement('iframe');
    iframe.id = id;
    iframe.className = 'displayImages';
    iframe.src = src;
    iframe.allowTransparency = 'false';
    iframe.style.display = 'flex';
    document.body.appendChild(iframe);
  }

  // Esc to close viewer
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('iframe.displayImages').forEach(n => n.remove());
    }
  });

  // --- 2) THEME HIGHLIGHTING (jQuery), load safely --------------------------
  // If you truly need jQuery here, wait for it to be loaded before using it.
  const jqScript = document.createElement('script');
  jqScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
  jqScript.onload = () => {
    // Your existing handlers after jQuery is ready
    Array.from(document.getElementsByClassName('button')).forEach(el =>
      el.addEventListener('click', highlight, false)
    );

    function unhighlightAll() {
      $('.highlightDatavis, .highlightDesign, .highlightModelmaking, .highlightAnimation, .highlightExhibit, .highlightViz')
        .css({ opacity: '100%', 'border-color': 'white' });
    }

    function highlight(e) {
      const key = e.target.id;
      unhighlightAll();
      switch (key) {
        case 'datavis':
          $('.highlightDatavis').css('border-color', 'lime');
          $('.highlightDesign, .highlightModelmaking, .highlightAnimation, .highlightExhibit, .highlightViz').css('opacity', '60%');
          break;
        case 'designstudio':
          $('.highlightDesign').css('border-color', '#ff00f7');
          $('.highlightModelmaking, .highlightAnimation, .highlightExhibit, .highlightViz, .highlightDatavis').css('opacity', '60%');
          break;
        case 'modelmaking':
          $('.highlightModelmaking').css('border-color', '#bfff00');
          $('.highlightAnimation, .highlightExhibit, .highlightViz, .highlightDatavis, .highlightDesign').css('opacity', '60%');
          break;
        case 'animation':
          $('.highlightAnimation').css('border-color', 'aqua');
          $('.highlightExhibit, .highlightViz, .highlightDatavis, .highlightDesign, .highlightModelmaking').css('opacity', '60%');
          break;
        case 'exhibit':
          $('.highlightExhibit').css('border-color', '#ff6a00');
          $('.highlightViz, .highlightDatavis, .highlightDesign, .highlightModelmaking, .highlightAnimation').css('opacity', '60%');
          break;
        default:
          break;
      }
      // Toggle active class on the clicked button
      $('.button').not(e.target).removeClass('active');
      $(e.target).toggleClass('active');
    }
  };
  document.head.appendChild(jqScript);

  // --- 3) FREE-FLOATING DRAGGABLE FRAMES (vanilla) --------------------------
  // Make sure you have: <section id="float-layer"> ... <div class="thumbnails frame" data-id="Paradise">...</div> ... </section>
  const layer = document.getElementById('float-layer');
  if (layer) {
    const dragEls = Array.from(layer.querySelectorAll('.thumbnails.frame'));

    restorePositions();

    let active = null, startX = 0, startY = 0, origX = 0, origY = 0;

    dragEls.forEach(f => {
      f.addEventListener('pointerdown', (e) => {
        active = f;
        f.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        const r = f.getBoundingClientRect();
        const lr = layer.getBoundingClientRect();
        origX = r.left - lr.left;
        origY = r.top - lr.top;
        f.style.zIndex = String(Date.now()); // bring to front
      });
      f.addEventListener('pointermove', (e) => {
        if (!active) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const nx = Math.max(0, Math.min(origX + dx, layer.clientWidth - active.offsetWidth));
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

    autoPackIfNeeded();

    function savePosition(el){
      const key = 'framePos:' + (el.dataset.id || el.id);
      localStorage.setItem(key, JSON.stringify({ left: el.style.left, top: el.style.top }));
    }

    function restorePositions(){
      dragEls.forEach(el => {
        const key = 'framePos:' + (el.dataset.id || el.id);
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved) {
          el.style.left = saved.left;
          el.style.top  = saved.top;
        }
      });
    }

    function autoPackIfNeeded(){
      const anySaved = dragEls.some(el => localStorage.getItem('framePos:' + (el.dataset.id || el.id)));
      if (anySaved) return;
      let x = 16, y = 16, rowH = 0;
      const pad = 16;
      dragEls.forEach(el => {
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        const w = el.offsetWidth || 320;
        const h = el.offsetHeight || 260;
        x += (w + pad);
        rowH = Math.max(rowH, h);
        if (x + w > layer.clientWidth){
          x = 16; y += (rowH + pad); rowH = 0;
        }
      });
    }
  }
});
