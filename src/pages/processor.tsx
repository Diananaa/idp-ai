"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("../components/PdfViewer"), { ssr: false });

interface UploadedFile {
  file: File;
  preview: string;
}

interface DocumentTypeOption {
  id: number;
  name: string;
}

interface ModelOption {
  id: number;
  name: string;
}

interface ProcessingJobFile {
  id: number;
  fileName: string;
  fileSize: number;
  fileType?: string | null;
}

interface ProcessingJobRecord {
  id: number;
  status: string;
  resultJson?: string | null;
  createdAt: string;
  updatedAt: string;
  documentType: DocumentTypeOption;
  model: ModelOption;
  files: ProcessingJobFile[];
}


export default function ProcessorPage() {
  const [documentTypeId, setDocumentTypeId] = useState<string>("")
  const [ocrModelId, setOcrModelId] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessingJobRecord | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)

  // Fetch document types from API
  useEffect(() => {
    fetchDocumentTypes();
    fetchModels();
  }, []);

const fetchModels = async () => {
  setIsLoadingModels(true);
 try {
  const response = await fetch("/api/model");
  if (response.ok) {
    const data: ModelOption[] = await response.json();
    setModels(data);
  } else {
    console.error("Failed to fetch models");
  }
 } catch (error) {
  console.error("Error fetching models:", error);
 } finally {
  setIsLoadingModels(false);
 }
}

  const fetchDocumentTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await fetch("/api/document-types");
      if (response.ok) {
        const data: DocumentTypeOption[] = await response.json();
        setDocumentTypes(data);
      } else {
        console.error("Failed to fetch document types");
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const convertPdfToPngPages = async (pdfFile: File) => {
    if (typeof window === "undefined") {
      return [pdfFile]
    }

    // Use the browser build of pdfjs compatible with pdfjs-dist@3.x
    const pdfjsLib = await import("pdfjs-dist/build/pdf")

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use the correct worker file for pdfjs-dist@3.11.174
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
    }

    const pdfData = await pdfFile.arrayBuffer()
    const pdf = await pdfjsLib
      .getDocument({
        data: pdfData,
      })
      .promise

    const pages: File[] = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Canvas context is not available")
      }

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result)
            } else {
              reject(new Error("Failed to convert canvas to blob"))
            }
          },
          "image/png",
          1
        )
      })

      const fileName = pdfFile.name.replace(/\.pdf$/i, `-page-${pageNumber}.png`)
      pages.push(new File([blob], fileName, { type: "image/png" }))
    }

    return pages
  }

  const handleReset = () => {
    setDocumentTypeId("")
    setOcrModelId("")
    setResult(null)
    setProgress(0)
    setIsProcessing(false)
    setFiles([])
  }

  const handleProcess = async () => {
    if (!files.length || !documentTypeId || !ocrModelId) return

    setIsProcessing(true)
    setProgress(10)
    setResult(null)

    const formData = new FormData()
    console.log(' 1 formData', formData)
    formData.append("documentTypeId", documentTypeId)
    formData.append("modelId", ocrModelId)

    try {
      const convertedFileGroups = await Promise.all(
        files.map(async ({ file }) => {
          const isPdf =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
          if (!isPdf) {
            return [file]
          }

          return await convertPdfToPngPages(file)
        })
      )

      const convertedFiles = convertedFileGroups.flat()

      convertedFiles.forEach((file) => {
        formData.append("files", file)
      })
console.log('2 convertedFiles', convertedFiles)
      setProgress(30)

      const response = await fetch("/api/processing-jobs", {
        method: "POST",
        body: formData,
      })

      console.log('3 response', response)
      setProgress(70)

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "Failed to create processing jobs")
      }

      const data: ProcessingJobRecord = await response.json()
      setResult({
        ...data,
        files: data.files ?? [],
      })
      setProgress(100)
      setErrorMessage(null)
      setIsErrorModalOpen(false)
    } catch (error) {
      console.error("Error processing files:", error)
      const message = error instanceof Error ? error.message : "Failed to process files"
      setErrorMessage(message)
      setIsErrorModalOpen(true)
      handleReset()
    } finally {
      setIsProcessing(false)
    }
  }

  const closeErrorModal = () => {
    setIsErrorModalOpen(false)
    setErrorMessage(null)
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
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragging ? "border-blue-400 bg-slate-700" : "border-primary bg-slate-800 hover:bg-slate-700"
          }`}
      // onDrop={handleFileChange}
      // onDragOver={handleDragOver}
      // onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-lg font-semibold">Drag & Drop your file here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </label>
        {
          files.length > 0 && (
            <div className="flex flex-col">
              {
                files.map((f, idx) => (
                  <div
                    key={`${f.file.name}-${idx}`}
                    className="mt-3 p-2 flex w-full justify-between bg-slate-700 hover:bg-slate-500 rounded"
                  >
                    <div className="flex gap-2 items-center">
                      <p className="text-sm">{f?.file.name}</p>
                      <p className="text-xs text-slate-400">
                        {(f?.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      className=" btn-error text-white hover:bg-red-700"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <X />
                    </button>
                  </div>
                ))
              }
            </div>
          )
        }
      </div>

      {/* Form Pilihan */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="font-bold mb-2">Document type</p>
          <select
            value={documentTypeId}
            onChange={(e) => setDocumentTypeId(e.target.value)}
            className="select w-full bg-slate-800"
            disabled={isLoadingTypes}
          >
            <option value="" disabled>
              {isLoadingTypes ? "Loading..." : "Select type"}
            </option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id.toString()}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="font-bold mb-2">Model</p>
          <select
            value={ocrModelId}
            onChange={(e) => setOcrModelId(e.target.value)}
            className="select w-full bg-slate-800"
            disabled={isLoadingModels}
          >
            <option value="" disabled>
              {isLoadingModels ? "Loading..." : "Select model"}
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.id.toString()}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleProcess}
          className="btn btn-primary"
          disabled={!files.length || !documentTypeId || !ocrModelId || isProcessing}
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

      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                <X className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-red-300">Processing Failed</p>
                <h3 className="text-2xl font-semibold text-white">Job cancelled</h3>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              {errorMessage || "Gemini gagal memproses dokumen. Semua proses telah dibatalkan."}
            </p>
            <div className="flex gap-3">
              <button
                className="btn flex-1 bg-white text-slate-900 hover:bg-slate-100"
                onClick={closeErrorModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
