import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Badge } from 'antd';
import { Card } from '../ui/card';
import { mockAIInsights } from '../data/mockData';
import { Button } from '../ui/button';

export function AIInsights() {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'complexity': return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'mismatch': return <FileText className="w-6 h-6 text-orange-600" />;
      default: return <Lightbulb className="w-6 h-6 text-blue-600" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'risk': return 'border-red-200 bg-red-50';
      case 'complexity': return 'border-purple-200 bg-purple-50';
      case 'mismatch': return 'border-orange-200 bg-orange-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') return <Badge variant="destructive">High Priority</Badge>;
    if (priority === 'medium') return <Badge variant="default">Medium Priority</Badge>;
    return <Badge variant="secondary">Low Priority</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white pad-20 round-10 mb-25 bggg">
        <div className="flex items-start justify-between dis-flex align-items-start">
          <div className="">
            <div className="flex items-center gap-2 mb-2 d-flex mb-20">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-white margin-0">AI-Powered Insights</h2>
            </div>
            <p className="text-purple-100">
              Automated analysis of your SERP visibility with actionable recommendations
            </p>
          </div>
          <Badge className="bg-white text-purple-600 clr-blk">
            {mockAIInsights.length} Active Insights
          </Badge>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 d-flex gap-15 ai-boxes">
        <Card className="p-4 border-l-4 border-l-green-500 pad-20 round-10 mb-25 width23">
          <div className="text-sm text-gray-600 mb-1 mb-20">Opportunities</div>
          <div className="text-2xl font-bold text-gray-900 font600">
            {mockAIInsights.filter(i => i.type === 'opportunity').length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500 pad-20 round-10 mb-25 width23">
          <div className="text-sm text-gray-600 mb-1 mb-20">Risks</div>
          <div className="text-2xl font-bold text-gray-900 font600">
            {mockAIInsights.filter(i => i.type === 'risk').length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500 pad-20 round-10 mb-25 width23">
          <div className="text-sm text-gray-600 mb-1 mb-20">Complexity Issues</div>
          <div className="text-2xl font-bold text-gray-900 font600">
            {mockAIInsights.filter(i => i.type === 'complexity').length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500 pad-20 round-10 mb-25 width23">
          <div className="text-sm text-gray-600 mb-1 mb-20">Mismatches</div>
          <div className="text-2xl font-bold text-gray-900 font600">
            {mockAIInsights.filter(i => i.type === 'mismatch').length}
          </div>
        </Card>
      </div>

      {/* Insight Cards */}
      <div className="space-y-4 insight-card">
        {mockAIInsights.map((insight) => (
          <Card key={insight.id} className={`p-6 border-2 ${getInsightColor(insight.type)} pad-20 round-10 mb-25`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2 dis-flex mb-15 align-items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 mb-20 font600">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {insight.description}
                    </p>
                  </div>
                  {getPriorityBadge(insight.priority)}
                </div>

                <div className="flex items-center gap-4 mt-4 dis-flex mb-15 align-items-start">
                  <div className="flex items-center gap-2 text-sm text-gray-600 align-items-center">
                    <FileText className="w-4 h-4 max-w20" />
                    <span>{insight.affectedKeywords} keywords affected</span>
                  </div>
                  
                  <Button size="sm" variant="outline" className="ml-auto">
                    View Keywords
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Action Items */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1 com-ul">
                    {insight.type === 'opportunity' && (
                      <>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-green-600 rounded-full" />
                          Create structured FAQ content for target keywords
                        </li>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-green-600 rounded-full" />
                          Optimize for conversational search queries
                        </li>
                      </>
                    )}
                    {insight.type === 'risk' && (
                      <>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-600 rounded-full" />
                          Update content with latest information
                        </li>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-600 rounded-full" />
                          Monitor competitor content changes
                        </li>
                      </>
                    )}
                    {insight.type === 'complexity' && (
                      <>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                          Focus on high-value SERP features
                        </li>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                          Optimize content for multiple formats
                        </li>
                      </>
                    )}
                    {insight.type === 'mismatch' && (
                      <>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
                          Create video content for visual keywords
                        </li>
                        <li className="text-sm text-gray-700 pl-4 relative">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
                          Match content format to search intent
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Analysis Info */}
      <Card className="p-6 bg-blue-50 border-blue-200 ai-analyse pad-20 round-10 mb-25">
        <div className="flex items-start gap-3 d-flex align-items-start">
          <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">How AI Insights Work</h4>
            <p className="text-sm text-gray-700">
              Our AI analyzes your keyword rankings, SERP features, and competitor data to identify
              opportunities and risks automatically. Insights are updated daily based on the latest
              search result changes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
