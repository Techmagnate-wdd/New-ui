import { useState } from 'react';
import { 
  Search, 
  Star, 
  Sparkles, 
  Video, 
  Image as ImageIcon,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Badge,
} from 'lucide-react';

import { Card } from '../ui/card';
import { mockKeywords } from '../data/mockData';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { TrendBadge } from '../common/TrendBadge';

export function KeywordOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('currentPosition');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredKeywords = mockKeywords
    .filter(kw => kw.keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'keyword') {
        return multiplier * a.keyword.localeCompare(b.keyword);
      }
      return multiplier * (a[sortField] - b[sortField]);
    });

  const getFeatureIcon = (feature) => {
    if (feature.includes('Snippet')) return <Star className="w-4 h-4 text-yellow-600" />;
    if (feature.includes('AI')) return <Sparkles className="w-4 h-4 text-purple-600" />;
    if (feature.includes('Video')) return <Video className="w-4 h-4 text-red-600" />;
    if (feature.includes('Image')) return <ImageIcon className="w-4 h-4 text-blue-600" />;
    if (feature.includes('Local')) return <MapPin className="w-4 h-4 text-green-600" />;
    return <Star className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="cursor-pointer hover:bg-gray-100">
              All Keywords ({mockKeywords.length})
            </Badge>
            <Badge className="cursor-pointer hover:bg-gray-100">
              Top 3 (42)
            </Badge>
            <Badge className="cursor-pointer hover:bg-gray-100">
              Trending Up (28)
            </Badge>
            <Badge className="cursor-pointer hover:bg-gray-100">
              Trending Down (15)
            </Badge>
          </div>
        </div>
      </Card>

      {/* Keywords Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('keyword')}
                  className="font-semibold"
                >
                  Keyword
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('currentPosition')}
                  className="font-semibold"
                >
                  Position
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>SERP Features</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('searchVolume')}
                  className="font-semibold"
                >
                  Volume
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('difficulty')}
                  className="font-semibold"
                >
                  Difficulty
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeywords.map((keyword) => (
              <>
                <TableRow key={keyword.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRow(expandedRow === keyword.id ? null : keyword.id)}
                    >
                      {expandedRow === keyword.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">#{keyword.currentPosition}</span>
                      <span className="text-xs text-gray-500">was #{keyword.previousPosition}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TrendBadge 
                      trend={keyword.trend} 
                      value={keyword.currentPosition - keyword.previousPosition}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {keyword.serpFeatures.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="inline-flex items-center">
                          {getFeatureIcon(feature)}
                        </div>
                      ))}
                      {keyword.serpFeatures.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{keyword.serpFeatures.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {keyword.platforms.map((platform, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {platform.split(' ')[0]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {keyword.searchVolume.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={keyword.difficulty > 70 ? 'destructive' : keyword.difficulty > 50 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {keyword.difficulty}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                {expandedRow === keyword.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-gray-50">
                      <div className="py-4 px-6">
                        <h4 className="font-semibold text-gray-900 mb-3">SERP Preview</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="space-y-3">
                            <div className="text-sm">
                              <p className="text-gray-600">Ranking URL:</p>
                              <p className="text-blue-600 font-medium">{keyword.url}</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-gray-600 mb-2">Active SERP Features:</p>
                              <div className="flex flex-wrap gap-2">
                                {keyword.serpFeatures.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="gap-1">
                                    {getFeatureIcon(feature)}
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
