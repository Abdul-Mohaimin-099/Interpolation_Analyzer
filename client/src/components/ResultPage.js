import React, { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';

function ResultPage({ plotData, setShowResult }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  // Add new state for zoom and pan
  const [viewTransform, setViewTransform] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // Add zoom controls UI state
  const [showZoomControls, setShowZoomControls] = useState(true);

  // Add back the downloadCSV function
  const downloadCSV = () => {
    if (!plotData || !plotData.recommendation || !plotData.interpolated) return;
    
    const recommendedMethod = plotData.recommendation.method.toLowerCase().replace(' ', '_');
    const headers = ['x', 'y'];
    const rows = plotData.interpolated.x.map((x, i) => [
      x,
      plotData.interpolated[recommendedMethod][i]
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interpolated_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle canvas resizing
  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = Math.min(Math.max(parent.offsetWidth * 0.9, 300), 800);
    const height = Math.min(Math.max(width * 0.666, 200), 500);
    canvas.width = width;
    canvas.height = height;
    drawPlot(animationProgress);
  };

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const formatAxisLabel = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1e6 || absValue <= 1e-6) {
      // Use scientific notation for very large or very small numbers
      return value.toExponential(2);
    } else {
      // Use fixed notation with dynamic precision
      const precision = absValue < 1 ? 4 : absValue < 100 ? 2 : 1;
      return value.toFixed(precision);
    }
  };

  // Add the thinData function back
  const thinData = (xData, yData, maxPoints = 1000) => {
    if (!Array.isArray(xData) || !Array.isArray(yData)) {
      return { x: [], y: [] };
    }
    if (xData.length !== yData.length) {
      return { x: [], y: [] };
    }
    if (xData.length <= maxPoints) {
      return { x: xData, y: yData };
    }
    const step = Math.ceil(xData.length / maxPoints);
    return {
      x: xData.filter((_, i) => i % step === 0),
      y: yData.filter((_, i) => i % step === 0)
    };
  };

  // Add zoom and pan handlers
  const handleWheel = (event) => {
    if (!canvasRef.current || isAnimating) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate zoom factor based on wheel delta
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(viewTransform.scale * zoomFactor, 0.1), 50);

    // Calculate zoom point in canvas coordinates
    const canvasX = (mouseX - viewTransform.offsetX) / viewTransform.scale;
    const canvasY = (mouseY - viewTransform.offsetY) / viewTransform.scale;

    // Calculate new offsets to zoom into mouse position
    const newOffsetX = mouseX - canvasX * newScale;
    const newOffsetY = mouseY - canvasY * newScale;

    setViewTransform(prev => ({
      ...prev,
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    }));

    drawPlot(1);
  };

  const handleMouseDown = (event) => {
    if (!canvasRef.current || isAnimating) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setViewTransform(prev => ({
      ...prev,
      isDragging: true,
      lastMouseX: event.clientX - rect.left,
      lastMouseY: event.clientY - rect.top
    }));
  };

  const handleMouseUp = () => {
    setViewTransform(prev => ({ ...prev, isDragging: false }));
  };

  const resetZoom = () => {
    setViewTransform({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    });
    drawPlot(1);
  };

  // Modify the drawPlot function to use the zoom transform
  const drawPlot = (progress) => {
    if (!plotData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the entire canvas with proper scaling
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before clearing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Set white background
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Apply zoom transform
    ctx.save();
    ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
    ctx.scale(viewTransform.scale, viewTransform.scale);

    const methods = ['linear', 'spline', 'newton_forward', 'newton_backward', 'divided'];
    const colors = {
      linear: '#FF6B6B',
      spline: '#34D399',
      newton_forward: '#FFA500',
      newton_backward: '#9B59B6',
      divided: '#F1C40F'
    };

    // Get data ranges with data thinning
    const xData = plotData.interpolated.x;
    const allYValues = methods.reduce((acc, method) => {
      if (plotData.interpolated[method]) {
        const thinned = thinData(xData, plotData.interpolated[method]);
        acc.push(...thinned.y);
      }
      return acc;
    }, [...plotData.originalData.y]);

    const minX = Math.min(...xData, ...plotData.originalData.x);
    const maxX = Math.max(...xData, ...plotData.originalData.x);
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);
    
    // Adjust padding based on data range
    const paddingX = (maxX - minX) * 0.1;
    const paddingY = (maxY - minY) * 0.1;
    const paddedMinX = minX - paddingX;
    const paddedMaxX = maxX + paddingX;
    const paddedMinY = minY - paddingY;
    const paddedMaxY = maxY + paddingY;

    // Calculate scaled dimensions for the plot area
    const plotWidth = canvas.width - 80;
    const plotHeight = canvas.height - 80;
    const plotLeft = 40;
    const plotTop = 40;

    // Draw grid with fade-in effect
    const gridOpacity = Math.min(1, progress * 2);
    ctx.strokeStyle = `rgba(238, 238, 238, ${gridOpacity})`;
    ctx.lineWidth = 1 / viewTransform.scale; // Adjust line width for zoom
    const gridLines = 10;

    // Draw grid lines
    for (let i = 0; i <= gridLines; i++) {
      const xPos = plotLeft + (i * plotWidth) / gridLines;
      const yPos = canvas.height - plotTop - (i * plotHeight) / gridLines;
      
      ctx.beginPath();
      ctx.moveTo(xPos, plotTop);
      ctx.lineTo(xPos, canvas.height - plotTop);
      ctx.moveTo(plotLeft, yPos);
      ctx.lineTo(canvas.width - plotLeft, yPos);
      ctx.stroke();

      // Draw axis labels with fade-in and better formatting
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for text
      ctx.fillStyle = `rgba(102, 102, 102, ${gridOpacity})`;
      ctx.font = '10px Arial';
      
      const xValue = paddedMinX + (i / gridLines) * (paddedMaxX - paddedMinX);
      const yValue = paddedMaxY - (i / gridLines) * (paddedMaxY - paddedMinY);
      
      // X-axis labels
      ctx.textAlign = 'center';
      const scaledXPos = xPos * viewTransform.scale + viewTransform.offsetX;
      ctx.fillText(formatAxisLabel(xValue), scaledXPos, canvas.height - 25);
      
      // Y-axis labels
      ctx.textAlign = 'right';
      const scaledYPos = yPos * viewTransform.scale + viewTransform.offsetY;
      ctx.fillText(formatAxisLabel(yValue), 35, scaledYPos + 4);
      ctx.restore();
    }

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2 / viewTransform.scale;
    const axesProgress = Math.min(1, progress * 3);
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(plotLeft, canvas.height - plotTop);
    ctx.lineTo(plotLeft + plotWidth * axesProgress, canvas.height - plotTop);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(plotLeft, canvas.height - plotTop);
    ctx.lineTo(plotLeft, plotTop + (canvas.height - 2 * plotTop) * (1 - axesProgress));
    ctx.stroke();

    // Calculate scales for data plotting
    const xScale = plotWidth / (paddedMaxX - paddedMinX);
    const yScale = plotHeight / (paddedMaxY - paddedMinY);

    // Draw original data points
    const pointProgress = Math.min(1, progress * 2);
    ctx.fillStyle = '#333333';
    const thinnedOriginal = thinData(plotData.originalData.x, plotData.originalData.y, 100);
    thinnedOriginal.x.forEach((x, i) => {
      if (i / thinnedOriginal.x.length <= pointProgress) {
        const xPos = plotLeft + (x - paddedMinX) * xScale;
        const yPos = canvas.height - plotTop - (thinnedOriginal.y[i] - paddedMinY) * yScale;
        const pointSize = 4 / viewTransform.scale;
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw interpolation curves
    const curveProgress = Math.max(0, Math.min(1, (progress - 0.3) * 1.5));
    methods.forEach((method, methodIndex) => {
      if (plotData.interpolated[method]) {
        const methodProgress = Math.max(0, Math.min(1, (progress - methodIndex * 0.1) * 1.5));
        const { x: thinnedX, y: thinnedY } = thinData(xData, plotData.interpolated[method]);
        const pointsToShow = Math.floor(thinnedX.length * methodProgress);
        
        ctx.beginPath();
        ctx.strokeStyle = colors[method];
        ctx.lineWidth = 2 / viewTransform.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        let lastValidY = null;
        for (let i = 0; i < pointsToShow; i++) {
          const xPos = plotLeft + (thinnedX[i] - paddedMinX) * xScale;
          const yPos = canvas.height - plotTop - (thinnedY[i] - paddedMinY) * yScale;
          
          // Skip points that would cause extreme vertical lines
          if (lastValidY !== null && Math.abs(yPos - lastValidY) > plotHeight) {
            ctx.stroke();
            ctx.beginPath();
            lastValidY = null;
            continue;
          }
          
          if (i === 0 || lastValidY === null) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
          lastValidY = yPos;
        }
        ctx.stroke();
      }
    });

    // Draw title
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(51, 51, 51, ${Math.min(1, progress * 2)})`;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Interpolation Results', canvas.width / 2, 20);
    ctx.restore();

    // Restore the original context state
    ctx.restore();
  };

  // Animation loop
  const animate = (timestamp) => {
    if (!animationRef.current) {
      animationRef.current = timestamp;
    }

    const elapsed = timestamp - animationRef.current;
    const progress = Math.min(1, elapsed / 2000); // 2 seconds animation
    setAnimationProgress(progress);
    drawPlot(progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
    }
  };

  // Start animation when component mounts or data changes
  useEffect(() => {
    setIsAnimating(true);
    setAnimationProgress(0);
    animationRef.current = null;
    requestAnimationFrame(animate);
  }, [plotData]);

  useEffect(() => {
    resizeCanvas();
    const handleResize = debounce(() => {
      if (!isAnimating) {
        resizeCanvas();
      }
    }, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAnimating]);

  // Add replay animation button handler
  const handleReplayAnimation = () => {
    setIsAnimating(true);
    setAnimationProgress(0);
    animationRef.current = null;
    requestAnimationFrame(animate);
  };

  // Add event listeners for zoom and pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [viewTransform.isDragging, isAnimating]);

  if (!plotData || !plotData.recommendation) return null;

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-3xl p-6 bg-white/80 rounded-xl shadow-2xl border border-[#ADD8E6]/30">
        <h2 className="text-2xl font-semibold text-center text-[#333333] mb-6">Analysis Results</h2>
        <p className="text-center text-[#333333]/70 mb-6">
          Best Method: <span className="font-medium">{plotData.recommendation.method}</span>
          <br />
          <span className="text-sm">MSE: {plotData.recommendation.mse.toExponential(4)}</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-[#333333] mb-3">MSE Comparison</h3>
            <ul className="space-y-2 text-[#333333]">
              {plotData.errors.map((error, index) => (
                <li key={index} className="flex justify-between">
                  <span>{error.method}:</span>
                  <span className="font-mono">{error.mse.toExponential(4)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-[#333333] mb-3">Sample Values</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[#333333]">
                <thead>
                  <tr className="bg-[#ADD8E6]">
                    <th className="p-2 text-left">X</th>
                    <th className="p-2 text-left">Y</th>
                  </tr>
                </thead>
                <tbody>
                  {plotData.interpolated.x.slice(0, 5).map((x, index) => (
                    <tr key={index} className="hover:bg-[#ADD8E6]/10">
                      <td className="p-2">{x.toFixed(4)}</td>
                      <td className="p-2">
                        {plotData.interpolated[plotData.recommendation.method.toLowerCase().replace(' ', '_')][index].toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-2 border-[#ADD8E6]/50 rounded-lg shadow-md"
          ></canvas>
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-md">
            <button
              onClick={() => {
                setViewTransform(prev => ({
                  ...prev,
                  scale: Math.min(prev.scale * 1.2, 50)
                }));
                drawPlot(1);
              }}
              className="p-2 bg-[#ADD8E6] text-[#333333] rounded-lg hover:bg-[#87CEEB] transition-colors"
              title="Zoom In"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => {
                setViewTransform(prev => ({
                  ...prev,
                  scale: Math.max(prev.scale / 1.2, 0.1)
                }));
                drawPlot(1);
              }}
              className="p-2 bg-[#ADD8E6] text-[#333333] rounded-lg hover:bg-[#87CEEB] transition-colors"
              title="Zoom Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="p-2 bg-[#ADD8E6] text-[#333333] rounded-lg hover:bg-[#87CEEB] transition-colors"
              title="Reset Zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {!isAnimating && (
            <button
              onClick={handleReplayAnimation}
              className="absolute top-2 right-2 bg-[#333333] text-white p-2 rounded-full opacity-50 hover:opacity-100 transition-opacity"
              title="Replay animation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-[#333333] mb-6">
          <span className="flex items-center"><span className="w-3 h-3 mr-2 bg-[#FF6B6B] rounded-full"></span>Linear</span>
          <span className="flex items-center"><span className="w-3 h-3 mr-2 bg-[#34D399] rounded-full"></span>Spline</span>
          <span className="flex items-center"><span className="w-3 h-3 mr-2 bg-[#FFA500] rounded-full"></span>Newton Forward</span>
          <span className="flex items-center"><span className="w-3 h-3 mr-2 bg-[#9B59B6] rounded-full"></span>Newton Backward</span>
          <span className="flex items-center"><span className="w-3 h-3 mr-2 bg-[#F1C40F] rounded-full"></span>Divided</span>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={downloadCSV}
            className="py-2 px-4 bg-[#ADD8E6] text-[#333333] rounded-lg hover:bg-[#87CEEB] focus:outline-none focus:ring-2 focus:ring-[#ADD8E6] transition-all duration-300 shadow-md"
          >
            Download CSV
          </button>
          <button
            onClick={() => setShowResult(false)}
            className="py-2 px-4 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF4F4F] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-300 shadow-md"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;