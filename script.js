// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bubbles-canvas'),
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 30;

// Add ambient light for realistic 3D rendering
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Bubble particles
const bubbles = [];
const bubbleCount = 15; // Reduced for calmer effect
const yellowColor = new THREE.Color(0xFFD700);

class Bubble {
    constructor() {
        // Larger bubbles: 2-6 units instead of 0.5-2.5
        const size = Math.random() * 4 + 2;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
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
        
        // Add point light for ambient glow
        this.light = new THREE.PointLight(0xFFD700, 0.5, 20);
        this.light.position.copy(this.mesh.position);
        
        scene.add(this.mesh);
        scene.add(this.light);
    }
    
    update() {
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    bubbles.forEach(bubble => bubble.update());
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lanyard API Integration
const DISCORD_USER_ID = '940165136440766464';
const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const CACHE_DURATION = 60000; // 1 minute in milliseconds

let cachedData = null;
let lastFetchTime = 0;

async function fetchDiscordData() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedData;
    }
    
    try {
        const response = await fetch(LANYARD_API_URL);
        const data = await response.json();
        
        if (data.success && data.data) {
            cachedData = data.data;
            lastFetchTime = now;
            return cachedData;
        }
    } catch (error) {
        console.error('Failed to fetch Discord data:', error);
    }
    
    return null;
}

async function updateAvatar() {
    const avatarImg = document.getElementById('discord-avatar');
    const loader = document.querySelector('.avatar-loader');
    
    const data = await fetchDiscordData();
    
    if (data && data.discord_user) {
        const { id, avatar } = data.discord_user;
        const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=256`;
        
        avatarImg.src = avatarUrl;
        avatarImg.onload = () => {
            loader.classList.add('hidden');
        };
    } else {
        // Fallback: hide loader and show placeholder
        loader.classList.add('hidden');
        avatarImg.style.display = 'none';
    }
}

// Initial avatar load
updateAvatar();

// Refresh avatar data every minute
setInterval(updateAvatar, CACHE_DURATION);

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

// Initial activity load
updateActivity();

// Refresh activity every minute (same as avatar)
setInterval(updateActivity, CACHE_DURATION);

// Scroll Indicators with IntersectionObserver
const scrollIndicator = document.getElementById('scroll-indicator');
const endMessage = document.getElementById('end-message');
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
    rootMargin: '0px',
    threshold: 0.5
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            currentSection = sectionId;
            updateActiveDot(sectionId);
            
            // Hide scroll indicator after leaving hero
            if (sectionId !== 'hero') {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
            
            // Show end message on contact section
            if (sectionId === 'contact') {
                endMessage.classList.add('visible');
                scrollIndicator.classList.add('hidden');
            } else {
                endMessage.classList.remove('visible');
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
const cursorTrail = [];
const maxTrailLength = 20;

document.addEventListener('mousemove', (e) => {
    // Create trail element
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    document.body.appendChild(trail);
    
    // Add to trail array
    cursorTrail.push(trail);
    
    // Remove old trails
    if (cursorTrail.length > maxTrailLength) {
        const oldTrail = cursorTrail.shift();
        oldTrail.remove();
    }
    
    // Fade out and remove after 1 second
    setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => {
            trail.remove();
            const index = cursorTrail.indexOf(trail);
            if (index > -1) {
                cursorTrail.splice(index, 1);
            }
        }, 1000);
    }, 50);
});
