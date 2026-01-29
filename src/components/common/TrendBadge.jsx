import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../ui/utils';

export function TrendBadge({ trend, value, size = 'md' }) {
  const getTrendIcon = () => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    if (trend === 'up') return <TrendingUp className={iconClass} />;
    if (trend === 'down') return <TrendingDown className={iconClass} />;
    return <Minus className={iconClass} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      getTrendColor(),
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'
    )}>
      {getTrendIcon()}
      {value !== undefined && <span>{value > 0 ? '+' : ''}{value}</span>}
    </div>
  );
}
