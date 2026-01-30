import { MessageSquare, Users, ThumbsUp, MessageCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from 'antd';

export function CommunityResults() {
  const discussions = [
    { question: 'What are the best SEO tools for 2026?', platform: 'Reddit', mentions: 5, upvotes: 142, position: 2 },
    { question: 'How to improve local SEO rankings?', platform: 'Quora', mentions: 3, upvotes: 89, position: 1 },
    { question: 'Rank tracking vs analytics - what\'s better?', platform: 'Reddit', mentions: 4, upvotes: 67, position: 3 },
    { question: 'Best practices for keyword research', platform: 'Stack Exchange', mentions: 2, upvotes: 45, position: 4 }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Community & Discussion Results</h2>
        <p className="text-indigo-100">Track visibility in forums, Q&A, and discussion platforms</p>
      </Card>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
          <div className="text-sm text-gray-600">Total Mentions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">14</div>
        </Card>
        <Card className="p-6">
          <Users className="w-8 h-8 text-blue-600 mb-3" />
          <div className="text-sm text-gray-600">Platforms</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">3</div>
        </Card>
        <Card className="p-6">
          <ThumbsUp className="w-8 h-8 text-green-600 mb-3" />
          <div className="text-sm text-gray-600">Total Engagement</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">343</div>
        </Card>
        <Card className="p-6">
          <MessageCircle className="w-8 h-8 text-orange-600 mb-3" />
          <div className="text-sm text-gray-600">Discussions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{discussions.length}</div>
        </Card>
      </div>

      {/* Discussions List */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Active Discussions</h3>
        <div className="space-y-4">
          {discussions.map((discussion, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{discussion.platform}</Badge>
                    <Badge variant="secondary">Position #{discussion.position}</Badge>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{discussion.question}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.mentions} brand mentions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{discussion.upvotes} upvotes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Platform Distribution</h3>
        <div className="space-y-3">
          {['Reddit', 'Quora', 'Stack Exchange'].map((platform, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{platform}</span>
              <Badge>{discussions.filter(d => d.platform === platform).length} discussions</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
