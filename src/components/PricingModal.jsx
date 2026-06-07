import React from 'react';

const PLAN_DETAILS = {
  ringl: { price: '₹100/mo', name: 'Ringl Auto-Reply', features: ['Missed Call Auto-Replies', 'Unlimited Webhooks', 'Basic Logs'] },
  ai: { price: '₹249/mo', name: 'Shoply AI Assistant', features: ['Unlimited AI Chat', 'Product Catalog Sync', 'Sales & Support'] },
  combo: { price: '₹299/mo', name: 'Combo (Best Value)', features: ['Everything in AI Assistant', 'Everything in Ringl', 'Save ₹50/mo!'] }
};

export default function PricingModal({ onClose, onSubscribe, subscribing, currentTier }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      padding: '2rem 1rem', backgroundColor: 'rgba(240,235,227,0.75)', backdropFilter: 'blur(12px)', 
      WebkitBackdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.2s ease-out',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'var(--panel-bg)', border: 'none', borderRadius: '24px',
        width: '100%', maxWidth: '900px', overflow: 'hidden', 
        boxShadow: 'var(--clay-shadow-lg)',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '2px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--panel-bg-light)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Upgrade Your Plan</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>Choose the perfect plan for your business needs.</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--panel-bg)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '10px', boxShadow: 'var(--clay-shadow-sm)', transition: 'all 0.2s' }}>
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
                  position: 'relative', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column',
                  backgroundColor: isCombo ? 'rgba(255,107,107,0.06)' : 'var(--panel-bg-light)',
                  border: 'none',
                  boxShadow: isCombo ? 'var(--clay-shadow-lg)' : 'var(--clay-shadow)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isCombo && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent-gradient)', color: 'white', fontSize: '0.75rem',
                    fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', 
                    boxShadow: '2px 2px 8px rgba(255,107,107,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', marginTop: isCombo ? '0.5rem' : 0 }}>{details.name}</h3>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                  {details.price}
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {details.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <svg style={{ width: '20px', height: '20px', color: 'var(--success-color)', marginRight: '0.5rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    width: '100%', padding: '0.75rem', borderRadius: '14px', fontWeight: 600, border: 'none',
                    cursor: subscribing || isCurrent ? 'not-allowed' : 'pointer',
                    backgroundColor: isCurrent ? 'var(--bg-secondary)' : (isCombo ? '' : 'var(--panel-bg)'),
                    background: !isCurrent && isCombo ? 'var(--accent-gradient)' : undefined,
                    color: isCurrent ? 'var(--text-muted)' : (isCombo ? 'white' : 'var(--text-primary)'),
                    transition: 'all 0.25s ease',
                    boxShadow: isCurrent ? 'var(--clay-inset)' : (isCombo 
                      ? '4px 4px 10px rgba(255,107,107,0.25), inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.1)'
                      : 'var(--clay-shadow-sm)'),
                    fontFamily: 'var(--font-family)'
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
