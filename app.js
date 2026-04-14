document.addEventListener('DOMContentLoaded', () => {

  // --- VIDEO BACKGROUND FADING SYSTEM ---
  const video = document.getElementById('bg-video');
  let fadeRequestId = null;
  let fadingOutRef = false;
  let targetOpacity = 1;
  let currentOpacity = 0;
  
  // 250ms duration for fade ins/outs
  const FADE_DURATION_MS = 250;
  let fadeStartTime = null;
  let startOpacity = 0;

  function runFadeLoop(timestamp) {
    if (!fadeStartTime) fadeStartTime = timestamp;
    const elapsed = timestamp - fadeStartTime;
    const progress = Math.min(elapsed / FADE_DURATION_MS, 1);
    
    // Ease out quad
    const ease = progress * (2 - progress);
    currentOpacity = startOpacity + (targetOpacity - startOpacity) * ease;
    
    video.style.opacity = currentOpacity;

    if (progress < 1) {
      fadeRequestId = requestAnimationFrame(runFadeLoop);
    } else {
      // Done fading
      if (targetOpacity === 0 && fadingOutRef) {
        // Reset sequence logic
        setTimeout(() => {
          video.currentTime = 0;
          video.play().then(() => {
            fadingOutRef = false;
            triggerFadeIn();
          }).catch(e => console.error('Play intercepted:', e));
        }, 100);
      }
    }
  }

  function triggerFadeIn() {
    if (fadeRequestId) cancelAnimationFrame(fadeRequestId);
    targetOpacity = 1;
    startOpacity = currentOpacity;
    fadeStartTime = null;
    fadingOutRef = false;
    fadeRequestId = requestAnimationFrame(runFadeLoop);
  }

  function triggerFadeOut() {
    if (fadingOutRef) return; // Prevent re-triggering
    fadingOutRef = true;
    if (fadeRequestId) cancelAnimationFrame(fadeRequestId);
    targetOpacity = 0;
    startOpacity = currentOpacity;
    fadeStartTime = null;
    fadeRequestId = requestAnimationFrame(runFadeLoop);
  }

  video.addEventListener('loadeddata', () => {
    video.play().catch(e => console.log('Autoplay prevented:', e));
    triggerFadeIn();
  });

  video.addEventListener('timeupdate', () => {
    // 250ms fade-out when 0.55s remain
    if (video.duration && !fadingOutRef) {
      if (video.duration - video.currentTime <= 0.55) {
        triggerFadeOut();
      }
    }
  });

  // Fallback if ended hits before the precise timeUpdate
  video.addEventListener('ended', () => {
    triggerFadeOut();
  });

  if (video.readyState >= 3) {
    video.play();
    triggerFadeIn();
  }


  // --- POPULATE DISCOVERY STRIP ---
  const stripData = [
    { name: 'Indian Peafowl', latin: 'Pavo cristatus', dist: 150, habitat: 'Forest', img: 'https://images.unsplash.com/photo-1503844281047-cf42eade5ac5?auto=format&fit=crop&w=600&q=80' },
    { name: 'Sacred Lotus', latin: 'Nelumbo nucifera', dist: 800, habitat: 'Wetland', img: 'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?auto=format&fit=crop&w=600&q=80' },
    { name: 'Leopard', latin: 'Panthera pardus', dist: 3200, habitat: 'Forest', img: 'https://images.unsplash.com/photo-1549471013-3364d7200b21?auto=format&fit=crop&w=600&q=80', rare: true },
    { name: 'Mugger Crocodile', latin: 'Crocodylus palustris', dist: 420, habitat: 'Wetland', img: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80' },
    { name: 'Indian Banyan', latin: 'Ficus benghalensis', dist: 120, habitat: 'Urban Green', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80' },
    { name: 'Sloth Bear', latin: 'Melursus ursinus', dist: 5600, habitat: 'Forest', img: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80', rare: true },
    { name: 'Rose-ringed Parakeet', latin: 'Psittacula krameri', dist: 310, habitat: 'Urban Green', img: 'https://images.unsplash.com/photo-1552728089-57105a8e3159?auto=format&fit=crop&w=600&q=80' },
    { name: 'King Cobra', latin: 'Ophiophagus hannah', dist: 7800, habitat: 'Forest', img: 'https://images.unsplash.com/photo-1532054241088-402b41508acc?auto=format&fit=crop&w=600&q=80', rare: true },
    { name: 'Chital Deer', latin: 'Axis axis', dist: 900, habitat: 'Grassland', img: 'https://images.unsplash.com/photo-1484406593171-81f962137979?auto=format&fit=crop&w=600&q=80' }
  ];

  const stripTrack = document.getElementById('strip-track');
  
  stripData.forEach((item, index) => {
    const isNear = item.dist < 500;
    const distText = isNear ? 'Near you 🌿' : `${(item.dist/1000).toFixed(1)}km away`;

    const el = document.createElement('div');
    el.className = 'species-card noise-texture';
    el.style.setProperty('--i', index);
    
    el.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.img}" class="card-img" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-content">
        <h3 class="card-common">${item.name}</h3>
        <p class="card-latin">${item.latin}</p>
        <div class="card-tags">
          <span class="tag-habitat">${item.habitat}</span>
          <span class="tag-dist">${distText}</span>
        </div>
      </div>
    `;
    stripTrack.appendChild(el);
  });

  // Horizontal scroll by drag functionality
  let isDown = false;
  let startX;
  let scrollLeft;

  const startDrag = (e) => {
    isDown = true;
    startX = (e.pageX || e.touches[0].pageX) - stripTrack.offsetLeft;
    scrollLeft = stripTrack.scrollLeft;
  };
  const endDrag = () => { isDown = false; };
  const moveDrag = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = (e.pageX || e.touches[0].pageX) - stripTrack.offsetLeft;
    const walk = (x - startX) * 2;
    stripTrack.scrollLeft = scrollLeft - walk;
  };

  stripTrack.addEventListener('mousedown', startDrag);
  stripTrack.addEventListener('touchstart', startDrag);
  stripTrack.addEventListener('mouseleave', endDrag);
  stripTrack.addEventListener('mouseup', endDrag);
  stripTrack.addEventListener('touchend', endDrag);
  stripTrack.addEventListener('mousemove', moveDrag);
  stripTrack.addEventListener('touchmove', moveDrag);


  // --- LEAFLET MAP INITIALIZATION ---
  const mapCenter = [20.0059, 73.7897]; // Nashik, Maharashtra
  const map = L.map('leaflet-map', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false // disable to let page scroll
  }).setView(mapCenter, 13);

  // CartoDB Positron variant
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  const pulsingIcon = L.divIcon({
    className: '',
    html: '<div class="amber-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const clusterIcon = L.divIcon({
    className: '',
    html: '<div class="cluster-marker">12</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  // Populate mock map data referencing our strip data
  const mapMarkers = [
    { pos: [20.0159, 73.7897], data: stripData[2] }, // Leopard (Rare)
    { pos: [19.9959, 73.7997], data: stripData[0] }, // Peafowl
    { pos: [20.0259, 73.7697], data: stripData[1] }  // Lotus
  ];

  const cluster = L.marker([20.040, 73.750], {icon: clusterIcon}).addTo(map);
  cluster.on('click', () => {
    openSidebar(stripData[0]); // generic cluster mock
  });

  mapMarkers.forEach(m => {
    const marker = L.marker(m.pos, {icon: pulsingIcon}).addTo(map);
    marker.on('click', () => {
      openSidebar(m.data);
    });
  });

  const sidebar = document.getElementById('map-sidebar');
  map.on('click', () => {
    sidebar.classList.remove('open');
  });

  // --- NAVBAR & SCROLL BEHAVIOR ---
  const navbar = document.querySelector('.navbar');
  const scrollIndicator = document.getElementById('scroll-indicator');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    if (scrollIndicator) {
      scrollIndicator.style.opacity = window.scrollY > 50 ? 0 : 1;
    }
  });
  
  function openSidebar(data) {
    sidebar.innerHTML = `
      <button class="sidebar-close" id="close-sidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <h3 class="sidebar-title">Zone Discovery</h3>
      
      <div class="species-detail-card noise-texture">
        ${data.rare ? '<div class="rare-badge">Rare</div>' : ''}
        <img src="${data.img}" class="detail-img">
        <div class="detail-body">
          <h4 class="detail-common">${data.name}</h4>
          <p class="detail-latin">${data.latin}</p>
          <div class="detail-grid">
            <div class="grid-item">
              <span class="grid-label">Habitat</span>
              <span class="grid-value">${data.habitat}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">Diet</span>
              <span class="grid-value">${data.name === 'Leopard' ? 'Carnivore' : (data.habitat === 'Wetland' ? 'Aquatic' : 'Omnivore')}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">Status</span>
              <span class="grid-value">${data.rare ? 'Endangered' : 'Least Concern'}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">Season</span>
              <span class="grid-value">Monsoon</span>
            </div>
          </div>
          <button class="btn-log-sighting">Log a Sighting</button>
        </div>
      </div>
    `;
    sidebar.classList.add('open');

    document.getElementById('close-sidebar').addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }
});
