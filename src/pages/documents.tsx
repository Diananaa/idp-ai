"use client"

import { useEffect, useMemo, useState } from "react"
import { Trash, Eye, AlertTriangle } from "lucide-react"
import { useRouter } from "next/router"

interface JobFileSummary {
  id: number
  fileName: string
  fileSize: number | null
  fileType?: string | null
}

interface ProcessingJobListItem {
  id: number
  status: string
  documentType: string | null
  model: string | null
  createdAt: string
  updatedAt: string
  files?: JobFileSummary[]
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse {
  data: ProcessingJobListItem[]
  pagination: PaginationInfo
}

export default function DocumentsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<ProcessingJobListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [pendingDeleteJob, setPendingDeleteJob] = useState<ProcessingJobListItem | null>(null)

  const fetchJobs = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/processing-jobs-list?page=${page}&limit=10`)
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to fetch processing jobs")
      }
      const result: ApiResponse = await response.json()
      setJobs(
        result.data.map((job) => ({
          ...job,
          files: job.files ?? [],
        }))
      )
      setPagination(result.pagination)
    } catch (err) {
      console.error("Error fetching jobs list:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewDetail = (jobId: number) => {
    router.push(`/documents/${jobId}`)
  }

  const handleDelete = async (jobId: number) => {
    setIsDeleting(jobId)
    try {
      const response = await fetch(`/api/processing-jobs/${jobId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete processing job")
      }
      // Refresh the list
      await fetchJobs(currentPage)
      setPendingDeleteJob(null)
    } catch (err) {
      console.error("Error deleting job:", err)
      alert(err instanceof Error ? err.message : "Failed to delete processing job")
    } finally {
      setIsDeleting(null)
    }
  }


  const tableBody = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-6">
            Loading...
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7} className="text-center text-red-400 py-6">
            {error}
          </td>
        </tr>
      )
    }

    if (!jobs.length) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-6 text-muted-foreground">
            No processing jobs yet
          </td>
        </tr>
      )
    }

    return jobs.map((job, index) => {
      const rowNumber = pagination ? (pagination.page - 1) * pagination.limit + index + 1 : index + 1
      return (
        <tr key={job.id} className="hover:bg-slate-800">
          <th>{rowNumber}</th>
          <td>
            {job.files && job.files.length > 0 ? (
              <div className="max-h-28 overflow-y-auto pr-2 flex flex-col gap-2">
                {job.files.map((file) => (
                  <span
                    key={file.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm"
                    title={`${file.fileName}${file.fileSize ? ` • ${(file.fileSize / 1024).toFixed(1)} KB` : ""}`}
                  >
                    <span className="truncate max-w-[180px]" aria-label="File name">
                      {file.fileName}
                    </span>
                    {file.fileType && (
                      <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] uppercase">
                        {file.fileType}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">No files</span>
            )}
          </td>
          <td>{job.documentType ?? "-"}</td>
          <td>{job.model ?? "-"}</td>
          <td>{job.status}</td>
          <td>{new Date(job.createdAt).toLocaleString()}</td>
          <td className="flex gap-3">
            <button
              className="btn btn-sm bg-slate-600 hover:bg-violet-950"
              aria-label="Preview result"
              onClick={() => handleViewDetail(job.id)}
            >
              <Eye />
            </button>
            <button
              className="btn btn-sm bg-slate-600 hover:bg-red-600 hover:text-white transition-colors"
              aria-label="Delete job"
              onClick={() => setPendingDeleteJob(job)}
              disabled={isDeleting === job.id}
            >
              {isDeleting === job.id ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Trash />
              )}
            </button>
          </td>
        </tr>
      )
    })
  }, [error, isLoading, jobs, pagination])

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Files</th>
              <th>Type Document</th>
              <th>Model</th>
              <th>Status</th>
              <th>Create At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </table>
        {pagination && pagination.totalPages > 1 && (() => {
          // Show max 7 pages at a time
          const maxVisiblePages = 7
          const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
          const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)
          const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
          
          return (
            <div className="flex justify-end px-[60px] mt-6">
              <div className="join">
                {pagination.hasPrevPage && (
                  <button
                    className="join-item btn btn-square bg-slate-800 hover:bg-purple-900"
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    «
                  </button>
                )}
                {visiblePages.map((pageNum) => (
                  <input
                    key={pageNum}
                    className={`join-item btn btn-square ${
                      currentPage === pageNum
                        ? "bg-purple-900"
                        : "bg-slate-800 hover:bg-purple-900"
                    }`}
                    type="radio"
                    name="options"
                    aria-label={pageNum.toString()}
                    checked={currentPage === pageNum}
                    onChange={() => handlePageChange(pageNum)}
                  />
                ))}
                {pagination.hasNextPage && (
                  <button
                    className="join-item btn btn-square bg-slate-800 hover:bg-purple-900"
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                  >
                    »
                  </button>
                )}
              </div>
            </div>
          )
        })()}
      </div>
      {pendingDeleteJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
                <AlertTriangle size={28} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Delete Job</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Are you absolutely sure?</h2>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-300">
              This action will permanently remove{" "}
              <span className="font-semibold text-white">
                #{pendingDeleteJob.id} {pendingDeleteJob.documentType ? `• ${pendingDeleteJob.documentType}` : ""}
              </span>{" "}
              along with all processed files. This cannot be undone.
            </p>
            {pendingDeleteJob.files && pendingDeleteJob.files.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Attached files</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingDeleteJob.files.slice(0, 3).map((file) => (
                    <span key={file.id} className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-100">
                      {file.fileName}
                    </span>
                  ))}
                  {pendingDeleteJob.files.length > 3 && (
                    <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-100">
                      +{pendingDeleteJob.files.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="btn flex-1 border-none bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => setPendingDeleteJob(null)}
                disabled={isDeleting === pendingDeleteJob.id}
              >
                Cancel
              </button>
              <button
                className="btn flex-1 border border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                onClick={() => handleDelete(pendingDeleteJob.id)}
                disabled={isDeleting === pendingDeleteJob.id}
              >
                {isDeleting === pendingDeleteJob.id ? (
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