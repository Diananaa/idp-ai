"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Trash, FileText, Image, File, Clock, Calendar, HardDrive, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"

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

export default function ProcessingJobDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [job, setJob] = useState<ProcessingJobDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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
        const jobDetail: ProcessingJobDetail = await response.json()
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
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {job.files.map((file) => {
              const isExpanded = expandedFiles.has(file.id)
              const hasOCRResult = !!file.OCRResult
              const normalizedPath = file.filePath
                ? `/${file.filePath.replace(/^\/+/, "").replace(/\\/g, "/")}`
                : null
              
              return (
                <div
                  key={file.id}
                  className="group bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 border border-slate-600 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
                >
                  {/* File Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 p-3 bg-slate-600 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base mb-2 truncate group-hover:text-violet-300 transition-colors">
                        {file.fileName}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>{formatFileSize(file.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <File className="w-3.5 h-3.5" />
                          <span>{file.fileType?.split('/').pop() ?? "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
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
                      {hasOCRResult && (
                        <button
                          type="button"
                          onClick={() => toggleFileExpansion(file.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-violet-400 hover:text-white"
                          aria-expanded={isExpanded}
                          aria-controls={`ocr-panel-${file.id}`}
                        >
                          {isExpanded ? 'Sembunyikan OCR' : 'Lihat OCR'}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* File Metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created: {formatDate(file.createdAt)}</span>
                  </div>

                  {normalizedPath && (
                    <div className="mb-4">
                      <Link
                        href={normalizedPath}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-white font-medium transition-colors"
                      >
                        View file
                        <FileText className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {/* OCR Result Section */}
                  {hasOCRResult && isExpanded && (
                    <div
                      id={`ocr-panel-${file.id}`}
                      className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <p className="text-sm font-medium text-slate-200 mb-3">OCR Result</p>
                      <pre className="text-xs text-slate-300 overflow-x-auto max-h-80 font-mono whitespace-pre-wrap">
                        {formatOcrDisplay(file.OCRResult)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
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

