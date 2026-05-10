# Portfolio Website

A modern, animated portfolio website showcasing projects, skills, and contact information with Three.js background effects.

## 🚀 Features

- **Animated Background**: Three.js bubble spheres with vertex deformation and point lights
- **Discord Integration**: Real-time Discord avatar display using Lanyard API
- **Smooth Scrolling**: Full-page scroll snapping with navigation dots
- **Responsive Design**: Mobile-friendly layout with adaptive grids
- **Modern UI**: Glassmorphism cards with gold accent styling
- **Interactive Elements**: Hover effects, smooth transitions, and micro-interactions

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Animation**: Three.js (r128) for 3D background effects
- **APIs**: Lanyard API for Discord integration
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties
- **Fonts**: Google Fonts (Courier Prime)

## 📁 Project Structure

```
/
├── index.html          # Main portfolio page
├── style.css           # All styles and responsive design
├── script.js           # Three.js animations and interactions
├── README.md           # Project documentation
└── .gitignore          # Git ignore rules
```

## 🎨 Design System

- **Primary Color**: Gold (#FFD700)
- **Background**: Dark radial gradient
- **Typography**: Monospace (Courier Prime)
- **Card Style**: Glassmorphism with blur effects
- **Animations**: GSAP-inspired smooth transitions

## 📱 Sections

1. **Hero**: Introduction with Discord avatar and activity status
2. **Projects**: 3-column grid of project showcases
3. **Skills**: Categorized technology stack display
4. **Contact**: Social links and contact information
5. **Footer**: Copyright and repository information

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- No build tools or dependencies required

### Installation
1. Clone the repository:
```bash
git clone https://github.com/Bl43eX/portfolio.git
cd portfolio
```

2. Open `index.html` in your browser or serve locally:
```bash
# Option 1: Python server
python -m http.server 8000

# Option 2: Node.js serve
npx serve

# Option 3: Live Server (VS Code extension)
```

3. Navigate to `http://localhost:8000`

## ⚙️ Configuration

### Discord Integration
Update Discord user ID in `script.js`:
```javascript
const DISCORD_USER_ID = '940165136440766464'; // Change to your ID
```

### Customization
- **Colors**: Modify `#FFD700` in `style.css` for accent color
- **Bubbles**: Adjust `bubbleCount` in `script.js` (line 20)
- **Content**: Edit HTML directly for text and project information

## 🎯 Key Features

### Three.js Background
- 15 animated bubble spheres
- Vertex deformation animations
- Point lighting effects
- Boundary wrapping
- Performance optimized

### Discord Integration
- Real-time avatar fetching
- Activity status display
- 1-minute cache to prevent rate limits
- Graceful fallback on API failure

### Scroll Behavior
- IntersectionObserver for section tracking
- Smooth scroll snapping
- Dynamic navigation dots
- Scroll indicators
- "That's it! :)" end message

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+ (3-column layouts)
- **Tablet**: 768px-1024px (2-column layouts)  
- **Mobile**: <768px (1-column layouts)

## 🚀 Deployment

This is a static site and can be deployed anywhere:

### Static Hosting
- **GitHub Pages**: Connect repository to GitHub Pages
- **Netlify**: Drag and drop build folder
- **Vercel**: Import repository
- **Surge.sh**: `surge` command

### Custom Domain
Update base URLs in `index.html` meta tags for custom domain setup.

## 🔧 Development

### Local Development
For live reload during development:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **GitHub**: [@Bl43eX](https://github.com/Bl43eX)
- **Telegram**: [@ifritov](https://t.me/ifritov)
- **Email**: ifritov@atomicmail.io

---

Made with ❤️ and lots of ☕
