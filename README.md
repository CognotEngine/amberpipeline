<p align="center">
  <img src="https://github.com/CognotEngine/amberpipeline/blob/main/input/LOGO.jpeg" width="300" />
</p>

# AmberPipeline

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-33.2.0-blue.svg)](https://www.electronjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.16-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-blue.svg)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95.0+-blue.svg)](https://fastapi.tiangolo.com/)

**AmberPipeline** is a middleware tool focused on converting AI-generated images into game assets, providing designers with a complete workflow solution from image segmentation to character skeleton binding.

By integrating advanced AI image segmentation technology and an intuitive layer editing system, AmberPipeline greatly simplifies the process of creating game character assets, allowing designers to more efficiently transform their creative ideas into usable game resources.

## Project Screenshots

*Note: The following are demonstrations of the main project interfaces; actual effects may vary.*

### Main Interface

![Main Interface](https://github.com/CognotEngine/AmberPipeline/blob/main/input/main_interface.png?raw=true)

### Image Segmentation Feature

![Image Segmentation](https://github.com/CognotEngine/AmberPipeline/blob/main/input/segmentation.png?raw=true)

### Layer Management Panel

![Layer Management](https://github.com/CognotEngine/AmberPipeline/blob/main/input/layer_management.png?raw=true)

## Table of Contents

- [Project Screenshots](#project-screenshots)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation Method](#installation-method)
- [Startup Method](#startup-method)
- [API Endpoints](#api-endpoints)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [System Requirements](#system-requirements)
- [License](#license)
- [Contribution Guide](#contribution-guide)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## Technology Stack

### Frontend
- **React 19** - A JavaScript library for building user interfaces
- **TypeScript (v5.7.0)** - A typed superset of JavaScript that provides type safety
- **Electron (v33.2.0)** - A cross-platform desktop application development framework
- **TailwindCSS (v3.4.16)** - A utility-first CSS framework
- **Vite (v6.0.0)** - Next-generation frontend build tool
- **Shadcn UI** - A component library built on Radix UI and Tailwind CSS
- **Lucide React (v0.460.0)** - Icon library
- **Zustand (v5.0.0)** - A lightweight state management library
- **TanStack Query (v5.90.12)** - A data fetching and caching library

### Backend
- **Python 3** - A high-level programming language
- **FastAPI (v0.95.0+)** - A modern, fast web framework
- **SAM (Segment Anything Model)** - A powerful image segmentation model
- **Pillow (v9.0.0+)** - A Python image processing library
- **NumPy (v1.21.0+)** - A numerical computing library
- **OpenCV (v4.5.0+)** - A computer vision library
- **Uvicorn (v0.22.0+)** - An ASGI server
- **Watchdog (v3.0.0+)** - A directory monitoring library
- **Pydantic (v2.0.0+)** - A data validation library
- **Rich (v13.0.0+)** - Beautiful console output

## Features

As a professional middleware for converting AI-generated images to game assets, AmberPipeline provides a complete workflow solution to help designers efficiently convert original images into assets usable in game development.

### Core Features

#### 1. Precision Cutting
- AI-driven image segmentation and background removal
- Support for point-prompt guided precise segmentation
- Real-time preview and editing capabilities

#### 2. Character Layer Management
- Multi-level character asset management
- Layer stacking and blending modes
- Refined editing toolset

#### 3. Skeleton Binding System
- Character skeleton creation and editing
- Bone weight painting
- Animation preview functionality

### Auxiliary Features

- **Multi-tab management** - Support for handling multiple projects simultaneously
- **Real-time system monitoring** - GPU load, VRAM usage, FPS display
- **Task progress tracking** - Visual display of processing progress
- **Smart panel** - Collapsible right-side properties panel
- **Responsive design** - Adapt to different screen sizes

## Project Structure

```
AmberPipeline/
├── frontend/                 # Frontend code
│   ├── src/                 # Source code
│   │   ├── app/             # Application core
│   │   │   ├── App.tsx      # Main application component
│   │   │   └── main.tsx     # Application entry point
│   │   ├── assets/          # Static resources
│   │   │   ├── styles/      # Style files
│   │   │   │   └── index.css # Main stylesheet
│   │   │   └── images/      # Image assets
│   │   ├── components/      # React components
│   │   │   ├── ai/          # AI-related components
│   │   │   └── common/      # Common components
│   │   ├── i18n/            # Internationalization
│   │   ├── lib/             # Utility libraries
│   │   │   ├── api.ts       # API client
│   │   │   └── queryClient.ts # TanStack Query client
│   │   ├── modules/         # Functional modules
│   │   │   ├── canvas/      # Canvas module
│   │   │   ├── header/      # Header module
│   │   │   ├── properties/  # Properties panel module
│   │   │   └── task/        # Task module
│   │   ├── stores/          # Zustand state management
│   │   ├── themes/          # Theme configurations
│   │   └── types/           # TypeScript type definitions
│   ├── electron/            # Electron related files
│   │   ├── main.cjs         # Electron main process file
│   │   └── preload.js       # Electron preload script
│   ├── public/              # Public resources
│   ├── package.json         # Frontend dependency configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   └── tailwind.config.js   # TailwindCSS configuration
├── backend/                 # Backend code
│   ├── Processed/           # Processed files
│   ├── Sorted/              # Sorted files
│   ├── Temp/                # Temporary files
│   ├── __pycache__/         # Python cache files
│   ├── __init__.py          # Package initialization file
│   ├── config.json          # Configuration file
│   ├── server.py            # FastAPI server
│   └── backend_server.log   # Server log
├── cpp/                     # C++ related code
│   ├── include/             # Header files
│   ├── src/                 # Source code
│   ├── test/                # Test code
│   └── tools/               # Tool code
├── models/                  # Model files
│   └── sam_vit_h_4b8939.pth # SAM model weights
├── modules/                 # Python modules
│   ├── __pycache__/         # Python cache files
│   └── *.py                 # Various functional modules
└── README.md                # Project documentation
```

## Installation Method

### Frontend Installation

```bash
# Enter frontend directory
cd frontend

# Install dependencies
npm install
```

### Backend Installation

```bash
# Enter backend directory
cd backend

# Install core dependencies
pip install fastapi uvicorn pillow numpy python-multipart

# Install SAM model related dependencies
# Note: SAM model may require additional installation steps, please refer to official documentation
```

## Startup Method

### Development Mode Startup

#### Frontend (with Electron)

```bash
# Enter frontend directory
cd frontend

# Start development server and Electron application
npm run electron:dev
```

#### Frontend (Web development server only)

```bash
# Enter frontend directory
cd frontend

# Start Vite development server
npm run dev
```

#### Backend

```bash
# Enter backend directory
cd backend

# Start FastAPI server
python server.py
```

### Production Environment Build

#### Frontend Build

```bash
# Enter frontend directory
cd frontend

# Build production version
npm run build

# Build Electron application
npm run electron:build
```

## API Endpoints

- **GET /** - API root path, returns API information
- **POST /segment** - Image segmentation (background removal)
- **POST /generate-normal-map** - Generate normal map

## Keyboard Shortcuts

- **F** - Open file menu
- **E** - Open edit menu
- **S** - Open select menu

## System Requirements

### Frontend
- Node.js 18+ (Recommended: Node.js 20+)
- npm or yarn

### Backend
- Python 3.8+
- Sufficient GPU memory (8GB+ recommended)

## License

Apache License 2.0

## Contribution Guide

Welcome to contribute to the AmberPipeline project! If you have any ideas, suggestions, or have found issues, please follow these steps:

1. Fork the project repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and passes all tests.

## Contact

If you have any questions or suggestions, please contact us through:

- GitHub Issues: [https://github.com/CognotEngine/AmberPipeline/issues](https://github.com/CognotEngine/AmberPipeline/issues)

## Acknowledgements

Thank you to all developers and users who have contributed to the AmberPipeline project!
