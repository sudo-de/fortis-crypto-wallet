import React, { useState, useEffect } from 'react';

interface PriceData {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  symbol: string;
  data: PriceData[];
  height?: number;
  showGrid?: boolean;
  showVolume?: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  symbol, 
  data, 
  height = 300, 
  showGrid = true, 
  showVolume = false 
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and scaling
  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  const padding = 20;
  const chartWidth = 400;
  const chartHeight = height - padding * 2;

  // Generate SVG path for price line
  const generatePath = () => {
    if (data.length < 2) return '';
    
    const stepX = chartWidth / (data.length - 1);
    const points = data.map((point, index) => {
      const x = index * stepX;
      const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridLines = 5;
    
    for (let i = 0; i <= gridLines; i++) {
      const y = (i / gridLines) * chartHeight;
      const price = maxPrice - (i / gridLines) * priceRange;
      
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
            ${price.toFixed(2)}
          </text>
        </g>
      );
    }
    
    return lines;
  };

  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  return (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{symbol}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ${lastPrice.toFixed(2)}
            <span className={`ml-2 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </p>
        </div>
        {hoveredPoint && (
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(hoveredPoint.timestamp).toLocaleTimeString()}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${hoveredPoint.price.toFixed(2)}
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

          {/* Price Line */}
          <g transform={`translate(${padding}, ${padding})`}>
            <path
              d={generatePath()}
              fill="none"
              stroke={priceChange >= 0 ? '#10B981' : '#EF4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data Points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * chartWidth;
              const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={priceChange >= 0 ? '#10B981' : '#EF4444'}
                  className="cursor-pointer hover:r-4 transition-all"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
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
              <div className={`w-3 h-3 rounded-full ${priceChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{symbol} Price</span>
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

export default PriceChart;
