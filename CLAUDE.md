# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NullBoard is a satirical "project management tool with absolutely no features" - a React-based web application that intentionally provides no functionality while maintaining a polished UI. The project serves as a humorous commentary on project management tools.

## Architecture

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Build Tool**: Create React App (react-scripts)
- **Testing**: Jest with React Testing Library

## Project Structure

The main application code is located in the `nullboard/` subdirectory:
- `src/App.tsx` - Main application component with dark/light mode toggle and mock functionality buttons
- `src/index.tsx` - Application entry point
- `src/index.css` - Global styles including Tailwind imports
- Configuration files are in the `nullboard/` root

## Development Commands

Navigate to the `nullboard/` directory before running commands:

```bash
cd nullboard
```

### Core Commands
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (irreversible)

### Development Workflow
1. All development work should be done in the `nullboard/` subdirectory
2. The app uses React hooks for state management (dark mode, message display)
3. Tailwind classes are used throughout for styling with conditional dark mode support
4. The app intentionally shows error messages when users try to use "features"

## Key Application Features

- **Dark/Light Mode Toggle**: Controlled by `darkMode` state in App.tsx:15
- **Mock Feature Buttons**: All trigger the same "feature doesn't exist" message
- **Responsive Design**: Uses Tailwind's responsive utilities
- **Error State**: Displays humorous error messages when users attempt to use functionality

## Code Style

- Uses functional components with React hooks
- Tailwind CSS classes for all styling
- Conditional styling based on dark mode state
- TypeScript with strict configuration