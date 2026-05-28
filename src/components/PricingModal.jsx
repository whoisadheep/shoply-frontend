import React from 'react';

const PLAN_DETAILS = {
  ringl: { price: '₹100/mo', name: 'Ringl Auto-Reply', features: ['Missed Call Auto-Replies', 'Unlimited Webhooks', 'Basic Logs'] },
  ai: { price: '₹249/mo', name: 'Shoply AI Assistant', features: ['Unlimited AI Chat', 'Product Catalog Sync', 'Sales & Support'] },
  combo: { price: '₹299/mo', name: 'Combo (Best Value)', features: ['Everything in AI Assistant', 'Everything in Ringl', 'Save ₹50/mo!'] }
};

export default function PricingModal({ onClose, onSubscribe, subscribing, currentTier }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column',
      padding: '1rem', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
        width: '100%', maxWidth: '900px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        margin: 'auto'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', margin: 0 }}>Upgrade Your Plan</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>Choose the perfect plan for your business needs.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pricing Cards */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {Object.entries(PLAN_DETAILS).map(([tier, details]) => {
            const isCurrent = currentTier === tier;
            const isCombo = tier === 'combo';
            
            return (
              <div 
                key={tier} 
                style={{
                  position: 'relative', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column',
                  backgroundColor: isCombo ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                  border: isCombo ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isCombo ? '0 0 30px rgba(59,130,246,0.15)' : 'none'
                }}
              >
                {isCombo && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)', color: 'white', fontSize: '0.75rem',
                    fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'white', marginBottom: '0.5rem', marginTop: isCombo ? '0.5rem' : 0 }}>{details.name}</h3>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
                  {details.price}
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {details.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                      <svg style={{ width: '20px', height: '20px', color: '#4ade80', marginRight: '0.5rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => onSubscribe(tier)}
                  disabled={subscribing || isCurrent}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, border: 'none',
                    cursor: subscribing || isCurrent ? 'not-allowed' : 'pointer',
                    backgroundColor: isCurrent ? 'rgba(255,255,255,0.1)' : (isCombo ? '#2563eb' : 'white'),
                    color: isCurrent ? '#9ca3af' : (isCombo ? 'white' : 'black'),
                    transition: 'all 0.2s ease',
                    boxShadow: isCombo && !isCurrent ? '0 10px 15px -3px rgba(37,99,235,0.3)' : 'none'
                  }}
                >
                  {subscribing ? 'Processing...' : isCurrent ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
