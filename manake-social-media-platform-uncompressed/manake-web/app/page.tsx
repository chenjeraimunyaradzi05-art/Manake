import React from 'react'

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          🌱 Welcome to Manake
        </h1>
        <p style={{ 
          fontSize: '24px', 
          color: '#6b7280',
          marginBottom: '40px'
        }}>
          Recovery Platform - Community, Mentorship, Support
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            ✅ Your Journey Starts Here
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Join our supportive community dedicated to recovery and personal growth.
            Connect with mentors, access resources, and build lasting relationships.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
          }}>
            <div>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px'
              }}>
                👥
              </div>
              <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>
                Community
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Connect with others on similar journeys
              </p>
            </div>
            
            <div>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#d1fae5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px'
              }}>
                📚
              </div>
              <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>
                Resources
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Access guided materials and tools
              </p>
            </div>
            
            <div>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#ede9fe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px'
              }}>
                🎯
              </div>
              <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>
                Mentorship
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Get guidance from experienced mentors
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '40px', 
          borderRadius: '12px'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            🚀 Ready to Start Your Journey?
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            marginBottom: '30px'
          }}>
            Join thousands who have found support and hope through our platform.
          </p>
          <button style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '15px 30px', 
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}>
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  )
}
