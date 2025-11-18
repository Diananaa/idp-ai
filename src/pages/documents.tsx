"use client"

import { useEffect, useMemo, useState } from "react"
import { Trash, Eye } from "lucide-react"

interface ProcessingJobListItem {
  id: number
  fileName: string
  fileSize: number
  fileType?: string | null
  status: string
  documentType: string | null
  model: string | null
  createdAt: string
  updatedAt: string
}

export default function DocumentsPage() {
  const [jobs, setJobs] = useState<ProcessingJobListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/processing-jobs-list")
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch processing jobs")
      }
      const data: ProcessingJobListItem[] = await response.json()
      setJobs(data)
    } catch (err) {
      console.error("Error fetching jobs list:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
  
    fetchJobs()
  }, [])

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

    return jobs.map((job, index) => (
      <tr key={job.id} className="hover:bg-slate-800">
        <th>{index + 1}</th>
        <td>{job.fileName}</td>
        <td>{job.documentType ?? "-"}</td>
        <td>{job.model ?? "-"}</td>
        <td>{job.status}</td>
        <td>{new Date(job.createdAt).toLocaleString()}</td>
        <td className="flex gap-3">
          <button className="btn btn-sm bg-slate-600 hover:bg-violet-950" aria-label="Preview result">
            <Eye />
          </button>
          <button className="btn btn-sm bg-slate-600 hover:bg-red-950" aria-label="Delete job">
            <Trash />
          </button>
        </td>
      </tr>
    ))
  }, [error, isLoading, jobs])

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
        <div className="flex justify-end px-[60px] mt-6">
          <div className="join">
            <input
              className="join-item btn btn-square"
              type="radio"
              name="options"
              aria-label="1"
              defaultChecked
            />
            <input
              className="join-item btn bg-slate-800 btn-square hover:bg-purple-900"
              type="radio"
              name="options"
              aria-label="2"
            />
            <input
              className="join-item btn btn-square bg-slate-800 hover:bg-purple-900"
              type="radio"
              name="options"
              aria-label="3"
            />
            <input
              className="join-item btn btn-square bg-slate-800 hover:bg-purple-900"
              type="radio"
              name="options"
              aria-label="4"
            />
          </div>
        </div>
      </div>
    </div>
  )
}