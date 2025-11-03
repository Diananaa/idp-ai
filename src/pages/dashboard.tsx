"use client"

import { FileText, TrendingUp, Clock } from "lucide-react"
import { useEffect, useState } from "react";
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

import axios from 'axios';




export default function DashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  async function fetchUsers() {
    try {
      const response = await axios.get('/api/users');
      const users = response.data;
      setUsers(users);
      setLoading(false);
      console.log(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Gagal mengambil data users');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold  text-gray-600">Dashboard ee</h1>
        <p className="text-gray-400">Overview of your document processing activities</p>
      </div>


      <div className="flex gap-5">
        {
          DATA_DOC_CARD.map((data) => (
            <div key={data.name} className=" w-[250px] p-4 shadow-sm border border-gray-200 rounded-md ">
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
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Users</h2>
          <button onClick={fetchUsers} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        {loading && (
          <p className="text-gray-500 text-sm mt-2">Loading users...</p>
        )}
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
        {!loading && !error && (
          <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-md">
            {users.length === 0 && (
              <li className="p-3 text-gray-500 text-sm">Belum ada data users</li>
            )}
            {users.map((u: any) => (
              <li key={u.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <span className="text-xs text-gray-400">ID: {u.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
