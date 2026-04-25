import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-5 font-sans">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-5">
          🌱 Welcome to Manake
        </h1>
        <p className="text-2xl text-gray-600 mb-10">
          Recovery Platform - Community, Mentorship, Support
        </p>
        
        <div className="bg-white p-10 rounded-xl shadow-lg mb-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-5">
            ✅ Your Journey Starts Here
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join our supportive community dedicated to recovery and personal growth.
            Connect with mentors, access resources, and build lasting relationships.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                👥
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Community
              </h3>
              <p className="text-gray-600 text-sm">
                Connect with others on similar journeys
              </p>
            </div>
            
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                📚
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Resources
              </h3>
              <p className="text-gray-600 text-sm">
                Access guided materials and tools
              </p>
            </div>
            
            <div>
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                🎯
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Mentorship
              </h3>
              <p className="text-gray-600 text-sm">
                Get guidance from experienced mentors
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-10 rounded-xl">
          <h2 className="text-3xl font-semibold text-gray-800 mb-5">
            🚀 Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands who have found support and hope through our platform.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  )
}
