# AmberPipeline

AmberPipeline is a middleware tool focused on converting AI original images to game assets, providing designers with a complete workflow solution from image segmentation to character skeleton binding.

## Technology Stack

### Frontend
- **React 19** - JavaScript library for building user interfaces
- **TypeScript (v5.7.0)** - Superset of JavaScript that provides type safety
- **Electron (v33.2.0)** - Cross-platform desktop application development framework
- **TailwindCSS (v3.4.16)** - Utility-first CSS framework
- **Vite (v6.0.0)** - Next-generation frontend build tool
- **Shadcn UI** - Component library built with Radix UI and Tailwind CSS
- **Lucide React (v0.460.0)** - Icon library
- **Zustand (v5.0.0)** - Lightweight state management library
- **TanStack Query (v5.90.12)** - Data fetching and caching library

### Backend
- **Python 3** - High-level programming language
- **FastAPI (v0.95.0+)** - Modern, fast web framework
- **SAM (Segment Anything Model)** - Powerful image segmentation model
- **Pillow (v9.0.0+)** - Python image processing library
- **NumPy (v1.21.0+)** - Numerical computing library
- **OpenCV (v4.5.0+)** - Computer vision library
- **Uvicorn (v0.22.0+)** - ASGI server
- **Watchdog (v3.0.0+)** - Directory monitoring library
- **Pydantic (v2.0.0+)** - Data validation library
- **Rich (v13.0.0+)** - Beautiful console output

## Features

As a professional middleware from AI original images to game assets, AmberPipeline provides a complete workflow solution to help designers efficiently convert original images into assets usable in game development.

### Core Features

#### 1. Precision Cut
- AI-driven image segmentation and background removal
- Support for point prompt guided segmentation
- Real-time preview and editing

#### 2. Character Layer
- Multi-level character management
- Layer stacking and blending modes
- Refined editing tools

#### 3. Skeleton Binding
- Character skeleton creation and editing
- Bone weight painting
- Animation preview

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

MIT License