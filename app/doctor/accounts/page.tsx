'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import { useAuth } from '@/lib/auth-context';
import { getAppointmentsByDoctorId, getPatients } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Appointment, Patient } from '@/lib/types';

interface Transaction {
  id: string;
  requestedDate: string;
  accountNo: string;
  creditedOn: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export default function DoctorAccounts() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    earned: 0,
    requested: 0
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const [appointmentsData, patientsData] = await Promise.all([
          getAppointmentsByDoctorId(user.id),
          getPatients()
        ]);

        setPatients(patientsData);

        // Convert completed appointments to transactions
        const completedAppointments = appointmentsData.filter(apt => apt.status === 'Completed');
        const transactionData: Transaction[] = completedAppointments.map((apt, index) => ({
          id: `#AC-${String(index + 1).padStart(4, '0')}`,
          requestedDate: apt.timestamp ? new Date(apt.timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'N/A',
          accountNo: '5396 5250 1908 XXXX', // Default account number
          creditedOn: apt.timestamp ? new Date(apt.timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'N/A',
          amount: apt.amount ? `$${apt.amount}` : '$0',
          status: 'Completed' as const
        }));

        setTransactions(transactionData);

        // Calculate statistics
        const totalEarned = completedAppointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);
        const pendingAppointments = appointmentsData.filter(apt => apt.status === 'Pending');
        const totalRequested = pendingAppointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);

        setStats({
          totalBalance: totalEarned * 0.9, // Assuming 10% platform fee
          earned: totalEarned,
          requested: totalRequested
        });

      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DoctorSidebar />
          <div className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Doctor</span>
                  <span>&gt;</span>
                  <span>Accounts</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <div className="bg-black text-white p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-6">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="border border-gray-700 rounded p-3">
                        <p className="text-sm text-gray-400">Total Balance</p>
                        <p className="text-2xl font-bold">${stats.totalBalance.toFixed(0)}</p>
                      </div>
                      <div className="border border-gray-700 rounded p-3">
                        <p className="text-sm text-gray-400">Earned</p>
                        <p className="text-2xl font-bold">${stats.earned.toFixed(0)}</p>
                      </div>
                      <div className="border border-gray-700 rounded p-3 col-span-2">
                        <p className="text-sm text-gray-400">Requested</p>
                        <p className="text-2xl font-bold">${stats.requested.toFixed(0)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Last Payment request: {transactions.length > 0 ? transactions[0].creditedOn : 'No transactions yet'}</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Request Payment</Button>
                  </div>
                </Card>

                <Card className="lg:col-span-3">
                  <div className="bg-black text-white p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Bank Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Bank Name</p>
                        <p className="font-semibold">Citi Bank Inc</p>
                        <p className="text-sm text-gray-400 mt-3">Branch Name</p>
                        <p className="font-semibold">London</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Account Number</p>
                        <p className="font-semibold">5396 5250 1908 XXXX</p>
                        <p className="text-sm text-gray-400 mt-3">Account Name</p>
                        <p className="font-semibold">{user?.name || 'Doctor'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Button variant="ghost" size="sm" className="text-blue-400">Edit Details</Button>
                      <Button variant="ghost" size="sm" className="text-blue-400 ml-2">Other Accounts</Button>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <div className="flex gap-4 mb-6">
                    <Button className="bg-blue-600">Accounts</Button>
                    <Button variant="outline">Refund Request</Button>
                  </div>

                  <div className="overflow-x-auto">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold">ID</th>
                            <th className="text-left py-3 px-4 font-semibold">Requested Date</th>
                            <th className="text-left py-3 px-4 font-semibold">Account No</th>
                            <th className="text-left py-3 px-4 font-semibold">Credited On</th>
                            <th className="text-left py-3 px-4 font-semibold">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                            <th className="text-left py-3 px-4 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-8 text-gray-500">
                                No transactions available yet.
                              </td>
                            </tr>
                          ) : (
                            transactions.map((item) => (
                              <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 text-blue-600 font-semibold">{item.id}</td>
                                <td className="py-3 px-4">{item.requestedDate}</td>
                                <td className="py-3 px-4">{item.accountNo}</td>
                                <td className="py-3 px-4">{item.creditedOn}</td>
                                <td className="py-3 px-4">{item.amount}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-3 py-1 rounded text-white text-xs font-medium ${
                                    item.status === 'Completed' ? 'bg-green-600' :
                                    item.status === 'Cancelled' ? 'bg-red-600' :
                                    'bg-yellow-500'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <Button variant="ghost" size="sm">🔗</Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {transactions.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                      <Button variant="outline" size="sm">&lt;</Button>
                      <Button variant="outline" size="sm">1</Button>
                      <Button size="sm" className="bg-blue-600">2</Button>
                      <Button variant="outline" size="sm">3</Button>
                      <Button variant="outline" size="sm">4</Button>
                      <span className="text-sm text-gray-600">...</span>
                      <Button variant="outline" size="sm">&gt;</Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
