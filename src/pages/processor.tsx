"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// dynamic import PdfViewer supaya gak error DOMMatrix di server
const PdfViewer = dynamic(() => import("../components/PdfViewer"), { ssr: false });

interface UploadedFile {
  file: File;
  preview: string;
}

export default function ProcessingPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [ocrModel, setOcrModel] = useState("");

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

  const closeModal = () => {
    setSelectedFile(null);
  };

  const handleProcess = () => {
    if (!files.length || !documentType || !ocrModel) {
      alert("Isi semua form dan upload file dulu ya!");
      return;
    }
    alert("Simulasi proses OCR jalan...");
  };

  return (
    <div className="p-8 bg-base-200 min-h-screen">
      <div className="max-w-3xl mx-auto bg-base-100 p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Document Processing</h1>
        <p className="text-gray-500 mb-6">
          Upload dan proses dokumen menggunakan Intelligent Document Processing (IDP)
        </p>

        {/* FORM */}
        <div className="form-control w-full mb-4">
          <label className="label font-medium">Document Type</label>
          <select
            className="select select-bordered w-full"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="">-- Pilih jenis dokumen --</option>
            <option value="ktp">KTP</option>
            <option value="kk">Kartu Keluarga</option>
            <option value="invoice">Invoice</option>
          </select>
        </div>

        <div className="form-control w-full mb-4">
          <label className="label font-medium">Model OCR</label>
          <select
            className="select select-bordered w-full"
            value={ocrModel}
            onChange={(e) => setOcrModel(e.target.value)}
          >
            <option value="">-- Pilih model --</option>
            <option value="openai">Open AI</option>
            <option value="custom">Custom Model</option>
          </select>
        </div>

        {/* FILE UPLOAD */}
        <div className="mb-4">
          <label className="label font-medium">Upload Documents</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        {/* LIST FILES */}
        {files.length > 0 && (
          <div className="space-y-2 mb-6">
            {files.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
              >
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => setSelectedFile(f)}
                >
                  {f.file.name}
                </span>
                <button
                  className="btn btn-sm btn-error text-white"
                  onClick={() => handleRemoveFile(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-primary w-full"
          onClick={handleProcess}
          disabled={!files.length}
        >
          Proses
        </button>
      </div>

      {/* MODAL PREVIEW */}
      {selectedFile && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-5xl">
            <h3 className="font-bold text-lg mb-4">
              Preview: {selectedFile.file.name}
            </h3>

            {/* PREVIEW FILE */}
            {selectedFile.file.type.includes("image") ? (
              <img
                src={selectedFile.preview}
                alt="preview"
                className="max-h-[600px] mx-auto rounded-lg shadow"
              />
            ) : selectedFile.file.type === "application/pdf" ? (
              <PdfViewer fileUrl={selectedFile.preview} />
            ) : (
              <p className="text-center text-gray-500">
                File type not supported for preview
              </p>
            )}

            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
