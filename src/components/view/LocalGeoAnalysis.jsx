import { MapPin, Navigation } from 'lucide-react';
import { Card } from '../ui/card';
import { TrendBadge } from '../common/TrendBadge';
import { mockKeywords } from '../data/mockData';
import { Badge } from 'antd';

export function LocalGeoAnalysis() {
  const localKeywords = mockKeywords.filter(kw =>
    kw.serpFeatures.includes('Local Pack') || kw.platforms.includes('Local')
  );

  const cities = [
    { name: 'New York, NY', keywords: 8, avgPosition: 2.3, trend: 'up' },
    { name: 'Los Angeles, CA', keywords: 6, avgPosition: 3.1, trend: 'up' },
    { name: 'Chicago, IL', keywords: 5, avgPosition: 4.2, trend: 'stable' },
    { name: 'Houston, TX', keywords: 4, avgPosition: 5.1, trend: 'down' }
  ];

  return (
    <div className="space-y-6 geo-local">
      <Card className="p-6 bg-gradient-to-r from-green-500 to-teal-600 text-white pad-20 round-10 mb-25">
        <h2 className="text-2xl font-bold mb-2">Local & Geo-Based Analysis</h2>
        <p className="text-green-100">Geographic keyword performance and local pack presence</p>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-25 geo-local-box">
        <Card className="p-6 pad-20 round-10">
          <MapPin className="w-8 h-8 text-green-600 mb-3 mb-20" />
          <div className="text-sm text-gray-600 mb-20">Local Keywords</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 mb-20">{localKeywords.length}</div>
          <TrendBadge trend="up" value={12} size="sm" />
        </Card>
        <Card className="p-6 pad-20 round-10">
          <Navigation className="w-8 h-8 text-blue-600 mb-3 mb-20" />
          <div className="text-sm text-gray-600 mb-20">Cities Tracked</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 mb-20">{cities.length}</div>
        </Card>
        <Card className="p-6 pad-20 round-10">
          <div className="text-sm text-gray-600 mb-20">Local Pack Presence</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 mb-20">87%</div>
          <TrendBadge trend="up" value={8} size="sm" />
        </Card>
      </div>

      {/* Map Visualization (Placeholder) */}
      <Card className="p-6 pad-20 round-10 mb-25 map-vis">
        <h3 className="font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
        <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Interactive map visualization</p>
            <p className="text-sm text-gray-400 mt-1">Showing keyword rankings by location</p>
          </div>
        </div>
      </Card>

      {/* City Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 grid-city mb-25">
        {cities.map((city, idx) => (
          <Card key={idx} className="p-6 pad-20 round-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{city.name}</h4>
                  <p className="text-sm text-gray-500">{city.keywords} keywords</p>
                </div>
              </div>
              <TrendBadge trend={city.trend} size="sm" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Position:</span>
                <span className="font-semibold text-gray-900">{city.avgPosition}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Local Pack:</span>
                <Badge variant="secondary">Present</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Top 3 Rankings:</span>
                <span className="font-semibold text-green-600">{Math.floor(city.keywords * 0.6)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Local Keywords List */}
      <Card className="p-6 pad-20 round-10 local-key">
        <h3 className="font-semibold text-gray-900 mb-4">Local Keywords</h3>
        <div className="space-y-3 local-key-inner">
          {localKeywords.map((keyword) => (
            <div key={keyword.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors pad-20 round-10">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{keyword.keyword}</p>
                <p className="text-sm text-gray-500 mt-1">Appears in Local Pack</p>
              </div>
              <div className="items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">#{keyword.currentPosition}</div>
                  <TrendBadge trend={keyword.trend} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
