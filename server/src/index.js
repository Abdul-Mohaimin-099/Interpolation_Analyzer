const express = require('express');
const { parse } = require('csv-parse/sync');
const math = require('mathjs');
const cors = require('cors');
const multer = require('multer');

// Environment variables with defaults
const port = process.env.PORT || 5001;
const maxFileSize = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024; // 5MB limit
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:5000'];

// Express app setup
const app = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Helper Functions
function sanitizeArray(arr) {
  return Array.isArray(arr) ? arr.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v)) : [];
}

function generateFallbackData(length) {
  return Array(length).fill(0).map((_, i) => i * 10);
}

// Helper function to calculate MSE
function calculateMSE(xRef, yRef, xInterp, yInterp) {
  try {
    if (xRef.length !== yRef.length || xInterp.length !== yInterp.length) {
      throw new Error('Input arrays must have the same length');
    }

    let totalSquaredError = 0;
    let count = 0;

    // For each reference point, find the closest interpolated point
    for (let i = 0; i < xRef.length; i++) {
      const x = xRef[i];
      const y = yRef[i];
      
      // Find the closest x value in the interpolated data
      let closestIndex = 0;
      let minDistance = Math.abs(xInterp[0] - x);
      
      for (let j = 1; j < xInterp.length; j++) {
        const distance = Math.abs(xInterp[j] - x);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = j;
        }
      }
      
      const error = y - yInterp[closestIndex];
      totalSquaredError += error * error;
      count++;
    }

    return count > 0 ? totalSquaredError / count : Infinity;
  } catch (error) {
    console.error('MSE Calculation Error:', error.message);
    return Infinity;
  }
}

// Interpolation Methods
function newtonForward(x, y, xNew) {
  try {
    const n = x.length;
    const diff = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) diff[i][0] = y[i] || 0;

    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        diff[i][j] = diff[i + 1][j - 1] - diff[i][j - 1] || 0;
      }
    }

    const result = new Array(xNew.length).fill(0);
    for (let i = 0; i < xNew.length; i++) {
      let value = y[0] || 0;
      let term = 1;
      const u = x.length > 1 ? (xNew[i] - x[0]) / (x[1] - x[0]) : 0;
      for (let j = 1; j < n; j++) {
        term *= (u - (j - 1)) / j;
        value += term * diff[0][j] || 0;
      }
      result[i] = isNaN(value) ? 0 : value;
    }
    return result.length === xNew.length ? result : generateFallbackData(xNew.length);
  } catch (error) {
    console.error('Newton Forward Error:', error.message);
    return generateFallbackData(xNew.length);
  }
}

function newtonBackward(x, y, xNew) {
  try {
    const n = x.length;
    const diff = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) diff[i][0] = y[i] || 0;

    for (let j = 1; j < n; j++) {
      for (let i = n - 1; i >= j; i--) {
        diff[i][j] = diff[i][j - 1] - diff[i - 1][j - 1] || 0;
      }
    }

    const result = new Array(xNew.length).fill(0);
    for (let i = 0; i < xNew.length; i++) {
      let value = y[n - 1] || 0;
      let term = 1;
      const u = x.length > 1 ? (xNew[i] - x[n - 1]) / (x[1] - x[0]) : 0;
      for (let j = 1; j < n; j++) {
        term *= (u + j - 1) / j;
        value += term * diff[n - 1][j] || 0;
      }
      result[i] = isNaN(value) ? 0 : value;
    }
    return result.length === xNew.length ? result : generateFallbackData(xNew.length);
  } catch (error) {
    console.error('Newton Backward Error:', error.message);
    return generateFallbackData(xNew.length);
  }
}

function dividedDifference(x, y, xNew) {
  try {
    const n = x.length;
    const diff = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) diff[i][0] = y[i] || 0;

    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        if (Math.abs(x[i + j] - x[i]) < 1e-10) throw new Error('Duplicate x values');
        diff[i][j] = (diff[i + 1][j - 1] - diff[i][j - 1]) / (x[i + j] - x[i]) || 0;
      }
    }

    const result = new Array(xNew.length).fill(0);
    for (let i = 0; i < xNew.length; i++) {
      let value = diff[0][0] || 0;
      let term = 1;
      for (let j = 1; j < n; j++) {
        term *= (xNew[i] - x[j - 1]);
        value += term * diff[0][j] || 0;
      }
      result[i] = isNaN(value) ? 0 : value;
    }
    return result.length === xNew.length ? result : generateFallbackData(xNew.length);
  } catch (error) {
    console.error('Divided Difference Error:', error.message);
    return generateFallbackData(xNew.length);
  }
}

// Add normalization helper functions
function normalizeData(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  return {
    normalizedData: range === 0 ? data : data.map(val => (val - min) / range),
    min,
    max,
    range
  };
}

function denormalizeData(normalizedData, min, range) {
  return normalizedData.map(val => val * range + min);
}

