"use client"

import FileList from "@/components/FileList"
import FilePreviewModal from "@/components/FilePreviewModal"
import { useState } from "react"
// import FileList from "./FileList"
// import FilePreviewModal from "./FilePreviewModal"

export default function ProcessingPage() {
  const [files, setFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [ocrModel, setOcrModel] = useState<string>("")

  // handle drag drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prev) => [...prev, ...Array.from(event.target.files)])
    }
  }

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file))
  }

  const handleProcess = () => {
    if (!documentType || !ocrModel || files.length === 0) {
      alert("Please select document type, model, and upload files first.")
      return
    }
    alert("Processing started (dummy simulation) 🚀")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Processing</h1>
        <p className="text-muted-foreground">
          Upload and process your documents with IDP (Intelligent Document Processing)
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="font-bold mb-2">Document type</p>
          <select
            className="select select-bordered w-full"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="">Select document type</option>
            <option value="KTP">KTP</option>
            <option value="KK">Kartu Keluarga</option>
            <option value="Invoice">Invoice</option>
          </select>
        </div>

        <div>
          <p className="font-bold mb-2">Model</p>
          <select
            className="select select-bordered w-full"
            value={ocrModel}
            onChange={(e) => setOcrModel(e.target.value)}
          >
            <option value="">Select OCR model</option>
            <option value="OpenAI">Open AI</option>
            <option value="Tesseract">Tesseract</option>
            <option value="Custom">Custom Model</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop area */}
      <div
        className="border-2 border-dashed border-gray-400 p-10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-base-200 transition"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p className="mb-3 text-lg font-medium">Drag & drop your files here</p>
        <input
          type="file"
          multiple
          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          onChange={handleFileChange}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <FileList
          files={files}
          onRemove={removeFile}
          onPreview={(file) => setSelectedFile(file)}
        />
      )}

      {/* Process Button */}
      <div className="pt-5">
        <button
          className="btn btn-primary w-full md:w-auto"
          onClick={handleProcess}
        >
          🚀 Start Processing
        </button>
      </div>

      {/* Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}
