// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bubbles-canvas'),
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
camera.position.z = 30;

// Add ambient light for realistic 3D rendering
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Bubble particles
const bubbles = [];
const bubbleCount = 15; // Reduced for calmer effect
const yellowColor = new THREE.Color(0xFFD700);
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bubbleSegments = isMobile ? 18 : 24;

class Bubble {
    constructor() {
        // Larger bubbles: 2-6 units instead of 0.5-2.5
        const size = Math.random() * 4 + 2;
        const geometry = new THREE.SphereGeometry(size, bubbleSegments, bubbleSegments);
        
        // Store original vertices for deformation
        this.originalVertices = [];
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            this.originalVertices.push(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: yellowColor,
            transparent: true,
            opacity: Math.random() * 0.4 + 0.4,
            metalness: 0.3,
            roughness: 0.4,
            emissive: yellowColor,
            emissiveIntensity: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Random position
        this.mesh.position.x = (Math.random() - 0.5) * 60;
        this.mesh.position.y = (Math.random() - 0.5) * 40;
        this.mesh.position.z = (Math.random() - 0.5) * 20;
        
        // Movement properties - slightly faster
        this.velocity = {
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.008
        };
        
        // Deformation properties - slower and smoother
        this.deformSpeed = Math.random() * 0.008 + 0.004;
        this.deformAmount = Math.random() * 0.4 + 0.2;
        this.time = Math.random() * Math.PI * 2;
        this.frameOffset = Math.floor(Math.random() * 2);
        
        // Add point light for ambient glow
        this.light = new THREE.PointLight(0xFFD700, 0.5, 20);
        this.light.position.copy(this.mesh.position);
        
        scene.add(this.mesh);
        scene.add(this.light);
    }
    
    update(frameCount) {
        // Move bubble
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.y += this.velocity.y;
        this.mesh.position.z += this.velocity.z;
        
        // Update light position to follow bubble
        this.light.position.copy(this.mesh.position);
        
        // Boundary check and wrap around
        if (Math.abs(this.mesh.position.x) > 35) this.velocity.x *= -1;
        if (Math.abs(this.mesh.position.y) > 25) this.velocity.y *= -1;
        if (Math.abs(this.mesh.position.z) > 15) this.velocity.z *= -1;
        
        // Deform vertices
        this.time += this.deformSpeed;
        const positions = this.mesh.geometry.attributes.position;

        if (reduceMotion || ((frameCount + this.frameOffset) % 2 !== 0)) {
            return;
        }
        
        for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            const x = this.originalVertices[i3];
            const y = this.originalVertices[i3 + 1];
            const z = this.originalVertices[i3 + 2];
            
            const deform = Math.sin(this.time + i * 0.1) * this.deformAmount;
            
            positions.setXYZ(
                i,
                x + Math.sin(this.time + y) * deform,
                y + Math.cos(this.time + x) * deform,
                z + Math.sin(this.time + x + y) * deform
            );
        }
        
        positions.needsUpdate = true;
    }
}

// Create bubbles
for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
}

let frameCount = 0;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    frameCount += 1;
    bubbles.forEach((bubble) => bubble.update(frameCount));
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
});

// Lanyard API Integration
const DISCORD_USER_ID = '940165136440766464';
const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const CACHE_DURATION = 60000; // 1 minute in milliseconds
const LOCAL_CACHE_KEY = 'discord_presence_cache_v2';
const REQUEST_TIMEOUT = 8000;

let cachedData = null;
let lastFetchTime = 0;

function readLocalCache() {
    try {
        const raw = localStorage.getItem(LOCAL_CACHE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }

        if (typeof parsed.timestamp !== 'number' || !parsed.data) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function writeLocalCache(data, timestamp) {
    try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ data, timestamp }));
    } catch {
        // Ignore quota/storage mode failures.
    }
}

function getDiscordDefaultAvatarUrl(id) {
    const fallbackIndex = Number(id) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
}

function buildDiscordAvatarUrl(user) {
    if (!user || !user.id) {
        return '';
    }

    if (!user.avatar) {
        return getDiscordDefaultAvatarUrl(user.id);
    }

    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
}

async function fetchDiscordData() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedData;
    }
    
    const localCache = readLocalCache();
    if (!cachedData && localCache) {
        cachedData = localCache.data;
        lastFetchTime = localCache.timestamp;

        if ((now - localCache.timestamp) < CACHE_DURATION) {
            return cachedData;
        }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(LANYARD_API_URL, {
            cache: 'no-store',
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
            cachedData = data.data;
            lastFetchTime = now;
            writeLocalCache(cachedData, lastFetchTime);
            return cachedData;
        }
    } catch (error) {
        console.error('Failed to fetch Discord data:', error);
        if (cachedData) {
            return cachedData;
        }

        if (localCache?.data) {
            return localCache.data;
        }
    } finally {
        clearTimeout(timeout);
    }
    
    return null;
}

