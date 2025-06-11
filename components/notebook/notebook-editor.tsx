"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Type,
  Palette,
  Quote,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Undo,
  Redo,
  Save,
  Download,
  Upload,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLearningSession } from "@/hooks/use-learning-session"
import Link from "next/link"

interface Cell {
  id: string;
  type: 'markdown' | 'code' | 'text';
  content: string;
  metadata?: {
    language?: string;
    tags?: string[];
    collapsed?: boolean;
  };
  outputs?: any[];
  executionCount?: number;
}

interface NotebookData {
  _id?: string;
  notebookId: string;
  title: string;
  description?: string;
  cells: Cell[];
  metadata: {
    language: string;
    tags: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number;
    subjects: string[];
  };
}

interface NotebookProps {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NotebookEditorProps {
  notebookId?: string;
  notebook?: NotebookProps;
}

export function NotebookEditor({ notebookId, notebook }: NotebookEditorProps) {
  // State for notebook data
  const [notebookData, setNotebookData] = useState<NotebookProps | null>(notebook || null)
  const [loading, setLoading] = useState(!notebook)
  const [error, setError] = useState<string | null>(null)
    const [content, setContent] = useState<string>(notebook?.content || '')
  const [title, setTitle] = useState<string>(notebook?.title || '')
  const [activeTab, setActiveTab] = useState<string>("notes")
  const [aiMessages, setAiMessages] = useState<Array<{id: string, role: 'user' | 'ai', content: string}>>([
    { id: '1', role: 'ai', content: "Hello! I'm your AI assistant. How can I help with your notes today?" }
  ])
  const [aiInput, setAiInput] = useState("")
  const [fontSize, setFontSize] = useState("14")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [sources, setSources] = useState<Array<{id: string, name: string, type: string, url?: string}>>([])
  const [wordCount, setWordCount] = useState(0)
  const [showShortcuts, setShowShortcuts] = useState(false)
    const isMobile = useIsMobile()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Learning session tracking
  const learningSession = useLearningSession({
    activityType: 'notebook_session',
    resourceId: notebookId || notebookData?.id,
    resourceTitle: title || notebookData?.title || 'Notebook',
    minSessionDuration: 2, // Track sessions longer than 2 minutes
  })

  // Fetch notebook data if only notebookId is provided
  useEffect(() => {
    if (notebookId && !notebook) {
      const fetchNotebook = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/notebooks/${notebookId}`)
          if (!response.ok) {
            throw new Error('Failed to fetch notebook')
          }
          const data = await response.json()
          if (data.success) {
            // Convert cell-based content to simple HTML content
            let htmlContent = ''
            if (data.notebook.cells && Array.isArray(data.notebook.cells)) {
              htmlContent = data.notebook.cells.map((cell: any) => {
                if (cell.type === 'markdown') {
                  return `<div>${cell.content}</div>`
                } else if (cell.type === 'code') {
                  return `<pre><code>${cell.content}</code></pre>`
                } else {
                  return `<div>${cell.content}</div>`
                }
              }).join('\n')
            } else if (data.notebook.content) {
              htmlContent = data.notebook.content
            }
            
            const notebookData: NotebookProps = {
              id: data.notebook.notebookId,
              title: data.notebook.title,
              content: htmlContent,
              createdAt: data.notebook.createdAt,
              updatedAt: data.notebook.updatedAt,
            }
            setNotebookData(notebookData)
            setTitle(notebookData.title)
            setContent(notebookData.content)
          } else {
            setError(data.message || 'Failed to fetch notebook')
          }
        } catch (err) {
          setError('Failed to load notebook')
          console.error('Error fetching notebook:', err)
        } finally {
          setLoading(false)
        }
      }
      fetchNotebook()
    }
  }, [notebookId, notebook])
  // Rich text formatting functions
  const applyFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [])

  const insertText = useCallback((text: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    editorRef.current?.focus()
  }, [])

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      
      // Update word count
      const textContent = editorRef.current.textContent || ""
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)

      // Track learning activity
      if (!learningSession.isActive) {
        learningSession.startSession()
      } else {
        learningSession.updateActivity()
      }
    }
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          applyFormat('bold')
          break
        case 'i':
          e.preventDefault()
          applyFormat('italic')
          break
        case 'u':
          e.preventDefault()
          applyFormat('underline')
          break
        case 'k':
          e.preventDefault()
          insertLink()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            applyFormat('redo')
          } else {
            applyFormat('undo')
          }
          break
        case 'y':
          e.preventDefault()
          applyFormat('redo')
          break
      }
    }
  }, [applyFormat])

  // AI Chat functionality
  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return
    
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: aiInput }
    setAiMessages(prev => [...prev, userMessage])
    setAiInput("")
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai' as const, 
        content: `I understand you're asking about "${aiInput}". Based on your notes, I can help you expand on this topic. Would you like me to suggest some key points or help you organize your thoughts?`
      }
      setAiMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  // File handling for sources
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const newSource = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: URL.createObjectURL(file)
        }
        setSources(prev => [...prev, newSource])
      })
    }
  }

  // Insert link functionality
  const insertLink = () => {
    const url = prompt('Enter URL:')
    const text = prompt('Enter link text:') || url
    if (url && text) {
      applyFormat('createLink', url)
    }
  }
  // Insert image functionality
  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      applyFormat('insertImage', url)
    }
  }

  // Insert table functionality
  const insertTable = () => {
    const rows = prompt('Number of rows:', '3')
    const cols = prompt('Number of columns:', '3')
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">'
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += i === 0 ? '<th style="border: 1px solid #ccc; padding: 8px;">Header</th>' 
                                : '<td style="border: 1px solid #ccc; padding: 8px;">Cell</td>'
        }
        tableHTML += '</tr>'
      }
      tableHTML += '</table>'
      applyFormat('insertHTML', tableHTML)
    }
  }

  // Text color functionality
  const changeTextColor = () => {
    const color = prompt('Enter color (hex, rgb, or color name):', '#000000')
    if (color) {
      applyFormat('foreColor', color)
    }
  }

  // Background color functionality
  const changeBackgroundColor = () => {
    const color = prompt('Enter background color (hex, rgb, or color name):', '#ffff00')
    if (color) {
      applyFormat('backColor', color)
    }
  }
  // Export functionality
  const exportAsHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: ${fontFamily}; font-size: ${fontSize}px; margin: 20px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import functionality
  const importFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (editorRef.current) {
            editorRef.current.innerHTML = content
            setContent(content)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }
  // Auto-save logic
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentNotebook = notebookData || notebook
    if (!currentNotebook) return
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(
        `notebook-${currentNotebook.id}`,
        JSON.stringify({ ...currentNotebook, title, content })
      )
      
      // Save to server if notebookId exists
      if (notebookId) {
        fetch(`/api/notebooks/${notebookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            cells: [{
              id: 'main-content',
              type: 'text',
              content: content,
              metadata: { language: 'html' }
            }]
          }),
        }).catch(err => console.error('Auto-save failed:', err))
      }
    }, 1000)
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [title, content, notebookData, notebook, notebookId])

  useEffect(() => {
    const currentNotebook = notebookData || notebook
    if (!currentNotebook) return
    
    const saved = localStorage.getItem(`notebook-${currentNotebook.id}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setTitle(parsed.title)
      setContent(parsed.content)
      if (editorRef.current) {
        editorRef.current.innerHTML = parsed.content
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML = content
    }
  }, [notebookData, notebook])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notebook...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const currentNotebook = notebookData || notebook
  if (!currentNotebook) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-600">Notebook not found</p>
      </div>
    )
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
        </div>        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportAsHTML}
            className="bg-white border-gray-200 rounded-lg items-center hidden md:flex"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={importFile}
            className="bg-white border-gray-200 rounded-lg items-center hidden md:flex"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
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
        {/* Sources sidebar */}
        {(!isMobile || activeTab === "sources") && (
          <div className="w-full md:w-64 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sources added yet</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Add PDFs, websites, or text documents to enhance your notes with references.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map((source) => (
                    <div key={source.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium truncate">{source.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{source.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Editor area */}
        {(!isMobile || activeTab === "notes") && (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">            {/* Font and size controls */}
            <div className="flex items-center p-2 border-b border-gray-200 gap-2">
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times">Times</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="14">14</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => applyFormat('formatBlock', value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Heading" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p">Paragraph</SelectItem>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="h4">Heading 4</SelectItem>
                  <SelectItem value="h5">Heading 5</SelectItem>
                  <SelectItem value="h6">Heading 6</SelectItem>
                </SelectContent>
              </Select>
            </div>            {/* Formatting toolbar */}
            <div className="flex items-center p-2 border-b border-gray-200 overflow-x-auto">
              {/* Undo/Redo */}
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('undo')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('redo')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              {/* Text formatting */}
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('bold')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('italic')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('underline')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('strikeThrough')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </div>

              {/* Colors */}
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={changeTextColor}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Text Color"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={changeBackgroundColor}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Background Color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Alignment */}
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('justifyLeft')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('justifyCenter')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('justifyRight')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Lists and formatting */}
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('insertUnorderedList')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('insertOrderedList')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('formatBlock', 'blockquote')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Subscript/Superscript */}
              <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('subscript')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Subscript"
                >
                  <Subscript className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('superscript')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Superscript"
                >
                  <Superscript className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Insert options */}
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={insertLink}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Insert Link (Ctrl+K)"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={insertImage}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={insertTable}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Insert Table"
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat('formatBlock', 'pre')}
                  className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  title="Code Block"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </div>
            </div>{/* Editor */}
            <div className="flex-1 overflow-auto">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                data-placeholder="Start typing your notes..."
                className="rich-editor w-full h-full min-h-[500px] p-6 outline-none text-sm leading-relaxed"
                style={{ 
                  fontFamily: fontFamily, 
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6'
                }}
                suppressContentEditableWarning={true}              />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{content.length} characters</span>
                <span>•</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShortcuts(!showShortcuts)}
                  className="text-xs p-1 h-auto"
                >
                  Shortcuts
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Auto-saved {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Keyboard shortcuts overlay */}
            {showShortcuts && (
              <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 max-w-sm">
                <h4 className="font-semibold text-sm mb-2">Keyboard Shortcuts</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span>Bold:</span><span>Ctrl+B</span></div>
                  <div className="flex justify-between"><span>Italic:</span><span>Ctrl+I</span></div>
                  <div className="flex justify-between"><span>Underline:</span><span>Ctrl+U</span></div>
                  <div className="flex justify-between"><span>Link:</span><span>Ctrl+K</span></div>
                  <div className="flex justify-between"><span>Undo:</span><span>Ctrl+Z</span></div>
                  <div className="flex justify-between"><span>Redo:</span><span>Ctrl+Y</span></div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShortcuts(false)}
                  className="mt-2 text-xs"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}

        {/* AI Assistant sidebar */}
        {(!isMobile || activeTab === "ai-chat") && (
          <div className="w-full md:w-80 border-l border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-800">
              <h3 className="text-lg font-medium text-white">AI Assistant</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {aiMessages.map((message) => (
                  <div key={message.id} className={`${message.role === 'ai' ? 'bg-indigo-50' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className="flex items-start">
                      <div className={`h-8 w-8 rounded-full ${message.role === 'ai' ? 'bg-gradient-to-r from-indigo-600 to-indigo-800' : 'bg-gray-400'} flex items-center justify-center text-white text-sm mr-3 flex-shrink-0`}>
                        {message.role === 'ai' ? 'AI' : 'U'}
                      </div>
                      <div>
                        <p className={message.role === 'ai' ? 'text-indigo-900' : 'text-gray-900'}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="relative">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                  placeholder="Ask AI about your notes..."
                  className="pr-10 bg-gray-50 border-gray-200 rounded-lg"
                />
                <Button 
                  onClick={handleAiSubmit}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
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
