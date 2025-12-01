# Zuno Tools - All-in-One Professional Tools

A comprehensive collection of professional tools built with Next.js, React, and TypeScript.

## Features

- 🎨 **Image Tools**: Background remover, resizer, compressor, converter, cropper, rotator, filters
- 📄 **Document Tools**: PDF creation and conversion
- 🤖 **AI Tools**: Resume builder, summarizer, English improvement, note summarizer
- 🎭 **Creative Tools**: Meme generator
- 🔧 **Developer Tools**: Code formatter, JSON formatter, Base64 encoder, URL encoder, Hash generator, UUID generator
- 📝 **Text Tools**: Word counter, case converter, text extractor (OCR)
- 🎯 **Utility Tools**: QR generator/scanner, unit converter, timezone converter, IP address info
- 🎨 **Design Tools**: Color picker, Lorem Ipsum generator, favicon generator
- 🔒 **Security Tools**: Password generator, hash generator
- 📚 **Study Tools**: Flashcards, timers, and more

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`

### Deploy to GitHub Pages

For static export:

```bash
# Add to next.config.js
output: 'export'

# Build
npm run build

# Deploy the 'out' folder to GitHub Pages
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Processing**: Canvas API, @imgly/background-removal
- **PDF**: jsPDF
- **QR Codes**: qrcode, jsQR
- **OCR**: Tesseract.js (optional)

## License

MIT
