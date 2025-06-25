"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  FileText,
  Database,
  Brain,
  MessageSquare,
  Send
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  source: 'manual' | 'upload'
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface NewKnowledgeForm {
  title: string
  content: string
  category: string
  tags: string
}

export default function KnowledgeBaseManager() {
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false)
  const [isEditKnowledgeOpen, setIsEditKnowledgeOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [newKnowledge, setNewKnowledge] = useState<NewKnowledgeForm>({
    title: "",
    content: "",
    category: "",
    tags: ""
  })
  const [isUploading, setIsUploading] = useState(false)
  
  // RAG Chat states
  const [chatMessages, setChatMessages] = useState<{role: string, content: string, timestamp: string}[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchKnowledgeEntries()
  }, [])

  const fetchKnowledgeEntries = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-base', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setKnowledgeEntries(data.entries)
        }
      }
    } catch (error) {
      console.error('Failed to fetch knowledge entries:', error)
      toast({
        title: "Error",
        description: "Failed to load knowledge base entries",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddKnowledge = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-base/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newKnowledge,
          tags: newKnowledge.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setKnowledgeEntries([...knowledgeEntries, data.entry])
          
          // Add to RAG system
          try {
            await fetch('/api/rag/add-knowledge', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                knowledge: {
                  ...data.entry,
                  source: 'manual'
                }
              }),
              credentials: 'include'
            })
          } catch (ragError) {
            console.error('Failed to add to RAG system:', ragError)
            // Don't fail the main operation if RAG fails
          }
          
          setNewKnowledge({ title: "", content: "", category: "", tags: "" })
          setIsAddKnowledgeOpen(false)
          toast({
            title: "Success",
            description: "Knowledge entry added successfully and indexed for search"
          })
        }
      }
    } catch (error) {
      console.error('Failed to add knowledge entry:', error)
      toast({
        title: "Error",
        description: "Failed to add knowledge entry",
        variant: "destructive"
      })
    }
  }

  const handleEditKnowledge = async () => {
    if (!selectedEntry) return

    try {
      const response = await fetch(`/api/admin/knowledge-base/${selectedEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newKnowledge.title,
          content: newKnowledge.content,
          category: newKnowledge.category,
          tags: newKnowledge.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setKnowledgeEntries(knowledgeEntries.map(entry => 
            entry.id === selectedEntry.id ? data.entry : entry
          ))
          setIsEditKnowledgeOpen(false)
          setSelectedEntry(null)
          toast({
            title: "Success",
            description: "Knowledge entry updated successfully"
          })
        }
      }
    } catch (error) {
      console.error('Failed to update knowledge entry:', error)
      toast({
        title: "Error",
        description: "Failed to update knowledge entry",
        variant: "destructive"
      })
    }
  }

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return

    try {
      const response = await fetch(`/api/admin/knowledge-base/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setKnowledgeEntries(knowledgeEntries.filter(entry => entry.id !== id))
        toast({
          title: "Success",
          description: "Knowledge entry deleted successfully"
        })
      }
    } catch (error) {
      console.error('Failed to delete knowledge entry:', error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge entry",
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/knowledge-base/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setKnowledgeEntries([...knowledgeEntries, ...data.entries])
          
          // Add each uploaded entry to RAG system
          try {
            for (const entry of data.entries) {
              await fetch('/api/rag/add-knowledge', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  knowledge: {
                    ...entry,
                    source: 'upload'
                  }
                }),
                credentials: 'include'
              })
            }
          } catch (ragError) {
            console.error('Failed to add uploaded files to RAG system:', ragError)
            // Don't fail the main operation if RAG fails
          }
          
          toast({
            title: "Success",
            description: `Successfully uploaded and processed ${data.entries.length} entries and indexed for search`
          })
        }
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const openEditDialog = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry)
    setNewKnowledge({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tags: entry.tags.join(', ')
    })
    setIsEditKnowledgeOpen(true)
  }

  const filteredEntries = knowledgeEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const stats = {
    total: knowledgeEntries.length,
    manual: knowledgeEntries.filter(e => e.source === 'manual').length,
    uploaded: knowledgeEntries.filter(e => e.source === 'upload').length,
    categories: [...new Set(knowledgeEntries.map(e => e.category))].length
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)
    
    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: chatInput,
          limit: 5
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const assistantMessage = {
          role: 'assistant',
          content: data.answer || 'I couldn\'t find relevant information in the knowledge base.',
          timestamp: new Date().toISOString()
        }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching the knowledge base.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Manager</h1>
          <p className="text-gray-600 mt-1">Manage knowledge entries and test RAG capabilities</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Manage Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="rag-chat" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>RAG Chat Test</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
      {/* Management controls */}
      <div className="flex items-center space-x-3">
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
        <Dialog open={isAddKnowledgeOpen} onOpenChange={setIsAddKnowledgeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Knowledge Entry</DialogTitle>
              <DialogDescription>
                Add a new knowledge entry to enhance the AI's capabilities
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newKnowledge.title}
                  onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                  placeholder="Enter knowledge title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newKnowledge.category}
                  onChange={(e) => setNewKnowledge({...newKnowledge, category: e.target.value})}
                  placeholder="e.g., Mathematics, Science, History"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newKnowledge.tags}
                  onChange={(e) => setNewKnowledge({...newKnowledge, tags: e.target.value})}
                  placeholder="e.g., algebra, equations, formulas"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newKnowledge.content}
                  onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                  placeholder="Enter detailed knowledge content"
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddKnowledgeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddKnowledge}>Add Knowledge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Manual Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.manual}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uploaded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search knowledge entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Knowledge Entries ({filteredEntries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entry.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.source === 'manual' ? 'default' : 'secondary'}>
                        {entry.source}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKnowledge(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No knowledge entries found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* RAG Chat Tab */}
        <TabsContent value="rag-chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>RAG Chat Interface</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Test the RAG system by asking questions about the knowledge base
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      Start a conversation to test the RAG system.<br/>
                      Ask questions about the knowledge entries you've added.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border shadow-sm'
                          }`}>
                            <div className="text-sm">{msg.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start mt-4">
                      <div className="bg-white border shadow-sm rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center border-t pt-4 mt-4">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about the knowledge base..."
                    className="flex-1 mr-2"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      {/* Edit Dialog */}
      <Dialog open={isEditKnowledgeOpen} onOpenChange={setIsEditKnowledgeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Entry</DialogTitle>
            <DialogDescription>
              Update the knowledge entry information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={newKnowledge.title}
                onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                placeholder="Enter knowledge title"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={newKnowledge.category}
                onChange={(e) => setNewKnowledge({...newKnowledge, category: e.target.value})}
                placeholder="e.g., Mathematics, Science, History"
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={newKnowledge.tags}
                onChange={(e) => setNewKnowledge({...newKnowledge, tags: e.target.value})}
                placeholder="e.g., algebra, equations, formulas"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={newKnowledge.content}
                onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                placeholder="Enter detailed knowledge content"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditKnowledgeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditKnowledge}>Update Knowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Tabs>
    </div>
  )
}