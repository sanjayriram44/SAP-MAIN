import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building, ChevronRight } from "lucide-react";

import { contextDimensions } from "@/data/customer-context-data";

const CustomerContext = () => {
  const navigate = useNavigate();
  const { productId, moduleId } = useParams();

  const [contextData, setContextData] = useState<Record<string, string>>({});

  const moduleNames: Record<string, string> = {
    sourcing: "SAP Ariba Sourcing",
    contract: "SAP Ariba Contract Management",
    risk: "SAP Ariba Supplier Risk",
    lifecycle: "SAP Ariba Supplier Lifecycle and Performance",
    buying: "SAP Ariba Buying and Invoicing",
    guided: "SAP Ariba Guided Buying",
    invoice: "SAP Ariba Invoice Management",
  };

  const formatKey = (label: string) =>
    label.toLowerCase().replace(/[^a-z0-9]/gi, "_");

  const handleSelection = (groupLabel: string, option: string) => {
    const key = formatKey(groupLabel);
    setContextData(prev => ({ ...prev, [key]: option }));
  };

  const isFormComplete = () => {
    return contextDimensions.every(dimension =>
      dimension.groups.every(group => {
        const key = formatKey(group.label);
        return contextData[key];
      })
    );
  };

  const handleContinue = async () => {
    try {
      console.log("Sending context:", contextData);

      await axios.post("http://localhost:8000/update_customer_context", {
        context: contextData,
      });

      sessionStorage.setItem("customerContext", JSON.stringify(contextData));

      navigate(`/product/${productId}/module/${moduleId}/generation/bbp`);
    } catch (err) {
      console.error("Failed to send context data:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => navigate(`/product/${productId}/module/${moduleId}`)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Building className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Customer Context Capture
            </h1>
            <p className="text-muted-foreground">
              {moduleNames[moduleId || ""] || "Unknown Module"} – Help us understand your business context
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Tell us about your business context
          </h2>
          <p className="text-muted-foreground text-lg">
            Select one option per group to describe your organization.
          </p>
        </div>

        <div className="space-y-10">
          {contextDimensions.map((dimension, index) => (
            <Card key={dimension.id} className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  {dimension.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {dimension.groups.map((group, groupIdx) => {
                  const key = formatKey(group.label);
                  const selected = contextData[key];

                  return (
                    <div key={groupIdx}>
                      <Label className="block mb-2 text-muted-foreground font-medium">
                        {group.label}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt, optIdx) => (
                          <Button
                            key={optIdx}
                            variant={selected === opt ? "default" : "outline"}
                            onClick={() => handleSelection(group.label, opt)}
                            className="text-sm"
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!isFormComplete()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            Continue to BBP Generation
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerContext;
