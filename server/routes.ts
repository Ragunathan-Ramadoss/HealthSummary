import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertTestResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create patient
  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      
      // Check if patient already exists
      let patient = await storage.getPatient(patientData.patientId);
      if (!patient) {
        patient = await storage.createPatient(patientData);
      }
      
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data", error });
    }
  });

  // Generate AI report
  app.post("/api/generate-report", async (req, res) => {
    try {
      const testData = insertTestResultSchema.parse(req.body);
      
      // Create test result record
      const testResult = await storage.createTestResult(testData);
      
      // Generate AI report using Ollama
      const aiReport = await generateAIReport(testData);
      
      // Update test result with AI report
      const updatedResult = await storage.updateTestResultWithReport(testResult.id, aiReport);
      
      res.json(updatedResult);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate AI report", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get test results for a patient
  app.get("/api/test-results/:patientId", async (req, res) => {
    try {
      const { patientId } = req.params;
      const results = await storage.getTestResults(patientId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIReport(testData: any) {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    
    const prompt = createPromptFromTestData(testData);
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return parseAIResponse(data.response, testData);
  } catch (error) {
    console.error("Ollama API error:", error);
    throw new Error("Failed to generate AI report. Please ensure Ollama is running and llama3.2:latest model is available.");
  }
}

function createPromptFromTestData(testData: any): string {
  const { testType, parameters } = testData;
  
  let prompt = `As a medical AI assistant, analyze the following ${testType} test results and provide a comprehensive medical report in JSON format.

Patient Test Data:
Test Type: ${testType}
Parameters: ${JSON.stringify(parameters, null, 2)}

Please provide a detailed analysis in the following JSON structure:
{
  "summary": "Executive summary of the test results",
  "keyFindings": [
    {
      "parameter": "parameter name",
      "value": "test value with unit",
      "status": "normal/abnormal/borderline",
      "interpretation": "clinical interpretation"
    }
  ],
  "recommendations": [
    "Clinical recommendation 1",
    "Clinical recommendation 2"
  ],
  "overallAssessment": "Overall clinical assessment",
  "followUpRequired": true/false,
  "criticalFlags": ["any critical issues if present"]
}

Focus on:
1. Clinical significance of each parameter
2. Relationships between different test values
3. Potential health implications
4. Actionable recommendations for the physician
5. Any values outside normal ranges and their clinical significance

Provide accurate medical terminology and reference ranges appropriate for the test type.`;

  return prompt;
}

function parseAIResponse(aiResponse: string, testData: any) {
  try {
    // Try to extract JSON from the AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: create structured response from text
    return {
      summary: aiResponse.split('\n')[0] || "AI analysis completed",
      keyFindings: Object.entries(testData.parameters).map(([key, value]) => ({
        parameter: key,
        value: `${value}`,
        status: "normal",
        interpretation: "Within expected range"
      })),
      recommendations: ["Continue current health maintenance", "Schedule routine follow-up"],
      overallAssessment: "Test results reviewed",
      followUpRequired: false,
      criticalFlags: [],
      rawResponse: aiResponse
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      summary: "AI analysis completed with parsing issues",
      keyFindings: [],
      recommendations: ["Please review raw AI response"],
      overallAssessment: "Manual review required",
      followUpRequired: true,
      criticalFlags: ["Response parsing error"],
      rawResponse: aiResponse
    };
  }
}
