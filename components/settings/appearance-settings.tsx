"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Moon, Sun, Monitor } from "lucide-react"

export function AppearanceSettings() {
  const [theme, setTheme] = useState("system")
  const [fontSize, setFontSize] = useState("medium")
  const [colorScheme, setColorScheme] = useState("indigo")

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
          <RadioGroup value={theme} onValueChange={setTheme} className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 flex-1">
              <RadioGroupItem value="light" id="light" className="border-gray-400" />
              <Label htmlFor="light" className="flex items-center cursor-pointer text-gray-900">
                <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 flex-1">
              <RadioGroupItem value="dark" id="dark" className="border-gray-400" />
              <Label htmlFor="dark" className="flex items-center cursor-pointer text-gray-900">
                <Moon className="h-5 w-5 mr-2 text-indigo-500" />
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 flex-1">
              <RadioGroupItem value="system" id="system" className="border-gray-400" />
              <Label htmlFor="system" className="flex items-center cursor-pointer text-gray-900">
                <Monitor className="h-5 w-5 mr-2 text-gray-500" />
                System
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="font-size" className="text-gray-700">
              Font Size
            </Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="font-size" className="border-gray-300 bg-white text-gray-900">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-scheme" className="text-gray-700">
              Color Scheme
            </Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger id="color-scheme" className="border-gray-300 bg-white text-gray-900">
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indigo">Indigo (Default)</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <div className="p-6 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  KM
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-base">Dashboard</h4>
                  <p className="text-gray-500 text-sm">Your learning progress</p>
                </div>
              </div>
              <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                Action
              </Button>
            </div>
            <div className="h-20 bg-gray-100 rounded-md"></div>
          </div>
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
