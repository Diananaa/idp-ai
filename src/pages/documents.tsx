"use client"

import type React from "react"

import { useState } from "react"

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
                        </tr>
                    </thead>
                    <tbody>
                        
                        <tr className="hover:bg-slate-800 border-b border-stone-500">
                            <th>1</th>
                            <td>Cy Ganderton</td>
                            <td>Quality Control Specialist</td>
                            <td>Blue</td>
                        </tr>
                        
                        <tr className="hover:bg-slate-800">
                            <th>2</th>
                            <td>Hart Hagerty</td>
                            <td>Desktop Support Technician</td>
                            <td>Purple</td>
                        </tr>
                        
                        <tr className="hover:bg-slate-800">
                            <th>3</th>
                            <td>Brice Swyre</td>
                            <td>Tax Accountant</td>
                            <td>Red</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}