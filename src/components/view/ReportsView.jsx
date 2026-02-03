import { useState } from 'react';
import { FileText, Download, Mail, Calendar, Eye } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from 'antd';
import { Checkbox } from '../ui/checkbox';

export function ReportsView() {
  const [selectedSections, setSelectedSections] = useState([
    'summary',
    'keywords',
    'serp-features'
  ]);

  const reportSections = [
    { id: 'summary', label: 'Executive Summary', description: 'KPIs and high-level metrics' },
    { id: 'keywords', label: 'Keyword Performance', description: 'Detailed keyword rankings' },
    { id: 'serp-features', label: 'SERP Features', description: 'Feature coverage analysis' },
    { id: 'platforms', label: 'Platform Rankings', description: 'Cross-platform performance' },
    { id: 'ai-insights', label: 'AI Insights', description: 'Automated recommendations' },
    { id: 'alerts', label: 'Recent Alerts', description: 'Critical changes and notifications' },
    { id: 'trends', label: 'Trend Analysis', description: 'Historical performance charts' }
  ];

  const toggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-gray-700 to-gray-900 text-white pad-20 round-10 mb-25 bggg">
        <h2 className="text-2xl font-bold mb-2 mb-20 text-white">Report Builder</h2>
        <p className="text-gray-300 margin-0">Create custom reports and export your data</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 main-report-sec mb-25">
        {/* Left Panel - Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Selection */}
          <Card className="p-6 pad-20 round-10 mb-25">
            <h3 className="font-semibold text-gray-900 mb-4 font20 font600 mb-20">Select Report Sections</h3>
            <div className="space-y-3 d-flex flex-wrap">
              {reportSections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors pad-20 round-10 mb-25 width100 d-flex report-lable"
                >
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 font600">{section.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{section.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Date Range */}
          <Card className="p-6 pad-20 round-10 mb-25 report-period">
            <h3 className="font-semibold text-gray-900 mb-4 font20 mb-25">Report Period</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Last 7 days
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 days
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Last 90 days
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Custom range
              </Button>
            </div>
          </Card>

          {/* Export Options */}
          <Card className="p-6 pad-20 round-10 report-period export-format">
            <h3 className="font-semibold text-gray-900 mb-4 mb-25 font20">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="flex-col h-auto py-4">
                <FileText className="w-8 h-8 mb-2 text-blue-600" />
                <span className="text-sm">PDF</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-4">
                <FileText className="w-8 h-8 mb-2 text-green-600" />
                <span className="text-sm">Excel</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-4">
                <FileText className="w-8 h-8 mb-2 text-gray-600" />
                <span className="text-sm">CSV</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Panel - Preview & Actions */}
        <div className="space-y-6">
          <Card className="p-6 pad-20 round-10 mb-25">
            <h3 className="font-semibold text-gray-900 mb-4 font20 font600 mb-25">Report Preview</h3>
            <div className="bg-gray-100 rounded-lg p-8 mb-4 min-h-[300px] flex items-center justify-center mb-25">
              <div className="text-center">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Preview will appear here</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm dis-flex mb-20">
                <span className="text-gray-600">Selected Sections:</span>
                <Badge>{selectedSections.length}</Badge>
              </div>
              <div className="flex justify-between text-sm dis-flex">
                <span className="text-gray-600">Estimated Pages:</span>
                <span className="font-medium text-gray-900">{selectedSections.length * 2}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 pad-20 round-10 rpt-btns mb-25">
            <Button className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Preview Report
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Email Report
            </Button>
          </Card>

          {/* Scheduled Reports */}
          <Card className="p-6 pad-20 round-10 schedule-rpt">
            <h3 className="font-semibold text-gray-900 mb-3 font20 ">Scheduled Reports</h3>
            <p className="text-sm text-gray-600 mb-3">
              Automatically generate and send reports on a schedule
            </p>
            <Button variant="outline" className="w-full" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Setup Schedule
            </Button>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card className="p-6 pad-20 round-10 report recent">
        <h3 className="font-semibold text-gray-900 mb-4 font20 mb-25">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'Monthly SEO Report - January 2026', date: 'Jan 22, 2026', format: 'PDF', size: '2.4 MB' },
            { name: 'Keyword Performance Q4 2025', date: 'Jan 15, 2026', format: 'Excel', size: '1.8 MB' },
            { name: 'SERP Feature Analysis', date: 'Jan 10, 2026', format: 'PDF', size: '1.2 MB' }
          ].map((report, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 pad-20 round-10 mb-20 dis-flex for-hover">
              <div className="flex items-center gap-3 d-flex">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 font600 mb-10">{report.name}</p>
                  <p className="text-sm text-gray-500">{report.date} • {report.format} • {report.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
