import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { mockKeywords } from '@/app/data/mockData';
import { cn } from '@/app/components/ui/utils';

export function SERPUnifiedDashboard() {
  const serpComponents = [
    'Organic',
    'AI Overview',
    'People Also Ask',
    'Local Pack',
    'Video Pack',
    'Image Pack',
    'Shopping',
    'News'
  ];

  const hasFeature = (keyword: any, component: string) => {
    if (component === 'Organic') return true; // All keywords have organic
    return keyword.serpFeatures.some((f: string) => 
      f.toLowerCase().includes(component.toLowerCase().replace(' ', ''))
    );
  };

  const isOwned = (keyword: any, component: string) => {
    // Simulate ownership - some features are owned by us
    if (component === 'Organic') return true;
    const random = parseInt(keyword.id) % 3;
    return random === 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">SERP Unified Dashboard</h2>
        <p className="text-blue-100">
          Consolidated view of all SERP components for each keyword
        </p>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Owned by Brand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Circle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">Feature Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded" />
            <span className="text-sm text-gray-700">Feature Absent</span>
          </div>
        </div>
      </Card>

      {/* SERP Matrix */}
      <Card className="p-6 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-900 sticky left-0 bg-white z-10">
                Keyword
              </th>
              <th className="text-center p-3 font-semibold text-gray-900 min-w-[80px]">
                Position
              </th>
              {serpComponents.map((component) => (
                <th key={component} className="text-center p-3 min-w-[100px]">
                  <div className="font-semibold text-gray-900 text-sm">{component}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockKeywords.map((keyword, idx) => (
              <tr 
                key={keyword.id} 
                className={cn(
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}
              >
                <td className="p-3 sticky left-0 bg-inherit z-10">
                  <div className="font-medium text-gray-900">{keyword.keyword}</div>
                  <div className="text-xs text-gray-500 mt-1">{keyword.url}</div>
                </td>
                <td className="p-3 text-center">
                  <Badge variant={keyword.currentPosition <= 3 ? 'default' : 'secondary'}>
                    #{keyword.currentPosition}
                  </Badge>
                </td>
                {serpComponents.map((component) => {
                  const present = hasFeature(keyword, component);
                  const owned = present && isOwned(keyword, component);
                  
                  return (
                    <td key={component} className="p-3 text-center">
                      <div className="flex justify-center">
                        {owned ? (
                          <div 
                            className="w-8 h-8 bg-green-500 rounded flex items-center justify-center"
                            title={`${component} - Owned`}
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        ) : present ? (
                          <div 
                            className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center"
                            title={`${component} - Present (not owned)`}
                          >
                            <Circle className="w-5 h-5 text-blue-600" />
                          </div>
                        ) : (
                          <div 
                            className="w-8 h-8 bg-gray-100 rounded"
                            title={`${component} - Absent`}
                          />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Features</div>
          <div className="text-2xl font-bold text-gray-900">
            {mockKeywords.reduce((sum, kw) => sum + kw.serpFeatures.length, 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Owned Features</div>
          <div className="text-2xl font-bold text-green-600">
            {Math.floor(mockKeywords.reduce((sum, kw) => sum + kw.serpFeatures.length, 0) / 3)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Features per Keyword</div>
          <div className="text-2xl font-bold text-gray-900">
            {(mockKeywords.reduce((sum, kw) => sum + kw.serpFeatures.length, 0) / mockKeywords.length).toFixed(1)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Feature Coverage</div>
          <div className="text-2xl font-bold text-blue-600">72%</div>
        </Card>
      </div>
    </div>
  );
}
