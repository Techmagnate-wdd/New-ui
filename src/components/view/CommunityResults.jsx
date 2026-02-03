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
    <div className="space-y-6 com-result">
      <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white pad-20 round-10 mb-25 bg-main">
        <h2 className="text-2xl font-bold mb-2 font20 font600 mb-20">Community & Discussion Results</h2>
        <p className="text-indigo-100 clr-blk margin-0">Track visibility in forums, Q&A, and discussion platforms</p>
      </Card>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-25 d-flex">
        <Card className="p-6 pad-20 round-10 width23">
          <MessageSquare className="w-8 h-8 text-purple-600 mb-3 mb-25 purple" />
          <div className="text-sm text-gray-600 mb-25">Total Mentions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 font600 margin-0 clr-blk">14</div>
        </Card>
        <Card className="p-6 pad-20 round-10 width23">
          <Users className="w-8 h-8 text-blue-600 mb-3 mb-25 blue" />
          <div className="text-sm text-gray-600 mb-25">Platforms</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 font600 margin-0 clr-blk">3</div>
        </Card>
        <Card className="p-6 pad-20 round-10 width23">
          <ThumbsUp className="w-8 h-8 text-green-600 mb-3 mb-25 green" />
          <div className="text-sm text-gray-600 mb-25">Total Engagement</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 font600 margin-0 clr-blk">343</div>
        </Card>
        <Card className="p-6 pad-20 round-10 width23">
          <MessageCircle className="w-8 h-8 text-orange-600 mb-3 mb-25 orange" />
          <div className="text-sm text-gray-600 mb-25">Discussions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1 font600 margin-0 clr-blk">{discussions.length}</div>
        </Card>
      </div>

      {/* Discussions List */}
      <Card className="p-6 pad-20 round-10 mb-25">
        <h3 className="font-semibold text-gray-900 mb-4 font20 mb-25">Active Discussions</h3>
        <div className="space-y-4 d-flex gap-15 flex-wrap">
          {discussions.map((discussion, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors pad-20 round-10 width100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 mb-20">
                    <Badge variant="outline" className="round-boxe mar-right-10">{discussion.platform}</Badge>
                    <Badge variant="secondary" className="round-boxe-solid">Position #{discussion.position}</Badge>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 font18 mb-20">{discussion.question}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 d-flex">
                    <div className="flex items-center gap-1 d-flex">
                      <MessageSquare className="w-4 h-4 max-w20" />
                      <span>{discussion.mentions} brand mentions</span>
                    </div>
                    <div className="flex items-center gap-1 d-flex">
                      <ThumbsUp className="w-4 h-4 max-w20" />
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
      <Card className="p-6 pad-20 round-10 mb-25">
        <h3 className="font-semibold text-gray-900 mb-4 font20">Platform Distribution</h3>
        <div className="space-y-3 platform-dir">
          {['Reddit', 'Quora', 'Stack Exchange'].map((platform, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dis-flex">
              <span className="font-medium text-gray-900 font600">{platform}</span>
              <Badge>{discussions.filter(d => d.platform === platform).length} discussions</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
