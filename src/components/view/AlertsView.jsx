import { 
  AlertTriangle, 
  Star, 
  Sparkles, 
  ArrowUpCircle,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card } from '../ui/card';
import { mockAlerts } from '../data/mockData';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from 'antd';
import { Button } from '../ui/button';

export function AlertsView() {
  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'border-red-300 bg-red-50';
    if (severity === 'medium') return 'border-yellow-300 bg-yellow-50';
    return 'border-blue-300 bg-blue-50';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'rank_drop': return <AlertTriangle className="w-5 h-5" />;
      case 'feature_loss': return <Star className="w-5 h-5" />;
      case 'ai_visibility': return <Sparkles className="w-5 h-5" />;
      case 'competitor_takeover': return <ArrowUpCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white pad-20 round-10 mb-25 bggg">
        <div className="flex items-center justify-between dis-flex align-items-start">
          <div>
            <div className="flex items-center gap-2 mb-2 d-flex mb-20">
              <Bell className="w-6 h-6" />
              <h2 className="text-2xl font-bold margin-0 text-white">Alerts & Notifications</h2>
            </div>
            <p className="text-orange-100">
              Monitor critical ranking changes and SERP feature updates
            </p>
          </div>
          <Badge className="bg-white text-red-600 text-lg px-4 py-2 clr-blk">
            {mockAlerts.length} Active
          </Badge>
        </div>
      </Card>

      {/* Alert Filters */}
      <Card className="p-4 pad-20 round-10 mb-25 alert-filter">
        <Tabs defaultValue="all" className="flex d-flex gap-2">
          <TabsList>
            <TabsTrigger value="all">All Alerts ({mockAlerts.length})</TabsTrigger>
            <TabsTrigger value="high">
              High Priority ({mockAlerts.filter(a => a.severity === 'high').length})
            </TabsTrigger>
            <TabsTrigger value="medium">
              Medium ({mockAlerts.filter(a => a.severity === 'medium').length})
            </TabsTrigger>
            <TabsTrigger value="low">
              Low ({mockAlerts.filter(a => a.severity === 'low').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {/* Alert List */}
      <div className="space-y-4 alert-list">
        {mockAlerts.map((alert) => {
          const iconColorClass = 
            alert.severity === 'high' ? 'text-red-600' :
            alert.severity === 'medium' ? 'text-yellow-600' :
            'text-blue-600';

          return (
            <Card key={alert.id} className={`p-6 border-2 ${getSeverityColor(alert.severity)} pad-20 round-10 mb-25`}>
              <div className="flex items-start gap-4 d-flex align-items-start">
                <div className={`flex-shrink-0 ${iconColorClass}`}>
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1 d-flex align-items-start">
                        <h3 className="font-semibold text-gray-900 font20 font600">{alert.title}</h3>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{alert.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{alert.timestamp}</span>
                  </div>

                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 pad-20 round-10 mb-20">
                    <p className="text-xs text-gray-600 mb-1">Affected Keyword:</p>
                    <p className="font-medium text-gray-900 margin-0 clr-blk">{alert.keyword}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 alert-but">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                    <Button size="sm" variant="ghost">
                      <X className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alert Settings */}
      <Card className="p-6 border-2 border-blue-200 pad-20 round-10 alert-set">
        <h3 className="font-semibold text-gray-900 mb-3 font20 font600">Alert Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="" />
            <span>Notify me when rankings drop by 3+ positions</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="" />
            <span>Alert when featured snippets are lost</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="" />
            <span>Notify about new AI Overview appearances</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="" />
            <span>Email digest of weekly alerts</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
