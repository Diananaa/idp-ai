"use client"

import { FileText, TrendingUp, Clock } from "lucide-react"
const DATA_DOC_CARD = [
  {
    name: "Today",
    count: 25,
    dec: 'Document Processed',
    icon: <FileText color="#6a7282" />
  }, {
    name: "This weeks",
    count: 50,
    dec: 'Document Processed',
    icon: <TrendingUp color="#6a7282" />
  }, {
    name: "Avg Processing Time",
    count: '23s',
    dec: 'Per document',
    icon: <Clock color="#6a7282" />
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold  text-gray-600">Dashboard ee</h1>
        <p className="text-gray-400">Overview of your document processing activities</p>
      </div>

  
      <div className="flex gap-5">
        {
          DATA_DOC_CARD.map((data) => (
            <div className=" w-[250] p-4 shadow-sm border border-gray-200 rounded-md ">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500 font-medium">{data.name}</p>
                {data.icon}

              </div>
              <div className="mt-3">
                <p className="text-xl font-bold">{data.count}</p>
                <p className="text-sm text-gray-500">{data.dec}</p>
              </div>
            </div>
          ))
        }
      </div>

    </div>
  )
}
