# AI-Driven To-Do List Manager - Modern UI

This is a modern, premium-grade UI design for an AI-Driven To-Do List Manager with a clean, minimal, and AI-themed design.

## Features

- Modern UI with glassmorphism design
- Responsive layout that works on all devices
- AI-powered task categorization and prioritization
- Beautiful data visualization
- Smooth animations and transitions
- Intuitive navigation

## Design Specifications

### Color Palette
- Primary Color: #4F46E5 (Indigo)
- Accent Color: #7C3AED (Purple Glow)
- Background: #F9FAFB
- Card Background: #FFFFFF
- Text: #1F2937 (Dark Gray)
- AI Glow: Neon cyan (#00F6FF with 40% opacity)

### UI Style
- Smooth rounded corners (border-radius: 16px)
- Glassmorphism cards (blur + opacity)
- Soft shadows
- Interactive hover animations
- Gradient buttons
- Floating icons

## Pages

1. **Home Page** - Welcome users & introduce the smart AI To-Do system
2. **Dashboard Page** - Where users add, view & manage tasks
3. **AI Analysis Page** - Show AI output in a clean, premium UI
4. **Insights Page** - Show analytics & progress with charts
5. **About Project Page** - For viva presentation

## Components

- Navbar
- TaskInput
- TaskCard
- TaskList
- AIBotButton
- AISuggestionsModal
- Footer

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Install Tailwind CSS:
   ```
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Technologies Used

- React
- Tailwind CSS
- Vite
- React Router
- Axios

## Folder Structure

```
src/
  components/
    Navbar.jsx
    TaskInput.jsx
    TaskCard.jsx
    TaskList.jsx
    AIBotButton.jsx
    AISuggestionsModal.jsx
    Footer.jsx

  pages/
    Home.jsx
    Dashboard.jsx
    Insights.jsx
    About.jsx

  styles/
    global.css

  App.jsx
  main.jsx
```