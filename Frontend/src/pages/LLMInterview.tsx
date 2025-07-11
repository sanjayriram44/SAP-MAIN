"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

type InterviewStep = "main" | "summary"

export default function LLMInterview() {
  const [question, setQuestion] = useState("")
  const [currentSub, setCurrentSub] = useState("")
  const [answer, setAnswer] = useState("")
  const [step, setStep] = useState<InterviewStep>("main")
  const [progress, setProgress] = useState(0)
  const [index, setIndex] = useState(1)
  const [total, setTotal] = useState(1)
  const [allDone, setAllDone] = useState(false)
  const [processUnderstanding, setProcessUnderstanding] = useState("")
  const [reviseInput, setReviseInput] = useState("")
  const [isLoadingUnderstanding, setIsLoadingUnderstanding] = useState(true)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [processRecommendation, setProcessRecommendation] = useState("")
  const [reviseRecInput, setReviseRecInput] = useState("")
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)
  const [isUnderstandingExpanded, setIsUnderstandingExpanded] = useState(false)
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false)

  const [bbpContent, setBbpContent] = useState("")
  const [isLoadingBBP, setIsLoadingBBP] = useState(false)

  useEffect(() => {
    const initFlow = async () => {
      try {
        const res = await axios.get("http://localhost:8000/init_subprocess_flow")
        setQuestion(res.data.suggested_question)
        setCurrentSub(res.data.current_subprocess)
        setProgress(res.data.progress_percent)
        setIndex(res.data.index)
        setTotal(res.data.total)
        setProcessUnderstanding(res.data.process_understanding || "")
        setIsLoadingUnderstanding(false)
        setIsLoadingQuestion(false)
      } catch (err) {
        console.error("Failed to initialize flow", err)
        setIsLoadingUnderstanding(false)
        setIsLoadingQuestion(false)
      }
    }

    initFlow()
  }, [])

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      setIsLoadingUnderstanding(true)

      const res = await axios.post("http://localhost:8000/submit_answer", {
        answer,
      })

      if (res.data.all_completed) {
        setAllDone(true)
        setStep("summary")
        setProcessUnderstanding(res.data.process_understanding || "")
        setProcessRecommendation(res.data.process_recommendation || "")
        setShowRecommendation(true)
      } else {
        setQuestion(res.data.next_question)
        setCurrentSub(res.data.current_subprocess)
        setAnswer("")
        setIndex((prev) => prev + 1)
        setProgress(Math.round(((index + 1) / total) * 100))
        setProcessUnderstanding(res.data.process_understanding || "")
        setProcessRecommendation(res.data.process_recommendation || "")
        setShowRecommendation(true)
      }
    } catch (err) {
      console.error("Failed to submit answer", err)
    } finally {
      setIsLoadingUnderstanding(false)
      setIsSubmitting(false)
    }
  }

  const handleReviseUnderstanding = async () => {
    if (!reviseInput.trim()) return

    try {
      setIsLoadingUnderstanding(true)
      const res = await axios.post("http://localhost:8000/revise_process_understanding", {
        user_input: reviseInput,
      })
      setProcessUnderstanding(res.data.updated_process_understanding)
      setReviseInput("")
    } catch (err) {
      console.error("Failed to revise process understanding", err)
    } finally {
      setIsLoadingUnderstanding(false)
    }
  }

  const handleReviseRecommendation = async () => {
    if (!reviseRecInput.trim()) return

    try {
      setIsLoadingRecommendation(true)
      const res = await axios.post("http://localhost:8000/revise_process_recommendation", {
        user_input: reviseRecInput,
      })
      setProcessRecommendation(res.data.updated_process_recommendation)
      setReviseRecInput("")
    } catch (err) {
      console.error("Failed to revise recommendation", err)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const handleGenerateBBP = async () => {
    try {
      setIsLoadingBBP(true)
      const res = await axios.get("http://localhost:8000/generate_bbp_from_process_analysis")
      setBbpContent(res.data.bbp_content)
    } catch (err) {
      console.error("Failed to generate BBP", err)
    } finally {
      setIsLoadingBBP(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto space-y-8">
      {/* Top: Main Interview */}
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">
            Subprocess {index} of {total}
          </h1>
          <p className="text-muted-foreground">{currentSub}</p>
          <Progress value={progress} className="h-2 mt-2" />
        </div>

        {step === "main" && !allDone && (
          <div className="space-y-4">
            <h2 className="font-medium">Question:</h2>
            {isLoadingQuestion ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your question...
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{question}</p>
            )}
            <Textarea
              placeholder="Your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px]"
              disabled={isSubmitting || isLoadingQuestion}
            />
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting || isLoadingQuestion}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
            <p className="text-xs text-muted-foreground">Press Cmd/Ctrl + Enter to submit</p>
          </div>
        )}

        {allDone && (
          <div className="space-y-4">
            <h2 className="text-green-700 font-medium">✅ All Subprocesses Complete</h2>
            <p className="text-sm">You’re done. Generate the final BBP document below.</p>

            <Button
              onClick={handleGenerateBBP}
              disabled={isLoadingBBP}
              className="w-full sm:w-auto"
            >
              {isLoadingBBP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoadingBBP ? "Generating BBP..." : "Generate BBP Document"}
            </Button>

            {bbpContent && (
              <div className="bg-gray-100 mt-4 p-4 rounded text-sm whitespace-pre-wrap max-h-[400px] overflow-auto">
                {bbpContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom: Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Process Understanding */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Current Process Understanding</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUnderstandingExpanded(!isUnderstandingExpanded)}
              className="p-1 h-auto"
              disabled={isLoadingUnderstanding || !processUnderstanding}
            >
              {isUnderstandingExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {isLoadingUnderstanding ? (
            <div className="bg-gray-100 p-3 rounded text-sm min-h-[60px] flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your responses...
            </div>
          ) : !processUnderstanding ? (
            <div className="bg-gray-100 p-3 rounded text-sm min-h-[60px] flex items-center text-muted-foreground">
              Process understanding will appear here after your first response.
            </div>
          ) : (
            <div className="bg-gray-100 rounded overflow-hidden">
              <div
                className={`p-3 text-sm whitespace-pre-wrap transition-all duration-200 ${
                  isUnderstandingExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                }`}
              >
                {processUnderstanding}
              </div>
              {!isUnderstandingExpanded && processUnderstanding.length > 200 && (
                <div className="bg-gradient-to-t from-gray-100 to-transparent h-6 -mt-6 relative" />
              )}
            </div>
          )}

          <Textarea
            placeholder="Suggest improvements..."
            value={reviseInput}
            onChange={(e) => setReviseInput(e.target.value)}
            className="min-h-[80px]"
            disabled={isLoadingUnderstanding}
          />
          <Button
            onClick={handleReviseUnderstanding}
            disabled={!reviseInput.trim() || isLoadingUnderstanding}
            size="sm"
            className="w-full"
          >
            {isLoadingUnderstanding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Understanding
          </Button>
        </div>

        {/* Right: Recommendation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recommended Process</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRecommendationExpanded(!isRecommendationExpanded)}
              className="p-1 h-auto"
              disabled={isLoadingRecommendation || !processRecommendation}
            >
              {isRecommendationExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {isLoadingRecommendation ? (
            <div className="bg-gray-100 p-3 rounded text-sm min-h-[60px] flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating recommendations...
            </div>
          ) : !processRecommendation ? (
            <div className="bg-gray-100 p-3 rounded text-sm min-h-[60px] flex items-center text-muted-foreground">
              No recommendation available yet.
            </div>
          ) : (
            <div className="bg-gray-100 rounded overflow-hidden">
              <div
                className={`p-3 text-sm whitespace-pre-wrap transition-all duration-200 ${
                  isRecommendationExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                }`}
              >
                {processRecommendation}
              </div>
              {!isRecommendationExpanded && processRecommendation.length > 200 && (
                <div className="bg-gradient-to-t from-gray-100 to-transparent h-6 -mt-6 relative" />
              )}
            </div>
          )}

          <Textarea
            placeholder="Suggest edits to recommendation..."
            value={reviseRecInput}
            onChange={(e) => setReviseRecInput(e.target.value)}
            className="min-h-[80px]"
            disabled={isLoadingRecommendation}
          />
          <Button
            onClick={handleReviseRecommendation}
            disabled={!reviseRecInput.trim() || isLoadingRecommendation}
            size="sm"
            className="w-full"
          >
            {isLoadingRecommendation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Recommendation
          </Button>
        </div>
      </div>
    </div>
  )
}
