import React from 'react';

const PLAN_DETAILS = {
  ringl: { price: '₹100/mo', name: 'Ringl Auto-Reply', features: ['Missed Call Auto-Replies', 'Unlimited Webhooks', 'Basic Logs'] },
  ai: { price: '₹249/mo', name: 'Shoply AI Assistant', features: ['Unlimited AI Chat', 'Product Catalog Sync', 'Sales & Support'] },
  combo: { price: '₹299/mo', name: 'Combo (Best Value)', features: ['Everything in AI Assistant', 'Everything in Ringl', 'Save ₹50/mo!'] }
};

export default function PricingModal({ onClose, onSubscribe, subscribing, currentTier }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-semibold text-white">Upgrade Your Plan</h2>
            <p className="text-gray-400 text-sm mt-1">Choose the perfect plan for your business needs.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLAN_DETAILS).map(([tier, details]) => {
            const isCurrent = currentTier === tier;
            const isCombo = tier === 'combo';
            
            return (
              <div 
                key={tier} 
                className={`relative p-6 rounded-xl border flex flex-col ${
                  isCombo 
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {isCombo && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-lg font-medium text-white mb-2">{details.name}</h3>
                <div className="text-3xl font-bold text-white mb-6">
                  {details.price}
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {details.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => onSubscribe(tier)}
                  disabled={subscribing || isCurrent}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                      : isCombo
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white text-black hover:bg-gray-200'
                  }`}
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
