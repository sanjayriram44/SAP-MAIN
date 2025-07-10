import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import {useState, useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";



const history = [
  { role: "user", content: "How do you handle invoices?" },
  { role: "assistant", content: "We use Ariba for invoice management." },
];

interface UnderstandingPanelProps {
  understandingText: string[];
  asIsConfirmed: boolean;
  missingDetails: string;
  onMissingDetailsChange: (value: string) => void;
  onConfirmAsIs: () => void;
  onRegenerate: () => void;
  onShowToBeProcess: () => void;
  showToBeProcess: boolean;
}


export const UnderstandingPanel = (
  {
  understandingText,
  asIsConfirmed,
  missingDetails,
  onMissingDetailsChange,
  onConfirmAsIs,
  onRegenerate,
  onShowToBeProcess,
  showToBeProcess
}: UnderstandingPanelProps) => {

  const [understanding, setUnderstanding] = useState<string>("");

  useEffect(() => {
    axios
      .post("http://localhost:8000/generate_process_understanding", { history })
      .then((response) => {
        setUnderstanding(response.data);
      })
      .catch((error) => {
        console.log("There was an error retrieving the process understanding:", error);
        setUnderstanding("Failed to load AS-IS process.");
      });
  }, []);
  return (
    <Card className="bg-card border shadow-sm mb-6">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
        Current Understanding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
         {understanding}
        </div>

        {!asIsConfirmed && (
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-sm font-medium text-foreground">
              Anything missing or needs clarification?
            </Label>
            <Textarea
              value={missingDetails}
              onChange={(e) => onMissingDetailsChange(e.target.value)}
              placeholder="Enter any missing details..."
              className="min-h-[80px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
            <div className="flex gap-2">
              <Button 
                onClick={onConfirmAsIs}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
              >
                Confirm AS-IS Process
              </Button>
              {missingDetails.trim() && (
                <Button 
                  onClick={onRegenerate}
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Regenerate
                </Button>
              )}
            </div>
          </div>
        )}

        {asIsConfirmed && !showToBeProcess && (
          <Button 
            onClick={onShowToBeProcess}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Suggested To-Be Process
          </Button>
        )}
      </CardContent>
    </Card>
  );
};