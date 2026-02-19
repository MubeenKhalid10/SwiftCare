'use client'

import Image from 'next/image'
import { Trash2, Edit } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'

const invoicesData = [
  { invoiceNo: '#IN0001', patientId: '#PT001', patientName: 'Charlene Reed', amount: '$100.00', date: '09 Sep 2019', status: 'Paid' },
  { invoiceNo: '#IN0002', patientId: '#PT002', patientName: 'Travis Trimble', amount: '$240.00', date: '12 Jan 2019', status: 'Paid' },
  { invoiceNo: '#IN0003', patientId: '#PT003', patientName: 'Carl Kelly', amount: '$330.00', date: '29 Mar 2019', status: 'Paid' },
  { invoiceNo: '#IN0004', patientId: '#PT004', patientName: 'Michelle Fairfax', amount: '$200.00', date: '25 Apr 2011', status: 'Paid' },
  { invoiceNo: '#IN0005', patientId: '#PT005', patientName: 'Gina Moore', amount: '$170.00', date: '28 Nov 2008', status: 'Paid' },
  { invoiceNo: '#IN0006', patientId: '#PT006', patientName: 'Elsie Gilley', amount: '$760.00', date: '02 Dec 2012', status: 'Paid' },
  { invoiceNo: '#IN0006', patientId: '#PT006', patientName: 'Elsie Gilley', amount: '$760.00', date: '02 Dec 2012', status: 'Paid' },
  { invoiceNo: '#IN0007', patientId: '#PT007', patientName: 'Joan Gardner', amount: '$290.00', date: '06 Oct 2012', status: 'Paid' },
  { invoiceNo: '#IN0008', patientId: '#PT008', patientName: 'Daniel Griffing', amount: '$370.00', date: '14 Sep 2010', status: 'Paid' },
  { invoiceNo: '#IN0009', patientId: '#PT009', patientName: 'Walter Roberson', amount: '$230.00', date: '15 Sep 2009', status: 'Paid' },
  { invoiceNo: '#IN0010', patientId: '#PT010', patientName: 'Robert Rhodes', amount: '$390.00', date: '08 Apr 2015', status: 'Paid' }
]

export default function InvoicesPage() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice Report</h1>
          <p className="text-gray-600">Dashboard / Invoice Report</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoicesData.map((invoice, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{invoice.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm font-medium">{invoice.patientId}</td>
                  <td className="px-6 py-4 text-sm">{invoice.patientName}</td>
                  <td className="px-6 py-4 text-sm font-medium">{invoice.amount}</td>
                  <td className="px-6 py-4 text-sm">{invoice.date}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
