# Smart Portfolio

This project is a modern portfolio website built with Next.js 15, featuring AI-powered tech stack validation and interactive visualizations.

## Key Features

- **Tech Stack Architecture Visualization**: Interactive drag-and-drop interface to design and validate technology stacks with AI feedback
- **GitHub Integration**: Dynamic GitHub statistics, featured projects, and contribution graphs
- **Responsive Design**: Fully responsive UI with dark/light mode support using Tailwind CSS and NextUI components
- **Blog System**: Markdown-based blog with reading time estimation and syntax highlighting
- **Performance Optimized**: Server components, static generation, and efficient caching strategies

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS, NextUI components, Framer Motion
- **AI/ML**: 
  - Google Gemini AI for tech stack validation
  - ReactFlow for tech stack visualization
- **GitHub API**: Octokit for repository and contribution data
- **UI Components**: 
  - React Icons
  - Lucide React
  - Recharts for data visualization
- **Content**: 
  - React Markdown
  - Gray Matter for frontmatter parsing
  - React Syntax Highlighter

## Features Summary

1. **Home Page**: Featuring about section, skills, timeline, and featured projects
2. **Tech Stack Architect**: Interactive tool for designing and validating technology stacks with AI feedback
3. **Blog System**: Markdown-based blog with filtering capabilities
4. **GitHub Integration**: Dynamic display of repositories and statistics

## Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- Git

## Installation Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/medevs/smart-portfolio.git
   cd smart-portfolio
   ```
2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Google AI API Key for Gemini models (used for tech stack validation)
   # Get your API key from: https://makersuite.google.com/app/apikey
   GOOGLE_API_KEY=your_google_api_key

   # GitHub
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token

   # Optional: Add any other API keys needed for additional features
   ```
4. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:3000`
5. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## Project Structure

For a detailed breakdown of the project’s folders and files, see [Project-Structure.md](./Project-Structure.md).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.