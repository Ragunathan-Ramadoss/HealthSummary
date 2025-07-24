import { FileText, Download, CheckCircle, Search, Lightbulb, Table, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReportDisplayProps {
  report: any;
  isGenerating: boolean;
}

export default function ReportDisplay({ report, isGenerating }: ReportDisplayProps) {
  if (isGenerating) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200 p-8 text-center">
        <div className="loading-pulse">
          <div className="w-16 h-16 bg-[var(--medical-blue)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-white text-2xl" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Test Results</h3>
        <p className="text-gray-600 mb-4">AI is processing your data using Ollama LLaMA 3.2...</p>
        <div className="flex justify-center">
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-[var(--medical-blue)] h-2 rounded-full loading-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <FileText className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Generated</h3>
        <p className="text-gray-600">Fill out the test data form and click "Generate AI Report" to begin analysis.</p>
      </Card>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'bg-[var(--medical-green)] text-white';
      case 'abnormal':
        return 'bg-[var(--medical-red)] text-white';
      case 'borderline':
        return 'bg-[var(--medical-amber)] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="medical-blue text-xl mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">AI-Generated Medical Report</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-[var(--medical-green)] text-white text-sm rounded-full flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Generated
              </span>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Patient:</span>
              <span className="font-medium ml-2">{report.patientId}</span>
            </div>
            <div>
              <span className="text-gray-500">Test Date:</span>
              <span className="font-medium ml-2">{formatDate(report.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">Test Type:</span>
              <span className="font-medium ml-2 capitalize">{report.testType}</span>
            </div>
            <div>
              <span className="text-gray-500">Generated:</span>
              <span className="font-medium ml-2">{formatDate(report.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {report.aiReport?.summary && (
        <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="medical-blue mr-2 h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{report.aiReport.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Findings */}
      {report.aiReport?.keyFindings && report.aiReport.keyFindings.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="medical-blue mr-2 h-5 w-5" />
              Key Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.aiReport.keyFindings.map((finding: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    finding.status === 'normal' ? 'bg-[var(--medical-green)]' : 
                    finding.status === 'abnormal' ? 'bg-[var(--medical-red)]' : 
                    'bg-[var(--medical-amber)]'
                  }`}>
                    <CheckCircle className="text-white text-xs w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{finding.parameter}</h4>
                    <p className="text-sm text-gray-600">{finding.interpretation}</p>
                    {finding.value && (
                      <p className="text-xs text-gray-500 mt-1">Value: {finding.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.aiReport?.recommendations && report.aiReport.recommendations.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="medical-blue mr-2 h-5 w-5" />
              Clinical Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.aiReport.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="medical-blue mt-1 text-sm">→</span>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Parameters Table */}
      {report.parameters && (
        <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Table className="medical-blue mr-2 h-5 w-5" />
              Test Parameters & Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(report.parameters).map(([param, value]: [string, any]) => {
                    const finding = report.aiReport?.keyFindings?.find((f: any) => 
                      f.parameter.toLowerCase().includes(param.toLowerCase())
                    );
                    return (
                      <tr key={param}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{param}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{value}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{finding?.referenceRange || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(finding?.status || 'normal')}`}>
                            {finding?.status || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Notes */}
      <Card className="bg-blue-50 border border-blue-200 report-section slide-in">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="medical-blue mt-1 h-5 w-5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Analysis Notes</h4>
              <p className="text-sm text-gray-700 mb-3">
                This report was generated using Ollama LLaMA 3.2. The AI analysis is based on established 
                medical reference ranges and clinical guidelines.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Model: LLaMA 3.2:latest</span>
                <span>•</span>
                <span>Generated: {formatDate(report.createdAt)}</span>
                {report.aiReport?.rawResponse && (
                  <>
                    <span>•</span>
                    <span>AI Response Available</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}