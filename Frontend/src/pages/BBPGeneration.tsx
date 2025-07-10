
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, CheckCircle, Settings, Upload, Brain } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const BBPGeneration = () => {
  const navigate = useNavigate();
  const { productId, moduleId } = useParams();

  const moduleNames: { [key: string]: string } = {
    sourcing: "SAP Ariba Sourcing",
    contract: "SAP Ariba Contract Management",
    risk: "SAP Ariba Supplier Risk",
    lifecycle: "SAP Ariba Supplier Lifecycle and Performance",
    buying: "SAP Ariba Buying and Invoicing",
    guided: "SAP Ariba Guided Buying",
    invoice: "SAP Ariba Invoice Management"
  };

  const journeyOptions = [
    {
      id: "llm-interview",
      name: "LLM-Based Discovery Workshop",
      description: "Interactive questionnaire that adapts based on your responses and facilitates discovery workshops with customers",
      estimatedTime: "30-45 minutes",
      icon: "Settings",
      benefits: ["Adaptive questions", "Context-aware flow", "Workshop facilitation"]
    },
    {
      id: "document-upload",
      name: "Upload Existing Questionnaire",
      description: "Skip the questionnaire by uploading your completed discovery document and generate blueprint directly",
      estimatedTime: "5-10 minutes", 
      icon: "Upload",
      benefits: ["Quick setup", "Direct generation", "Document parsing"]
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Low": return "bg-green-900 text-green-300 border-green-700";
      case "Medium": return "bg-yellow-900 text-yellow-300 border-yellow-700";
      case "High": return "bg-red-900 text-red-300 border-red-700";
      default: return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Essential": return "bg-blue-900 text-blue-300 border-blue-700";
      case "Complete": return "bg-purple-900 text-purple-300 border-purple-700";
      case "Advanced": return "bg-orange-900 text-orange-300 border-orange-700";
      case "Migration": return "bg-teal-900 text-teal-300 border-teal-700";
      default: return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  const handleJourneySelect = (journeyId: string) => {
    if (journeyId === "llm-interview") {
      navigate(`/product/${productId}/module/${moduleId}/generation/bbp/interview`);
    } else if (journeyId === "document-upload") {
      navigate(`/product/${productId}/module/${moduleId}/generation/bbp/upload`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate(`/product/${productId}/module/${moduleId}`)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {moduleNames[moduleId || ''] || 'Unknown Module'} - BBP Generation
              </h1>
              <p className="text-muted-foreground">Select a questionnaire template to begin BBP generation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Choose Your BBP Generation Journey</h2>
          <p className="text-muted-foreground text-lg">
            Select the approach that best fits your current situation and requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {journeyOptions.map((journey) => (
            <Card key={journey.id} className="bg-card border shadow-sm hover:shadow-lg transition-all group hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {journey.icon === "Settings" ? (
                      <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/15 transition-colors">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                    ) : (
                      <div className="bg-success/10 p-3 rounded-xl group-hover:bg-success/15 transition-colors">
                        <Upload className="h-8 w-8 text-success" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg mb-2 text-foreground font-medium">{journey.name}</CardTitle>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {journey.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Estimated time: {journey.estimatedTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {journey.benefits.map((benefit) => (
                      <Badge key={benefit} className="bg-primary/10 text-primary border-primary/20">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => handleJourneySelect(journey.id)} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {journey.id === "llm-interview" ? "Start Discovery Interview" : "Upload Document"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground font-medium">Steps to generate Business Blueprint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-xl inline-block mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-2">1. Fill Questionnaire</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Answer structured questions about your business processes and requirements
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-xl inline-block mb-4">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-2">2. Visualize Business Flow</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI maps your answers to BBP blocks and generates structured content
                </p>
              </div>
              <div className="text-center">
                <div className="bg-success/10 p-4 rounded-xl inline-block mb-4">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h4 className="font-medium text-foreground mb-2">3. Review & Export</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Review the generated BBP document and export in your preferred format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BBPGeneration;
