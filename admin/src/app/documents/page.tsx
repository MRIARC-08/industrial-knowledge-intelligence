// admin/src/app/documents/page.tsx
'use client'
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner, Badge } from '@/components'
import { formatDate, cn } from '@/lib/utils'
import { DocumentStatus } from '@iki/shared'

const statusConfig: Record<DocumentStatus, {
  icon: React.ReactNode
  variant: 'success' | 'warning' | 'danger' | 'info'
  label: string
}> = {
  completed: {
    icon: <CheckCircle className="w-4 h-4 text-green-400" />,
    variant: 'success',
    label: 'Indexed'
  },
  processing: {
    icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
    variant: 'info',
    label: 'Processing'
  },
  failed: {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    variant: 'danger',
    label: 'Failed'
  },
}

export default function DocumentsPage() {
  const qc = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['documents', 'list'],
    queryFn: api.documents.list,
    refetchInterval: 10000,  // Poll for processing updates
  })

  const uploadMutation = useMutation({
    mutationFn: api.documents.upload,
    onSuccess: (result) => {
      setUploadProgress(`✅ ${result.name} uploaded — processing started`)
      qc.invalidateQueries({ queryKey: ['documents'] })
      setTimeout(() => setUploadProgress(null), 5000)
    },
    onError: (err: Error) => {
      setUploadProgress(`❌ Upload failed: ${err.message}`)
      setTimeout(() => setUploadProgress(null), 5000)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) {
      setUploadProgress('❌ Only PDF files are supported')
      return
    }
    setUploadProgress(`⏳ Uploading ${file.name}...`)
    uploadMutation.mutate(file)
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  // Separate processing docs for queue display
  const processing = (data?.documents ?? []).filter(d => d.status === 'processing')
  const rest = (data?.documents ?? []).filter(d => d.status !== 'processing')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Library"
        subtitle={`${data?.total ?? 0} documents indexed in knowledge base`}
      />

      {/* Upload Zone */}
      <Card>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-blue-500 bg-blue-500/5'
              : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            'w-10 h-10 mx-auto mb-3',
            isDragActive ? 'text-blue-400' : 'text-gray-600'
          )} />
          <p className="text-gray-300 font-medium mb-1">
            {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF documents'}
          </p>
          <p className="text-gray-500 text-sm">or click to browse files</p>
          <p className="text-gray-600 text-xs mt-2">Supported: PDF only · Max 50MB</p>
        </div>

        {/* Upload status message */}
        {uploadProgress && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
            {uploadProgress}
          </div>
        )}
      </Card>

      {/* Processing Queue */}
      {processing.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Processing Queue ({processing.length})
          </h2>
          <div className="space-y-2">
            {processing.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-blue-400/5 border border-blue-400/10 rounded-lg">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    Extracting text → NER → Chunking → Embedding → Graph update
                  </p>
                </div>
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Document List */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">All Documents</h2>
          <span className="text-xs text-gray-500">{data?.total ?? 0} total</span>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="divide-y divide-gray-800/50">
            {rest.map((doc) => {
              const config = statusConfig[doc.status]
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/30 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.type} · Uploaded {formatDate(doc.upload_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {config.icon}
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </div>
              )
            })}
            {rest.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500 text-sm">
                No documents yet — upload your first PDF above
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
