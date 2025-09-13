"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Setup worker untuk render PDF
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number>(0);

  return (
    <div className="flex flex-col items-center gap-2">
      <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        {Array.from(new Array(numPages), (_, i) => (
          <Page key={`page_${i + 1}`} pageNumber={i + 1} width={600} />
        ))}
      </Document>
      <p className="text-sm text-gray-400">
        Total halaman: {numPages}
      </p>
    </div>
  );
}
