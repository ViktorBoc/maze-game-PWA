# Maze Game PWA

This repository contains a Progressive Web App (PWA) maze game developed as a school project. The game features responsive design, drag-and-drop functionality, and supports both desktop and mobile play with different control schemes.

## Features & Implementation

### Gameplay Experience
- **Maze Navigation System**:
    - Guide a colored ball through procedurally generated mazes to reach the red goal
    - Two difficulty tiers with distinct mechanics:
        - Easy: 15x15 mazes with 15-second timer
        - Hard: 20x20 mazes with 20-second timer
    - Visual solution path toggle using BFS algorithm
- **Player Customization**:
    - Drag-and-drop color selection between orange, green, and blue
    - Persistent progress tracking via localStorage

### Technical Architecture
- **Progressive Web App Core**:
    - Offline-first design with service worker caching
    - Installable on mobile through web manifest
    - Adaptive layout for all screen sizes (desktop, tablet, mobile)
- **Control Systems**:
    - Desktop: WASD keyboard bindings
    - Mobile: Accelerometer controls with permission handling
- **Rendering Engine**:
    - HTML5 Canvas for smooth 2D graphics
    - Dynamic cell sizing based on difficulty
    - Print-optimized stylesheet for documentation

### Backend Logic
- **Maze Management**:
    - JSON configuration for 10 unique mazes (5 per difficulty)
    - Random selection algorithm preventing repeats
    - Pathfinding implementation using breadth-first search
- **Performance Optimization**:
    - Efficient asset loading and caching
    - Memory-conscious game state management
    - Responsive frame rendering


## Installation & Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/maze-game-PWA.git
cd maze-game-PWA

# 2. Serve via a local HTTP server 
#    (required for service worker registration and PWA features)

# Option A: Python 3 built-in server
python3 -m http.server 8000

# Option B: Node.js http-server
npm install -g http-server
http-server . -p 8000

# 3. Open in your browser
http://localhost:8000