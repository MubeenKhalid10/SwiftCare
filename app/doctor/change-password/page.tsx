'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
                  <span>Change Password</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
              </div>

              <Card>
                <div className="p-6 max-w-md">
                  <h2 className="text-xl font-bold mb-6">Change Password</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Old Password</label>
                      <Input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-2"
                        />
                        <button className="absolute right-3 top-5 text-gray-400">👁️</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="mt-2"
                        />
                        <button className="absolute right-3 top-5 text-gray-400">👁️</button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-blue-600">Save Changes</Button>
                    </div>
                  </div>
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
