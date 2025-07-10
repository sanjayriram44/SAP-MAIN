
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductModules from "./pages/ProductModules";
import ActivitySelection from "./pages/ActivitySelection";
import CustomerContext from "./pages/CustomerContext";
import BBPGeneration from "./pages/BBPGeneration";
import QuestionnaireTemplates from "./pages/QuestionnaireTemplates";
import LLMInterview from "./pages/LLMInterview";
import DocumentUpload from "./pages/DocumentUpload";
import BlueprintGeneration from "./pages/BlueprintGeneration";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:productId" element={<ProductModules />} />
          <Route path="/product/:productId/module/:moduleId" element={<ActivitySelection />} />
          <Route path="/product/:productId/module/:moduleId/generation/bbp/context" element={<CustomerContext />} />
          <Route path="/product/:productId/module/:moduleId/generation/bbp" element={<BBPGeneration />} />
          <Route path="/product/:productId/module/:moduleId/generation/bbp/interview" element={<LLMInterview />} />
          <Route path="/product/:productId/module/:moduleId/generation/bbp/upload" element={<DocumentUpload />} />
          <Route path="/product/:productId/module/:moduleId/generation/bbp/questionnaire/:templateId" element={<QuestionnaireTemplates />} />
          <Route path="/product/:productId/module/:moduleId/generation/bbp/questionnaire/:templateId/blueprint" element={<BlueprintGeneration />} />
          <Route path="/product/:productId/module/:moduleId/:activityType/:activityId" element={<ComingSoon />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
