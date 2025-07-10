import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Bot, MessageCircle, Send } from "lucide-react";

const BlueprintGeneration = () => {
  const navigate = useNavigate();
  const { productId, moduleId, templateId } = useParams();

  const [bbpDocText, setBbpDocText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchBBP = async () => {
      try {
        console.log("📡 Fetching BBP from backend...");
        const response = await axios.get("http://localhost:8000/get_bbp_document");
        console.log("✅ BBP content:", response.data.content?.slice(0, 300));
        setBbpDocText(response.data.content);
      } catch (err) {
        console.error("❌ Error fetching BBP document:", err);
        setBbpDocText("Error loading document.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBBP();
  }, []);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsRegenerating(true);

    setTimeout(() => {
      const aiMessage = `I've noted your request: "${userMessage}". This feature is under construction.`;
      setChatMessages((prev) => [...prev, { role: "assistant", content: aiMessage }]);
      setIsRegenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => navigate(`/product/${productId}/module/${moduleId}/generation/bbp/questionnaire/${templateId}`)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Generated Business Blueprint</h1>
            <p className="text-muted-foreground">Full content loaded from BBP document</p>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: BBP Document */}
        <div className="lg:col-span-2">
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-foreground font-medium">SAP Ariba BBP Document</CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatically generated from uploaded input
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[75vh] overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading document...</p>
              ) : (
                <pre className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">
                  {bbpDocText || "👀 Nothing loaded"}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Assistant */}
        <div className="lg:col-span-1">
          <Card className="bg-card border shadow-lg h-fit sticky top-6">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg text-foreground flex items-center gap-2 font-medium">
                <Bot className="h-5 w-5 text-primary" />
                AI Assistant
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Make changes to your blueprint using natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Chat Messages */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium mb-1">Start a conversation</p>
                    <p className="text-xs">Example: "Add risk management requirements"</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary/10 ml-4 border border-primary/20"
                          : "bg-muted mr-4"
                      }`}
                    >
                      <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
                    </div>
                  ))
                )}
                {isRegenerating && (
                  <div className="p-3 rounded-lg bg-muted mr-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Describe the changes you want..."
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                  disabled={isRegenerating}
                />
                <Button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isRegenerating}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlueprintGeneration;
