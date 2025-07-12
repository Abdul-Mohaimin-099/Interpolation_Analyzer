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

3. Start the development servers:
   ```bash
   # Start backend server (from server directory)
   npm start

   # Start frontend development server (from client directory)
   npm start
   ```

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