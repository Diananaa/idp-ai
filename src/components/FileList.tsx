import { Trash2, Eye } from "lucide-react"

interface FileListProps {
  files: File[]
  onRemove: (file: File) => void
  onPreview: (file: File) => void
}

export default function FileList({ files, onRemove, onPreview }: FileListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Uploaded Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div key={index} className="card bg-base-200 shadow-xl p-4">
            <h3 className="font-semibold truncate">{file.name}</h3>
            <p className="text-sm text-gray-400">
              {(file.size / 1024).toFixed(2)} KB | {file.type || "unknown"}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => onPreview(file)}
              >
                <Eye className="w-4 h-4 mr-1" /> View
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => onRemove(file)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
