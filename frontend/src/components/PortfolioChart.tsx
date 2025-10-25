import React, { useState, useEffect } from 'react';

interface PortfolioDataPoint {
  timestamp: number;
  value: number;
  change: number;
}

interface PortfolioChartProps {
  data: PortfolioDataPoint[];
  height?: number;
  showGrid?: boolean;
  timeRange?: '1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL';
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ 
  data, 
  height = 300, 
  showGrid = true,
  timeRange = '1M'
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PortfolioDataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No portfolio data available</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;
  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height - padding * 2;

  // Generate SVG path for portfolio value line
  const generatePath = () => {
    if (data.length < 2) return '';
    
    const stepX = chartWidth / (data.length - 1);
    const points = data.map((point, index) => {
      const x = index * stepX;
      const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate area under the curve
  const generateAreaPath = () => {
    if (data.length < 2) return '';
    
    const stepX = chartWidth / (data.length - 1);
    const points = data.map((point, index) => {
      const x = index * stepX;
      const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    });
    
    const firstPoint = `0,${chartHeight}`;
    const lastPoint = `${chartWidth},${chartHeight}`;
    
    return `M ${firstPoint} L ${points.join(' L ')} L ${lastPoint} Z`;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridLines = 5;
    
    for (let i = 0; i <= gridLines; i++) {
      const y = (i / gridLines) * chartHeight;
      const value = maxValue - (i / gridLines) * valueRange;
      
      lines.push(
        <g key={i}>
          <line
            x1={0}
            y1={y}
            x2={chartWidth}
            y2={y}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.1"
          />
          <text
            x={-5}
            y={y + 4}
            fontSize="12"
            fill="currentColor"
            opacity="0.6"
            textAnchor="end"
          >
            ${(value / 1000).toFixed(0)}k
          </text>
        </g>
      );
    }
    
    return lines;
  };

  // Calculate portfolio performance
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const totalChange = lastValue - firstValue;
  const totalChangePercent = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;

  // Get time range label
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '1D': return '24 Hours';
      case '7D': return '7 Days';
      case '1M': return '1 Month';
      case '3M': return '3 Months';
      case '1Y': return '1 Year';
      case 'ALL': return 'All Time';
      default: return '1 Month';
    }
  };

  return (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Performance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getTimeRangeLabel()} • {data.length} data points
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Value
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${lastValue.toLocaleString()}
          </p>
          <p className={`text-sm font-medium ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
          </p>
        </div>
        {hoveredPoint && (
          <div className="text-right ml-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(hoveredPoint.timestamp).toLocaleDateString()}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${hoveredPoint.value.toLocaleString()}
            </p>
            <p className={`text-sm ${hoveredPoint.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {hoveredPoint.change >= 0 ? '+' : ''}{hoveredPoint.change.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {showGrid && (
            <g transform={`translate(${padding}, ${padding})`}>
              {generateGridLines()}
            </g>
          )}

          {/* Area under the curve */}
          <g transform={`translate(${padding}, ${padding})`}>
            <path
              d={generateAreaPath()}
              fill="url(#portfolioGradient)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
          </g>

          {/* Portfolio Value Line */}
          <g transform={`translate(${padding}, ${padding})`}>
            <path
              d={generatePath()}
              fill="none"
              stroke={totalChangePercent >= 0 ? '#10B981' : '#EF4444'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data Points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * chartWidth;
              const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
              
              return (
                <g key={index}>
                  {/* Invisible larger hit area */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Visible data point */}
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={totalChangePercent >= 0 ? '#10B981' : '#EF4444'}
                    className="transition-all duration-200"
                    style={{
                      filter: hoveredPoint?.timestamp === point.timestamp ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                    }}
                  />
                </g>
              );
            })}
          </g>

          {/* Hover Line */}
          {hoveredPoint && (
            <g transform={`translate(${padding}, ${padding})`}>
              <line
                x1={data.findIndex(d => d.timestamp === hoveredPoint.timestamp) * (chartWidth / (data.length - 1))}
                y1={0}
                x2={data.findIndex(d => d.timestamp === hoveredPoint.timestamp) * (chartWidth / (data.length - 1))}
                y2={chartHeight}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="5,5"
              />
            </g>
          )}
        </svg>

        {/* Chart Legend */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${totalChangePercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Portfolio Value</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-30"></div>
              <span>Performance Area</span>
            </div>
          </div>
          <div className="text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
