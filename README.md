# 🧱 BrickBuilder

A web application that allows users to create, save, and share LEGO-style builds using a 2D or 3D canvas.

## Features

- 🔨 Place, move, rotate, and delete bricks on a grid
- 🎨 Choose from various brick colors and sizes
- 💾 Save builds to your account and load them later
- 🔒 Secure user authentication

## Tech Stack

- **Frontend**: React, TailwindCSS, Zustand, Three.js (for future 3D view)
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/brickbuilder.git
   cd brickbuilder
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Set up environment variables
   - Create a `.env` file in the server directory with the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRES_IN=1d
     ```
   - Create a `.env` file in the client directory with:
     ```
     VITE_API_BASE_URL=http://localhost:5000/api
     ```

### Running the App

1. Start the server
   ```
   cd server
   npm run dev
   ```

2. Start the client
   ```
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register an account or log in
2. In the editor, select a brick type and color from the sidebar
3. Click on the canvas to place bricks
4. Use keyboard shortcuts to manipulate bricks:
   - Arrow keys: Move selected brick
   - R key: Rotate selected brick
   - Delete key: Delete selected brick
   - Shift + Click + Drag: Pan the canvas
   - Mouse wheel: Zoom in/out
5. Save your build with the "Save Build" button
6. View your saved builds in the "My Builds" section

## Future Enhancements

- 🌐 Public gallery to view and share builds
- 📄 Export to STL (3D printable format)
- 👥 Multiplayer mode using WebSockets
- 🌙 Dark mode & theme switcher

## License

This project is licensed under the MIT License. 