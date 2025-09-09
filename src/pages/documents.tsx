"use client"

import type React from "react"
import { useState } from "react"
import { Trash, Eye } from "lucide-react"

const DATA = [
    {
        createAt: '10/11/2022 08:01:00',
        timeProcess: '100s',
        fileName: 'kk-001.pdf',
        typeDoc: 'Kartu Keluarga',
        model: 'Gemini',
    },
    {
        createAt: '10/11/2022 08:01:00',
        timeProcess: '100s',
        fileName: 'kk-001.pdf',
        typeDoc: 'Kartu Keluarga',
        model: 'Gemini',
    }, {
        createAt: '10/11/2022 08:01:00',
        timeProcess: '100s',
        fileName: 'kk-001.pdf',
        typeDoc: 'Kartu Keluarga',
        model: 'Gemini',
    }, {
        createAt: '10/11/2022 08:01:00',
        timeProcess: '100s',
        fileName: 'kk-001.pdf',
        typeDoc: 'Kartu Keluarga',
        model: 'Gemini',
    },
]

export default function ProcessorPage() {
    return (
        <div>
            <div className="overflow-x-auto">
                <table className="table">

                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Create At</th>
                            <th>Process time</th>
                            <th>File Name</th>
                            <th>Type Document</th>
                            <th>Model</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            DATA.map((data, key) => (
                                <tr className="hover:bg-slate-800">
                                    <th>{key++ + 1}</th>
                                    <td>{data?.createAt}</td>
                                    <td>{data?.timeProcess}</td>
                                    <td>{data?.fileName}</td>
                                    <td>{data?.typeDoc}</td>
                                    <td>{data?.model}</td>
                                    <td className="gap-3 flex">
                                        <button className="btn btn-sm bg-slate-600 hover:bg-violet-950"><Eye /></button>
                                        <button className="btn btn-sm bg-slate-600 hover:bg-red-950"><Trash /></button>
                                    </td>
                                </tr>

                            ))
                        }


                    </tbody>
                </table>
                <div className="flex justify-end px-[60px] mt-6">
                    <div className="join">
                        <input
                            class="join-item btn btn-square"
                            type="radio"
                            name="options"
                            aria-label="1"
                            checked="checked" />
                        <input className="join-item btn bg-slate-800 btn-square hover:bg-purple-900" type="radio" name="options" aria-label="2" />
                        <input className="join-item btn btn-square bg-slate-800 hover:bg-purple-900" type="radio" name="options" aria-label="3" />
                        <input className="join-item btn btn-square bg-slate-800 hover:bg-purple-900" type="radio" name="options" aria-label="4" />
                    </div>
                </div>
            </div>
        </div>
    )
}