import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, CheckCircle, Upload, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

const QuestionnaireTemplates = () => {
  const navigate = useNavigate();
  const { productId, moduleId, templateId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const moduleNames: { [key: string]: string } = {
    sourcing: "SAP Ariba Sourcing",
    contract: "SAP Ariba Contract Management",
    risk: "SAP Ariba Supplier Risk",
    lifecycle: "SAP Ariba Supplier Lifecycle and Performance",
    buying: "SAP Ariba Buying and Invoicing",
    guided: "SAP Ariba Guided Buying",
    invoice: "SAP Ariba Invoice Management"
  };

  const templateNames: { [key: string]: string } = {
    standard: "Standard Implementation",
    "quick-start": "Quick Start Template",
    enterprise: "Enterprise Implementation",
    migration: "System Migration"
  };

  const questions = [
    {
      id: "process_areas",
      title: "What process areas are in scope for your implementation?",
      type: "radio",
      options: [
        "Only RFQ will be used",
        "RFI and RFQ",
        "RFI, RFQ, and Auctions",
        "Full sourcing suite including negotiations"
      ]
    },
    {
      id: "templates_required",
      title: "Do you require different templates for different categories or business units?",
      type: "radio",
      options: [
        "Single template will be used for all the categories",
        "Different templates per category",
        "Different templates per business unit",
        "Combination of category and business unit templates"
      ]
    },
    {
      id: "default_settings",
      title: "What default settings should be applied in each template (e.g., bidding rules, timing)?",
      type: "textarea",
      placeholder: "Describe the default settings..."
    },
    {
      id: "sourcing_phases",
      title: "What phases should each sourcing event include (e.g., preparation, bidding, evaluation)?",
      type: "multiselect",
      options: [
        "Preparation",
        "Bidding",
        "Evaluation",
        "Negotiation",
        "Award"
      ]
    },
    {
      id: "predefined_tasks",
      title: "Do you need predefined tasks or milestones in sourcing projects?",
      type: "radio",
      options: [
        "Yes, detailed project templates",
        "Yes, basic milestones only",
        "No",
        "Custom requirements per project"
      ]
    },
    {
      id: "custom_fields",
      title: "What custom fields are needed for supplier responses?",
      type: "textarea",
      placeholder: "Describe any custom fields required..."
    },
    {
      id: "mandatory_fields",
      title: "Should any fields be mandatory or conditional?",
      type: "radio",
      options: [
        "All fields should be mandatory",
        "Some fields mandatory, some optional",
        "Conditional fields based on responses",
        "All fields optional"
      ]
    },
    {
      id: "scoring_weighting",
      title: "Do you need scoring or weighting for specific questions?",
      type: "radio",
      options: [
        "Yes, detailed scoring matrix",
        "Yes, simple weighting",
        "No",
        "Custom per event type"
      ]
    },
    {
      id: "approval_steps",
      title: "What approval steps are required before publishing an event?",
      type: "textarea",
      placeholder: "Describe the approval workflow..."
    },
    {
      id: "notifications",
      title: "Who should be notified at each stage of the event?",
      type: "textarea",
      placeholder: "Describe notification requirements..."
    },
    {
      id: "escalation_paths",
      title: "Are there escalation paths for delayed approvals?",
      type: "radio",
      options: [
        "Yes, automatic escalation",
        "Yes, manual escalation",
        "No",
        "Custom escalation rules"
      ]
    },
    {
      id: "user_roles",
      title: "What roles exist in your organization?",
      type: "textarea",
      placeholder: "Describe the roles and their responsibilities..."
    },
    {
      id: "role_permissions",
      title: "What permissions should each role have?",
      type: "textarea",
      placeholder: "Describe permissions for each role..."
    },
    {
      id: "geographic_restrictions",
      title: "Are there any restrictions based on business unit or geography?",
      type: "textarea",
      placeholder: "Describe any restrictions..."
    },
    {
      id: "erp_integration",
      title: "What ERP systems need to be integrated?",
      type: "multiselect",
      options: [
        "SAP S/4HANA",
        "SAP ECC",
        "Oracle ERP",
        "Microsoft Dynamics",
        "Other ERP systems"
      ]
    },
    {
      id: "data_sync",
      title: "What data should be synced between systems?",
      type: "multiselect",
      options: [
        "Supplier master",
        "Material master",
        "Purchase orders",
        "Contracts",
        "Financial data"
      ]
    },
    {
      id: "custom_apis",
      title: "Are there custom APIs or middleware involved?",
      type: "radio",
      options: [
        "Yes, custom APIs required",
        "Yes, middleware required",
        "No",
        "Standard integration only"
      ]
    },
    {
      id: "standard_reports",
      title: "What standard reports are needed?",
      type: "textarea",
      placeholder: "Describe reporting requirements..."
    },
    {
      id: "custom_dashboards",
      title: "Do you need custom dashboards?",
      type: "radio",
      options: [
        "Yes, executive dashboards",
        "Yes, operational dashboards",
        "No",
        "Standard dashboards only"
      ]
    },
    {
      id: "languages_currencies",
      title: "What languages and currencies must be supported?",
      type: "textarea",
      placeholder: "Specify languages and currencies..."
    },
    {
      id: "compliance_requirements",
      title: "Do you need audit trails for regulatory compliance?",
      type: "radio",
      options: [
        "Yes, full audit trails",
        "Yes, basic compliance",
        "No",
        "Industry-specific requirements"
      ]
    },
    {
      id: "training_materials",
      title: "What training materials are needed for users?",
      type: "textarea",
      placeholder: "Describe training requirements..."
    },
    {
      id: "sandbox_environment",
      title: "Do you need sandbox environments for testing?",
      type: "textarea",
      placeholder: "Describe testing environment needs..."
    },
    {
      id: "organization_details",
      title: "Provide your organization details",
      type: "textarea",
      placeholder: "Organization name, industry, project goals, geographies, stakeholders..."
    },
    {
      id: "as_is_process",
      title: "Describe your current As-Is process",
      type: "textarea",
      placeholder: "Detail your current procurement process..."
    },
    {
      id: "to_be_process",
      title: "Describe your desired To-Be process",
      type: "textarea",
      placeholder: "Detail your target future process..."
    }
  ];

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    // Navigate to blueprint generation page
    navigate(`/product/${productId}/module/${moduleId}/generation/bbp/questionnaire/${templateId}/blueprint`);
  };

  const handleTryWithoutData = () => {
    // Pre-fill with the provided sample data
    const sampleAnswers = {
      process_areas: "Only RFQ will be used",
      templates_required: "Single template will be used for all the categories",
      default_settings: "System default settings should be applied for all the templates",
      sourcing_phases: ["Evaluation"],
      predefined_tasks: "No",
      custom_fields: "No custom fields required",
      mandatory_fields: "All fields should be mandatory",
      scoring_weighting: "No",
      approval_steps: "No approval required before publishing an event",
      notifications: "Event owner should be notified at every stage of the event",
      escalation_paths: "No",
      user_roles: "Sourcing Manager and Reviewer",
      role_permissions: "Sourcing manager can create, edit and Reviewer can approve",
      geographic_restrictions: "No",
      erp_integration: ["SAP S/4HANA"],
      data_sync: ["Supplier master", "Material master"],
      custom_apis: "No",
      standard_reports: "All the standard reports available in the system",
      custom_dashboards: "No",
      languages_currencies: "Language will be English. Currencies will be INR and USD.",
      compliance_requirements: "Yes, full audit trails",
      training_materials: "Step by Step guide user manuals in PDF format",
      sandbox_environment: "Ariba Test realm is available post Go live.",
      organization_details: `Client/Organization Name: XYZ company
Industry Domain: Manufacturing
Project Goal/Objectives: Procurement Automation
Geographies Involved: India
Project Stakeholders: Mr. ABC
Master Data Source: supplier master, material master
Integration Tools: CIG`,
      as_is_process: "Currently Creating Purchase requisitions in SAP S/4HANA and negotiations with suppliers are happening over the emails and phone. Later Purchase orders creation is happening in S/4HANA.",
      to_be_process: `After the Purchase Requisition (PR) is generated in SAP S/4HANA, it will be automatically converted into a Request for Quotation (RFQ) within S/4HANA and seamlessly pushed to the SAP Ariba system via integration.

In Ariba, the assigned buyer can initiate the appropriate sourcing event—RFI, RFQ, or auction—based on the business requirement. The RFQ will then be floated to relevant suppliers through Ariba.

Upon receiving supplier quotations, the system will automatically generate a comparative analysis of the responses. This facilitates the vendor evaluation and selection process for awarding the purchase order (PO).

Once a vendor is selected, an auto-generated PO will be triggered from Ariba, and the corresponding Purchase Order will be created in SAP S/4HANA through the integrated workflow.

Approval Workflow: Project owner will approve the RFQ before publishing.`
    };
    setAnswers(sampleAnswers);
    navigate(`/product/${productId}/module/${moduleId}/generation/bbp/questionnaire/${templateId}/blueprint`);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate(`/product/${productId}/module/${moduleId}/generation/bbp`)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                {moduleNames[moduleId || ''] || 'Unknown Module'}
              </h1>
              <p className="text-gray-300">{templateNames[templateId || ''] || 'Questionnaire'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Question {currentStep + 1} of {questions.length}</span>
            <span className="text-sm text-gray-300">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* File Upload Option */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Existing Questionnaire
            </CardTitle>
            <CardDescription className="text-gray-300">
              Have a completed questionnaire document? Upload it to skip the form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".docx,.doc,.pdf"
                onChange={handleFileUpload}
                className="bg-gray-700 border-gray-600 text-white"
              />
              {uploadedFile && (
                <Badge className="bg-green-900 text-green-300">
                  {uploadedFile.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {currentQuestion.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "multiselect" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={(answers[currentQuestion.id] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = answers[currentQuestion.id] || [];
                        if (checked) {
                          handleAnswerChange(currentQuestion.id, [...currentAnswers, option]);
                        } else {
                          handleAnswerChange(currentQuestion.id, currentAnswers.filter((a: string) => a !== option));
                        }
                      }}
                    />
                    <Label htmlFor={option} className="text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="min-h-[120px] bg-gray-700 border-gray-600 text-white"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-gray-600 text-gray-300"
          >
            Previous
          </Button>

          <Button
            variant="ghost"
            onClick={handleTryWithoutData}
            className="text-blue-400 hover:text-blue-300"
          >
            Try without data
          </Button>

          {currentStep < questions.length - 1 ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Next
            </Button>
          ) : (
            <Button onClick={handleGenerate} className="bg-green-600 hover:bg-green-700">
              Generate Blueprint
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireTemplates;
