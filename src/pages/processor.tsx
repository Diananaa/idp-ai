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

interface ProcessingJobRecord {
  id: number;
  fileName: string;
  fileSize: number;
  fileType?: string | null;
  status: string;
  resultJson?: string | null;
  createdAt: string;
  updatedAt: string;
  documentType: DocumentTypeOption;
  model: ModelOption;
}


export default function ProcessorPage() {
  const [documentTypeId, setDocumentTypeId] = useState<string>("")
  const [ocrModelId, setOcrModelId] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessingJobRecord[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

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

  const handleProcess = async () => {
    if (!files.length || !documentTypeId || !ocrModelId) return

    setIsProcessing(true)
    setProgress(10)
    setResult(null)

    const payload = {
      documentTypeId: Number(documentTypeId),
      modelId: Number(ocrModelId),
      files: files.map((uploadedFile) => ({
        name: uploadedFile.file.name,
        size: uploadedFile.file.size,
        type: uploadedFile.file.type,
      })),
    }

    try {
      const response = await fetch("/api/processing-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      console.log(response);
      setProgress(70)

      if (!response.ok) {
        throw new Error("Failed to create processing jobs")
      }

      const data: ProcessingJobRecord[] = await response.json()
      console.log("API Response Data:", data)
      setResult(data)
      setProgress(100)
    } catch (error) {
      console.error("Error processing files:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setDocumentTypeId("")
    setOcrModelId("")
    setResult(null)
    setProgress(0)
    setIsProcessing(false)
    setFiles([])
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
    </div>
  )
}
