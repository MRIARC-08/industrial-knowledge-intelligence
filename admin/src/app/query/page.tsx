// admin/src/app/query/page.tsx
'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Send, Bot, User, FileText, AlertCircle } from 'lucide-react'
import { Card, PageHeader } from '@/components'
import { confidenceLabel, cn } from '@/lib/utils'
import { QueryResponse } from '../../../shared/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: QueryResponse
  timestamp: Date
}

function QueryInterface() {
  const searchParams = useSearchParams()
  const defaultEquipment = searchParams.get('equipment') ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [equipment, setEquipment] = useState(defaultEquipment)
  const [role, setRole] = useState<'engineer' | 'technician' | 'manager'>('engineer')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const queryMutation = useMutation({
    mutationFn: api.query,
    onSuccess: (data, variables) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.answer,
          response: data,
          timestamp: new Date(),
        }
      ])
    },
    onError: (err: Error) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${err.message}`,
          timestamp: new Date(),
        }
      ])
    },
  })

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed || queryMutation.isPending) return

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }
    ])
    setInput('')

    // Send to API
    queryMutation.mutate({
      query: trimmed,
      user_id: 'admin_user',
      user_role: role,
      equipment_context: equipment || undefined,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <PageHeader
        title="Knowledge Query"
        subtitle="Ask anything about your plant — powered by AI agents"
      />

      {/* Context controls */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Equipment Context</label>
          <input
            type="text"
            placeholder="e.g. P-101A (optional)"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 w-48"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="engineer">Engineer</option>
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col min-h-0" padding="sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Bot className="w-12 h-12 text-blue-400 mb-4" />
              <p className="text-gray-300 font-medium mb-2">Industrial Knowledge Assistant</p>
              <p className="text-gray-500 text-sm max-w-sm">
                Ask about equipment history, maintenance procedures, compliance requirements, or operational guidance.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6 max-w-md">
                {[
                  'What caused P-101A to fail last time?',
                  'Is V-301 compliant with OISD-118?',
                  'What are bearing replacement intervals?',
                  'Show compliance gaps for CDU unit',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}

              <div className={cn(
                'max-w-2xl rounded-xl',
                msg.role === 'user'
                  ? 'bg-blue-600 px-4 py-3'
                  : 'bg-gray-800/80 border border-gray-700/50 px-4 py-4'
              )}>
                <p className={cn(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user' ? 'text-white' : 'text-gray-300'
                )}>
                  {msg.content}
                </p>

                {/* Assistant metadata */}
                {msg.role === 'assistant' && msg.response && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-3">
                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden max-w-24">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${msg.response.confidence * 100}%` }}
                        />
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        confidenceLabel(msg.response.confidence).color
                      )}>
                        {(msg.response.confidence * 100).toFixed(0)}% {confidenceLabel(msg.response.confidence).label}
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        {msg.response.response_time_ms}ms
                      </span>
                    </div>

                    {/* Sources */}
                    {msg.response.sources.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Sources:</p>
                        <div className="space-y-1">
                          {msg.response.sources.slice(0, 3).map((src, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <FileText className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-blue-400">{src.doc_id}</span>
                                <span className="text-gray-500 ml-1">
                                  (score: {src.score.toFixed(2)})
                                </span>
                                {src.equipment_tags.length > 0 && (
                                  <span className="text-gray-600 ml-1">
                                    · {src.equipment_tags.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {queryMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about equipment, procedures, compliance, incidents... (Enter to send)"
              rows={2}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || queryMutation.isPending}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-white transition-colors self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function QueryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueryInterface />
    </Suspense>
  )
}
