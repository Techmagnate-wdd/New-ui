import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { TrendBadge } from '@/app/components/common/TrendBadge';
import { Image as ImageIcon, Video, Film, Youtube } from 'lucide-react';
import { mockKeywords } from '@/app/data/mockData';

export function MediaSearchAnalysis() {
  const mediaKeywords = mockKeywords.filter(kw => 
    kw.serpFeatures.some(f => f.includes('Image') || f.includes('Video'))
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Media Search Analysis</h2>
        <p className="text-pink-100">Visual and multimedia-driven SERP performance</p>
      </Card>

      {/* Media Type Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <ImageIcon className="w-8 h-8 text-blue-600 mb-3" />
          <div className="text-sm text-gray-600">Image Pack</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockKeywords.filter(kw => kw.serpFeatures.some(f => f.includes('Image'))).length}
          </div>
          <TrendBadge trend="up" size="sm" />
        </Card>
        <Card className="p-6">
          <Video className="w-8 h-8 text-red-600 mb-3" />
          <div className="text-sm text-gray-600">Video Pack</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockKeywords.filter(kw => kw.serpFeatures.some(f => f.includes('Video'))).length}
          </div>
          <TrendBadge trend="up" size="sm" />
        </Card>
        <Card className="p-6">
          <Film className="w-8 h-8 text-orange-600 mb-3" />
          <div className="text-sm text-gray-600">Short Videos</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">15</div>
          <TrendBadge trend="stable" size="sm" />
        </Card>
        <Card className="p-6">
          <Youtube className="w-8 h-8 text-red-600 mb-3" />
          <div className="text-sm text-gray-600">YouTube</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockKeywords.filter(kw => kw.platforms.includes('YouTube')).length}
          </div>
          <TrendBadge trend="up" size="sm" />
        </Card>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaKeywords.map((keyword) => (
          <Card key={keyword.id} className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {keyword.serpFeatures.some(f => f.includes('Video')) ? (
                <Video className="w-16 h-16 text-white" />
              ) : (
                <ImageIcon className="w-16 h-16 text-white" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{keyword.keyword}</h4>
                <Badge variant="outline">Owned</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Position:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600">#{keyword.currentPosition}</span>
                  <TrendBadge trend={keyword.trend} size="sm" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