async function updateAvatar() {
    const avatarImg = document.getElementById('discord-avatar');
    const loader = document.querySelector('.avatar-loader');
    
    const data = await fetchDiscordData();
    
    if (data && data.discord_user) {
        const avatarUrl = buildDiscordAvatarUrl(data.discord_user);

        if (!avatarUrl) {
            loader.classList.add('hidden');
            avatarImg.style.display = 'none';
            return;
        }

        const preloaded = new Image();
        preloaded.decoding = 'async';
        preloaded.referrerPolicy = 'no-referrer';

        preloaded.onload = () => {
            avatarImg.src = avatarUrl;
            avatarImg.style.display = 'block';
            loader.classList.add('hidden');
        };

        preloaded.onerror = () => {
            const fallbackUrl = getDiscordDefaultAvatarUrl(data.discord_user.id);
            avatarImg.src = fallbackUrl;
            avatarImg.style.display = 'block';
            loader.classList.add('hidden');
        };

        preloaded.src = avatarUrl;
        avatarImg.onload = () => {
            loader.classList.add('hidden');
        };
    } else {
        const localCache = readLocalCache();
        const fallbackUser = localCache?.data?.discord_user;

        if (fallbackUser?.id) {
            avatarImg.src = buildDiscordAvatarUrl(fallbackUser) || getDiscordDefaultAvatarUrl(fallbackUser.id);
            avatarImg.style.display = 'block';
            loader.classList.add('hidden');
            return;
        }

        loader.classList.add('hidden');
        avatarImg.style.display = 'none';
    }
}

// Discord Activity Display
async function updateActivity() {
    const activityContainer = document.getElementById('discord-activity');
    const activityIcon = document.getElementById('activity-icon');
    const activityName = document.getElementById('activity-name');
    const activityDetails = document.getElementById('activity-details');
    
    const data = await fetchDiscordData();
    
    if (!data) {
        activityContainer.style.display = 'none';
        return;
    }
    
    // Приоритет: обычная активность (type: 0), исключая Custom Status и Spotify
    const regularActivity = data.activities?.find(
        activity => activity.type === 0 && activity.name !== 'Spotify' && activity.name !== 'Custom Status'
    );
    
    // Если нет обычной активности, ищем Spotify
    const spotifyActivity = data.activities?.find(activity => activity.type === 2);
    
    if (regularActivity) {
        // Показываем обычную активность
        const { name, details, state, assets, application_id } = regularActivity;
        
        // Строим URL иконки
        if (assets?.large_image && application_id) {
            const imageId = assets.large_image;
            activityIcon.src = `https://cdn.discordapp.com/app-assets/${application_id}/${imageId}.png`;
            activityIcon.style.display = 'block';
            
            activityIcon.onerror = () => {
                activityIcon.style.display = 'none';
            };
        } else {
            activityIcon.style.display = 'none';
        }
        
        activityName.textContent = name;
        activityDetails.textContent = details || state || 'Active';
        activityContainer.style.display = 'flex';
        
    } else if (spotifyActivity && data.spotify) {
        // Показываем Spotify активность
        const { song, artist } = data.spotify;
        const albumArtUrl = data.spotify.album_art_url;
        
        if (albumArtUrl) {
            activityIcon.src = albumArtUrl;
            activityIcon.style.display = 'block';
            
            activityIcon.onerror = () => {
                activityIcon.style.display = 'none';
            };
        } else {
            activityIcon.style.display = 'none';
        }
        
        activityName.textContent = 'Listening to:';
        activityDetails.textContent = `${song} by ${artist}`;
        activityContainer.style.display = 'flex';
        
    } else {
        // Нет активности - скрываем карточку
        activityContainer.style.display = 'none';
    }
}

async function refreshDiscordUI() {
    await Promise.allSettled([updateAvatar(), updateActivity()]);
}

