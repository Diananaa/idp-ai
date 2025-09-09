"use client"

import type React from "react"

import { useState } from "react"

export default function ProcessorPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [documentType, setDocumentType] = useState<string>("")
    const [ocrModel, setOcrModel] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleProcess = async () => {
        if (!selectedFile || !documentType || !ocrModel) {
            return
        }

        setIsProcessing(true)
        // Simulate processing delay
        setTimeout(() => {
            setIsProcessing(false)
            // Reset form
            setSelectedFile(null)
            setDocumentType("")
            setOcrModel("")
            // Reset file input
            const fileInput = document.getElementById("file-upload") as HTMLInputElement
            if (fileInput) fileInput.value = ""
        }, 3000)
    }

    const isFormValid = selectedFile && documentType && ocrModel

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Processing</h1>
                <p className="text-muted-foreground">Upload and process your documents</p>
            </div>
            <div>
       

                <div className="py-3">
                    <p className="font-bold mb-2">Document type</p>
                    <select className="select bg-slate-800">
                        <option disabled selected>Ktp</option>
                        <option>Kartu Keluarga</option>
                        <option>Invoice</option>
                    </select>
                </div>


                <div className="py-3">
                    <p className="font-bold mb-2">Select Document</p>
                    <input type="file" className="file-input file-input-primary bg-slate-800" />
                </div>

                <div className="py-3">
                    <p className="font-bold mb-2">Model</p>
                    <select className="select bg-slate-800">
                        <option disabled selected>Open AI</option>
                        <option>Kartu Keluarga</option>
                        <option>Invoice</option>
                    </select>
                </div>
<div className="py-5"/>
                <button className="btn btn-primary">Proses</button>
            </div>
        </div>
    )
}
