# Interpolation Analyzer

An interactive web application for visualizing and comparing different interpolation methods. This tool helps users understand and analyze various interpolation techniques through dynamic visualization and real-time data processing.

## Features

- Upload CSV data for interpolation analysis
- Compare multiple interpolation methods:
  - Linear Interpolation
  - Cubic Spline Interpolation
  - Newton Forward Interpolation
  - Newton Backward Interpolation
  - Divided Differences
- Interactive visualization with zoom and pan capabilities
- Real-time error analysis (MSE)
- Download interpolated results
- Educational resources in Learning Hub

## Tech Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express
- Data Processing: Math.js
- File Handling: Multer
- Visualization: HTML Canvas

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdul-Mohaimin-099/Interpolation_Analyzer.git
   ```

2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

## How to Run the Project

To run the project locally, you need to start both the backend (server) and frontend (client) development servers. Open two terminal windows or tabs and follow these steps:

### 1. Start the Backend Server
```bash
cd server
npm install   # Install backend dependencies (only needed once)
npm start     # Start the backend server (default: http://localhost:5000)
```

### 2. Start the Frontend Client
```bash
cd client
npm install   # Install frontend dependencies (only needed once)
npm start     # Start the frontend development server (default: http://localhost:3000)
```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:5000 by default.

4. Open http://localhost:3000 in your browser

## Usage

1. Upload a CSV file containing x and y coordinates
2. View the interpolation results with different methods
3. Compare accuracy using MSE values
4. Download the interpolated data
5. Explore the Learning Hub for educational content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 