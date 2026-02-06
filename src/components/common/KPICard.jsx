import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import SummaryToolTipIcon from '../../pages/LLM/SummaryToolTipIcon';


export function KPICard({ title, value, change, tooltipTitle, trend, icon: Icon, iconColor = 'text-blue-600' }) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="d-flex">
          <p className="text-sm text-gray-600 mb-1 font600">{title}</p>
          <div className={cn('p-1 pt-0 rounded-lg bg-opacity-10', iconColor.replace('text-', 'bg-'))}>
          <SummaryToolTipIcon tooltipTitle={tooltipTitle} />
        </div>
          </div>
          <div className="d-flex">
          <p className="text-2xl mb-0 me-4 font-bold text-gray-900 font18">{value}</p>

          {change !== undefined && trend && (
            <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2', getTrendColor())}>
              {getTrendIcon()}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
          </div>
        </div>
        

        <div className={cn('p-3 pt-0 rounded-lg bg-opacity-10', iconColor.replace('text-', 'bg-'))}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </Card>
  );
}

