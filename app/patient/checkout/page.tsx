'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function CheckoutPage() {
  const [selectedPayment, setSelectedPayment] = useState('credit-card');

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <span className="text-blue-600">●</span>
          <span>Patient</span>
          <span>›</span>
          <span>Checkout</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <Input placeholder="First Name" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <Input placeholder="Last Name" className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="Email" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <Input placeholder="Phone" className="w-full" />
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                Existing Customer?{' '}
                <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Click here to login
                </a>
              </p>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              {/* Credit Card Option */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer mb-6">
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={selectedPayment === 'credit-card'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-900">Credit Card</span>
                </label>

                {selectedPayment === 'credit-card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name on Card</label>
                      <Input placeholder="Name on Card" className="w-full" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                      <Input placeholder="1234 5678 9876 5432" className="w-full" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Month</label>
                        <Input placeholder="MM" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Year</label>
                        <Input placeholder="YY" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                        <Input placeholder="CVV" className="w-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paypal Option */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={selectedPayment === 'paypal'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-gray-900">Paypal</span>
              </label>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 mt-6 mb-6">
                <input type="checkbox" className="w-4 h-4 mt-1" />
                <label className="text-sm text-gray-700">
                  I have read and accept{' '}
                  <a href="/terms-and-conditions" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Confirm and Pay Button */}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold">
                Confirm and Pay
              </Button>
            </div>
          </div>

          {/* Right Side - Booking Summary */}
          <div className="border border-gray-200 rounded-lg p-8 h-fit">
            <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>

            {/* Doctor Info */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop"
                alt="Dr. Darren Elder"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-bold text-lg mb-1">Dr. Darren Elder</h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-400">★★★★</span>
                  <span className="text-sm font-semibold">35</span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  📍 Newyork, USA
                </p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Date16 Nov 2019 Time10:00 AM</p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Consulting Fee</span>
                <span className="font-semibold">$100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Booking Fee</span>
                <span className="font-semibold">$10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Video Call</span>
                <span className="font-semibold">$50</span>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-600">$160</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
