import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { productId, moduleId } = useParams();
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const moduleNames: { [key: string]: string } = {
    sourcing: "SAP Ariba Sourcing",
    contract: "SAP Ariba Contract Management",
    risk: "SAP Ariba Supplier Risk",
    lifecycle: "SAP Ariba Supplier Lifecycle and Performance",
    buying: "SAP Ariba Buying and Invoicing",
    guided: "SAP Ariba Guided Buying",
    invoice: "SAP Ariba Invoice Management"
  };

  const supportedFormats = [
    { format: ".docx", description: "Microsoft Word Document" },
    { format: ".doc", description: "Microsoft Word Document (Legacy)" },
    { format: ".pdf", description: "PDF Document" },
    { format: ".xlsx", description: "Microsoft Excel Spreadsheet" },
    { format: ".txt", description: "Plain Text File" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(files);
    }
  };

  const handleProcessDocument = async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]); // only using the first file

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      navigate(`/product/${productId}/module/${moduleId}/generation/bbp/questionnaire/document-upload/blueprint`);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTryWithSample = () => {
    navigate(`/product/${productId}/module/${moduleId}/generation/bbp/questionnaire/document-upload/blueprint`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate(`/product/${productId}/module/${moduleId}/generation/bbp`)} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Upload className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {moduleNames[moduleId || ''] || 'Unknown Module'} - Document Upload
              </h1>
              <p className="text-muted-foreground">Upload your completed questionnaire document</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Questionnaire Document
            </CardTitle>
            <CardDescription>
              Upload your completed discovery questionnaire to generate a Business Blueprint directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="file-upload" className="mb-2 block">
                Select Documents (Only one for now)
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".docx,.doc,.pdf,.xlsx,.txt"
                onChange={handleFileUpload}
              />
            </div>

            {uploadedFiles && uploadedFiles.length > 0 && (
              <div className="space-y-3">
                {Array.from(uploadedFiles).map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge className="bg-success/10 text-success hover:bg-success/20">
                      Ready to Process
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleProcessDocument}
                disabled={!uploadedFiles || uploadedFiles.length === 0 || isProcessing}
              >
                {isProcessing ? "Processing..." : "Process Document & Generate Blueprint"}
              </Button>

              <Button variant="outline" onClick={handleTryWithSample}>
                Try with Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Supported File Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportedFormats.map((format) => (
                <div key={format.format} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>
                    <strong>{format.format}</strong> - {format.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Tips for Best Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Ensure your document contains clear question-answer pairs</li>
              <li>• Include process descriptions and organizational details</li>
              <li>• Make sure the document is properly formatted and readable</li>
              <li>• Include any specific requirements or constraints</li>
              <li>• Provide details about current and desired future processes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
