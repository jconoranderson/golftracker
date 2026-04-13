# 🏌️‍♂️ GolfTracker

A mobile-first, high-performance web application to track your personal golf rounds built with React, Vite, and Tailwind CSS. 

![Screenshot Placeholder](public/favicon.svg) <!-- Replace with an actual screenshot! -->

## ✨ Features

- **Mobile First Design**: A fluid UI crafted for thumb accessibility while out on the course.
- **Premium Aesthetics**: Defaults to a sleek dark mode highlighted with classic Masters Green accents.
- **Detailed Stat Tracking**: Track your total score, putts, fairways hit, and Greens in Regulation (GIR) per round using ergonomic steppers and toggle pills.
- **Dashboard Analysis**: Instantly visualize your Average Score, Putting Average, and active GIR percentage. Includes a trend graph of your recent scores.
- **Private Data Storage**: Your rounds are saved securely to your device's Local Storage. No internet connection required!
- **Data Portability**: Click "Export to JSON" on the Stats page to pull raw data for Python/R analytics down the road.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jconoranderson/golftracker.git
   cd golftracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 📦 Building for Production

To create a production-ready build:

```bash
npm run build
```

This will output optimized, minified files directly into the `/dist` directory.

---
*Built with ❤️ for precision out on the fairway.*
