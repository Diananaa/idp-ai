"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { useState } from "react"

interface OCRMetaForm {
  documentType: string
  model: string
  processedAt: string
}

interface OCRFieldFormItem {
  name: string
  value: string
}

interface OCRFormValues {
  meta: OCRMetaForm
  fields: OCRFieldFormItem[]
}

const buildDefaultValues = (): OCRFormValues => ({
  meta: {
    documentType: "Kartu Keluarga",
    model: "Tesseract",
    processedAt: new Date().toISOString().slice(0, 16),
  },
  fields: [
    { name: "documentNumber", value: "DOC-159956" },
    { name: "ownerName", value: "John Doe" },
    { name: "issuedDate", value: "2025-11-09" },
    { name: "transactionValue", value: "62073065.46793039" },
  ],
})

export default function OCRFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OCRFormValues>({
    defaultValues: buildDefaultValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  })

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const processedAt = data.meta.processedAt
        ? new Date(data.meta.processedAt).toISOString()
        : new Date().toISOString()

      const formattedFields = data.fields
        .map((field) => ({
          name: field.name?.trim(),
          value: field.value,
        }))
        .filter((field) => field.name)
        .map((field) => ({
          name: field.name as string,
          value: {
            value: field.value,
          },
        }))

      const formattedData = {
        meta: {
          ...data.meta,
          processedAt,
        },
        fields: formattedFields,
      }

      setResult(JSON.stringify(formattedData, null, 2))
    } catch (error) {
      console.error("Error formatting OCR data:", error)
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleReset = () => {
    setResult(null)
    reset(buildDefaultValues())
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      alert("JSON copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">OCR Dummy Data Form</h1>
        <p className="text-slate-400">
          Masukkan data dummy OCR dengan struktur JSON baru
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Meta Section */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Meta Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Document Type
              </label>
              <input
                type="text"
                {...register("meta.documentType", { required: "Document type is required" })}
                className="input w-full bg-slate-700 text-white border-slate-600 focus:border-violet-500"
                placeholder="KTP"
              />
              {errors.meta?.documentType && (
                <p className="text-red-400 text-xs mt-1">{errors.meta.documentType.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Model
              </label>
              <input
                type="text"
                {...register("meta.model", { required: "Model is required" })}
                className="input w-full bg-slate-700 text-white border-slate-600 focus:border-violet-500"
                placeholder="Tesseract"
              />
              {errors.meta?.model && (
                <p className="text-red-400 text-xs mt-1">{errors.meta.model.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Processed At
              </label>
              <input
                type="datetime-local"
                {...register("meta.processedAt", {
                  required: "Processed at is required",
                })}
                className="input w-full bg-slate-700 text-white border-slate-600 focus:border-violet-500"
              />
              {errors.meta?.processedAt && (
                <p className="text-red-400 text-xs mt-1">{errors.meta.processedAt.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Fields Data</h2>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg bg-slate-900/40 border border-slate-700 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Field Name</label>
                    <input
                      type="text"
                      {...register(`fields.${index}.name`, {
                        required: "Field name is required",
                      })}
                      className="input w-full bg-slate-700 text-white border-slate-600 focus:border-violet-500"
                      placeholder="documentNumber"
                    />
                    {errors.fields?.[index]?.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.fields[index]?.name?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Field Value</label>
                    <input
                      type="text"
                      {...register(`fields.${index}.value`, {
                        required: "Field value is required",
                      })}
                      className="input w-full bg-slate-700 text-white border-slate-600 focus:border-violet-500"
                      placeholder="DOC-159956"
                    />
                    {errors.fields?.[index]?.value && (
                      <p className="text-red-400 text-xs mt-1">{errors.fields[index]?.value?.message}</p>
                    )}
                  </div>
                </div>

                {fields.length > 1 && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn btn-sm bg-red-600/80 hover:bg-red-600 text-white"
                    >
                      Remove Field
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ name: "", value: "" })}
              className="btn btn-sm bg-slate-700 hover:bg-slate-600 text-white"
            >
              + Add Field
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isSubmitting ? "Processing..." : "Generate JSON"}
          </button>
          <button type="button" onClick={handleReset} className="btn bg-slate-600 hover:bg-slate-500 text-white">
            Reset
          </button>
        </div>
      </form>

      {/* Result Section */}
      {result && (
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Generated JSON</h2>
            <button
              onClick={handleCopy}
              className="btn btn-sm bg-slate-600 hover:bg-slate-500 text-white"
            >
              Copy JSON
            </button>
          </div>
          <pre className="bg-slate-900 p-4 rounded text-sm text-white overflow-x-auto max-h-96 border border-slate-700">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

