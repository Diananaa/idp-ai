"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  ArrowLeft,
  Trash,
  FileText,
  Image,
  File,
  Clock,
  Calendar,
  HardDrive,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Edit2,
  Save,
  X,
} from "lucide-react"

interface ProcessingJobFile {
  id: number
  fileName: string
  filePath?: string | null
  fileSize?: number | null
  fileType?: string | null
  status: string
  processTime: number
  OCRResult?: string | null
  createdAt: string
}

interface DocumentType {
  id: number
  name: string
}

interface Model {
  id: number
  name: string
}

interface ProcessingJobDetail {
  id: number
  status: string
  resultJson?: string | null
  documentType: DocumentType | null
  model: Model | null
  createdAt: string
  updatedAt: string
  files: ProcessingJobFile[]
}

interface OCRFieldValue {
  value: string | number
  currency?: string
  confidence?: number
  [key: string]: any
}

interface OCRFieldEntry {
  name: string
  value: OCRFieldValue
}

interface OCRFormData {
  meta: {
    documentType: string
    model: string
    processedAt: string
  }
  fields: OCRFieldEntry[]
}

interface FieldFormItem {
  key: string
  value: string
  currency?: string
  confidence?: string
}

interface OCREditFormProps {
  file: ProcessingJobFile
  job: ProcessingJobDetail
  onCancel: () => void
  onSubmit: (data: OCRFormData) => void
  isSubmitting: boolean
}

