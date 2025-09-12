import { useEffect, useState } from "react"

interface FilePreviewModalProps {
  file: File
  onClose: () => void
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [fileUrl, setFileUrl] = useState<string>("")

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const getFileType = () => {
    if (file.type.includes("pdf")) return "pdf"
    if (file.type.includes("image")) return "image"
    return "other"
  }

  const fileType = getFileType()

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="modal-box max-w-4xl w-full">
        <h3 className="font-bold text-lg mb-2">Preview: {file.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {(file.size / 1024).toFixed(2)} KB | {file.type || "unknown"}
        </p>

        <div className="bg-base-200 p-3 rounded-lg max-h-[70vh] overflow-auto flex justify-center">
          {fileType === "pdf" && (
            <embed src={fileUrl} type="application/pdf" className="w-full h-[70vh]" />
          )}

          {fileType === "image" && (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-[70vh] object-contain rounded-lg"
            />
          )}

          {fileType === "other" && (
            <pre className="bg-base-300 p-4 rounded-lg w-full overflow-auto">
              {`Preview not available for this file type.
Example OCR Data:
{
  "documentType": "KTP",
  "name": "John Doe",
  "dob": "1990-01-01",
  "address": "Jl. Mawar No. 123, Jakarta",
  "nik": "1234567890123456"
}`}
            </pre>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
