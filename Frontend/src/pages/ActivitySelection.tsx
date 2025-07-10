import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Settings, Zap, Bot } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ActivitySelection = () => {
  const navigate = useNavigate();
  const { productId, moduleId } = useParams();

  const moduleNames: { [key: string]: string } = {
    sourcing: "SAP Ariba Sourcing",
    contract: "SAP Ariba Contract Management",
    risk: "SAP Ariba Supplier Risk",
    lifecycle: "SAP Ariba Supplier Lifecycle and Performance",
    buying: "SAP Ariba Buying and Invoicing",
    guided: "SAP Ariba Guided Buying",
    invoice: "SAP Ariba Invoice Management",
  };

  const generationActivities = [
    {
      id: "bbp",
      title: "BBP Generation",
      description: "Generate Business Blueprint documents automatically",
      icon: FileText,
      buttonText: "Generate BBP",
    },
    {
      id: "test-scripts",
      title: "Test Script Generation",
      description: "Create comprehensive test scripts for validation",
      icon: Settings,
      buttonText: "Generate Test Script",
    },
    {
      id: "training",
      title: "Training Documents",
      description: "Generate user training materials and guides",
      icon: FileText,
      buttonText: "Generate Training",
    },
    {
      id: "config",
      title: "Configuration Document",
      description: "Create detailed configuration documentation",
      icon: Settings,
      buttonText: "Generate Configuration",
    },
    {
      id: "fs-ts",
      title: "FS & TS Documents",
      description: "Generate Functional and Technical Specifications",
      icon: FileText,
      buttonText: "Generate FS & TS",
    },
  ];

  const automationActivities = [
    {
      id: "config-mgmt",
      title: "Config Management",
      description: "Enable automated configuration management",
      icon: Settings,
      buttonText: "Access Config Management",
    },
    {
      id: "code-gen",
      title: "On-demand Code Generation",
      description: "Generate code components on demand",
      icon: Zap,
      buttonText: "Generate Code",
    },
  ];

  const handleActivityClick = async (activityType: string, activityId: string) => {
    try {
      await axios.post("http://localhost:8000/update_activity", JSON.stringify(activityId), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const route =
        activityType === "generation" && activityId === "bbp"
          ? `/product/${productId}/module/${moduleId}/generation/bbp/context`
          : `/product/${productId}/module/${moduleId}/${activityType}/${activityId}`;

      navigate(route);
    } catch (err) {
      console.error("Failed to update activity:", err);
    }
  };

  const renderActivityCards = (activities: any[], type: string) =>
    activities.map((activity) => {
      const Icon = activity.icon;
      return (
        <Card
          key={activity.id}
          className="bg-card border shadow-sm hover:shadow-lg transition-all cursor-pointer group hover:scale-105"
        >
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/15 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground font-medium">{activity.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6 text-muted-foreground leading-relaxed">
              {activity.description}
            </CardDescription>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleActivityClick(type, activity.id)}
            >
              {activity.buttonText}
            </Button>
          </CardContent>
        </Card>
      );
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate(`/product/${productId}`)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {moduleNames[moduleId || ""] || "Unknown Module"}
              </h1>
              <p className="text-muted-foreground">Select an activity type</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Generation of Artefacts</h2>
          <p className="text-muted-foreground text-lg">
            AI-powered document and artifact generation tools
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderActivityCards(generationActivities, "generation")}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Automation of Activities</h2>
          <p className="text-muted-foreground text-lg">
            Streamline and automate your implementation processes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderActivityCards(automationActivities, "automation")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySelection;