// Add advanced data preprocessing
function preprocessData(xData, yData) {
  // Remove outliers using IQR method
  function removeOutliers(data) {
    const q1 = math.quantileSeq(data, 0.25);
    const q3 = math.quantileSeq(data, 0.75);
    const iqr = q3 - q1;
    const validRange = {
      min: q1 - 1.5 * iqr,
      max: q3 + 1.5 * iqr
    };
    return data.map(v => 
      v < validRange.min || v > validRange.max ? null : v
    );
  }

  // Handle missing or invalid values
  function cleanData(xArr, yArr) {
    const pairs = xArr.map((x, i) => ({ x, y: yArr[i] }))
      .filter(pair => pair.x !== null && pair.y !== null)
      .sort((a, b) => a.x - b.x);
    return {
      x: pairs.map(p => p.x),
      y: pairs.map(p => p.y)
    };
  }

  // Remove duplicate x values by averaging y values
  function removeDuplicates(xArr, yArr) {
    const grouped = {};
    xArr.forEach((x, i) => {
      if (!grouped[x]) grouped[x] = [];
      grouped[x].push(yArr[i]);
    });

    return Object.entries(grouped).map(([x, yValues]) => ({
      x: parseFloat(x),
      y: math.mean(yValues)
    })).sort((a, b) => a.x - b.x);
  }

  // Process the data
  const cleanedY = removeOutliers(yData);
  const cleaned = cleanData(xData, cleanedY);
  const deduped = removeDuplicates(cleaned.x, cleaned.y);
  
  return {
    x: deduped.map(p => p.x),
    y: deduped.map(p => p.y)
  };
}