// GitHub Contribution Graph
async function initGithubGraph() {
    const graphContainer = document.getElementById('github-graph');
    const totalCountLabel = document.getElementById('github-total-contributions');
    if (!graphContainer) return;

    try {
        const response = await fetch('https://github-contributions-api.jogruber.de/v4/bl43ex');
        if (!response.ok) throw new Error('Failed to fetch GitHub contributions');
        
        const data = await response.json();
        let contributions = data.contributions;
        
        // Define "today" as May 12, 2026 (based on current date)
        const today = new Date('2026-05-12');
        
        // Ensure data is sorted by date ascending
        contributions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Filter out future dates and get exactly the last 365 days ending today
        const filteredContributions = contributions.filter(day => new Date(day.date) <= today);
        const lastYear = filteredContributions.slice(-365);
        
        // Calculate total contributions for the header
        const total = lastYear.reduce((sum, day) => sum + day.count, 0);
        if (totalCountLabel) {
            totalCountLabel.textContent = `${total} contributions in the last year`;
        }
        
        graphContainer.innerHTML = '';
        
        lastYear.forEach(day => {
            const cell = document.createElement('div');
            cell.className = `graph-cell level-${day.level}`;
            
            // Format date for tooltip
            const date = new Date(day.date);
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
            
            cell.title = `${day.count} contributions on ${formattedDate}`;
            graphContainer.appendChild(cell);
        });

        // Scroll to the end of the graph (most recent activity)
        const wrapper = graphContainer.parentElement;
        if (wrapper) {
            // Use requestAnimationFrame to ensure DOM is rendered before scrolling
            requestAnimationFrame(() => {
                wrapper.scrollLeft = wrapper.scrollWidth;
            });
        }

    } catch (error) {
        console.error('Error loading GitHub graph:', error);
        graphContainer.innerHTML = '<p class="error-message">Failed to load activity graph.</p>';
    }
}

// Initial data load
refreshDiscordUI();
initGithubGraph();

// Refresh data every minute
setInterval(refreshDiscordUI, CACHE_DURATION);
setInterval(initGithubGraph, CACHE_DURATION * 60); // Refresh GitHub graph every hour

// Scroll Indicators with IntersectionObserver
const scrollIndicator = document.getElementById('scroll-indicator');
const endMessage = document.getElementById('end-message');
const footer = document.querySelector('.footer');
const dotsNav = document.getElementById('dots-nav');
const dots = document.querySelectorAll('.dot');

// Track current section
let currentSection = 'hero';

// Update active dot
function updateActiveDot(sectionId) {
    dots.forEach(dot => {
        if (dot.dataset.section === sectionId) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// IntersectionObserver for section tracking
const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger precisely at the center of the viewport
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            updateActiveDot(sectionId);
            
            // Manage UI states based on section
            if (sectionId === 'contact') {
                endMessage.classList.add('visible');
                footer.classList.add('visible');
                scrollIndicator.classList.add('hidden');
            } else {
                endMessage.classList.remove('visible');
                footer.classList.remove('visible');
                if (sectionId === 'hero') {
                    scrollIndicator.classList.remove('hidden');
                } else {
                    scrollIndicator.classList.add('hidden');
                }
            }
        }
    });
}, observerOptions);

// Observe all sections
const sections = document.querySelectorAll('.section');
sections.forEach(section => {
    sectionObserver.observe(section);
});

// Dots navigation click handlers
dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = dot.dataset.section;
        const target = document.getElementById(targetSection);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cursor trail effect
const pointerFine = window.matchMedia('(pointer: fine)').matches;

if (pointerFine && !isMobile) {
    const TRAIL_SIZE = 14;
    const trails = [];
    let trailIndex = 0;
    let pointerX = 0;
    let pointerY = 0;
    let rafScheduled = false;

    for (let i = 0; i < TRAIL_SIZE; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.opacity = '0';
        document.body.appendChild(trail);
        trails.push(trail);
    }

    function paintTrail() {
        rafScheduled = false;
        const trail = trails[trailIndex];
        trailIndex = (trailIndex + 1) % TRAIL_SIZE;

        trail.style.left = `${pointerX}px`;
        trail.style.top = `${pointerY}px`;
        trail.style.opacity = '0.8';

        requestAnimationFrame(() => {
            trail.style.opacity = '0';
        });
    }

    document.addEventListener('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;

        if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(paintTrail);
        }
    }, { passive: true });
}

function syncProjectTagIconsFromSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    const iconByName = new Map();

    skillItems.forEach((item) => {
        const label = item.querySelector('span')?.textContent?.trim();
        const icon = item.querySelector('svg.skill-icon');

        if (label && icon && !iconByName.has(label)) {
            iconByName.set(label, icon);
        }
    });

    document.querySelectorAll('.project-tags .tag').forEach((tag) => {
        const label = tag.textContent.trim();
        const sourceIcon = iconByName.get(label);

        if (!sourceIcon) {
            return;
        }

        const clonedIcon = sourceIcon.cloneNode(true);
        clonedIcon.classList.remove('skill-icon');
        clonedIcon.classList.add('tag-icon');

        tag.textContent = label;
        tag.prepend(clonedIcon);
    });
}

syncProjectTagIconsFromSkills();
