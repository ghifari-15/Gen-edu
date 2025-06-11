"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, User, MapPin, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingData {
  bio: string
  location: string
  occupation: string
  institution: string
  education: string
  grade: string
}

const STEPS = [
  { id: 1, title: "About You", icon: User },
  { id: 2, title: "Background", icon: GraduationCap },
  { id: 3, title: "Location & Work", icon: MapPin }
]

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
  "PhD",
  "Other"
]

const GRADE_LEVELS = [
  "Grade 9",
  "Grade 10", 
  "Grade 11",
  "Grade 12",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduate Student",
  "Other"
]

export function OnboardingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    bio: "",
    location: "",
    occupation: "",
    institution: "",
    education: "",
    grade: ""
  })

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          profile: {
            bio: data.bio,
            institution: data.institution,
            grade: data.grade
          },
          onboardingCompleted: true,
          preferences: {
            // Add any preferences based on the data collected
          }
        }),
      })

      if (response.ok) {
        // Mark onboarding as complete
        localStorage.setItem('onboarding-completed', 'true')
        router.push('/')
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
              <p className="text-gray-600 mt-2">Help us personalize your learning experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your interests, and what brings you to GenEdu..."
                  value={data.bio}
                  onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Educational Background</h2>
              <p className="text-gray-600 mt-2">Tell us about your education</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="e.g., Seoul National University, Harvard University"
                  value={data.institution}
                  onChange={(e) => setData(prev => ({ ...prev, institution: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="education">Education Level</Label>
                <Select value={data.education} onValueChange={(value) => setData(prev => ({ ...prev, education: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grade">Current Grade/Year</Label>
                <Select value={data.grade} onValueChange={(value) => setData(prev => ({ ...prev, grade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current grade/year" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Location & Work</h2>
              <p className="text-gray-600 mt-2">Where are you based and what do you do?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Seoul, South Korea"
                  value={data.location}
                  onChange={(e) => setData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation/Role</Label>
                <Input
                  id="occupation"
                  placeholder="e.g., AI Researcher at TechInnovate, Student, Teacher"
                  value={data.occupation}
                  onChange={(e) => setData(prev => ({ ...prev, occupation: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="w-full" />
          <CardTitle className="text-sm text-gray-500 mt-2">
            Step {currentStep} of {STEPS.length}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
          
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.setItem('onboarding-completed', 'true')
                router.push('/')
              }}
              className="text-gray-500"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
