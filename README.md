# KB Stone Pro

Professional quoting system for limestone and natural stone contractors.

## Features

- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- 🧱 **Multi-Block Support** - Handle different block types (cream, natural, grey)
- 📐 **Smart Calculations** - Automatic waste, cutting costs, labor hours
- 🏗️ **Wall Diagrams** - Isometric 3D visualization of retaining walls
- 🌏 **Perth Substrate System** - Built-in soil conditions (sand, clay, limestone)
- 🔄 **Corner Walls** - L-shapes, U-shapes with automatic corner deductions
- 📊 **Slope Calculator** - Buried courses, triangle blocks for transitions
- 📄 **Professional PDFs** - Client quotes, materials orders, job sheets
- ⚙️ **Admin Panel** - Customize pricing, block types, materials
- 🌙 **Dark Mode** - Eye-friendly night mode

## Installation

### Quick Start
1. Open `index.html` in a browser
2. Click the install prompt (or Add to Home Screen on mobile)
3. Start quoting!

### GitHub Pages Deployment
1. Fork this repo
2. Go to Settings → Pages
3. Source: Deploy from branch `main`
4. Visit: `https://[your-username].github.io/kb-stone-pro`

### Netlify Deployment
1. Drag the folder into Netlify Drop
2. Done!

## Usage

### Creating a Quote
1. Enter client details
2. Add block groups (different wall sections)
3. Enter dimensions (accepts mm or m: `1200` or `1.2`)
4. Select soil type (sand/clay/limestone)
5. Add corners if needed (L-shape, U-shape)
6. Generate wall diagram
7. Export professional PDF quote

### Wall Diagrams
- Click "🖼️ Generate Wall Diagram" in any block group
- See isometric 3D view of your wall
- Save PNG or attach to PDF quotes
- Supports corners and multi-segment walls

### Admin Settings
- Click hamburger menu (☰) in header
- Customize block types, pricing, materials
- Set profit margin, GST rate
- All settings saved to browser

## Technical Details

- **Architecture:** Single-file PWA (all code embedded in index.html)
- **Storage:** localStorage (client-side only)
- **Rendering:** Canvas API for isometric diagrams
- **PDF:** HTML → Print with custom styling
- **Offline:** Service Worker caching
- **Size:** ~75KB total (fully self-contained)

## File Structure

```
kb-stone-pro/
├── index.html       # Main app (all JS/CSS embedded)
├── sw.js            # Service worker for offline
├── manifest.json    # PWA configuration
├── icon-180.png     # Apple touch icon
├── icon-192.png     # PWA icon (small)
└── icon-512.png     # PWA icon (large)
```

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- iOS Safari 14+
- Android Chrome

## Development

### No Build Process Required
All code is in `index.html` - just edit and refresh!

### Key Functions
- `calcGroup()` - Calculate blocks, materials, costs
- `renderWallDiagram()` - Isometric canvas rendering
- `pdfQuote()` - Generate client PDF
- `calcSlope()` - Buried courses for retaining walls

### Testing Locally
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx serve .

# Then visit: http://localhost:8000
```

## License

MIT License - Use freely for your business!

## Credits

Built for KB Stone Pty Ltd  
Perth, Western Australia

---

**Note:** This is a complete, standalone PWA. No server, no database, no external dependencies. Just open and use!
