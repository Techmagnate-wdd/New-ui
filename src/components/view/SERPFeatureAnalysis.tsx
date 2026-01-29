import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { 
  Star, 
  HelpCircle, 
  Sparkles, 
  Bot, 
  Image as ImageIcon,
  Video,
  MapPin,
  ShoppingCart,
  Newspaper,
  Film,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { mockKeywords, mockSerpFeatures } from '@/app/data/mockData';

export function SERPFeatureAnalysis() {
  const [selectedFeature, setSelectedFeature] = useState('Featured Snippet');

  const featureTabs = [
    { id: 'Featured Snippet', icon: Star, color: 'text-yellow-600' },
    { id: 'People Also Ask', icon: HelpCircle, color: 'text-blue-600' },
    { id: 'AI Overview', icon: Sparkles, color: 'text-purple-600' },
    { id: 'AI Mode', icon: Bot, color: 'text-purple-600' },
    { id: 'Image Pack', icon: ImageIcon, color: 'text-blue-600' },
    { id: 'Video Pack', icon: Video, color: 'text-red-600' },
    { id: 'Local Pack', icon: MapPin, color: 'text-green-600' },
    { id: 'Shopping', icon: ShoppingCart, color: 'text-orange-600' },
    { id: 'News', icon: Newspaper, color: 'text-gray-600' },
    { id: 'Short Videos', icon: Film, color: 'text-red-600' }
  ];

  const filteredKeywords = mockKeywords.filter(kw => 
    kw.serpFeatures.includes(selectedFeature)
  );

  const featureData = mockSerpFeatures.find(f => f.name === selectedFeature);
  const selectedTab = featureTabs.find(f => f.id === selectedFeature);
  const Icon = selectedTab?.icon || Star;

  return (
    <div className="space-y-6">
      {/* Feature Selection Tabs */}
      <Card className="p-4">
        <Tabs value={selectedFeature} onValueChange={setSelectedFeature}>
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto bg-transparent">
            {featureTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-blue-50"
                >
                  <TabIcon className={`w-5 h-5 ${tab.color}`} />
                  <span className="text-xs text-center">{tab.id}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Keyword List */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Keywords</h3>
            <Badge>{filteredKeywords.length}</Badge>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredKeywords.map((keyword) => (
              <div
                key={keyword.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{keyword.keyword}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Position #{keyword.currentPosition}</span>
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">#{keyword.currentPosition}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Central Panel - SERP Preview */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">SERP Preview</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon className={`w-6 h-6 ${selectedTab?.color} flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedFeature}</h4>
                  <p className="text-sm text-gray-600">
                    This feature appears in {featureData?.percentage}% of tracked SERPs
                  </p>
                </div>
              </div>
            </div>

            {/* Mock SERP Result */}
            <div className="space-y-3">
              <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Your Site
                  </Badge>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1">
                  {filteredKeywords[0]?.keyword || 'Example Keyword'}
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  Comprehensive guide covering all aspects of {selectedFeature.toLowerCase()}...
                </p>
                <p className="text-xs text-green-700">yoursite.com • Position #{filteredKeywords[0]?.currentPosition || 1}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline">Competitor</Badge>
                  <XCircle className="w-5 h-5 text-gray-400" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1">
                  Competitor's {selectedFeature} Page
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  Alternative content about the topic from a competitor...
                </p>
                <p className="text-xs text-gray-500">competitor.com • Position #2</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Panel - Insights */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Feature Insights</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Appearances:</span>
                  <span className="font-medium text-gray-900">{featureData?.count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-medium text-gray-900">{featureData?.percentage || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <Badge variant={featureData?.trend === 'up' ? 'default' : 'secondary'}>
                    {featureData?.trend || 'stable'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 pl-4 relative">
                  <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Optimize content structure for better feature visibility
                </li>
                <li className="text-sm text-gray-600 pl-4 relative">
                  <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Monitor competitor content in this feature
                </li>
                <li className="text-sm text-gray-600 pl-4 relative">
                  <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Update content regularly to maintain position
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Visibility Notes</h4>
              <p className="text-sm text-gray-600">
                {selectedFeature === 'Featured Snippet' && 
                  'Featured snippets provide high visibility and can significantly increase CTR. Focus on clear, concise answers to common questions.'}
                {selectedFeature === 'AI Overview' && 
                  'AI Overviews are becoming more prominent. Ensure your content is comprehensive and authoritative to be included.'}
                {selectedFeature === 'People Also Ask' && 
                  'PAA boxes expand search visibility. Target question-based keywords and provide detailed answers.'}
                {!['Featured Snippet', 'AI Overview', 'People Also Ask'].includes(selectedFeature) &&
                  `${selectedFeature} features can drive qualified traffic. Optimize your content format to match user intent.`}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
