# PWA Icons Generation Guide

## Quick Method: Use the SVG

1. Open `public/icons/icon.svg` in a browser
2. Take a screenshot or export as PNG
3. Resize to required dimensions

## Required Icon Sizes

For PWA, you need these sizes in `public/icons/`:

- `icon-192x192.png` - Home screen icon (Android)
- `icon-512x512.png` - Home screen icon (larger devices)
- `icon-192x192-maskable.png` - Maskable icon (Android adaptive icons)
- `icon-512x512-maskable.png` - Maskable icon (larger)

## Online Tools

### 1. Figma (Recommended)
1. Open Figma
2. Create frame 512x512
3. Import `icon.svg`
4. Export as PNG at 192x192 and 512x512
6. For maskable: add 72px padding (safe zone)

### 2. Canva
1. Go to Canva.com
2. Create custom size: 512x512
3. Upload `icon.svg`
4. Download as PNG

### 3. RealFaviconGenerator
1. Go to https://realfavicongenerator.net/
2. Upload `icon.svg` or `icon-512x512.png`
3. Configure for PWA
4. Download generated icons
5. Place in `public/icons/`

### 4. App Icon Generator
1. Go to https://appicon.co/
2. Upload your icon
3. Download iOS and Android icons
4. Extract needed sizes

## Command Line (if you have ImageMagick)

```bash
# Install ImageMagick
# macOS: brew install imagemagick
# Windows: choco install imagemagick
# Linux: sudo apt install imagemagick

# Generate 192x192
convert public/icons/icon.svg -resize 192x192 public/icons/icon-192x192.png

# Generate 512x512
convert public/icons/icon.svg -resize 512x512 public/icons/icon-512x512.png

# Generate maskable (with padding)
convert public/icons/icon.svg -resize 362x362 -background none -gravity center -extent 512x512 public/icons/icon-512x512-maskable.png
```

## OG Image Generation

For Open Graph image (`public/og-image.png`):

1. Open `public/og-template.html` in browser
2. Take screenshot (1200x630)
3. Save as `public/og-image.png`

Or use Figma:
1. Create frame 1200x630
2. Recreate the design from `og-template.html`
3. Export as PNG

## Twitter Card Image

Same as OG image but can be different:
- Size: 1200x630 (summary_large_image)
- Save as `public/twitter-image.png`

## Verification

After adding icons, verify:

1. PWA: https://realfavicongenerator.net/
2. Lighthouse in Chrome DevTools
3. https://www.pwabuilder.com/