function OCREditForm({ file, job, onCancel, onSubmit, isSubmitting }: OCREditFormProps) {
  const parseOCRFields = (ocrString?: string | null): FieldFormItem[] => {
    if (!ocrString) return []
    try {
      const parsed = JSON.parse(ocrString)
      const rawFields = parsed.fields

      if (Array.isArray(rawFields)) {
        return rawFields.map((field: any) => {
          const valuePayload = field?.value ?? field
          const rawValue = valuePayload?.value ?? valuePayload ?? ''
          return {
            key: String(field?.name ?? field?.key ?? ''),
            value: rawValue !== undefined && rawValue !== null ? String(rawValue) : '',
            currency: valuePayload?.currency ? String(valuePayload.currency) : '',
            confidence:
              valuePayload?.confidence !== undefined && valuePayload?.confidence !== null
                ? String(valuePayload.confidence)
                : '',
          }
        })
      }

      if (rawFields && typeof rawFields === 'object') {
        return Object.entries(rawFields).map(([key, value]: [string, any]) => {
          const valuePayload = value?.value !== undefined ? value : { value }
          const rawValue = valuePayload?.value ?? ''
          return {
            key,
            value: rawValue !== undefined && rawValue !== null ? String(rawValue) : '',
            currency: valuePayload?.currency ? String(valuePayload.currency) : '',
            confidence:
              valuePayload?.confidence !== undefined && valuePayload?.confidence !== null
                ? String(valuePayload.confidence)
                : '',
          }
        })
      }
    } catch {
      // ignore parsing errors and fall back to empty array
    }
    return []
  }

  const existingFields = parseOCRFields(file.OCRResult)

  const [fields, setFields] = useState<FieldFormItem[]>(
    existingFields.length > 0 ? existingFields : [{ key: '', value: '', currency: '', confidence: '' }]
  )

  const addField = () => {
    setFields([...fields, { key: '', value: '', currency: '', confidence: '' }])
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const updateField = (index: number, field: Partial<FieldFormItem>) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], ...field }
    setFields(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const formattedFields = fields
      .map((field) => ({
        key: field.key?.trim(),
        value: field.value,
        currency: field.currency?.trim(),
        confidence: field.confidence?.trim(),
      }))
      .filter((field) => field.key)
      .map((field) => {
        const confidenceNumber =
          field.confidence && !Number.isNaN(Number(field.confidence))
            ? Number(field.confidence)
            : undefined

        return {
          name: field.key as string,
          value: {
            value: field.value,
            ...(field.currency ? { currency: field.currency } : {}),
            ...(confidenceNumber !== undefined ? { confidence: confidenceNumber } : {}),
          },
        }
      })

    // Get existing meta from OCR result
    let meta = {
      documentType: job.documentType?.name || 'KTP',
      model: job.model?.name || 'Tesseract',
      processedAt: new Date().toISOString(),
    }

    try {
      const parsed = JSON.parse(file.OCRResult || '{}')
      if (parsed.meta) {
        meta = {
          ...parsed.meta,
          processedAt: new Date().toISOString(),
        }
      }
    } catch {}

    const formattedData: OCRFormData = {
      meta,
      fields: formattedFields,
    }

    onSubmit(formattedData)
  }

  return (
    <div
      className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4 max-h-[600px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-300">Fields</h4>
          <button
            type="button"
            onClick={addField}
            className="btn btn-xs bg-violet-600 hover:bg-violet-700 text-white"
          >
            + Add Field
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-2"
            >
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Field Name</label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateField(index, { key: e.target.value })}
                    placeholder="e.g., documentNumber"
                    className="input input-sm w-full bg-slate-700 text-white border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Value</label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(index, { value: e.target.value })}
                    placeholder="Field value"
                    className="input input-sm w-full bg-slate-700 text-white border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Currency (optional)</label>
                  <input
                    type="text"
                    value={field.currency}
                    onChange={(e) => updateField(index, { currency: e.target.value })}
                    placeholder="IDR"
                    className="input input-sm w-full bg-slate-700 text-white border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Confidence (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={field.confidence}
                    onChange={(e) => updateField(index, { confidence: e.target.value })}
                    placeholder="0.95"
                    className="input input-sm w-full bg-slate-700 text-white border-slate-600"
                  />
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="btn btn-xs btn-error text-white w-full"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove Field
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1" />
                Save
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-sm bg-slate-600 hover:bg-slate-500 text-white"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProcessingJobDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [job, setJob] = useState<ProcessingJobDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingFiles, setEditingFiles] = useState<Set<number>>(new Set())
  const [updatingFiles, setUpdatingFiles] = useState<Set<number>>(new Set())
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    const fetchJobDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/processing-jobs/${id}`)
        
      
        if (!response.ok) {
          throw new Error("Failed to fetch job details")
        }
        console.log('aaa',response)
        const jobDetail: ProcessingJobDetail = await response.json()
        console.log('bbb',jobDetail)
        setJob(jobDetail)
      } catch (err) {
        console.error("Error fetching job detail:", err)
        setError(err instanceof Error ? err.message : "Failed to load job details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetail()
  }, [id])

  // Auto-select first file when job is loaded
  useEffect(() => {
    if (job && job.files && job.files.length > 0 && selectedFileId === null) {
      setSelectedFileId(job.files[0].id)
      if (job.files[0].OCRResult) {
        setExpandedFiles(new Set([job.files[0].id]))
      }
    }
  }, [job, selectedFileId])

  const handleDelete = async () => {
    if (!job) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/processing-jobs/${job.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete processing job")
      }
      // Redirect to documents list
      router.push("/documents")
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error("Error deleting job:", err)
      alert(err instanceof Error ? err.message : "Failed to delete processing job")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const parseJsonSafely = (jsonString?: string | null) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

  const formatOcrDisplay = (ocrString?: string | null) => {
    if (!ocrString) return ''
    const parsed = parseJsonSafely(ocrString)
    if (parsed) {
      return JSON.stringify(parsed, null, 2)
    }
    return ocrString
  }

  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return <File className="w-5 h-5" />
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return <Image className="w-5 h-5 text-blue-400" />
    }
    return <File className="w-5 h-5 text-slate-400" />
  }

  const toggleFileExpansion = (fileId: number) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
        // Also close edit mode when closing expansion
        setEditingFiles(prevEdit => {
          const newEditSet = new Set(prevEdit)
          newEditSet.delete(fileId)
          return newEditSet
        })
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const toggleEditMode = (fileId: number) => {
    setEditingFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const handleUpdateOCR = async (fileId: number, ocrData: OCRFormData) => {
    setUpdatingFiles(prev => new Set(prev).add(fileId))
    try {
      // Convert datetime-local to ISO string if needed
      const processedAt = ocrData.meta.processedAt.includes('T')
        ? ocrData.meta.processedAt
        : new Date(ocrData.meta.processedAt).toISOString()

      const formattedData = {
        ...ocrData,
        meta: {
          ...ocrData.meta,
          processedAt,
        },
      }

      const response = await fetch(`/api/files/${fileId}/ocr-result`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrResult: formattedData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update OCR result')
      }

      // Refresh job data
      const jobResponse = await fetch(`/api/processing-jobs/${id}`)
      if (jobResponse.ok) {
        const updatedJob: ProcessingJobDetail = await jobResponse.json()
        setJob(updatedJob)
      }

      // Close edit mode
      setEditingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })

      alert('OCR result updated successfully!')
    } catch (error) {
      console.error('Error updating OCR result:', error)
      alert(error instanceof Error ? error.message : 'Failed to update OCR result')
    } finally {
      setUpdatingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-white mt-4">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || "Job not found"}</p>
          <button
            className="btn bg-slate-600 hover:bg-slate-500 text-white"
            onClick={() => router.push("/documents")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="btn btn-sm bg-slate-600 hover:bg-slate-500 text-white"
            onClick={() => router.push("/documents")}
            aria-label="Back to documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Processing Job Details</h1>
          </div>
        </div>
        <button
          className="btn bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Deleting...
            </>
          ) : (
            <>
              <Trash className="w-4 h-4 mr-2" />
              Delete Job
            </>
          )}
        </button>
      </div>

      {/* Basic Information Card */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <p className="text-white font-medium">
              <span className={`badge ${
                job.status === 'COMPLETED' ? 'badge-success' :
                job.status === 'PROCESSING' ? 'badge-warning' :
                job.status === 'FAILED' ? 'badge-error' :
                'badge-info'
              }`}>
                {job.status}
              </span>
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Document Type</p>
            <p className="text-white font-medium">{job.documentType?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Model</p>
            <p className="text-white font-medium">{job.model?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Created At</p>
            <p className="text-white font-medium">{formatDate(job.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Updated At</p>
            <p className="text-white font-medium">{formatDate(job.updatedAt)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Total Files</p>
            <p className="text-white font-medium">{job.files.length} file(s)</p>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" />
            Files
            <span className="ml-2 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm font-semibold">
              {job.files.length}
            </span>
          </h2>
        </div>
        {job.files.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No files associated with this job</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_600px] gap-6 h-[calc(100vh-400px)] min-h-[600px]">
            {/* Left Side: Preview + Horizontal Image List */}
            <div className="flex flex-col min-h-0">
              {/* Preview Image - Top */}
              {selectedFileId ? (() => {
                const file = job.files.find(f => f.id === selectedFileId)
                if (!file) return null
                
                const normalizedPath = file.filePath
                  ? `/${file.filePath.replace(/^\/+/, "").replace(/\\/g, "/")}`
                  : null

                return (
                  <div className="mb-4 flex-1 min-h-0 flex flex-col">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-slate-600 flex-1 flex items-center justify-center min-h-[400px]">
                      {normalizedPath ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={normalizedPath}
                            alt={file.fileName}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = document.createElement('div')
                                fallback.className = 'w-full h-full bg-slate-700 rounded-lg flex items-center justify-center'
                                fallback.innerHTML = '<div class="text-slate-400">Image not available</div>'
                                parent.appendChild(fallback)
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-slate-700 rounded-lg flex items-center justify-center">
                          <File className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })() : (
                <div className="mb-4 flex-1 min-h-0 flex flex-col">
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-slate-600 flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <Image className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">Select an image to view</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Horizontal Image List - Below Preview */}
              <div className="border-t border-slate-700 pt-4 flex-shrink-0 max-w-[500px] overflow-x-auto">
                <h3 className="text-sm font-semibold text-white mb-3">Image List ({job.files.length})</h3>
                <div 
                  className="overflow-x-auto pb-2"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#475569 #1e293b'
                  }}
                >
                  <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
                    {job.files.map((listFile) => {
                      const listNormalizedPath = listFile.filePath
                        ? `/${listFile.filePath.replace(/^\/+/, "").replace(/\\/g, "/")}`
                        : null
                      const isSelected = selectedFileId === listFile.id
                      
                      return (
                        <button
                          key={listFile.id}
                          onClick={() => {
                            setSelectedFileId(listFile.id)
                            if (!expandedFiles.has(listFile.id) && listFile.OCRResult) {
                              setExpandedFiles(prev => new Set(prev).add(listFile.id))
                            }
                          }}
                          className={`flex-shrink-0 w-32 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                              : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
                          }`}
                        >
                          {listNormalizedPath ? (
                            <div className="p-2">
                              <img
                                src={listNormalizedPath}
                                alt={listFile.fileName}
                                className="w-full h-24 rounded-lg object-cover mb-2"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const fallback = document.createElement('div')
                                    fallback.className = 'w-full h-24 bg-slate-600 rounded-lg flex items-center justify-center mb-2'
                                    fallback.innerHTML = '<div class="text-slate-400 text-xs">N/A</div>'
                                    parent.insertBefore(fallback, target.nextSibling)
                                  }
                                }}
                              />
                              <p className="text-white text-xs font-medium truncate px-1">
                                {listFile.fileName}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2">
                              <div className="w-full h-24 bg-slate-600 rounded-lg flex items-center justify-center mb-2">
                                <File className="w-6 h-6 text-slate-400" />
                              </div>
                              <p className="text-white text-xs font-medium truncate px-1">
                                {listFile.fileName}
                              </p>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: File Detail & OCR */}
            <div className="flex flex-col overflow-hidden min-h-0 lg:border-l border-slate-700 lg:pl-6">
              {selectedFileId ? (() => {
                const file = job.files.find(f => f.id === selectedFileId)
                if (!file) return null
                
                const isExpanded = expandedFiles.has(file.id)
                const hasOCRResult = !!file.OCRResult

                return (
                  <div className="flex-1 overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#475569 #1e293b'
                  }}>
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600">
                      {/* File Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 p-3 bg-slate-600 rounded-lg">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg mb-3 truncate">
                            {file.fileName}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <HardDrive className="w-4 h-4" />
                              <span>{formatFileSize(file.fileSize)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <File className="w-4 h-4" />
                              <span>{file.fileType?.split('/').pop() ?? "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{file.processTime}ms</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`badge badge-sm ${
                            file.status === 'COMPLETED' ? 'badge-success' :
                            file.status === 'PROCESSING' ? 'badge-warning' :
                            file.status === 'FAILED' ? 'badge-error' :
                            'badge-info'
                          }`}>
                            {file.status}
                          </span>
                        </div>
                      </div>

                      {/* File Metadata */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 pb-4 border-b border-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(file.createdAt)}</span>
                      </div>

                      {/* File Link */}
                      {file.filePath && (
                        <div className="mb-6">
                          <Link
                            href={`/${file.filePath.replace(/^\/+/, "").replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-white font-medium transition-colors"
                          >
                            Open full image
                            <FileText className="w-4 h-4" />
                          </Link>
                        </div>
                      )}

                      {/* OCR Result Section */}
                      {hasOCRResult && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-white">OCR Result</p>
                            <div className="flex gap-2">
                              {!editingFiles.has(file.id) && (
                                <button
                                  type="button"
                                  onClick={() => toggleEditMode(file.id)}
                                  className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleFileExpansion(file.id)}
                                className="btn btn-sm bg-slate-600 hover:bg-slate-500 text-white"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Hide OCR
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    Show OCR
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4">
                              {editingFiles.has(file.id) ? (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <OCREditForm
                                    file={file}
                                    job={job}
                                    onCancel={() => toggleEditMode(file.id)}
                                    onSubmit={(data) => handleUpdateOCR(file.id, data)}
                                    isSubmitting={updatingFiles.has(file.id)}
                                  />
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                  <pre className="text-sm text-slate-300 overflow-x-auto max-h-[500px] font-mono whitespace-pre-wrap overflow-y-auto">
                                    {formatOcrDisplay(file.OCRResult)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!hasOCRResult && (
                        <div className="text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700">
                          <p className="text-slate-400">No OCR result available for this file</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })() : (
                <div className="flex items-center justify-center h-full bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Select an image to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Processing Result Section */}
      {job.resultJson && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Processing Result</h2>
          <pre className="bg-slate-900 p-4 rounded text-sm text-white overflow-x-auto max-h-96">
            {JSON.stringify(parseJsonSafely(job.resultJson), null, 2)}
          </pre>
        </div>
      )}
      {isDeleteModalOpen && job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
                <AlertTriangle size={28} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Delete Job</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Confirm removal</h2>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-300">
              This will permanently delete job{" "}
              <span className="font-semibold text-white">
                #{job.id} {job.documentType?.name ? `• ${job.documentType.name}` : ""}
              </span>{" "}
              and {job.files.length || "all"} associated file(s). This cannot be undone.
            </p>
            {job.files.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Files snapshot</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.files.slice(0, 3).map((file) => (
                    <span key={file.id} className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-100">
                      {file.fileName}
                    </span>
                  ))}
                  {job.files.length > 3 && (
                    <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-100">
                      +{job.files.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="btn flex-1 border-none bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn flex-1 border border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" /> Delete forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


