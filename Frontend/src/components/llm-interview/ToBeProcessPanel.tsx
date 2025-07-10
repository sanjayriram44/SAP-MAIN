import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lightbulb, ChevronRight } from "lucide-react";
import { ToBeOption } from "@/types/llm-interview";

interface ToBeProcessPanelProps {
  options: ToBeOption[];
  selectedOption: string;
  onOptionChange: (value: string) => void;
  onNext: () => void;
  isLastSubprocess: boolean;
}

export const ToBeProcessPanel = ({
  options,
  selectedOption,
  onOptionChange,
  onNext,
  isLastSubprocess
}: ToBeProcessPanelProps) => {
  return (
    <Card className="bg-card border shadow-sm mb-6">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          Suggested To-Be Process
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedOption}
          onValueChange={onOptionChange}
          className="space-y-4"
        >
          {options.map((option, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.title} id={option.title} />
                <Label htmlFor={option.title} className="font-medium text-foreground cursor-pointer">
                  {option.title}
                </Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                {option.description}
              </div>
            </div>
          ))}
        </RadioGroup>

        {selectedOption && (
          <Button 
            onClick={onNext}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          >
            {isLastSubprocess ? 'Generate Blueprint' : 'Next Subprocess'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};