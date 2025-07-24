import { patients, testResults, type Patient, type InsertPatient, type TestResult, type InsertTestResult } from "@shared/schema";

export interface IStorage {
  getPatient(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  getTestResults(patientId: string): Promise<TestResult[]>;
  updateTestResultWithReport(id: number, aiReport: any): Promise<TestResult | undefined>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient>;
  private testResults: Map<number, TestResult>;
  private currentPatientId: number;
  private currentTestResultId: number;

  constructor() {
    this.patients = new Map();
    this.testResults = new Map();
    this.currentPatientId = 1;
    this.currentTestResultId = 1;
  }

  async getPatient(patientId: string): Promise<Patient | undefined> {
    return this.patients.get(patientId);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = { 
      ...insertPatient, 
      id,
      createdAt: new Date()
    };
    this.patients.set(insertPatient.patientId, patient);
    return patient;
  }

  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = this.currentTestResultId++;
    const testResult: TestResult = { 
      ...insertTestResult, 
      id,
      createdAt: new Date(),
      aiReport: null
    };
    this.testResults.set(id, testResult);
    return testResult;
  }

  async getTestResults(patientId: string): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      (result) => result.patientId === patientId
    );
  }

  async updateTestResultWithReport(id: number, aiReport: any): Promise<TestResult | undefined> {
    const testResult = this.testResults.get(id);
    if (testResult) {
      const updated = { ...testResult, aiReport };
      this.testResults.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
