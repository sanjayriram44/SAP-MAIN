
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package } from "lucide-react";
import axios from 'axios';

const Index = () => {
  const navigate = useNavigate();

  const sapProducts = [
    {
      id: "ariba",
      name: "SAP Ariba",
      description: "Procurement and sourcing solutions",
      status: "Available" 
    },
    {
      id: "s4hana",
      name: "SAP S/4HANA Public Cloud",
      description: "Enterprise resource planning suite",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">AI Studio</h1>
              <p className="text-muted-foreground text-lg">SAP Practice Implementation Accelerator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">SAP Product Solutions</h2>
          <p className="text-muted-foreground text-lg">Choose the SAP product you want to work with</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {sapProducts.map((product) => (
            <Card 
              key={product.id} 
              className={`bg-card border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group ${product.status === 'Coming Soon' ? 'opacity-60' : 'hover:scale-105'}`}
              onClick={async () => {
                if (product.status === 'Available') {
                  try {
                    await axios.post('http://localhost:8000/update_sap_product', JSON.stringify(product.name), {
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });
                    navigate(`/product/${product.id}`);
                  } catch (err) {
                    console.error("Failed to update SAP product:", err);
                  }
                }
              }}
              
              
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/15 transition-colors">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground font-medium">{product.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-6 text-muted-foreground text-base leading-relaxed">
                  {product.description}
                </CardDescription>
                {product.status === 'Available' ? (
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    Select Product
                  </Button>
                ) : (
                  <Button disabled className="w-full bg-muted text-muted-foreground">
                    {product.status}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
