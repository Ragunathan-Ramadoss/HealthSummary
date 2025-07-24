import { FileText, Download, CheckCircle, Search, Lightbulb, Table, Info, AlertTriangle, TrendingDown, Activity, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePDFReport } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

interface ReportDisplayProps {
  report: any;
  isGenerating: boolean;
}

export default function ReportDisplay({ report, isGenerating }: ReportDisplayProps) {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    try {
      const reportData = {
        patientId: report.patientId,
        testType: report.testType,
        createdAt: report.createdAt,
        parameters: report.parameters,
        aiReport: report.aiReport
      };
      
      generatePDFReport(reportData);
      
      toast({
        title: "PDF Downloaded",
        description: "Your medical report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Error",
        description: "There was an error generating your PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

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

  const getTestDisplayName = (testType: string) => {
    const testNames = {
      blood: 'Blood Panel',
      urine: 'Urine Analysis',
      lipid: 'Lipid Profile',
      thyroid: 'Thyroid Function',
      liver: 'Liver Function'
    };
    return testNames[testType as keyof typeof testNames] || testType;
  };

  const getRiskLevel = (findings: any[]) => {
    if (!findings || findings.length === 0) return 'low';
    const abnormalCount = findings.filter(f => f.status === 'abnormal').length;
    const borderlineCount = findings.filter(f => f.status === 'borderline').length;
    
    if (abnormalCount > 0) return 'high';
    if (borderlineCount > 1) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel(report?.aiReport?.keyFindings || []);

  return (
    <div className="space-y-6">
      {/* Report Title */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Understanding your {getTestDisplayName(report?.testType || '')} Test Results
            </h1>
            <p className="text-gray-600">
              Comprehensive AI-powered analysis with personalized insights
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Header */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="medical-blue text-xl mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Medical Report Summary</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-[var(--medical-green)] text-white text-sm rounded-full flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Generated
              </span>
              <Button variant="ghost" size="sm" onClick={handleDownloadPDF} title="Download PDF Report">
                <Download className="w-4 h-4 mr-1" />
                PDF
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
              <span className="font-medium ml-2">{getTestDisplayName(report?.testType || '')}</span>
            </div>
            <div>
              <span className="text-gray-500">Generated:</span>
              <span className="font-medium ml-2">{formatDate(report.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Science Behind the Test */}
      <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="medical-blue mr-2 h-5 w-5" />
            The Science Behind the Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Scientific Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="prose prose-sm max-w-none">
                  {report?.testType === 'lipid' && (
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Scientists know that heart disease is caused by particles in the blood called low-density lipoproteins, or LDL. 
                        But without the tools to measure these LDL particles directly, doctors have traditionally estimated their number 
                        by measuring the cholesterol they contain. This measure is known as LDL cholesterol, or LDL-C.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        While useful for some patients, knowing the amount of cholesterol in these particles is not as important as 
                        knowing the actual number of LDL particles. When high numbers of LDL particles are in the blood, they build 
                        up in the arteries and cause heart disease. So a higher number of LDL particles (LDL-P) indicates a higher 
                        risk of heart disease.
                      </p>
                    </div>
                  )}
                  {report?.testType === 'blood' && (
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Blood tests provide a comprehensive view of your health by measuring different components circulating in your bloodstream. 
                        These tests can detect infections, anemia, bleeding disorders, and other conditions.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Hemoglobin carries oxygen throughout your body, while white blood cells fight infections. Platelets help your blood clot, 
                        and glucose levels indicate how your body processes sugar. Each parameter provides crucial information about your overall health.
                      </p>
                    </div>
                  )}
                  {report?.testType === 'thyroid' && (
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Your thyroid gland produces hormones that control your metabolism, heart rate, and body temperature. 
                        TSH (Thyroid Stimulating Hormone) is produced by your pituitary gland to regulate thyroid function.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        When TSH levels are high, it usually means your thyroid is underactive (hypothyroidism). When TSH is low, 
                        your thyroid may be overactive (hyperthyroidism). T3 and T4 are the actual thyroid hormones that affect your metabolism.
                      </p>
                    </div>
                  )}
                  {report?.testType === 'liver' && (
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Your liver performs over 500 functions including filtering toxins, producing proteins, and storing energy. 
                        Liver function tests measure enzymes and proteins that indicate how well your liver is working.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        ALT and AST are enzymes released when liver cells are damaged. Bilirubin is a waste product that can build up 
                        if your liver isn't processing it properly. Albumin is a protein made by your liver that's essential for many body functions.
                      </p>
                    </div>
                  )}
                  {report?.testType === 'urine' && (
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Urine analysis provides insights into kidney function, metabolic disorders, and urinary tract health. 
                        Your kidneys filter waste products and excess water from your blood to create urine.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Protein in urine may indicate kidney damage, while glucose can suggest diabetes. Specific gravity measures 
                        urine concentration, and pH indicates acidity levels. These parameters help detect various health conditions early.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Visual Risk Diagram */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <h5 className="font-medium text-gray-900 mb-4">Risk Assessment Visualization</h5>
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    {/* Circular risk diagram */}
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200 bg-gradient-to-br from-green-100 via-yellow-100 to-red-100">
                      {/* Risk level indicator */}
                      <div className={`absolute inset-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        riskLevel === 'low' ? 'bg-[var(--medical-green)]' : 
                        riskLevel === 'medium' ? 'bg-[var(--medical-amber)]' : 
                        'bg-[var(--medical-red)]'
                      }`}>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {riskLevel === 'low' ? '✓' : riskLevel === 'medium' ? '!' : '⚠'}
                          </div>
                          <div className="text-xs">
                            {riskLevel.toUpperCase()}<br/>RISK
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Risk level labels */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-700">
                      Highest Risk
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-700">
                      Low Risk
                    </div>
                    <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 text-xs font-medium text-yellow-700 -rotate-90">
                      Medium Risk
                    </div>
                    <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 text-xs font-medium text-yellow-700 rotate-90">
                      Medium Risk
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--medical-green)]"></div>
                      <span>Normal values</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--medical-amber)]"></div>
                      <span>Borderline values</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--medical-red)]"></div>
                      <span>Abnormal values</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment Scale */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Your Risk Assessment</h4>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 rounded-lg border">
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${riskLevel === 'low' ? 'bg-[var(--medical-green)] ring-4 ring-green-200' : 'bg-[var(--medical-green)]'}`}>
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Low Risk</span>
                  <p className="text-xs text-gray-600 mt-1">All values normal</p>
                </div>
                <div className="w-0.5 h-12 bg-gray-300 mx-2"></div>
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${riskLevel === 'medium' ? 'bg-[var(--medical-amber)] ring-4 ring-yellow-200' : 'bg-[var(--medical-amber)]'}`}>
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-yellow-700">Medium Risk</span>
                  <p className="text-xs text-gray-600 mt-1">Some borderline values</p>
                </div>
                <div className="w-0.5 h-12 bg-gray-300 mx-2"></div>
                <div className="text-center flex-1">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${riskLevel === 'high' ? 'bg-[var(--medical-red)] ring-4 ring-red-200' : 'bg-[var(--medical-red)]'}`}>
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-red-700">High Risk</span>
                  <p className="text-xs text-gray-600 mt-1">Abnormal values detected</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Your Current Risk Level: </strong>
                  <span className={`font-semibold ${
                    riskLevel === 'low' ? 'text-green-700' : 
                    riskLevel === 'medium' ? 'text-yellow-700' : 
                    'text-red-700'
                  }`}>
                    {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Based on {report?.aiReport?.keyFindings?.length || 0} analyzed parameters from your {getTestDisplayName(report?.testType || '')} test.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Your Values with Test Summary */}
      <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="medical-blue mr-2 h-5 w-5" />
            Your Values with Test Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.aiReport?.summary && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Overall Summary</h4>
              <p className="text-gray-700 leading-relaxed">{report.aiReport.summary}</p>
            </div>
          )}
          
          {/* Test Parameters Table */}
          {report.parameters && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Result</th>
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
                        <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{value}</td>
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
          )}
        </CardContent>
      </Card>

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

      {/* Section 3: Treatment Considerations */}
      <Card className="bg-white shadow-sm border border-gray-200 report-section slide-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="medical-blue mr-2 h-5 w-5" />
            Treatment Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Clinical Recommendations */}
            {report.aiReport?.recommendations && report.aiReport.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Clinical Recommendations</h4>
                <div className="space-y-3">
                  {report.aiReport.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-md">
                      <span className="medical-blue mt-1 text-sm">→</span>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Options */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Treatment Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Lifestyle Modifications</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {report.aiReport?.treatmentOptions?.lifestyle ? 
                      report.aiReport.treatmentOptions.lifestyle.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      )) : (
                      <>
                        <li>• Dietary adjustments</li>
                        <li>• Regular exercise routine</li>
                        <li>• Stress management</li>
                        <li>• Sleep optimization</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Medical Interventions</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {report.aiReport?.treatmentOptions?.medical ? 
                      report.aiReport.treatmentOptions.medical.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      )) : (
                      <>
                        <li>• Regular monitoring</li>
                        <li>• Medication management</li>
                        <li>• Specialist consultation</li>
                        <li>• Follow-up testing</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Medications Section */}
              {report.aiReport?.treatmentOptions?.medications && report.aiReport.treatmentOptions.medications.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h5 className="font-medium text-purple-800 mb-2">💊 Common Medications</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {report.aiReport.treatmentOptions.medications.map((medication: string, index: number) => (
                      <li key={index}>• {medication}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-purple-600 mt-2">
                    *Medications should only be prescribed by qualified healthcare providers
                  </p>
                </div>
              )}
            </div>

            {/* Medication Information */}
            {riskLevel !== 'low' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">⚠️ Important Note</h5>
                <p className="text-sm text-yellow-700">
                  Treatment decisions should always be made in consultation with your healthcare provider. 
                  This report provides general information and should not replace professional medical advice.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



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