// Enhance the spline interpolation for better accuracy
function splineInterpolation(x, y, xNew) {
  try {
    const n = x.length;
    if (n < 2) throw new Error('Insufficient points for spline');

    // Calculate divided differences for natural cubic spline
    const h = new Array(n - 1);
    const alpha = new Array(n - 1);
    const l = new Array(n);
    const mu = new Array(n);
    const z = new Array(n);
    const c = new Array(n);
    const b = new Array(n - 1);
    const d = new Array(n - 1);

    // Step 1: Calculate h values
    for (let i = 0; i < n - 1; i++) {
      h[i] = x[i + 1] - x[i];
      if (Math.abs(h[i]) < 1e-10) throw new Error('Zero interval in spline');
    }

    // Step 2: Calculate alpha values
    for (let i = 1; i < n - 1; i++) {
      alpha[i] = (3 / h[i]) * (y[i + 1] - y[i]) - (3 / h[i - 1]) * (y[i] - y[i - 1]);
    }

    // Step 3: Calculate l, mu, and z values
    l[0] = 1;
    mu[0] = 0;
    z[0] = 0;

    for (let i = 1; i < n - 1; i++) {
      l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }

    // Step 4: Calculate coefficients
    l[n - 1] = 1;
    z[n - 1] = 0;
    c[n - 1] = 0;

    for (let j = n - 2; j >= 0; j--) {
      c[j] = z[j] - mu[j] * c[j + 1];
      b[j] = (y[j + 1] - y[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
      d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    // Interpolate new points
    const result = new Array(xNew.length);
    for (let i = 0; i < xNew.length; i++) {
      const xi = xNew[i];
      let j = x.findIndex((val, idx) => xi <= val && (idx === 0 || xi > x[idx - 1]));
      j = Math.max(0, Math.min(j, n - 2));

      const dx = xi - x[j];
      result[i] = y[j] + b[j] * dx + c[j] * dx * dx + d[j] * dx * dx * dx;
    }

    return result;
  } catch (error) {
    console.error('Enhanced Spline Interpolation Error:', error.message);
    return generateFallbackData(xNew.length);
  }
}

function linearInterpolation(x, y, xNew) {
  try {
    const result = [];
    for (let xi of xNew) {
      let idx = x.findIndex((val, i) => xi <= val && (i === 0 || xi > x[i - 1]));
      idx = Math.max(0, Math.min(idx, x.length - 2));
      if (idx + 1 >= x.length || Math.abs(x[idx + 1] - x[idx]) < 1e-10) {
        result.push(y[idx] || 0);
      } else {
        const t = (xi - x[idx]) / (x[idx + 1] - x[idx]);
        result.push(y[idx] + t * (y[idx + 1] - y[idx]) || 0);
      }
    }
    return result.length === xNew.length ? result : generateFallbackData(xNew.length);
  } catch (error) {
    console.error('Linear Interpolation Error:', error.message);
    return generateFallbackData(xNew.length);
  }
}

// Add smoothness calculation helper
function calculateSmoothness(yValues) {
  if (yValues.length < 3) return 1;
  
  let smoothness = 0;
  for (let i = 1; i < yValues.length - 1; i++) {
    const prev = yValues[i - 1];
    const curr = yValues[i];
    const next = yValues[i + 1];
    
    // Calculate second derivative approximation
    const secondDeriv = Math.abs(next - 2 * curr + prev);
    smoothness += 1 / (1 + secondDeriv);
  }
  
  return smoothness / (yValues.length - 2);
}

// API Routes
app.post('/api/interpolate', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rawContent = req.file.buffer.toString('utf-8');
    const delimiters = [',', ';', '\t'];
    let records = [];
    let successfulParse = false;

    for (const delimiter of delimiters) {
      try {
        const parsed = parse(rawContent, {
          delimiter,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
          skip_lines_with_error: true
        });

        const tempRecords = parsed
          .filter(record => record.x !== undefined && record.y !== undefined)
          .map(record => ({
            x: parseFloat(record.x),
            y: parseFloat(record.y)
          }))
          .filter(r => !isNaN(r.x) && !isNaN(r.y));

        records = records.concat(tempRecords);
        if (tempRecords.length > 0) {
          successfulParse = true;
        }
      } catch (parseError) {
        console.warn(`Parsing failed with delimiter '${delimiter}':`, parseError.message);
      }
    }

    if (!successfulParse || records.length < 2) {
      throw new Error(`No valid data or insufficient points (${records.length} found)`);
    }

    // Remove duplicates and sort by x values
    records = [...new Map(records.map(r => [r.x, r])).values()]
      .sort((a, b) => a.x - b.x);

    if (records.length < 2) {
      throw new Error('Insufficient valid data points after deduplication');
    }

    const xData = records.map(r => r.x);
    const yData = records.map(r => r.y);

    // Preprocess the data
    const { x: cleanedX, y: cleanedY } = preprocessData(xData, yData);

    // Normalize the cleaned data
    const { normalizedData: normalizedY, min: yMin, max: yMax, range: yRange } = normalizeData(cleanedY);
    const { normalizedData: normalizedX, min: xMin, max: xMax, range: xRange } = normalizeData(cleanedX);

    // Generate adaptive interpolation points
    const xInterp = [];
    const basePoints = Math.min(2000, cleanedX.length * 20); // Increase density for better resolution
    
    // Use non-uniform point distribution for better detail in high-variation regions
    const yGradient = normalizedY.slice(1).map((v, i) => Math.abs(v - normalizedY[i]));
    const maxGradient = Math.max(...yGradient);
    const pointDensity = yGradient.map(g => 1 + 4 * (g / maxGradient)); // 1-5x density based on gradient

    let currentX = 0;
    while (currentX <= 1) {
      xInterp.push(currentX);
      const idx = Math.floor(currentX * (normalizedX.length - 1));
      const density = pointDensity[Math.min(idx, pointDensity.length - 1)] || 1;
      currentX += 1 / (basePoints * density);
    }

    // Perform interpolations on normalized data with enhanced methods
    const interpolated = {
      linear: denormalizeData(linearInterpolation(normalizedX, normalizedY, xInterp), yMin, yRange),
      spline: denormalizeData(splineInterpolation(normalizedX, normalizedY, xInterp), yMin, yRange),
      newton_forward: denormalizeData(newtonForward(normalizedX, normalizedY, xInterp), yMin, yRange),
      newton_backward: denormalizeData(newtonBackward(normalizedX, normalizedY, xInterp), yMin, yRange),
      divided: denormalizeData(dividedDifference(normalizedX, normalizedY, xInterp), yMin, yRange)
    };

    // Denormalize x interpolation points
    const denormalizedXInterp = denormalizeData(xInterp, xMin, xRange);

    // Calculate weighted MSE using denormalized values
    const errors = {};
    for (const method in interpolated) {
      const mse = calculateMSE(cleanedX, cleanedY, denormalizedXInterp, interpolated[method]);
      const smoothness = calculateSmoothness(interpolated[method]);
      errors[method] = mse * (1 + 0.1 * (1 - smoothness)); // Penalize non-smooth solutions
    }

    // Format response with additional metadata
    res.json({
      interpolated: {
        x: denormalizedXInterp,
        linear: interpolated.linear,
        spline: interpolated.spline,
        newton_forward: interpolated.newton_forward,
        newton_backward: interpolated.newton_backward,
        divided: interpolated.divided
      },
      errors: Object.entries(errors)
        .map(([method, mse]) => ({
          method: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
          mse: mse
        }))
        .sort((a, b) => a.mse - b.mse),
      recommendation: {
        method: Object.entries(errors)
          .sort((a, b) => a[1] - b[1])[0][0]
          .charAt(0).toUpperCase() + 
          Object.entries(errors)
          .sort((a, b) => a[1] - b[1])[0][0]
          .slice(1).replace('_', ' '),
        mse: Math.min(...Object.values(errors))
      },
      originalData: {
        x: cleanedX,
        y: cleanedY
      },
      metadata: {
        pointCount: denormalizedXInterp.length,
        dataRange: {
          x: { min: xMin, max: xMax },
          y: { min: yMin, max: yMax }
        }
      }
    });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
let server;
try {
  server = app.listen(port, () => {
    console.log(`Server running on port ${port} at ${new Date().toISOString()}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}