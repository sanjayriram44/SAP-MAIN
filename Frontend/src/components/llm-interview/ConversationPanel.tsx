import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { ConversationEntry } from "@/types/llm-interview";

interface ConversationPanelProps {
  subprocess: { name: string; description: string };
  conversationHistory: ConversationEntry[];
  currentQuestion: string;
  currentAnswer: string;
  onAnswerChange: (value: string) => void;
  onAnswerSubmit: () => void;
  onShowUnderstanding: () => void;
  showUnderstanding: boolean;
}

export const ConversationPanel = ({
  subprocess,
  conversationHistory,
  currentQuestion,
  currentAnswer,
  onAnswerChange,
  onAnswerSubmit,
  onShowUnderstanding,
  showUnderstanding
}: ConversationPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Subprocess Overview */}
      <Card className="bg-card border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground font-medium flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {subprocess.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{subprocess.description}</p>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card className="bg-card border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Discovery Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show conversation history */}
          {conversationHistory.map((entry, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${
                entry.role === 'consultant' 
                  ? 'bg-primary/10 border-l-4 border-primary' 
                  : 'bg-muted/50'
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {entry.role === 'consultant' ? 'Consultant:' : 'Customer Team:'}
              </div>
              <div className="text-foreground">{entry.message}</div>
            </div>
          ))}

          {/* Current question */}
          {conversationHistory.length === 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border-l-4 border-primary">
              <div className="text-sm font-medium text-muted-foreground mb-2">Consultant:</div>
              <div className="text-foreground">{currentQuestion}</div>
            </div>
          )}

          {/* Answer input */}
          <div className="space-y-4">
            <Textarea
              value={currentAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your response..."
              className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
            <Button 
              onClick={onAnswerSubmit}
              disabled={!currentAnswer.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Submit Response
            </Button>
          </div>

          {/* Show understanding button */}
          {conversationHistory.length > 0 && !showUnderstanding && (
            <Button 
              onClick={onShowUnderstanding}
              variant="outline"
              className="mt-4 border-primary text-primary hover:bg-primary/10"
            >
              Show Sub Process Understanding
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};