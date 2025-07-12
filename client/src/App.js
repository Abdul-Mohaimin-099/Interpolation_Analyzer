import React, { useState } from 'react';
import UploadPage from './components/UploadPage';
import ResultPage from './components/ResultPage';
import LearningHub from './components/LearningHub';
import Info from './components/Info';
import './index.css';

function App() {
  const [showResult, setShowResult] = useState(false);
  const [plotData, setPlotData] = useState(null);
  const [currentPage, setCurrentPage] = useState('upload'); // 'upload', 'result', 'learn', or 'info'

  const renderPage = () => {
    switch (currentPage) {
      case 'result':
        return <ResultPage plotData={plotData} setShowResult={() => setCurrentPage('upload')} />;
      case 'learn':
        return <LearningHub />;
      case 'info':
        return <Info />;
      default:
        return <UploadPage setPlotData={setPlotData} setShowResult={() => setCurrentPage('result')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full bg-[#333333] text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-4xl font-bold text-[#ADD8E6] tracking-wide">Interpolation Analyzer</h1>
              <p className="text-lg mt-2 text-white/80">Advanced Data Visualization Tool</p>
            </div>
            <nav className="flex justify-center md:justify-end space-x-4">
              <button
                onClick={() => setCurrentPage('upload')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 'upload'
                    ? 'bg-[#ADD8E6] text-[#333333]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Upload Data
              </button>
              <button
                onClick={() => setCurrentPage('learn')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 'learn'
                    ? 'bg-[#ADD8E6] text-[#333333]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Learning Hub
              </button>
              <button
                onClick={() => setCurrentPage('info')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 'info'
                    ? 'bg-[#ADD8E6] text-[#333333]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Info
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow p-4">
        <div className="w-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;