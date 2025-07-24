export interface TestParameter {
  name: string;
  unit: string;
  normalRange: string;
  type: 'number' | 'text';
  step?: number;
}

export interface TestConfig {
  [key: string]: TestParameter[];
}

export const testConfigs: TestConfig = {
  blood: [
    { name: 'Hemoglobin', unit: 'g/dL', normalRange: '12.0-16.0', type: 'number', step: 0.1 },
    { name: 'White Blood Cells', unit: '×10³/μL', normalRange: '4.0-11.0', type: 'number', step: 0.1 },
    { name: 'Platelets', unit: '×10³/μL', normalRange: '150-450', type: 'number' },
    { name: 'Glucose', unit: 'mg/dL', normalRange: '70-100', type: 'number' },
    { name: 'Hematocrit', unit: '%', normalRange: '36-46', type: 'number', step: 0.1 }
  ],
  urine: [
    { name: 'Protein', unit: 'mg/dL', normalRange: '0-8', type: 'number', step: 0.1 },
    { name: 'Glucose', unit: 'mg/dL', normalRange: '0', type: 'number' },
    { name: 'Specific Gravity', unit: '', normalRange: '1.003-1.030', type: 'number', step: 0.001 },
    { name: 'pH', unit: '', normalRange: '4.6-8.0', type: 'number', step: 0.1 },
    { name: 'Ketones', unit: 'mg/dL', normalRange: 'Negative', type: 'number' }
  ],
  lipid: [
    { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '<200', type: 'number' },
    { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '>40 (M), >50 (F)', type: 'number' },
    { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '<100', type: 'number' },
    { name: 'Triglycerides', unit: 'mg/dL', normalRange: '<150', type: 'number' },
    { name: 'Non-HDL Cholesterol', unit: 'mg/dL', normalRange: '<130', type: 'number' }
  ],
  thyroid: [
    { name: 'TSH', unit: 'mIU/L', normalRange: '0.4-4.0', type: 'number', step: 0.01 },
    { name: 'Free T4', unit: 'ng/dL', normalRange: '0.8-1.8', type: 'number', step: 0.01 },
    { name: 'Free T3', unit: 'pg/mL', normalRange: '2.3-4.2', type: 'number', step: 0.01 },
    { name: 'T4 Total', unit: 'μg/dL', normalRange: '4.5-12.0', type: 'number', step: 0.1 }
  ],
  liver: [
    { name: 'ALT', unit: 'U/L', normalRange: '7-56', type: 'number' },
    { name: 'AST', unit: 'U/L', normalRange: '10-40', type: 'number' },
    { name: 'Bilirubin Total', unit: 'mg/dL', normalRange: '0.2-1.2', type: 'number', step: 0.1 },
    { name: 'Alkaline Phosphatase', unit: 'U/L', normalRange: '44-147', type: 'number' },
    { name: 'Albumin', unit: 'g/dL', normalRange: '3.5-5.0', type: 'number', step: 0.1 }
  ]
};

export const testTypeOptions = [
  { value: 'blood', label: 'Blood Panel' },
  { value: 'urine', label: 'Urine Analysis' },
  { value: 'lipid', label: 'Lipid Profile' },
  { value: 'thyroid', label: 'Thyroid Function' },
  { value: 'liver', label: 'Liver Function' }
];
