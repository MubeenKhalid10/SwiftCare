"use client"

import { Suspense, useState } from "react"
import { Search, Plus, Download, FileText, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { PatientSidebar } from "@/components/patient/patient-sidebar"

const medicalRecords = [
  {
    id: "#MR1236",
    name: "Electro cardiography",
    date: "24 Mar 2025",
    recordFor: "Hendrita Clark",
    comments: "Take Good Rest",
    doctor: "Dr. John",
    avatar: "/doctor1.jpg",
  },
  {
    id: "#MR3656",
    name: "Complete Blood Count",
    date: "27 Mar 2025",
    recordFor: "Laura Stewart",
    comments: "Stable, no change",
    doctor: "Dr. Sarah",
    avatar: "/doctor2.jpg",
  },
  {
    id: "#MR1246",
    name: "Blood Glucose Test",
    date: "10 Apr 2025",
    recordFor: "Mathew Charles",
    comments: "All Clear",
    doctor: "Dr. Mike",
    avatar: "/doctor3.jpg",
  },
]

function MedicalRecordsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("medical")

  const filteredRecords = medicalRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <span className="text-blue-600">●</span>
          <Link href="/patient/dashboard" className="text-gray-600 hover:text-gray-900">
            Patient
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Medical Records</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Medical Records</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reusable Sidebar */}
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Records</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Medical Record
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="medical">Medical Records</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Record For</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-blue-600 font-medium">
                          {record.id}
                        </TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={record.avatar} />
                              <AvatarFallback>DR</AvatarFallback>
                            </Avatar>
                            {record.recordFor}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {record.comments}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Download className="w-4 h-4 cursor-pointer text-gray-500" />
                            <Share2 className="w-4 h-4 cursor-pointer text-gray-500" />
                            <FileText className="w-4 h-4 cursor-pointer text-gray-500" />
                            <Trash2 className="w-4 h-4 cursor-pointer text-gray-500" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function MedicalRecordsPage() {
  return (
    <Suspense fallback={null}>
      <MedicalRecordsContent />
    </Suspense>
  )
}
