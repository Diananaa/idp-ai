"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// config worker pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface UploadedFile {
  file: File;
  preview: string;
}

export default function FileUploadWithPreview() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  // handle input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // hapus file
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // close modal
  const closeModal = () => {
    setSelectedFile(null);
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Upload Documents</h2>

        {/* FORM */}
        <div className="form-control w-full mb-4">
          <label className="label font-medium">Document Type</label>
          <input
            type="text"
            placeholder="Enter document type"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full mb-4">
          <label className="label font-medium">Model</label>
          <input
            type="text"
            placeholder="Enter model name"
            className="input input-bordered w-full"
          />
        </div>

        {/* FILE UPLOAD */}
        <div className="mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        {/* LIST FILES */}
        <div className="grid gap-3">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-base-200 rounded-lg shadow-sm"
            >
              <p
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => setSelectedFile(f)}
              >
                {f.file.name}
              </p>
              <button
                className="btn btn-sm btn-error text-white"
                onClick={() => handleRemoveFile(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PREVIEW */}
      {selectedFile && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              Preview: {selectedFile.file.name}
            </h3>

            {/* Preview Content */}
            {selectedFile.file.type.includes("image") ? (
              <img
                src={selectedFile.preview}
                alt="preview"
                className="max-h-[500px] mx-auto rounded-lg shadow"
              />
            ) : selectedFile.file.type === "application/pdf" ? (
              <div className="flex flex-col items-center">
                <Document
                  file={selectedFile.preview}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={600}
                    />
                  ))}
                </Document>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                File type not supported for preview.
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
