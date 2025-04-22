"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Upload, Settings } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function QuizCreator() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [numQuestions, setNumQuestions] = useState("10")
  const [difficulty, setDifficulty] = useState("Medium")
  const [language, setLanguage] = useState("English")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (): void => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleGenerate = (): void => {
    if (!file) return // Don't proceed if no file is uploaded

    setIsGenerating(true)

    // Simulate API call to generate quiz
    setTimeout(() => {
      setIsGenerating(false)
      // Redirect to the generated quiz preview page
      router.push("/quiz/generated/1")
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white shadow-md border-gray-200">
        <CardContent className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-center mb-2">Upload Study Material</h1>
            <p className="text-gray-600 text-center mb-8">Upload your PDF and customize quiz generation settings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center ${
                isDragging ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
              } transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{file ? file.name : "Drop your PDF here"}</h3>
                  <p className="text-sm text-gray-500">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse files"}
                  </p>
                </motion.div>
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Quiz Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="num-questions" className="text-gray-700 mb-2 block">
                  Number of Questions
                </Label>
                <Input
                  id="num-questions"
                  type="number"
                  min="1"
                  max="50"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-gray-700 mb-2 block">
                  Difficulty Level
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger
                    id="difficulty"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language" className="text-gray-700 mb-2 block">
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger
                    id="language"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
              <Button
                onClick={handleGenerate}
                disabled={!file || isGenerating}
                className={`w-full py-6 text-lg rounded-xl ${
                  !file
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isGenerating
                      ? "bg-indigo-400 text-white cursor-wait"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Quiz...
                  </div>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
