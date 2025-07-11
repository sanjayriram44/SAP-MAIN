"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ChevronDown, ChevronUp, FileText, Download, CheckCircle, MessageSquare } from "lucide-react"

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

  // Card-level collapse states
  const [isUnderstandingCardExpanded, setIsUnderstandingCardExpanded] = useState(true)
  const [isRecommendationCardExpanded, setIsRecommendationCardExpanded] = useState(true)

  // Text-level collapse states
  const [isUnderstandingTextExpanded, setIsUnderstandingTextExpanded] = useState(false)
  const [isRecommendationTextExpanded, setIsRecommendationTextExpanded] = useState(false)

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
      setIsLoadingRecommendation(true)
      const res = await axios.post("http://localhost:8000/submit_answer", { answer })
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
      setIsLoadingRecommendation(false)
      setIsSubmitting(false)
    }
  }

  const handleDownloadExcel = async () => {
    try {
      await axios.get("http://localhost:8000/export_qna_excel")
      alert("Excel file generated successfully.")
    } catch (err) {
      console.error("Failed to download Excel", err)
      alert("Failed to generate Excel.")
    }
  }

  const handleDownloadWord = async () => {
    try {
      await axios.get("http://localhost:8000/export_qna_word")
      alert("Word file generated successfully.")
    } catch (err) {
      console.error("Failed to download Word", err)
      alert("Failed to generate Word documents.")
    }
  }

  const handleExportProcessAnalysis = async () => {
    try {
      await axios.get("http://localhost:8000/export_process_analysis_docs")
      alert("Process analysis documents exported successfully.")
    } catch (err) {
      console.error("Failed to export process analysis docs", err)
      alert("Failed to export process analysis documents.")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="px-6 py-12 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                    Step {index} of {total}
                  </Badge>
                  <h1 className="text-2xl font-bold text-gray-900">Process Interview</h1>
                </div>
                <p className="text-gray-600 font-medium">{currentSub}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{progress}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-3 bg-gray-200" />
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        {step === "main" && !allDone && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Current Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingQuestion ? (
                <div className="flex items-center gap-3 text-gray-600 py-8 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg">Generating your question...</span>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-gray-800 leading-relaxed text-lg">{question}</p>
                </div>
              )}

              <div className="space-y-4">
                <Textarea
                  placeholder="Share your detailed response here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[140px] text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isSubmitting || isLoadingQuestion}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting || isLoadingQuestion}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 text-base font-medium"
                    size="lg"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Processing..." : "Submit Answer"}
                  </Button>

                  <div className="text-sm text-gray-500 flex items-center">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Cmd</kbd> +{" "}
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to submit
                  </div>
                </div>
              </div>

              {index > 1 && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Options
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <FileText className="h-4 w-4" />
                        Excel Export
                      </Button>
                      <Button
                        onClick={handleDownloadWord}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <FileText className="h-4 w-4" />
                        Word Export
                      </Button>
                      <Button
                        onClick={handleExportProcessAnalysis}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <FileText className="h-4 w-4" />
                        Process Analysis
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Completion Section */}
        {allDone && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800">All Subprocesses Complete!</h2>
                <p className="text-green-700 text-lg">You're ready to generate the final BBP document.</p>

                <Button
                  onClick={handleGenerateBBP}
                  disabled={isLoadingBBP}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
                  size="lg"
                >
                  {isLoadingBBP && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoadingBBP ? "Generating BBP..." : "Generate BBP Document"}
                </Button>

                {bbpContent && (
                  <Card className="mt-6 bg-white border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">Generated BBP Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-[400px] overflow-auto border">
                        {bbpContent}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Process Understanding */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-900">Current Process Understanding</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setIsUnderstandingCardExpanded(!isUnderstandingCardExpanded)}
                >
                  {isUnderstandingCardExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {isUnderstandingCardExpanded && (
              <CardContent className="space-y-4">
                {/* Text Display Section with its own collapse */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Understanding Content</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUnderstandingTextExpanded(!isUnderstandingTextExpanded)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      disabled={isLoadingUnderstanding || !processUnderstanding}
                    >
                      {isUnderstandingTextExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {isLoadingUnderstanding ? (
                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg min-h-[120px] flex items-center justify-center gap-3 text-gray-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Analyzing your responses...</span>
                    </div>
                  ) : !processUnderstanding ? (
                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg min-h-[120px] flex items-center justify-center text-gray-500">
                      Process understanding will appear here after your first response.
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`p-4 text-gray-800 whitespace-pre-wrap transition-all duration-300 ${
                          isUnderstandingTextExpanded ? "max-h-none" : "max-h-[160px] overflow-hidden"
                        }`}
                      >
                        {processUnderstanding}
                      </div>
                      {!isUnderstandingTextExpanded && processUnderstanding.length > 200 && (
                        <div className="bg-gradient-to-t from-gray-50 to-transparent h-8 -mt-8 relative" />
                      )}
                    </div>
                  )}
                </div>

                {/* Revision Section */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Suggest improvements to the understanding..."
                    value={reviseInput}
                    onChange={(e) => setReviseInput(e.target.value)}
                    className="min-h-[100px] border-gray-300 focus:border-purple-500"
                    disabled={isLoadingUnderstanding}
                  />
                  <Button
                    onClick={handleReviseUnderstanding}
                    disabled={!reviseInput.trim() || isLoadingUnderstanding}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoadingUnderstanding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Understanding
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Process Recommendation */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-900">Recommended Process</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setIsRecommendationCardExpanded(!isRecommendationCardExpanded)}
                >
                  {isRecommendationCardExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {isRecommendationCardExpanded && (
              <CardContent className="space-y-4">
                {/* Text Display Section with its own collapse */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Recommendation Content</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsRecommendationTextExpanded(!isRecommendationTextExpanded)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      disabled={isLoadingRecommendation || !processRecommendation}
                    >
                      {isRecommendationTextExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {isLoadingRecommendation ? (
                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg min-h-[120px] flex items-center justify-center gap-3 text-gray-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating recommendations...</span>
                    </div>
                  ) : !processRecommendation ? (
                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg min-h-[120px] flex items-center justify-center text-gray-500">
                      No recommendation available yet.
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`p-4 text-gray-800 whitespace-pre-wrap transition-all duration-300 ${
                          isRecommendationTextExpanded ? "max-h-none" : "max-h-[160px] overflow-hidden"
                        }`}
                      >
                        {processRecommendation}
                      </div>
                      {!isRecommendationTextExpanded && processRecommendation.length > 200 && (
                        <div className="bg-gradient-to-t from-gray-50 to-transparent h-8 -mt-8 relative" />
                      )}
                    </div>
                  )}
                </div>

                {/* Revision Section */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Suggest edits to recommendation..."
                    value={reviseRecInput}
                    onChange={(e) => setReviseRecInput(e.target.value)}
                    className="min-h-[100px] border-gray-300 focus:border-purple-500"
                    disabled={isLoadingRecommendation}
                  />
                  <Button
                    onClick={handleReviseRecommendation}
                    disabled={!reviseRecInput.trim() || isLoadingRecommendation}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoadingRecommendation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Recommendation
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
