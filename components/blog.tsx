"use client"

import { Calendar, User } from "lucide-react"

const posts = [
  { title: "Tips for Finding and Booking the Perfect Doctor", date: "Jan 15, 2024", author: "Dr. Sarah" },
  { title: "Why Regular Check-ups are Important for Your Health", date: "Jan 12, 2024", author: "Dr. John" },
]

export default function Blog() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Insights
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-16">
          Stay Updated With Our <span className="text-blue-600">Latest Articles</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-blue-300 to-blue-200 h-48"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-4">{post.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  )
}
