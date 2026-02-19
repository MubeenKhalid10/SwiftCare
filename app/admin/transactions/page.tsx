'use client'

import { Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'

const transactionsData = [
  { invoiceNo: '#IN0001', patientId: '#PT001', patientName: 'Charlene Reed', amount: '$100.00', status: 'Paid' },
  { invoiceNo: '#IN0002', patientId: '#PT002', patientName: 'Travis Trimble', amount: '$200.00', status: 'Paid' },
  { invoiceNo: '#IN0003', patientId: '#PT003', patientName: 'Carl Kelly', amount: '$250.00', status: 'Paid' },
  { invoiceNo: '#IN0004', patientId: '#PT004', patientName: 'Michelle Fairfax', amount: '$150.00', status: 'Paid' },
  { invoiceNo: '#IN0005', patientId: '#PT005', patientName: 'Gina Moore', amount: '$350.00', status: 'Paid' },
  { invoiceNo: '#IN0006', patientId: '#PT006', patientName: 'Elsie Gilley', amount: '$300.00', status: 'Paid' },
  { invoiceNo: '#IN0007', patientId: '#PT007', patientName: 'Joan Gardner', amount: '$250.00', status: 'Paid' },
  { invoiceNo: '#IN0008', patientId: '#PT008', patientName: 'Daniel Griffing', amount: '$150.00', status: 'Paid' },
  { invoiceNo: '#IN0009', patientId: '#PT009', patientName: 'Walter Roberson', amount: '$100.00', status: 'Paid' },
  { invoiceNo: '#IN0010', patientId: '#PT010', patientName: 'Robert Rhodes', amount: '$120.00', status: 'Paid' }
]

export default function TransactionsPage() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600">Dashboard / Transactions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactionsData.map((trans, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{trans.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trans.patientId}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trans.patientName}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trans.amount}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {trans.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-200 text-right text-sm text-gray-600">
            Showing 1 to 10 of 10 entries
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
