import { render, screen } from '@testing-library/react';
     import ResultPage from '../ResultPage';

     test('renders interpolation insights', () => {
       const plotData = {
         interpolated: { x: [1, 2, 3], linear: [1, 2, 3], polynomial: [1, 2, 3], spline: [1, 2, 3] },
         errors: [{ method: 'Linear', mse: 0.01 }, { method: 'Polynomial', mse: 0.02 }, { method: 'Spline', mse: 0.03 }],
         recommendation: { method: 'Linear', mse: 0.01 }
       };
       render(<ResultPage plotData={plotData} setShowResult={() => {}} />);
       expect(screen.getByText(/Interpolation Insights/i)).toBeInTheDocument();
       expect(screen.getByText(/Best Method: Linear/i)).toBeInTheDocument();
     });