import { useState } from "react";
import { Heart, User, Activity } from "lucide-react";
import TestInputForm from "../components/test-input-form";
import ReportDisplay from "../components/report-display";

export default function Dashboard() {
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleReportGenerated = (report: any) => {
    setGeneratedReport(report);
  };

  const handleGenerationStart = () => {
    setIsGenerating(true);
    setGeneratedReport(null);
  };

  const handleGenerationEnd = () => {
    setIsGenerating(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Heart className="medical-blue text-2xl mr-3" />
                <span className="text-xl font-bold text-gray-900">MediReport AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="mr-2 h-4 w-4" />
                <span>Dr. Sarah Johnson</span>
                <span className="ml-2 px-2 py-1 bg-medical-green text-white text-xs rounded-full">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>Dashboard</span>
            <span className="mx-2">›</span>
            <span className="medical-blue">Test Analysis</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Test Analysis</h1>
          <p className="text-gray-600 mt-2">Generate AI-powered reports from patient test results using Ollama LLaMA 3.2</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Input Form */}
          <div className="lg:col-span-1">
            <TestInputForm 
              onReportGenerated={handleReportGenerated}
              onGenerationStart={handleGenerationStart}
              onGenerationEnd={handleGenerationEnd}
            />
          </div>

          {/* Report Display */}
          <div className="lg:col-span-2">
            <ReportDisplay 
              report={generatedReport}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                <Activity className="w-4 h-4 mr-2 inline" />
                Save Report
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                Print
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setGeneratedReport(null)}
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
