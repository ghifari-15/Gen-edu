import mongoose from 'mongoose'

interface IChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface IChatThread {
  threadId: string
  userId: string
  messages: IChatMessage[]
  model: 'claude-sonnet' | 'deepseek-reasoning'
  title?: string
  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema = new mongoose.Schema<IChatMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const ChatThreadSchema = new mongoose.Schema<IChatThread>({
  threadId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [ChatMessageSchema],
  model: {
    type: String,
    enum: ['claude-sonnet', 'deepseek-reasoning'],
    default: 'claude-sonnet'
  },
  title: {
    type: String,
    maxlength: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Create compound index for efficient queries
ChatThreadSchema.index({ userId: 1, updatedAt: -1 })
ChatThreadSchema.index({ threadId: 1, userId: 1 })

// Auto-generate title from first message if not provided
ChatThreadSchema.pre('save', function(next) {
  if (!this.title && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.role === 'user')
    if (firstUserMessage) {
      this.title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
  }
  this.updatedAt = new Date()
  next()
})

const ChatThread = mongoose.models.ChatThread || mongoose.model<IChatThread>('ChatThread', ChatThreadSchema)

export default ChatThread
export type { IChatThread, IChatMessage }
