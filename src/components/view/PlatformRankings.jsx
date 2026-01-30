import { useState } from 'react';
import { Image as ImageIcon, MapPin, Youtube, Smartphone, Search } from 'lucide-react';
import { mockKeywords } from '../data/mockData';
import { Card } from '../ui/card';
import { TrendBadge } from '../common/TrendBadge';
import { Badge } from 'antd';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export function PlatformRankings() {
  const [selectedPlatform, setSelectedPlatform] = useState('Image Search');

  const platforms = [
    { id: 'Image Search', icon: ImageIcon, color: 'text-blue-600' },
    { id: 'Local', icon: MapPin, color: 'text-green-600' },
    { id: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { id: 'App Store', icon: Smartphone, color: 'text-purple-600' },
    { id: 'Bing', icon: Search, color: 'text-orange-600' }
  ];

  const filteredKeywords = mockKeywords.filter(kw => 
    kw.platforms.some(p => p.includes(selectedPlatform.split(' ')[0]))
  );

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);
  const Icon = selectedPlatformData?.icon || ImageIcon;

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <Card className="p-4">
        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <TabsList className="grid grid-cols-5 gap-2 h-auto bg-transparent">
            {platforms.map((platform) => {
              const PlatformIcon = platform.icon;
              return (
                <TabsTrigger
                  key={platform.id}
                  value={platform.id}
                  className="flex items-center gap-2 p-3 data-[state=active]:bg-blue-50"
                >
                  <PlatformIcon className={`w-5 h-5 ${platform.color}`} />
                  <span>{platform.id}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </Card>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Keywords</div>
          <div className="text-3xl font-bold text-gray-900">{filteredKeywords.length}</div>
          <div className="mt-2">
            <TrendBadge trend="up" value={8} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Position</div>
          <div className="text-3xl font-bold text-gray-900">
            {(filteredKeywords.reduce((sum, kw) => sum + kw.currentPosition, 0) / filteredKeywords.length || 0).toFixed(1)}
          </div>
          <div className="mt-2">
            <TrendBadge trend="up" value={-12} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Top 10 Keywords</div>
          <div className="text-3xl font-bold text-gray-900">
            {filteredKeywords.filter(kw => kw.currentPosition <= 10).length}
          </div>
          <div className="mt-2">
            <TrendBadge trend="up" value={15} />
          </div>
        </Card>
      </div>

      {/* Keyword Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKeywords.map((keyword) => (
          <Card key={keyword.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">#{keyword.currentPosition}</div>
                <TrendBadge trend={keyword.trend} size="sm" />
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">{keyword.keyword}</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Search Volume:</span>
                <span className="font-medium text-gray-900">{keyword.searchVolume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <Badge variant={keyword.difficulty > 70 ? 'destructive' : 'secondary'}>
                  {keyword.difficulty}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">URL:</span>
                <span className="text-blue-600 text-xs truncate max-w-[150px]">{keyword.url}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-1 flex-wrap">
                {keyword.serpFeatures.slice(0, 2).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {keyword.serpFeatures.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{keyword.serpFeatures.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredKeywords.length === 0 && (
        <Card className="p-12 text-center">
          <Icon className={`w-16 h-16 mx-auto mb-4 ${selectedPlatformData?.color}`} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
          <p className="text-gray-600">
            No keywords are currently ranking on {selectedPlatform}
          </p>
        </Card>
      )}
    </div>
  );
}
