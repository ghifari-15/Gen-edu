"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Search, 
  Trash2, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  Loader2,
  BookOpen,
  PlusCircle
} from 'lucide-react'

interface RAGResult {
  id: string
  content: string
  score: number
  source: string
  fileName?: string
  cellType?: string
  cellIndex?: number
}

interface RAGStats {
  totalCells: number
  totalPDFs: number
  totalTextDocuments: number
  totalChunks: number
  collectionExists: boolean
}

interface NotebookRAGPanelProps {
  notebookId: string
  isOpen?: boolean
  onClose?: () => void
}

export function NotebookRAGPanel({ notebookId, isOpen = true, onClose }: NotebookRAGPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RAGResult[]>([])
  const [textContent, setTextContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [stats, setStats] = useState<RAGStats | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }, [])

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/rag`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [notebookId])

  // Upload PDF files
  const handlePDFUpload = useCallback(async (files: FileList) => {
    setIsLoading(true)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/notebooks/${notebookId}/rag`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        showAlert('success', `Successfully uploaded ${data.data.documentsAdded} PDF files with ${data.data.chunksCreated} chunks`)
        loadStats()
      } else {
        showAlert('error', data.message || 'Upload failed')
      }
    } catch (error) {
      showAlert('error', 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }, [notebookId, showAlert, loadStats])

  // Add text content
  const handleAddText = useCallback(async () => {
    if (!textContent.trim()) {
      showAlert('error', 'Please enter some content')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/rag/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: textContent,
          fileName: fileName || 'text_input'
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert('success', `Successfully added text content with ${data.data.chunksCreated} chunks`)
        setTextContent('')
        setFileName('')
        loadStats()
      } else {
        showAlert('error', data.message || 'Failed to add text content')
      }
    } catch (error) {
      showAlert('error', 'Failed to add text: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [notebookId, textContent, fileName, showAlert, loadStats])

  // Search RAG collection
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      showAlert('error', 'Please enter a search query')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10,
          scoreThreshold: 0.3
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSearchResults(data.data.results)
        if (data.data.results.length === 0) {
          showAlert('error', 'No results found for your query')
        }
      } else {
        showAlert('error', data.message || 'Search failed')
        setSearchResults([])
      }
    } catch (error) {
      showAlert('error', 'Search failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [notebookId, searchQuery, showAlert])

  // Clear all RAG data
  const handleClearData = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all RAG data for this notebook? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/rag`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        showAlert('success', 'All RAG data cleared successfully')
        setSearchResults([])
        setStats(null)
        loadStats()
      } else {
        showAlert('error', data.message || 'Failed to clear data')
      }
    } catch (error) {
      showAlert('error', 'Failed to clear data: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [notebookId, showAlert, loadStats])

  // Load stats on mount
  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Notebook RAG System
          </CardTitle>
          <CardDescription>
            Upload PDFs, add text content, and search through your notebook's knowledge base
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Knowledge Base Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCells}</div>
                <div className="text-sm text-gray-600">Notebook Cells</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPDFs}</div>
                <div className="text-sm text-gray-600">PDF Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalTextDocuments}</div>
                <div className="text-sm text-gray-600">Text Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalChunks}</div>
                <div className="text-sm text-gray-600">Total Chunks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="add-content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-content">Add Content</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="add-content" className="space-y-4">
          {/* PDF Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload PDF Documents
              </CardTitle>
              <CardDescription>
                Upload PDF files to extract and index their content using OCR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => e.target.files && handlePDFUpload(e.target.files)}
                    disabled={isLoading}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload PDF files or drag and drop
                    </span>
                    <span className="text-xs text-gray-400">
                      Multiple PDFs supported
                    </span>
                  </label>
                </div>
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Text Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Add Text Content
              </CardTitle>
              <CardDescription>
                Add text content directly to the knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter file name (optional)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  disabled={isLoading}
                />
                <Textarea
                  placeholder="Enter your text content here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isLoading}
                  rows={6}
                />
                <Button
                  onClick={handleAddText}
                  disabled={isLoading || !textContent.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Content...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Text Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Knowledge Base
              </CardTitle>
              <CardDescription>
                Search through all indexed content in your notebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !searchQuery.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Search Results ({searchResults.length})</h4>
                    {searchResults.map((result) => (
                      <Card key={result.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{result.source}</Badge>
                                {result.fileName && (
                                  <Badge variant="outline">{result.fileName}</Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                  Score: {(result.score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {result.content}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Manage Knowledge Base
              </CardTitle>
              <CardDescription>
                Clear all indexed content and reset the knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will permanently delete all indexed content including PDFs, text documents, and notebook cells. This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleClearData}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing Data...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All RAG Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={loadStats}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
