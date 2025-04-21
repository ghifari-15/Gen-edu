"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Code,
  FileText,
  Share,
  Settings,
  Plus,
  Send,
  ChevronLeft,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"

interface NotebookProps {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export function NotebookEditor({ notebook }: { notebook: NotebookProps }) {
  const [content, setContent] = useState<string>(notebook.content)
  const [title, setTitle] = useState<string>(notebook.title)
  const [activeTab, setActiveTab] = useState<string>("notes")
  const isMobile = useIsMobile()

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white text-gray-900">
        <div className="flex items-center">
          <Link href="/notebook" className="mr-3 md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-0 focus-visible:ring-0 p-0 h-auto bg-transparent max-w-[200px] md:max-w-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-white border-gray-200 rounded-lg items-center hidden md:flex">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      {isMobile && (
        <div className="border-b border-gray-200 bg-white">
          <Tabs defaultValue="notes" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent h-12 p-0">
              <TabsTrigger
                value="sources"
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 h-full"
              >
                Sources
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 h-full"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="ai-chat"
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 h-full"
              >
                AI Chat
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sources sidebar - hidden on mobile */}
        {(!isMobile || activeTab === "sources") && (
          <div className="w-full md:w-64 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sources added yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Add PDFs, websites, or text documents to enhance your notes with references.
              </p>
            </div>
          </div>
        )}

        {/* Editor area */}
        {(!isMobile || activeTab === "notes") && (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Formatting toolbar */}
            <div className="flex items-center p-2 border-b border-gray-200 overflow-x-auto">
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto">
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Type something..."
                className="w-full h-full min-h-[500px] p-6 border-0 focus-visible:ring-0 resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* AI Assistant sidebar - hidden on mobile */}
        {(!isMobile || activeTab === "ai-chat") && (
          <div className="w-full md:w-80 border-l border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-800">
              <h3 className="text-lg font-medium text-white">AI Assistant</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-sm mr-3 flex-shrink-0">
                    AI
                  </div>
                  <div>
                    <p className="text-indigo-900">
                      Hello! I'm your AI assistant. How can I help with your notes today?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="relative">
                <Input
                  placeholder="Ask AI about your notes..."
                  className="pr-10 bg-gray-50 border-gray-200 rounded-lg"
                />
                <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
