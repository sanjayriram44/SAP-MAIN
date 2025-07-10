import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ProductModules = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const productNames: { [key: string]: string } = {
    ariba: "SAP Ariba",
    s4hana: "SAP S/4HANA Public Cloud",
  };

  const aribaModules = {
    upstream: [
      {
        id: "sourcing",
        name: "Sourcing",
        description: "Facilitates the identification of suppliers and negotiation of terms",
      },
      {
        id: "contract",
        name: "Contract Management",
        description: "Manages creation, execution, and monitoring of contracts",
      },
      {
        id: "risk",
        name: "Supplier Risk",
        description: "Helps manage and mitigate risks associated with suppliers",
      },
      {
        id: "lifecycle",
        name: "Supplier Lifecycle and Performance",
        description: "Focuses on onboarding, qualifying, and evaluating suppliers",
      },
    ],
    downstream: [
      {
        id: "buying",
        name: "Buying and Invoicing",
        description: "Manages end-to-end procurement process from requisitioning to invoicing",
      },
      {
        id: "guided",
        name: "Guided Buying",
        description: "Provides intuitive interface for compliant purchases",
      },
      {
        id: "invoice",
        name: "Invoice Management",
        description: "Automates processing and management of supplier invoices",
      },
    ],
  };

  const handleModuleSelect = async (moduleId: string) => {
    try {
      await axios.post("http://localhost:8000/update_module", JSON.stringify(moduleId), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      navigate(`/product/${productId}/module/${moduleId}`);
    } catch (err) {
      console.error("Failed to update module:", err);
    }
  };

  if (productId !== "ariba") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {productNames[productId || ""] || "Unknown Product"}
                </h1>
                <p className="text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground text-lg">This product is coming soon!</p>
        </div>
      </div>
    );
  }

  const renderModuleCards = (modules: any[]) =>
    modules.map((module) => (
      <Card
        key={module.id}
        className="bg-card border shadow-sm hover:shadow-lg transition-all cursor-pointer group hover:scale-105"
      >
        <CardHeader>
          <CardTitle className="text-lg text-foreground font-medium">{module.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 text-muted-foreground leading-relaxed">
            {module.description}
          </CardDescription>
          <Button
            onClick={() => handleModuleSelect(module.id)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Select
          </Button>
        </CardContent>
      </Card>
    ));

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Package className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">SAP Ariba - Select Module</h1>
              <p className="text-muted-foreground">Choose a module to work with</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Upstream Process</h2>
          <p className="text-muted-foreground mb-6">Strategic sourcing and supplier management activities</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderModuleCards(aribaModules.upstream)}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Downstream Process</h2>
          <p className="text-muted-foreground mb-6">Transactional procurement activities</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderModuleCards(aribaModules.downstream)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModules;
