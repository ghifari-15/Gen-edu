"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Clock, FileText, BarChart3, List, ArrowRight, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  difficulty: string;
  questions: Question[];
}

export function GeneratedQuizPreview({ quiz }: { quiz: QuizProps }) {
  const router = useRouter()

  const handleEditQuiz = (): void => {
    // Go back to the quiz creator page
    router.push("/quiz/create")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white shadow-md border-gray-200">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Quiz Generated Successfully!</h1>
          <p className="text-gray-600 text-center mb-4">Your quiz is ready to be taken</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{quiz.title}</h2>
            <p className="text-gray-600 mb-6">{quiz.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center text-indigo-600 mb-2">
                  <List className="h-5 w-5 mr-2" />
                  <span className="font-medium">Questions</span>
                </div>
                <p className="text-2xl font-bold">{quiz.totalQuestions}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center text-indigo-600 mb-2">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span className="font-medium">Difficulty</span>
                </div>
                <p className="text-2xl font-bold">{quiz.difficulty}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center text-indigo-600 mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">Est. Time</span>
                </div>
                <p className="text-2xl font-bold">{Math.round(quiz.totalQuestions * 1.5)} min</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quiz Preview</h3>
            <div className="space-y-3">
              {quiz.questions.slice(0, 2).map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">
                    {index + 1}. {question.text}
                  </p>
                  <div className="pl-6 text-gray-600">
                    <p>• {question.options[0]}</p>
                    <p>• {question.options[1]}</p>
                    <p className="text-gray-400">• [+ {question.options.length - 2} more options]</p>
                  </div>
                </div>
              ))}
              <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500">
                + {quiz.totalQuestions - 2} more questions
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <Link href={`/quiz/${quiz.id}`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              Take Quiz <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
