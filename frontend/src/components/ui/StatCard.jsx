import { TrendingUp, TrendingDown } from 'lucide-react';

const Sparkline = ({ data, color = '#16a34a' }) => {
  const w = 80, h = 36, pad = 4;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pts.split(' ')[0]} L${pts.split(' ').slice(1).join(' L')} L${w - pad},${h} L${pad},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StatCard = ({
  label,
  value,
  subtitle,
  trend,
  up = true,
  icon: Icon,
  sparkData,
  onClick,
  className = '',
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-500',
  bgGradient,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${bgGradient || 'bg-white'} rounded-none border border-white/50 p-5 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'shadow-sm hover:shadow-md hover:-translate-y-1'
      } ${className}`}
    >
      <div className="flex justify-between items-start mb-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-none flex items-center justify-center ${iconBg}`}>
            <Icon size={20} className={iconColor} strokeWidth={2} />
          </div>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            up ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
          }`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none">{value}</div>
      <div className="text-sm text-gray-500 mt-1 mb-2 font-medium">{label}</div>
      {sparkData && <Sparkline data={sparkData} color={up ? '#16a34a' : '#ef4444'} />}
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
