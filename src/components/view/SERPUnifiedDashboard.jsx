import { CheckCircle2, Circle } from 'lucide-react';
import { Card } from '../ui/card';
import { mockKeywords } from '../data/mockData';
import { cn } from '../ui/utils';
import { Badge } from 'antd';

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

  const hasFeature = (keyword, component) => {
    if (component === 'Organic') return true; // All keywords have organic
    return keyword.serpFeatures.some((f) => 
      f.toLowerCase().includes(component.toLowerCase().replace(' ', ''))
    );
  };

  const isOwned = (keyword, component) => {
    // Simulate ownership - some features are owned by us
    if (component === 'Organic') return true;
    const random = parseInt(keyword.id) % 3;
    return random === 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white pad-20 round-10 mb-25 bg-main">
        <h2 className="text-2xl font-bold mb-2 font20 mb-20">SERP Unified Dashboard</h2>
        <p className="text-blue-100 clr-blk margin-0">
          Consolidated view of all SERP components for each keyword
        </p>
      </Card>

      {/* Legend */}
      <Card className="p-4 pad-20 round-10 mb-25 legend">
        <div className="flex items-center gap-6 flex-wrap d-flex">
          <div className="flex items-center gap-2 d-flex mar-right-10">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Owned by Brand</span>
          </div>
          <div className="flex items-center gap-2 d-flex mar-right-10">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Circle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">Feature Present</span>
          </div>
          <div className="flex items-center gap-2 d-flex">
            <div className="w-6 h-6 bg-gray-100 rounded" />
            <span className="text-sm text-gray-700">Feature Absent</span>
          </div>
        </div>
      </Card>

      {/* SERP Matrix */}
      <Card className="p-6 overflow-x-auto legend pad-20 round-10 mb-25">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-900 sticky left-0 bg-white z-10 font600 clr-blk">
                Keyword
              </th>
              <th className="text-center p-3 font-semibold text-gray-900 min-w-[80px] font600 clr-blk">
                Position
              </th>
              {serpComponents.map((component) => (
                <th key={component} className="text-center p-3 min-w-[100px] font600 clr-blk">
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
                <td className="p-3 sticky left-0 bg-inherit z-10 clr-blk font18 font600">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 d-flex">
        <Card className="p-4 pad-20 round-10 mb-20 width23">
          <div className="text-sm text-gray-600 mb-1 mb-25 font16">Total Features</div>
          <div className="text-2xl font-bold text-gray-900 font600">
            {mockKeywords.reduce((sum, kw) => sum + kw.serpFeatures.length, 0)}
          </div>
        </Card>
        <Card className="p-4 pad-20 round-10 mb-20 width23">
          <div className="text-sm text-gray-600 mb-1 mb-25 font16">Owned Features</div>
          <div className="text-2xl font-bold text-green-600 green font600">
            {Math.floor(mockKeywords.reduce((sum, kw) => sum + kw.serpFeatures.length, 0) / 3)}
          </div>
        </Card>
        <Card className="p-4 pad-20 round-10 mb-20 width23">
          <div className="text-sm text-gray-600 mb-1 mb-25 font16">Avg Features per Keyword</div>
          <div className="text-2xl font-bold text-gray-900 font600">
            {(mockKeywords.reduce((sum, kw) => sum + kw.serpFeatures.length, 0) / mockKeywords.length).toFixed(1)}
          </div>
        </Card>
        <Card className="p-4 pad-20 round-10 mb-20 width23">
          <div className="text-sm text-gray-600 mb-1 mb-25 font16">Feature Coverage</div>
          <div className="text-2xl font-bold text-blue-600 blue font600">72%</div>
        </Card>
      </div>
    </div>
  );
}
