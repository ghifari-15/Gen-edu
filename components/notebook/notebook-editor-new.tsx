"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bold,
  Italic,
  Code2,
  FileText,
  Share,
  Settings,
  Plus,
  Send,
  ChevronLeft,
  Save,
  Play,
  Square,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Clock,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { NotebookChatPanel } from "./notebook-chat-panel"
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

interface NotebookEditorProps {
  notebookId: string;
}

export function NotebookEditor({ notebookId }: NotebookEditorProps) {
  const [notebook, setNotebook] = useState<NotebookData | null>(null)
  const [activeTab, setActiveTab] = useState<string>("notes")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeCellId, setActiveCellId] = useState<string | null>(null)
  
  const isMobile = useIsMobile()
  const router = useRouter()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load notebook data
  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        const response = await fetch(`/api/notebooks/${notebookId}`)
        const data = await response.json()
        
        if (data.success) {
          setNotebook(data.notebook)
          if (data.notebook.cells.length === 0) {
            // Add initial cell if notebook is empty
            addCell('markdown')
          }
        } else {
          console.error('Failed to load notebook:', data.message)
          router.push('/notebook')
        }
      } catch (error) {
        console.error('Error loading notebook:', error)
        router.push('/notebook')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotebook()
  }, [notebookId, router])

  // Autosave functionality
  const saveNotebook = useCallback(async (notebookData: NotebookData) => {
    if (!notebookData) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notebookData.title,
          description: notebookData.description,
          cells: notebookData.cells,
          metadata: notebookData.metadata,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setLastSaved(new Date())
        setNotebook(data.notebook)
      } else {
        console.error('Failed to save notebook:', data.message)
      }
    } catch (error) {
      console.error('Error saving notebook:', error)
    } finally {
      setIsSaving(false)
    }
  }, [notebookId])

  // Debounced autosave
  useEffect(() => {
    if (!notebook) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNotebook(notebook)
    }, 2000) // Save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [notebook, saveNotebook])

  // Generate unique cell ID
  const generateCellId = () => {
    return `cell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add new cell
  const addCell = (type: 'markdown' | 'code' | 'text', insertAfter?: string) => {
    if (!notebook) return

    const newCell: Cell = {
      id: generateCellId(),
      type,
      content: type === 'markdown' ? '# New Cell\n\nStart typing...' : 
               type === 'code' ? '// Write your code here\nconsole.log("Hello, World!");' : 
               'Start typing...',
      metadata: {
        language: type === 'code' ? 'javascript' : type,
        tags: [],
        collapsed: false,
      },
      outputs: [],
      executionCount: 0,
    }

    let newCells = [...notebook.cells]
    
    if (insertAfter) {
      const index = newCells.findIndex(cell => cell.id === insertAfter)
      newCells.splice(index + 1, 0, newCell)
    } else {
      newCells.push(newCell)
    }

    setNotebook({
      ...notebook,
      cells: newCells
    })
    setActiveCellId(newCell.id)
  }

  // Delete cell
  const deleteCell = (cellId: string) => {
    if (!notebook || notebook.cells.length <= 1) return

    const newCells = notebook.cells.filter(cell => cell.id !== cellId)
    setNotebook({
      ...notebook,
      cells: newCells
    })
    
    if (activeCellId === cellId) {
      setActiveCellId(newCells[0]?.id || null)
    }
  }

  // Move cell up
  const moveCellUp = (cellId: string) => {
    if (!notebook) return

    const cellIndex = notebook.cells.findIndex(cell => cell.id === cellId)
    if (cellIndex > 0) {
      const newCells = [...notebook.cells]
      const temp = newCells[cellIndex]
      newCells[cellIndex] = newCells[cellIndex - 1]
      newCells[cellIndex - 1] = temp
      
      setNotebook({
        ...notebook,
        cells: newCells
      })
    }
  }

  // Move cell down
  const moveCellDown = (cellId: string) => {
    if (!notebook) return

    const cellIndex = notebook.cells.findIndex(cell => cell.id === cellId)
    if (cellIndex < notebook.cells.length - 1) {
      const newCells = [...notebook.cells]
      const temp = newCells[cellIndex]
      newCells[cellIndex] = newCells[cellIndex + 1]
      newCells[cellIndex + 1] = temp
      
      setNotebook({
        ...notebook,
        cells: newCells
      })
    }
  }

  // Update cell content
  const updateCellContent = (cellId: string, content: string) => {
    if (!notebook) return

    const newCells = notebook.cells.map(cell => 
      cell.id === cellId ? { ...cell, content } : cell
    )

    setNotebook({
      ...notebook,
      cells: newCells
    })
  }

  // Update cell type
  const updateCellType = (cellId: string, type: 'markdown' | 'code' | 'text') => {
    if (!notebook) return

    const newCells = notebook.cells.map(cell => 
      cell.id === cellId ? { 
        ...cell, 
        type,
        metadata: {
          ...cell.metadata,
          language: type === 'code' ? 'javascript' : type
        }
      } : cell
    )

    setNotebook({
      ...notebook,
      cells: newCells
    })
  }

  // Update notebook title
  const updateTitle = (title: string) => {
    if (!notebook) return
    setNotebook({ ...notebook, title })
  }

  // Render cell content based on type
  const renderCellContent = (cell: Cell) => {
    if (cell.type === 'markdown') {
      return (
        <div className="prose max-w-none">
          <Textarea
            value={cell.content}
            onChange={(e) => updateCellContent(cell.id, e.target.value)}
            placeholder="Type markdown here..."
            className="min-h-[100px] border-0 resize-none focus:ring-0 p-0 bg-transparent"
          />
        </div>
      )
    } else if (cell.type === 'code') {
      return (
        <div className="font-mono">
          <Textarea
            value={cell.content}
            onChange={(e) => updateCellContent(cell.id, e.target.value)}
            placeholder="Write your code here..."
            className="min-h-[100px] border-0 resize-none focus:ring-0 p-0 bg-gray-50 font-mono"
          />
        </div>
      )
    } else {
      return (
        <Textarea
          value={cell.content}
          onChange={(e) => updateCellContent(cell.id, e.target.value)}
          placeholder="Type text here..."
          className="min-h-[100px] border-0 resize-none focus:ring-0 p-0 bg-transparent"
        />
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading notebook...</div>
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">Failed to load notebook</div>
        </div>
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
            value={notebook.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-xl font-bold border-0 focus-visible:ring-0 p-0 h-auto bg-transparent max-w-[200px] md:max-w-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isSaving && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </div>
          )}
          {lastSaved && !isSaving && (
            <div className="text-sm text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
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
                value="notes"
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 h-full"
              >
                Notebook
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
        {/* Notebook area */}
        {(!isMobile || activeTab === "notes") && (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => addCell('markdown')}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Markdown
                </Button>
                <Button
                  onClick={() => addCell('code')}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Code
                </Button>
                <Button
                  onClick={() => addCell('text')}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Text
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {notebook.cells.length} cells
              </div>
            </div>

            {/* Cells */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {notebook.cells.map((cell, index) => (
                <div
                  key={cell.id}
                  className={`border rounded-lg ${
                    activeCellId === cell.id ? 'border-indigo-500 shadow-md' : 'border-gray-200'
                  }`}
                  onClick={() => setActiveCellId(cell.id)}
                >
                  {/* Cell header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Select
                        value={cell.type}
                        onValueChange={(value: 'markdown' | 'code' | 'text') => updateCellType(cell.id, value)}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-gray-500">Cell {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {cell.type === 'code' && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => moveCellUp(cell.id)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => moveCellDown(cell.id)}
                        disabled={index === notebook.cells.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => deleteCell(cell.id)}
                        disabled={notebook.cells.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Cell content */}
                  <div className="p-4">
                    {renderCellContent(cell)}
                  </div>

                  {/* Cell outputs (for code cells) */}
                  {cell.type === 'code' && cell.outputs && cell.outputs.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="text-xs text-gray-500 mb-2">Output:</div>
                      <pre className="text-sm bg-white p-3 rounded border">
                        {JSON.stringify(cell.outputs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              {/* Add cell button */}
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => addCell('markdown')}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cell
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant sidebar */}
        {(!isMobile || activeTab === "ai-chat") && (
          <div className="w-full md:w-80 border-l border-gray-200 bg-white flex flex-col">
            <NotebookChatPanel notebookId={notebookId} />
          </div>
        )}
      </div>
    </div>
  )
}
