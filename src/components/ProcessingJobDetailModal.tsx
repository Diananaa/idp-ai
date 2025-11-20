"use client"

import { X } from "lucide-react"

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

interface ProcessingJobDetailModalProps {
  job: ProcessingJobDetail | null
  isLoading: boolean
  onClose: () => void
}

export default function ProcessingJobDetailModal({
  job,
  isLoading,
  onClose,
}: ProcessingJobDetailModalProps) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50" onClick={onClose}>
      <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-white">Processing Job Details</h3>
          <button
            className="btn btn-sm btn-circle bg-slate-700 hover:bg-slate-600 text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="text-white mt-4">Loading job details...</p>
          </div>
        ) : !job ? (
          <div className="text-center py-8">
            <p className="text-red-400">Failed to load job details</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Job ID</p>
                  <p className="text-white font-medium">#{job.id}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
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
                  <p className="text-slate-400">Document Type</p>
                  <p className="text-white font-medium">{job.documentType?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Model</p>
                  <p className="text-white font-medium">{job.model?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Created At</p>
                  <p className="text-white font-medium">{formatDate(job.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Updated At</p>
                  <p className="text-white font-medium">{formatDate(job.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Files ({job.files.length})</h4>
              <div className="space-y-3">
                {job.files.length === 0 ? (
                  <p className="text-slate-400 text-sm">No files associated with this job</p>
                ) : (
                  job.files.map((file) => (
                    <div key={file.id} className="bg-slate-600 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{file.fileName}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {formatFileSize(file.fileSize)} | {file.fileType ?? "Unknown type"}
                          </p>
                        </div>
                        <span className={`badge badge-sm ${
                          file.status === 'COMPLETED' ? 'badge-success' :
                          file.status === 'PROCESSING' ? 'badge-warning' :
                          file.status === 'FAILED' ? 'badge-error' :
                          'badge-info'
                        }`}>
                          {file.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2">
                        <div>
                          <span>Process Time: </span>
                          <span className="text-white">{file.processTime}ms</span>
                        </div>
                        <div>
                          <span>Created: </span>
                          <span className="text-white">{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                      {file.OCRResult && (
                        <div className="mt-3 pt-3 border-t border-slate-500">
                          <p className="text-slate-400 text-xs mb-1">OCR Result:</p>
                          <pre className="bg-slate-800 p-2 rounded text-xs text-white overflow-x-auto">
                            {JSON.stringify(parseJsonSafely(file.OCRResult), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Result JSON */}
            {job.resultJson && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Processing Result</h4>
                <pre className="bg-slate-800 p-3 rounded text-xs text-white overflow-x-auto max-h-60">
                  {JSON.stringify(parseJsonSafely(job.resultJson), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="modal-action mt-6">
          <button className="btn bg-slate-600 hover:bg-slate-500 text-white" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

