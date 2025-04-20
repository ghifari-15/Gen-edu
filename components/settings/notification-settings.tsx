"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [quizReminders, setQuizReminders] = useState(true)
  const [studyReminders, setStudyReminders] = useState(false)
  const [newFeatures, setNewFeatures] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="email-notifications" className="text-base font-medium text-gray-900">
              Email Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">Receive notifications about your account via email</p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="quiz-reminders" className="text-base font-medium text-gray-900">
              Quiz Reminders
            </Label>
            <p className="text-sm text-gray-600 mt-1">Get reminders about upcoming and incomplete quizzes</p>
          </div>
          <Switch
            id="quiz-reminders"
            checked={quizReminders}
            onCheckedChange={setQuizReminders}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="study-reminders" className="text-base font-medium text-gray-900">
              Study Reminders
            </Label>
            <p className="text-sm text-gray-600 mt-1">Receive daily reminders to continue your learning</p>
          </div>
          <Switch
            id="study-reminders"
            checked={studyReminders}
            onCheckedChange={setStudyReminders}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="flex flex-row items-center justify-between py-4 border-b border-gray-200">
          <div>
            <Label htmlFor="new-features" className="text-base font-medium text-gray-900">
              New Features
            </Label>
            <p className="text-sm text-gray-600 mt-1">Be the first to know about new features and updates</p>
          </div>
          <Switch
            id="new-features"
            checked={newFeatures}
            onCheckedChange={setNewFeatures}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <div className="flex flex-row items-center justify-between py-4">
          <div>
            <Label htmlFor="marketing-emails" className="text-base font-medium text-gray-900">
              Marketing Emails
            </Label>
            <p className="text-sm text-gray-600 mt-1">Receive emails about new products, features, and more</p>
          </div>
          <Switch
            id="marketing-emails"
            checked={marketingEmails}
            onCheckedChange={setMarketingEmails}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
