import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Brain, FlaskConical, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { testConfigs, testTypeOptions } from "@/lib/test-configs";

const formSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  age: z.number().min(1, "Age must be greater than 0").max(150, "Age must be less than 150"),
  gender: z.enum(["male", "female", "other"]),
  testType: z.string().min(1, "Test type is required"),
  parameters: z.record(z.string(), z.any())
});

type FormData = z.infer<typeof formSchema>;

interface TestInputFormProps {
  onReportGenerated: (report: any) => void;
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
}

export default function TestInputForm({ onReportGenerated, onGenerationStart, onGenerationEnd }: TestInputFormProps) {
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [testParameters, setTestParameters] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      age: 0,
      gender: "male",
      testType: "",
      parameters: {}
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // First create/get patient
      const patientResponse = await apiRequest("POST", "/api/patients", {
        patientId: data.patientId,
        name: data.patientName,
        age: data.age,
        gender: data.gender
      });

      // Then generate report
      const reportResponse = await apiRequest("POST", "/api/generate-report", {
        patientId: data.patientId,
        testType: data.testType,
        parameters: data.parameters
      });

      return reportResponse.json();
    },
    onSuccess: (data) => {
      onReportGenerated(data);
      onGenerationEnd();
      toast({
        title: "Report Generated",
        description: "AI report has been successfully generated.",
      });
    },
    onError: (error: any) => {
      onGenerationEnd();
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate AI report. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (selectedTestType && testConfigs[selectedTestType]) {
      const defaultParams: Record<string, any> = {};
      testConfigs[selectedTestType].forEach(param => {
        defaultParams[param.name] = "";
      });
      setTestParameters(defaultParams);
      form.setValue("parameters", defaultParams);
    }
  }, [selectedTestType, form]);

  const handleTestTypeChange = (value: string) => {
    setSelectedTestType(value);
    form.setValue("testType", value);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    const newParams = { ...testParameters, [paramName]: value };
    setTestParameters(newParams);
    form.setValue("parameters", newParams);
  };

  const onSubmit = (data: FormData) => {
    onGenerationStart();
    generateReportMutation.mutate(data);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FlaskConical className="medical-blue text-lg mr-3" />
          Test Data Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Patient Information
              </h3>
              <div className="space-y-4">
                <FormField>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register("patientId")}
                      placeholder="Enter patient ID"
                      className="focus:ring-[var(--medical-blue)] focus:border-[var(--medical-blue)]"
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.patientId?.message}</FormMessage>
                </FormField>

                <FormField>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register("patientName")}
                      placeholder="Enter patient name"
                      className="focus:ring-[var(--medical-blue)] focus:border-[var(--medical-blue)]"
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.patientName?.message}</FormMessage>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...form.register("age", { valueAsNumber: true })}
                        placeholder="Age"
                        className="focus:ring-[var(--medical-blue)] focus:border-[var(--medical-blue)]"
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.age?.message}</FormMessage>
                  </FormField>

                  <FormField>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => form.setValue("gender", value as "male" | "female" | "other")}>
                        <SelectTrigger className="focus:ring-[var(--medical-blue)] focus:border-[var(--medical-blue)]">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage>{form.formState.errors.gender?.message}</FormMessage>
                  </FormField>
                </div>
              </div>
            </div>

            {/* Test Type Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Test Type</h3>
              <Select onValueChange={handleTestTypeChange}>
                <SelectTrigger className="focus:ring-[var(--medical-blue)] focus:border-[var(--medical-blue)]">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {testTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage>{form.formState.errors.testType?.message}</FormMessage>
            </div>

            {/* Dynamic Test Parameters */}
            {selectedTestType && testConfigs[selectedTestType] && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Test Parameters</h3>
                <div className="space-y-3">
                  {testConfigs[selectedTestType].map((param) => (
                    <div key={param.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{param.name}</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step={param.step || 1}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-[var(--medical-blue)] focus:border-[var(--medical-blue)]"
                          value={testParameters[param.name] || ""}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500">{param.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Report Button */}
            <Button
              type="submit"
              className="w-full bg-[var(--medical-blue)] text-white py-3 px-4 rounded-md hover:bg-[var(--medical-deep)] transition-colors font-medium"
              disabled={generateReportMutation.isPending}
            >
              <Brain className="mr-2 h-4 w-4" />
              {generateReportMutation.isPending ? "Generating..." : "Generate AI Report"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
