'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getAppointments, getPatients } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Appointment, Patient } from '@/lib/types'

type TransactionRow = {
  invoiceNo: string
  patientIdLabel: string
  patientName: string
  patientEmail: string
  amountText: string
  amountValue: number
  date: string
  time: string
  doctorName: string
  status: 'Paid' | 'Cancelled'
  timestamp: number
}

function getAppointmentTimestamp(appointment: Appointment): number {
  const source = appointment.fullDateIso || appointment.timestamp || appointment.date
  if (!source) return 0
  const ts = new Date(source).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

function normalizePatient(raw: any): Patient {
  return {
    ...raw,
    id: raw?.id || raw?._id,
    name: raw?.name || 'Unknown Patient',
    email: String(raw?.email || raw?.credentials?.email || '').trim(),
  }
}

export default function TransactionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Cancelled'>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchTransactions() {
      try {
        const [appointments, patientData] = await Promise.all([
          getAppointments(),
          getPatients(),
        ])

        const patientMap = patientData.reduce<Record<string, Patient>>((acc, patient: any) => {
          const normalized = normalizePatient(patient)
          const key = String(normalized.id || '')
          if (key) acc[key] = normalized
          return acc
        }, {})

        const mapped = appointments
          .filter((apt) => typeof apt.amount === 'number' && Number.isFinite(apt.amount) && apt.amount > 0)
          .map((apt) => {
            const aptId = String(apt.id || apt._id || '')
            const patientId = String(apt.patientId || '')
            const patient = patientMap[patientId]
            const patientName = patient?.name || apt.patientName || 'Unknown Patient'

            return {
              invoiceNo: `#IN${aptId.slice(-6).toUpperCase().padStart(6, '0')}`,
              patientIdLabel: `#PAT${patientId.slice(-6).toUpperCase().padStart(6, '0')}`,
              patientName,
              patientEmail: patient?.email || 'N/A',
              amountText: `RS. ${Number(apt.amount).toLocaleString()}`,
              amountValue: Number(apt.amount),
              date: apt.date || 'N/A',
              time: apt.time || 'N/A',
              doctorName: apt.doctorName || 'N/A',
              status: String(apt.status || '').toLowerCase() === 'cancelled' ? 'Cancelled' : 'Paid',
              timestamp: getAppointmentTimestamp(apt),
            } as TransactionRow
          })
          .sort((a, b) => b.timestamp - a.timestamp)

        setTransactions(mapped)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message === 'Unauthorized') {
          router.push('/admin/login')
          return
        }

        console.error(err)
        setError('Failed to load transactions')
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchTransactions()
    }
  }, [user, isAuthenticated, authLoading, router])

  const filteredTransactions = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
      if (!matchesStatus) return false

      if (!query) return true

      return (
        transaction.invoiceNo.toLowerCase().includes(query) ||
        transaction.patientIdLabel.toLowerCase().includes(query) ||
        transaction.patientName.toLowerCase().includes(query)
      )
    })
  }, [transactions, searchText, statusFilter])

  const footerText = useMemo(() => {
    if (filteredTransactions.length === 0) return 'Showing 0 entries'
    return `Showing 1 to ${filteredTransactions.length} of ${filteredTransactions.length} entries`
  }, [filteredTransactions.length])

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600">Dashboard / Transactions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by invoice, patient ID, or patient name"
            className="w-full md:max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Paid' | 'Cancelled')}
            className="w-full md:w-44 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((trans, idx) => (
                <tr
                  key={`${trans.invoiceNo}-${idx}`}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedTransaction(trans)
                    setIsInvoiceOpen(true)
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium">{trans.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trans.patientIdLabel}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trans.patientName}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trans.amountText}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trans.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trans.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && !error && (
            <div className="text-center py-8 text-gray-600">No transaction data found</div>
          )}
          <div className="px-6 py-4 border-t border-gray-200 text-right text-sm text-gray-600">
            {footerText}
          </div>
        </div>

        <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>

            {selectedTransaction && (
              <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">INVOICE</p>
                    <p className="text-sm text-gray-500 mt-1">SwiftCare Admin Billing</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Invoice No</p>
                    <p className="font-semibold text-gray-900">{selectedTransaction.invoiceNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Bill To</p>
                    <p className="font-semibold text-gray-900 mt-1">{selectedTransaction.patientName}</p>
                    <p className="text-sm text-gray-600">{selectedTransaction.patientIdLabel}</p>
                    <p className="text-sm text-gray-600">{selectedTransaction.patientEmail}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Appointment Details</p>
                    <p className="text-sm text-gray-700 mt-1">Doctor: {selectedTransaction.doctorName}</p>
                    <p className="text-sm text-gray-700">Date: {selectedTransaction.date}</p>
                    <p className="text-sm text-gray-700">Time: {selectedTransaction.time}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Consultation Fee</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">RS. {selectedTransaction.amountValue.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">RS. {selectedTransaction.amountValue.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTransaction.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                  <Button type="button" variant="outline" onClick={() => setIsInvoiceOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
