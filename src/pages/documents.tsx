"use client"

import { useEffect, useMemo, useState } from "react"
import { Trash, Eye } from "lucide-react"
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
    if (!confirm("Are you sure you want to delete this processing job? This action cannot be undone.")) {
      return
    }

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
          <td>{job.files?.[0]?.fileName ?? "-"}</td>
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
              className="btn btn-sm bg-slate-600 hover:bg-red-950"
              aria-label="Delete job"
              onClick={() => handleDelete(job.id)}
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
    <div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>No.</th>
              <th>File Name</th>
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
    </div>
  )
}