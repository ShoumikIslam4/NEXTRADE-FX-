import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { CurrencyPair, CandleData } from '../../types/market';
import { generateInitialCandles } from '../../data/mockMarketData';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, 
  TrendingUp, Activity, Layers, PenTool, Eye, EyeOff 
} from 'lucide-react';

interface Props {
  pair: CurrencyPair;
  className?: string;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
type DrawingTool = 'crosshair' | 'trendline' | 'horizontal' | 'fibonacci';

export const TradingTerminalChart: React.FC<Props> = ({ pair, className = '' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [indicators, setIndicators] = useState({
    sma20: true,
    ema50: true,
    bollinger: false,
    volume: true,
    rsi: false
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Custom drawn horizontal levels or trend lines
  const [drawings, setDrawings] = useState<Array<{ type: string; price: number; label: string }>>([
    { type: 'horizontal', price: pair.bid * 0.9985, label: 'Key Support' },
    { type: 'horizontal', price: pair.ask * 1.0025, label: 'Resistance 1' }
  ]);

  // Keep candle history generated for current symbol
  const [candles, setCandles] = useState<CandleData[]>(() => {
    return generateInitialCandles(pair.bid, 90, pair.pipPrecision);
  });

  // Regenerate or adapt candles when pair or timeframe changes
  useEffect(() => {
    setCandles(generateInitialCandles(pair.bid, 90, pair.pipPrecision));
  }, [pair.symbol, timeframe, pair.pipPrecision]);

  // Append or update latest candle when live tick comes in
  useEffect(() => {
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const lastIndex = prev.length - 1;
      const last = { ...prev[lastIndex] };
      
      const newClose = pair.bid;
      const newHigh = Math.max(last.high, newClose);
      const newLow = Math.min(last.low, newClose);
      
      last.close = newClose;
      last.high = newHigh;
      last.low = newLow;
      last.volume += 1;

      const next = [...prev];
      next[lastIndex] = last;
      return next;
    });
  }, [pair.bid]);

  // Calculate Simple Moving Average
  const calculateSMA = useCallback((data: CandleData[], period: number) => {
    const sma: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close;
        }
        sma.push(sum / period);
      }
    }
    return sma;
  }, []);

  // Calculate Exponential Moving Average
  const calculateEMA = useCallback((data: CandleData[], period: number) => {
    const ema: (number | null)[] = [];
    const k = 2 / (period + 1);
    let prevEMA: number | null = null;

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ema.push(null);
      } else if (i === period - 1) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[j].close;
        }
        prevEMA = sum / period;
        ema.push(prevEMA);
      } else {
        const val: number = data[i].close * k + (prevEMA as number) * (1 - k);
        prevEMA = val;
        ema.push(val);
      }
    }
    return ema;
  }, []);

  // Compute Bollinger Bands (20, 2)
  const calculateBollingerBands = useCallback((data: CandleData[], period: number = 20, multiplier: number = 2) => {
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];
    const middle: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(null);
        lower.push(null);
        middle.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j].close;
        const mean = sum / period;
        let varianceSum = 0;
        for (let j = 0; j < period; j++) varianceSum += Math.pow(data[i - j].close - mean, 2);
        const stdDev = Math.sqrt(varianceSum / period);
        
        middle.push(mean);
        upper.push(mean + multiplier * stdDev);
        lower.push(mean - multiplier * stdDev);
      }
    }
    return { upper, lower, middle };
  }, []);

  // Compute RSI(14)
  const calculateRSI = useCallback((data: CandleData[], period: number = 14) => {
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) gains += change;
      else losses -= change;

      if (i < period) {
        rsi.push(null);
      } else if (i === period) {
        let avgGain = gains / period;
        let avgLoss = losses / period;
        if (avgLoss === 0) rsi.push(100);
        else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
        }
      } else {
        const currentGain = change > 0 ? change : 0;
        const currentLoss = change < 0 ? -change : 0;
        // Simplified rolling
        const avgGain = (gains / i);
        const avgLoss = (losses / i);
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(Math.min(95, Math.max(10, 100 - (100 / (1 + rs)))));
      }
    }
    return rsi;
  }, []);

  // Responsive chart dimensions managed by ResizeObserver
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 420 });

  useEffect(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const w = Math.floor(parent.clientWidth);
      const h = Math.floor(parent.clientHeight);
      if (w > 0 && h > 0) {
        setDimensions(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }
    };

    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
    });

    ro.observe(parent);
    window.addEventListener('resize', updateSize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimensions.width || 800;
    const height = dimensions.height || 420;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Layout configuration
    const paddingRight = 75; // Y-axis price scale
    const paddingBottom = indicators.rsi ? 90 : 35; // Time axis or sub-panel
    const rsiPanelHeight = indicators.rsi ? 70 : 0;
    const plotWidth = width - paddingRight;
    const plotHeight = height - paddingBottom - rsiPanelHeight;

    // Background
    ctx.fillStyle = isLight ? '#FFFFFF' : '#0B1220';
    ctx.fillRect(0, 0, width, height);

    // Visible window
    const visibleCount = Math.max(25, Math.floor(65 / zoomLevel));
    const startIndex = Math.max(0, candles.length - visibleCount);
    const visibleCandles = candles.slice(startIndex);

    if (visibleCandles.length === 0) return;

    // Price Bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    // Add 10% breathing room to price scale
    const priceRange = maxPrice - minPrice || 0.001;
    minPrice -= priceRange * 0.08;
    maxPrice += priceRange * 0.08;
    const adjustedRange = maxPrice - minPrice;

    // Price to Y coordinate
    const priceToY = (price: number) => {
      return plotHeight - ((price - minPrice) / adjustedRange) * plotHeight;
    };

    // Index to X coordinate
    const candleWidth = (plotWidth / visibleCandles.length) * 0.72;
    const candleGap = plotWidth / visibleCandles.length;

    const indexToX = (index: number) => {
      return index * candleGap + candleGap / 2;
    };

    // Draw Grid lines
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal Price Grids (5 levels)
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (adjustedRange / gridSteps) * i;
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotWidth, y);
      ctx.stroke();

      // Price Label on Y Axis
      ctx.fillStyle = isLight ? '#475569' : '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(pair.pipPrecision), plotWidth + 8, y + 3.5);
    }

    // Vertical Time Grids
    const timeStep = Math.max(1, Math.floor(visibleCandles.length / 6));
    for (let i = 0; i < visibleCandles.length; i += timeStep) {
      const x = indexToX(i);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, plotHeight);
      ctx.stroke();

      // Timestamp
      const d = new Date(visibleCandles[i].time * 1000);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      ctx.fillStyle = isLight ? '#475569' : '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, plotHeight + 18);
    }

    // Draw Volume Bars
    if (indicators.volume && maxVolume > 0) {
      const maxVolHeight = plotHeight * 0.18;
      visibleCandles.forEach((c, idx) => {
        const x = indexToX(idx);
        const isUp = c.close >= c.open;
        const vHeight = (c.volume / maxVolume) * maxVolHeight;
        ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.16)' : 'rgba(239, 68, 68, 0.16)';
        ctx.fillRect(x - candleWidth / 2, plotHeight - vHeight, candleWidth, vHeight);
      });
    }

    // Draw Bollinger Bands if enabled
    if (indicators.bollinger) {
      const bands = calculateBollingerBands(candles);
      const visibleUpper = bands.upper.slice(startIndex);
      const visibleLower = bands.lower.slice(startIndex);
      const visibleMiddle = bands.middle.slice(startIndex);

      // Ribbon fill
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const up = visibleUpper[i];
        if (up !== null) {
          const x = indexToX(i);
          const y = priceToY(up);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const low = visibleLower[i];
        if (low !== null) {
          const x = indexToX(i);
          const y = priceToY(low);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      // Upper & Lower lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      visibleUpper.forEach((val, i) => {
        if (val !== null) {
          const x = indexToX(i);
          const y = priceToY(val);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      ctx.beginPath();
      visibleLower.forEach((val, i) => {
        if (val !== null) {
          const x = indexToX(i);
          const y = priceToY(val);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw SMA 20
    if (indicators.sma20) {
      const sma = calculateSMA(candles, 20).slice(startIndex);
      ctx.strokeStyle = '#F59E0B'; // Amber / Gold
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      sma.forEach((val, i) => {
        if (val !== null) {
          const x = indexToX(i);
          const y = priceToY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw EMA 50
    if (indicators.ema50) {
      const ema = calculateEMA(candles, 50).slice(startIndex);
      ctx.strokeStyle = '#38BDF8'; // Sky Blue
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      ema.forEach((val, i) => {
        if (val !== null) {
          const x = indexToX(i);
          const y = priceToY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw Candlesticks
    visibleCandles.forEach((c, idx) => {
      const x = indexToX(idx);
      const openY = priceToY(c.open);
      const closeY = priceToY(c.close);
      const highY = priceToY(c.high);
      const lowY = priceToY(c.low);

      const isBull = c.close >= c.open;
      const color = isBull ? '#22C55E' : '#EF4444';

      // Candle Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Candle Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw Custom User Drawings (Support/Resistance)
    drawings.forEach(d => {
      const y = priceToY(d.price);
      if (y >= 0 && y <= plotHeight) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '9px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(d.label, 8, y - 4);
      }
    });

    // Draw Live Current Price Line & Right Badge
    const liveY = priceToY(pair.bid);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, liveY);
    ctx.lineTo(plotWidth, liveY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live price bead pulsing
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(plotWidth - 4, liveY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Right-side Price Tag
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(plotWidth, liveY - 9, paddingRight, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(pair.bid.toFixed(pair.pipPrecision), plotWidth + 6, liveY + 3.5);

    // Draw RSI Panel if activated
    if (indicators.rsi) {
      const rsiTop = height - rsiPanelHeight - 15;
      const rsiBottom = height - 15;

      // Divider
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rsiTop - 8);
      ctx.lineTo(width, rsiTop - 8);
      ctx.stroke();

      // RSI Label
      ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
      ctx.font = '9px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RSI (14)', 8, rsiTop + 6);

      // 70 and 30 levels
      const y70 = rsiBottom - (70 / 100) * rsiPanelHeight;
      const y30 = rsiBottom - (30 / 100) * rsiPanelHeight;

      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(plotWidth, y70);
      ctx.moveTo(0, y30);
      ctx.lineTo(plotWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      const rsiData = calculateRSI(candles).slice(startIndex);
      ctx.strokeStyle = '#A855F7'; // Purple
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      rsiData.forEach((val, i) => {
        if (val !== null) {
          const x = indexToX(i);
          const y = rsiBottom - (val / 100) * rsiPanelHeight;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Crosshair rendering
    if (crosshairPos && crosshairPos.x < plotWidth && crosshairPos.y < plotHeight) {
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crosshairPos.x, 0);
      ctx.lineTo(crosshairPos.x, plotHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crosshairPos.y);
      ctx.lineTo(plotWidth, crosshairPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating price tooltip on Y axis
      const hoveredPrice = maxPrice - (crosshairPos.y / plotHeight) * adjustedRange;
      ctx.fillStyle = isLight ? '#FFFFFF' : '#1E293B';
      ctx.fillRect(plotWidth, crosshairPos.y - 9, paddingRight, 18);
      ctx.strokeStyle = isLight ? '#CBD5E1' : '#475569';
      ctx.strokeRect(plotWidth, crosshairPos.y - 9, paddingRight, 18);
      ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(hoveredPrice.toFixed(pair.pipPrecision), plotWidth + 6, crosshairPos.y + 3.5);

      // Floating index & candle data inspection
      const candleIdx = Math.floor(crosshairPos.x / candleGap);
      if (candleIdx >= 0 && candleIdx < visibleCandles.length) {
        const c = visibleCandles[candleIdx];
        const isUp = c.close >= c.open;

        ctx.fillStyle = isLight ? '#FFFFFF' : '#0F172A';
        ctx.fillRect(8, 8, 310, 22);
        ctx.strokeStyle = isLight ? '#CBD5E1' : '#334155';
        ctx.strokeRect(8, 8, 310, 22);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
        ctx.fillText(`O:`, 14, 23);
        ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
        ctx.fillText(`${c.open.toFixed(pair.pipPrecision)}`, 28, 23);

        ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
        ctx.fillText(`H:`, 90, 23);
        ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
        ctx.fillText(`${c.high.toFixed(pair.pipPrecision)}`, 104, 23);

        ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
        ctx.fillText(`L:`, 166, 23);
        ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
        ctx.fillText(`${c.low.toFixed(pair.pipPrecision)}`, 178, 23);

        ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
        ctx.fillText(`C:`, 240, 23);
        ctx.fillStyle = isUp ? '#10B981' : '#F43F5E';
        ctx.fillText(`${c.close.toFixed(pair.pipPrecision)}`, 254, 23);
      }
    }

  }, [candles, pair, timeframe, zoomLevel, indicators, crosshairPos, drawings, dimensions, theme]);

  // Handle canvas mouse move for crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshairPos({ x, y });
  };

  const handleMouseLeave = () => {
    setCrosshairPos(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'horizontal' && crosshairPos && canvasRef.current) {
      const height = canvasRef.current.clientHeight;
      const plotHeight = indicators.rsi ? height - 90 - 70 : height - 35;
      
      const visibleCount = Math.max(25, Math.floor(65 / zoomLevel));
      const visible = candles.slice(Math.max(0, candles.length - visibleCount));
      let minP = Infinity;
      let maxP = -Infinity;
      visible.forEach(c => {
        if (c.low < minP) minP = c.low;
        if (c.high > maxP) maxP = c.high;
      });
      const range = maxP - minP;
      minP -= range * 0.08;
      maxP += range * 0.08;

      const clickPrice = maxP - (crosshairPos.y / plotHeight) * (maxP - minP);
      setDrawings(prev => [
        ...prev,
        { type: 'horizontal', price: Number(clickPrice.toFixed(pair.pipPrecision)), label: `Level @ ${clickPrice.toFixed(pair.pipPrecision)}` }
      ]);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col bg-[#0B1220] border border-slate-800 rounded-lg overflow-hidden select-none ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''} ${className}`}
    >
      {/* Chart Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#111827] border-b border-slate-800 gap-2">
        {/* Left: Symbol & Timeframes */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-sm text-white mr-2">
            <span>{pair.symbol}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
              Simulated
            </span>
          </div>

          <div className="flex items-center bg-[#151F30] rounded p-0.5 border border-slate-800">
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Indicator toggles dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorsModal(!showIndicatorsModal)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors ${
                showIndicatorsModal 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'bg-[#151F30] text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Indicators</span>
            </button>

            {showIndicatorsModal && (
              <div className="absolute left-0 top-full mt-1.5 w-56 p-3 bg-[#151F30] border border-slate-700 rounded-lg shadow-2xl z-30 flex flex-col gap-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Technical Overlays
                </div>
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    SMA 20 Period
                  </span>
                  <input
                    type="checkbox"
                    checked={indicators.sma20}
                    onChange={e => setIndicators({ ...indicators, sma20: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    EMA 50 Period
                  </span>
                  <input
                    type="checkbox"
                    checked={indicators.ema50}
                    onChange={e => setIndicators({ ...indicators, ema50: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Bollinger Bands (20, 2)
                  </span>
                  <input
                    type="checkbox"
                    checked={indicators.bollinger}
                    onChange={e => setIndicators({ ...indicators, bollinger: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Volume Histogram
                  </span>
                  <input
                    type="checkbox"
                    checked={indicators.volume}
                    onChange={e => setIndicators({ ...indicators, volume: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    RSI Sub-Panel (14)
                  </span>
                  <input
                    type="checkbox"
                    checked={indicators.rsi}
                    onChange={e => setIndicators({ ...indicators, rsi: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tools & Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTool(activeTool === 'horizontal' ? 'crosshair' : 'horizontal')}
            className={`p-1.5 rounded transition-colors ${
              activeTool === 'horizontal' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
            title="Click chart to place Horizontal Price Level"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="text-[11px] text-slate-400 hover:text-rose-400 px-1.5 py-0.5 rounded transition-colors"
              title="Clear drawings"
            >
              Clear Lines
            </button>
          )}

          <div className="h-4 w-[1px] bg-slate-800" />

          <button
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.25))}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[260px] relative cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Live Legend */}
        <div className="absolute top-2.5 left-3 pointer-events-none flex items-center gap-3 text-[11px] text-slate-400">
          {indicators.sma20 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-amber-400" />
              <span>SMA(20)</span>
            </div>
          )}
          {indicators.ema50 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-sky-400" />
              <span>EMA(50)</span>
            </div>
          )}
          {indicators.bollinger && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-blue-400" />
              <span>BB(20,2)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
