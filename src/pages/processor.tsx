"use client"

import React, { useState } from "react"

export default function ProcessorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [ocrModel, setOcrModel] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleProcess = () => {
    if (!selectedFile || !documentType || !ocrModel) return
    setIsProcessing(true)
    setProgress(0)
    setResult(null)

    // Simulate step-by-step progress
    let current = 0
    const interval = setInterval(() => {
      current += 20
      setProgress(current)
      if (current >= 100) {
        clearInterval(interval)
        setIsProcessing(false)
        // Dummy result
        setResult({
          name: "Budi Santoso",
          nik: "1234567890123456",
          dob: "1986-07-15",
          address: "Jl. Merdeka No. 10, Jakarta",
          docType: documentType,
          model: ocrModel,
          file: selectedFile.name,
        })
      }
    }, 600)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setDocumentType("")
    setOcrModel("")
    setResult(null)
    setProgress(0)
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Processing</h1>
        <p className="text-muted-foreground">
          Intelligent Document Processing – Upload and process your documents with AI
        </p>
      </div>

      {/* Drag & Drop Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          isDragging ? "border-blue-400 bg-slate-700" : "border-primary bg-slate-800 hover:bg-slate-700"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-lg font-semibold">Drag & Drop your file here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </label>
        {selectedFile && (
          <div className="mt-3 p-2 bg-slate-700 rounded">
            <p className="text-sm">{selectedFile.name}</p>
          </div>
        )}
      </div>

      {/* Form Pilihan */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="font-bold mb-2">Document type</p>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="select w-full bg-slate-800"
          >
            <option value="" disabled>
              Select type
            </option>
            <option value="KTP">KTP</option>
            <option value="Kartu Keluarga">Kartu Keluarga</option>
            <option value="Invoice">Invoice</option>
          </select>
        </div>

        <div>
          <p className="font-bold mb-2">Model</p>
          <select
            value={ocrModel}
            onChange={(e) => setOcrModel(e.target.value)}
            className="select w-full bg-slate-800"
          >
            <option value="" disabled>
              Select model
            </option>
            <option value="OpenAI">Open AI</option>
            <option value="Tesseract">Tesseract</option>
            <option value="Custom">Custom Model</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleProcess}
          className="btn btn-primary"
          disabled={!selectedFile || !documentType || !ocrModel || isProcessing}
        >
          {isProcessing ? "Processing..." : "Proses"}
        </button>
        <button
          onClick={handleReset}
          className="btn btn-outline"
          disabled={isProcessing}
        >
          Reset
        </button>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Result Preview */}
      {result && (
        <div className="bg-slate-800 p-4 rounded-xl mt-6">
          <h2 className="text-xl font-semibold mb-2">Extracted Data</h2>
          <pre className="text-sm bg-slate-900 p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
