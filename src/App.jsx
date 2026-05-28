import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './LandingPage';
import MeshBackground from './MeshBackground';
import './index.css';
const API_BASE_URL = 'https://whatsapp-agent-3es5.onrender.com/api';

const apiFetch = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { ...options.headers };
  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return fetch(url, { ...options, headers });
};

const AI_CAPABILITIES = [
  { id: 'greet', label: 'Greet customers warmly', default: true },
  { id: 'answer_faq', label: 'Answer basic questions about the business' , default: true },
  { id: 'collect_lead', label: 'Collect customer name, phone & inquiry', default: true },
  { id: 'share_pricing', label: 'Share pricing information' },
  { id: 'share_location', label: 'Share business address & hours' },
  { id: 'handoff', label: 'Forward complex questions to the owner', default: true },
  { id: 'multilingual', label: 'Reply in customer\'s language (Hindi/English/Hinglish)', default: true },
  { id: 'share_upi', label: 'Share UPI / payment details' },
  { id: 'review_request', label: 'Ask happy customers for a Google review' },
];

function CapabilityChecklist({ selected, onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(c => c !== id) : [...selected, id]);
  };
  return (
    <div className="capability-grid">
      {AI_CAPABILITIES.map(cap => (
        <label key={cap.id} className={`capability-item ${selected.includes(cap.id) ? 'selected' : ''}`}>
          <input type="checkbox" checked={selected.includes(cap.id)} onChange={() => toggle(cap.id)} />
          <span>{cap.label}</span>
        </label>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Auth Gate — wraps the entire app
   ───────────────────────────────────────────── */
function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  if (authLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <Dashboard session={session} />;
}

/* ─────────────────────────────────────────────
   Login Screen
   ───────────────────────────────────────────── */
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [aiCapabilities, setAiCapabilities] = useState(
    AI_CAPABILITIES.filter(c => c.default).map(c => c.id)
  );
  const [upiDetails, setUpiDetails] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [pricingDetails, setPricingDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState('form'); // 'form' | 'provisioning' | 'qr'
  const [qrData, setQrData] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Create Supabase auth account
      const result = await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;

      if (result.data?.user?.identities?.length === 0) {
        setError('This email is already registered. Please login instead.');
        setLoading(false);
        return;
      }

      // Step 2: Generate AI prompt from business description
      setStep('provisioning');
      let generatedPrompt = null;
      if (businessDescription.trim()) {
        try {
          let extraContext = '';
          if (aiCapabilities.includes('share_upi') && upiDetails) extraContext += `UPI / Payment Info: ${upiDetails}\n`;
          if (aiCapabilities.includes('share_location') && businessHours) extraContext += `Address & Hours: ${businessHours}\n`;
          if (aiCapabilities.includes('share_pricing') && pricingDetails) extraContext += `Pricing Details: ${pricingDetails}\n`;

          const promptRes = await apiFetch(`${API_BASE_URL}/generate-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName,
              businessDescription,
              aiRole: AI_CAPABILITIES.filter(c => aiCapabilities.includes(c.id)).map(c => c.label).join(', '),
              extraContext,
            }),
          });
          const promptData = await promptRes.json();
          if (promptRes.ok && promptData.prompt) {
            generatedPrompt = promptData.prompt;
          }
        } catch (promptErr) {
          console.error('Prompt generation failed, using default:', promptErr);
        }
      }

      // Step 3: Provision the business (tenant + Evolution instance + QR)
      const instanceName = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

      const response = await apiFetch(`${API_BASE_URL}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          instance_name: instanceName,
          owner_phone: ownerPhone,
          system_prompt: generatedPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create business');

      // Step 3: Show QR code
      const base64 = data.qr?.base64;
      if (base64 && base64.length > 10) {
        setQrData(base64);
        setStep('qr');
      } else {
        // QR not available (Evolution API might not be running), auth is done so session will kick in
        setStep('form');
      }
    } catch (err) {
      setError(err.message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <MeshBackground />
      <div className="glass-panel login-card animate-fade-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '560px' }}>
        
        {/* Provisioning spinner */}
        {step === 'provisioning' && (
          <div className="loading-state">
            <div className="spinner"></div>
            <h2>Setting up {businessName}...</h2>
            <p>Creating your account, AI receptionist, and WhatsApp connection...</p>
          </div>
        )}

        {/* QR Code after signup */}
        {step === 'qr' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--success-color)' }}>Success</div>
            <h2>Welcome aboard!</h2>
            <p>Your AI receptionist for <strong>{businessName}</strong> is ready. Scan this QR code with your business WhatsApp.</p>

            <div className="qr-container">
              {qrData.startsWith('data:') ? (
                <img src={qrData} alt="WhatsApp QR Code" className="qr-image" />
              ) : (
                <img src={`data:image/png;base64,${qrData}`} alt="WhatsApp QR Code" className="qr-image" />
              )}
            </div>

            <button className="btn btn-primary" style={{ marginTop: '1rem', padding: '12px 24px' }}
              onClick={() => window.location.reload()}>
              Done — Go to Dashboard
            </button>
          </div>
        )}

        {/* Login / Signup Form */}
        {step === 'form' && (
          <>
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem' }}>
              <button 
                type="button"
                onClick={() => setShowApp(false)}
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', padding: '0.5rem' }}
              >
                &larr; Back
              </button>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                Shoply AI <span style={{ color: 'var(--accent-color)' }}>Manager</span>
              </h1>
              <p>{mode === 'login' ? 'Sign in to manage your AI receptionists' : 'Set up your AI receptionist in 60 seconds'}</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
              {mode === 'signup' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input 
                      type="text" className="form-control"
                      value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sharma Electronics"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your WhatsApp Number</label>
                    <input 
                      type="text" className="form-control"
                      value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="e.g. 919876543210"
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      The AI will alert you here when it can't answer a customer.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tell us about your business *</label>
                    <textarea 
                      className="form-control"
                      value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="e.g. We sell and install CCTV cameras, biometric devices, and networking solutions in Gorakhpur. Our prices range from ₹2000 to ₹50000. We also do AMC contracts."
                      style={{ minHeight: '100px' }}
                      required
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Our AI will use this to craft the perfect prompt for your receptionist.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">What should the AI do?</label>
                    <CapabilityChecklist selected={aiCapabilities} onChange={setAiCapabilities} />
                  </div>
                  {aiCapabilities.includes('share_upi') && (
                    <div className="form-group animate-fade-in" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label">UPI ID / Payment Details *</label>
                      <input type="text" className="form-control" value={upiDetails} onChange={(e) => setUpiDetails(e.target.value)} placeholder="e.g. sharma@okaxis or Bank Details" required />
                    </div>
                  )}
                  {aiCapabilities.includes('share_location') && (
                    <div className="form-group animate-fade-in" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label">Business Address & Hours *</label>
                      <textarea className="form-control" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="e.g. 123 Main St. Open Mon-Sat 10 AM to 8 PM" style={{ minHeight: '60px' }} required />
                    </div>
                  )}
                  {aiCapabilities.includes('share_pricing') && (
                    <div className="form-group animate-fade-in" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label">Key Pricing / Starting Prices *</label>
                      <textarea className="form-control" value={pricingDetails} onChange={(e) => setPricingDetails(e.target.value)} placeholder="e.g. Consulting fee is ₹500. Product X starts at ₹1200." style={{ minHeight: '60px' }} required />
                    </div>
                  )}
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" className="form-control" 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourbusiness.com"
                  required autoFocus={mode === 'login'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" className="form-control" 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required minLength={6}
                />
              </div>

              <button 
                type="submit" className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account & Setup AI')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              {mode === 'login' ? (
                <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); setError(''); }} style={{ color: 'var(--accent-color)' }}>Sign up</a></>
              ) : (
                <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }} style={{ color: 'var(--accent-color)' }}>Sign in</a></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Dashboard (only visible when logged in)
   ───────────────────────────────────────────── */
function Dashboard({ session }) {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE_URL}/tenants`);
      if (!response.ok) throw new Error('Failed to fetch tenants');
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedTenant) => {
    setSaveStatus('Saving...');
    try {
      const response = await apiFetch(`${API_BASE_URL}/tenants/${updatedTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTenant),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      const saved = await response.json();
      setTenants(tenants.map(t => t.id === saved.id ? saved : t));
      setSelectedTenant(saved);
      setSaveStatus('Saved successfully! AI updated.');
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const handleBusinessCreated = (newTenant) => {
    setTenants([newTenant, ...tenants]);
    setShowAddModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="container"><p>Loading dashboard...</p></div>;
  if (error) return <div className="container"><p style={{color: 'var(--danger-color)'}}>Error: {error}</p></div>;

  return (
    <div className="container">
      <header className="header animate-fade-in">
        <div>
          <h1>Shoply AI <span style={{ color: 'var(--accent-color)' }}>Manager</span></h1>
          <p>Logged in as <strong>{session.user.email}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedTenant ? (
            <button className="btn btn-secondary" onClick={() => setSelectedTenant(null)}>
              ← Back to Dashboard
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Add Business
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>
            Logout
          </button>
        </div>
      </header>

      {showAddModal && (
        <AddBusinessModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleBusinessCreated}
        />
      )}

      {selectedTenant ? (
        <TenantEditor 
          tenant={selectedTenant} 
          onSave={handleSave} 
          saveStatus={saveStatus} 
        />
      ) : (
        <TenantsList 
          tenants={tenants} 
          onSelect={setSelectedTenant} 
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tenants List (Dashboard Home)
   ───────────────────────────────────────────── */
function TenantsList({ tenants, onSelect }) {
  return (
    <div className="grid">
      {tenants.map((tenant, idx) => (
        <div 
          key={tenant.id} 
          className="glass-panel animate-fade-in"
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h2>{tenant.name}</h2>
            <span className="badge badge-active">Active</span>
          </div>
          
          <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <p><strong>Instance:</strong> {tenant.instance_name}</p>
            <p><strong>Owner:</strong> {tenant.owner_phone || 'Not set'}</p>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={() => onSelect(tenant)}
          >
            Edit Settings
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Add Business Modal
   ───────────────────────────────────────────── */
function AddBusinessModal({ onClose, onCreated }) {
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'qr' | 'done'
  const [formData, setFormData] = useState({
    name: '',
    instance_name: '',
    owner_phone: '',
  });
  const [qrData, setQrData] = useState(null);
  const [createdTenant, setCreatedTenant] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate instance name from business name
    if (name === 'name') {
      const instanceName = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      setFormData(prev => ({ ...prev, name: value, instance_name: instanceName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStep('loading');

    try {
      const response = await apiFetch(`${API_BASE_URL}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business');
      }

      setCreatedTenant(data.tenant);

      if (data.qr?.base64) {
        setQrData(data.qr.base64);
        setStep('qr');
      } else if (data.qr?.pairingCode) {
        setQrData(data.qr.pairingCode);
        setStep('qr');
      } else {
        setStep('done');
      }
    } catch (err) {
      setError(err.message);
      setStep('form');
    }
  };

  const refreshQr = async () => {
    if (!createdTenant) return;
    try {
      const response = await apiFetch(`${API_BASE_URL}/tenants/${createdTenant.id}/qr`);
      const data = await response.json();
      if (data?.base64) {
        setQrData(data.base64);
      }
    } catch (err) {
      console.error('Failed to refresh QR:', err);
    }
  };

  const handleFinish = () => {
    if (createdTenant) onCreated(createdTenant);
    else onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel modal-content animate-fade-in">
        
        {/* Step 1: Form */}
        {step === 'form' && (
          <>
            <h2>Add New Business</h2>
            <p>Provision a new AI receptionist for a WhatsApp number</p>
            
            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input 
                  type="text" className="form-control" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="e.g. Sharma Electronics"
                  required autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instance Name (auto-generated)</label>
                <input 
                  type="text" className="form-control" name="instance_name"
                  value={formData.instance_name} onChange={handleChange}
                  placeholder="e.g. sharma_electronics"
                  required
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  This is the internal name for the WhatsApp connection. Use lowercase and underscores.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Owner Phone (for handoff alerts)</label>
                <input 
                  type="text" className="form-control" name="owner_phone"
                  value={formData.owner_phone} onChange={handleChange}
                  placeholder="e.g. 919876543210"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create & Get QR Code</button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="loading-state">
            <div className="spinner"></div>
            <h2>Setting up {formData.name}...</h2>
            <p>Creating WhatsApp instance, configuring webhook, generating QR code...</p>
          </div>
        )}

        {/* Step 3: QR Code */}
        {step === 'qr' && (
          <div style={{ textAlign: 'center' }}>
            <h2>Scan QR Code</h2>
            <p>Open WhatsApp on the business phone → Settings → Linked Devices → Link a Device</p>

            <div className="qr-container">
              {qrData && qrData.startsWith('data:') ? (
                <img src={qrData} alt="WhatsApp QR Code" className="qr-image" />
              ) : qrData ? (
                <img src={`data:image/png;base64,${qrData}`} alt="WhatsApp QR Code" className="qr-image" />
              ) : (
                <p>QR code not available yet</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={refreshQr}>🔄 Refresh QR</button>
              <button className="btn btn-primary" onClick={handleFinish}>Done — Go to Dashboard</button>
            </div>
          </div>
        )}

        {/* Step 4: Done (no QR available) */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--success-color)' }}>Success</div>
            <h2>{formData.name} Created!</h2>
            <p>The business has been added. The QR code wasn't available right away — you can fetch it from the tenant settings.</p>
            <button className="btn btn-primary" onClick={handleFinish} style={{ marginTop: '1.5rem' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Inbox View
   ───────────────────────────────────────────── */
function InboxView({ tenant }) {
  const [customers, setCustomers] = useState([]);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/customers`);
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (phone) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/customers/${phone}/messages`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCustomer = (c) => {
    setActiveCustomer(c);
    fetchMessages(c.phone);
  };

  const toggleTakeover = async () => {
    if (!activeCustomer) return;
    const isPaused = activeCustomer.paused_at != null;
    const action = isPaused ? 'resume' : 'pause';
    try {
      await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/customers/${activeCustomer.phone}/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      fetchCustomers();
      setActiveCustomer({ ...activeCustomer, timeout_ms: isPaused ? null : -1, paused_at: isPaused ? null : new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeCustomer) return;
    const text = inputText;
    setInputText('');
    
    // Optimistic update
    setMessages(prev => [...prev, { role: 'owner', content: text, created_at: new Date().toISOString() }]);

    try {
      await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/customers/${activeCustomer.phone}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      fetchCustomers();
      setActiveCustomer(prev => ({ ...prev, paused_at: new Date().toISOString(), timeout_ms: -1 }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 10000); // refresh list every 10s
    return () => clearInterval(interval);
  }, [tenant.id]);

  useEffect(() => {
    if (activeCustomer) {
      const interval = setInterval(() => fetchMessages(activeCustomer.phone), 5000);
      return () => clearInterval(interval);
    }
  }, [activeCustomer, tenant.id]);

  return (
    <div className={`inbox-layout ${activeCustomer ? 'chat-open' : ''}`}>
      <div className="customer-sidebar">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--panel-border)', fontWeight: 600 }}>
          Customers ({customers.length})
        </div>
        <div className="customer-list">
          {customers.map(c => {
            const isPaused = c.paused_at != null;
            return (
              <div key={c.phone} 
                className={`customer-item ${activeCustomer?.phone === c.phone ? 'active' : ''}`}
                onClick={() => handleSelectCustomer(c)}>
                <div>
                  <div className="customer-name">{c.push_name || 'Customer'} {isPaused ? '(Paused)' : ''}</div>
                  <div className="customer-phone">{c.phone}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(c.last_seen).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-pane">
        {activeCustomer ? (
          <>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-secondary back-btn" style={{ padding: '4px 8px' }} 
                  onClick={() => setActiveCustomer(null)}>
                  ←
                </button>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{activeCustomer.push_name}</h3>
                  <small style={{ color: 'var(--text-secondary)' }}>{activeCustomer.phone}</small>
                </div>
              </div>
              <button 
                className={`btn ${activeCustomer.paused_at != null ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleTakeover}>
                {activeCustomer.paused_at != null ? 'Resume AI' : 'Takeover'}
              </button>
            </div>
            
            <div className="chat-history">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>
                  {m.content}
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                    {m.role === 'owner' ? 'You' : m.role === 'assistant' ? 'AI' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder="Type a message (pauses AI)..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary" onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select a customer to view history
          </div>
        )}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   Knowledge Base View
   ───────────────────────────────────────────── */
function KnowledgeBaseView({ tenant }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/knowledge`);
      if (res.ok) setDocuments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [tenant.id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setError('Only PDF and TXT files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be less than 10MB.');
      return;
    }

    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/knowledge`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchDocs();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to upload document');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploading(false);
      e.target.value = null; // clear input
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/knowledge/${docId}`, {
        method: 'DELETE',
      });
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Knowledge Base</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upload PDFs or Text files to give your AI specific knowledge.</p>
        </div>
        <div>
          <label className="btn btn-primary" style={{ cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? 'Uploading...' : 'Upload Document'}
            <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem', padding: '12px', background: 'rgba(248,81,73,0.1)', color: 'var(--danger-color)', borderRadius: '6px' }}>{error}</div>
      )}

      {documents.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
          <p>No documents uploaded yet.</p>
          <p style={{ fontSize: '0.8rem' }}>Upload your menus, pricing guides, FAQs, or policies.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{doc.filename}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uploaded {new Date(doc.created_at).toLocaleDateString()}</div>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', color: 'var(--danger-color)', borderColor: 'rgba(248,81,73,0.3)' }} onClick={() => handleDelete(doc.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ─────────────────────────────────────────────
   Tenant Editor
   ───────────────────────────────────────────── */
function TenantEditor({ tenant, onSave, saveStatus }) {
  const [formData, setFormData] = useState({ ...tenant });
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Prompt Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardDesc, setWizardDesc] = useState('');
  const [wizardRole, setWizardRole] = useState(AI_CAPABILITIES.filter(c => c.default).map(c => c.id).join(','));
  const [wizardUpi, setWizardUpi] = useState('');
  const [wizardHours, setWizardHours] = useState('');
  const [wizardPricing, setWizardPricing] = useState('');
  const [wizardLoading, setWizardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${tenant.name}? This will permanently remove all customers, messages, and knowledge base files.`)) {
      return;
    }
    
    try {
      setSaveStatus('Deleting...');
      const response = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      // Force a full reload to take user back to dashboard and refresh tenants
      window.location.reload();
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const generatePrompt = async () => {
    if (!wizardDesc.trim()) return;
    setWizardLoading(true);
    try {
      const activeCaps = wizardRole.split(',');
      let extraContext = '';
      if (activeCaps.includes('share_upi') && wizardUpi) extraContext += `UPI / Payment Info: ${wizardUpi}\n`;
      if (activeCaps.includes('share_location') && wizardHours) extraContext += `Address & Hours: ${wizardHours}\n`;
      if (activeCaps.includes('share_pricing') && wizardPricing) extraContext += `Pricing Details: ${wizardPricing}\n`;

      const response = await apiFetch(`${API_BASE_URL}/generate-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.name,
          businessDescription: wizardDesc,
          aiRole: AI_CAPABILITIES.filter(c => activeCaps.includes(c.id)).map(c => c.label).join(', '),
          extraContext,
        }),
      });
      const data = await response.json();
      if (response.ok && data.prompt) {
        setFormData(prev => ({ ...prev, system_prompt: data.prompt }));
        setShowWizard(false);
      }
    } catch (err) {
      console.error('Failed to generate prompt:', err);
    } finally {
      setWizardLoading(false);
    }
  };

  const fetchQrCode = async () => {
    setQrLoading(true);
    setQrData(null);
    try {
      const response = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/qr`);
      const data = await response.json();
      console.log('QR Response:', data);
      
      const base64 = data?.base64 || data?.data?.base64;
      const pairingCode = data?.pairingCode || data?.code;
      
      if (base64 && base64.length > 10) {
        setQrData(base64);
      } else if (pairingCode && pairingCode.length > 0) {
        setQrData(pairingCode);
      } else {
        console.log('No QR data found in response. Keys:', Object.keys(data || {}));
        setQrData('error');
      }
    } catch (err) {
      console.error('Failed to fetch QR:', err);
      setQrData('error');
    } finally {
      setQrLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/status`);
      const data = await response.json();
      setConnectionStatus(data?.instance?.state || 'unknown');
    } catch (err) {
      setConnectionStatus('offline');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/tenants/${tenant.id}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchAnalytics();
  }, [tenant.id]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>

      <div className="tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'inbox' ? 'active' : ''} onClick={() => setActiveTab('inbox')}>Live Inbox</button>
        <button className={activeTab === 'knowledge' ? 'active' : ''} onClick={() => setActiveTab('knowledge')}>Knowledge Base</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>AI Settings</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
        
        {activeTab === 'inbox' && (
          <InboxView tenant={tenant} />
        )}

        {activeTab === 'overview' && (
          <>
            {/* Analytics & ROI Panel */}
            <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.05) 0%, rgba(30, 41, 59, 0.5) 100%)', borderColor: 'rgba(88, 166, 255, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2>Analytics & ROI</h2>
                <button className="btn btn-secondary" onClick={fetchAnalytics} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  Refresh
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Live performance metrics for your AI receptionist.</p>
              
              {analytics ? (
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value">{analytics.totalCustomers}</div>
                    <div className="metric-label">Total Customers</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{analytics.aiMessages}</div>
                    <div className="metric-label">AI Messages Sent</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value" style={{ color: 'var(--success-color)' }}>{analytics.timeSaved}</div>
                    <div className="metric-label">Time Saved</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value" style={{ color: 'var(--danger-color)' }}>{analytics.handoffs}</div>
                    <div className="metric-label">Handoffs to Owner</div>
                  </div>
                </div>
              ) : (
                <div className="loading-state" style={{ padding: '2rem' }}>
                  <div className="spinner"></div>
                  <p>Loading metrics...</p>
                </div>
              )}
            </div>
            
            {/* WhatsApp Connection Panel */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>WhatsApp Connection</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${connectionStatus === 'open' ? 'badge-active' : 'badge-offline'}`}>
                    {connectionStatus === 'open' ? '● Connected' : connectionStatus === 'unknown' ? '● Unknown' : '● Disconnected'}
                  </span>
                  <button className="btn btn-secondary" onClick={checkStatus} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                    Refresh Status
                  </button>
                </div>
              </div>

              {connectionStatus === 'open' ? (
                <p style={{ color: 'var(--success-color)' }}>
                  WhatsApp is connected and the AI is live for <strong>{tenant.name}</strong>.
                </p>
              ) : (
                <div>
                  <p>Scan the QR code below with the business WhatsApp to connect.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
                    {qrLoading && (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Fetching QR code from Evolution API...</p>
                      </div>
                    )}

                    {qrData && qrData !== 'error' && !qrLoading && (
                      <div className="qr-container">
                        {qrData.startsWith('data:') ? (
                          <img src={qrData} alt="WhatsApp QR Code" className="qr-image" />
                        ) : qrData.length > 20 ? (
                          <img src={`data:image/png;base64,${qrData}`} alt="WhatsApp QR Code" className="qr-image" />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: '#000', fontWeight: 600, fontSize: '0.9rem' }}>Pairing Code:</p>
                            <p style={{ color: '#000', fontSize: '2rem', fontWeight: 700, letterSpacing: '4px' }}>{qrData}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {qrData === 'error' && !qrLoading && (
                      <div className="error-banner" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        Could not fetch QR code. Make sure your Evolution API server is running at <code>localhost:8080</code>.
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                      <button className="btn btn-primary" onClick={fetchQrCode}>
                        {qrData ? 'Refresh QR Code' : 'Get QR Code'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView tenant={tenant} />
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>AI Settings</h2>
              {saveStatus && (
                <span style={{ 
                  color: saveStatus.includes('Error') ? 'var(--danger-color)' : 'var(--success-color)',
                  fontWeight: 500
                }}>
                  {saveStatus}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid">
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input 
                    type="text" className="form-control" name="name"
                    value={formData.name || ''} onChange={handleChange} required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Phone (For Handoff Alerts)</label>
                  <input 
                    type="text" className="form-control" name="owner_phone"
                    value={formData.owner_phone || ''} onChange={handleChange}
                    placeholder="e.g. 919876543210"
                  />
                </div>
              </div>

              {/* AI Prompt Wizard */}
              <div className="glass-panel" style={{ marginBottom: '1.5rem', background: 'rgba(88, 166, 255, 0.05)', border: '1px solid rgba(88, 166, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>AI Prompt Wizard</h3>
                    <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>Describe your business in plain language and let AI write the perfect prompt.</p>
                  </div>
                  <button type="button" className="btn btn-primary" style={{ padding: '8px 16px' }}
                    onClick={() => setShowWizard(!showWizard)}>
                    {showWizard ? 'Close' : 'Open Wizard'}
                  </button>
                </div>

                {showWizard && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tell us about this business *</label>
                      <textarea 
                        className="form-control"
                        value={wizardDesc} onChange={(e) => setWizardDesc(e.target.value)}
                        placeholder="e.g. We are a CCTV and security solutions company in Gorakhpur. We sell Hikvision and CP Plus cameras, biometric attendance systems, and networking equipment. Prices range from ₹2000 to ₹50000. We also do AMC contracts and on-site installations."
                        style={{ minHeight: '120px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">What should the AI do for this business?</label>
                      <CapabilityChecklist selected={wizardRole.split(',').filter(Boolean)} onChange={(caps) => setWizardRole(caps.join(','))} />
                    </div>
                    {wizardRole.split(',').includes('share_upi') && (
                      <div className="form-group animate-fade-in" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">UPI ID / Payment Details *</label>
                        <input type="text" className="form-control" value={wizardUpi} onChange={(e) => setWizardUpi(e.target.value)} placeholder="e.g. sharma@okaxis or Bank Details" required />
                      </div>
                    )}
                    {wizardRole.split(',').includes('share_location') && (
                      <div className="form-group animate-fade-in" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">Business Address & Hours *</label>
                        <textarea className="form-control" value={wizardHours} onChange={(e) => setWizardHours(e.target.value)} placeholder="e.g. 123 Main St. Open Mon-Sat 10 AM to 8 PM" style={{ minHeight: '60px' }} required />
                      </div>
                    )}
                    {wizardRole.split(',').includes('share_pricing') && (
                      <div className="form-group animate-fade-in" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">Key Pricing / Starting Prices *</label>
                        <textarea className="form-control" value={wizardPricing} onChange={(e) => setWizardPricing(e.target.value)} placeholder="e.g. Consulting fee is ₹500. Product X starts at ₹1200." style={{ minHeight: '60px' }} required />
                      </div>
                    )}
                    <button type="button" className="btn btn-primary" onClick={generatePrompt} disabled={wizardLoading || !wizardDesc.trim()}>
                      {wizardLoading ? 'AI is writing the prompt...' : 'Generate AI Prompt'}
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">AI System Prompt (The Rules)</label>
                <p style={{ fontSize: '0.8rem', marginTop: '-0.3rem', marginBottom: '0.5rem' }}>
                  This is the core brain of the AI. Use the wizard above or edit manually below.
                </p>
                <textarea 
                  className="form-control" name="system_prompt"
                  value={formData.system_prompt || ''} onChange={handleChange}
                  style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ignored Numbers (Comma separated)</label>
                <input 
                  type="text" className="form-control" name="ignored_numbers"
                  value={formData.ignored_numbers || ''} onChange={handleChange}
                  placeholder="e.g. 919876543210, 911234567890"
                />
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={handleDelete}>
                  Delete Business
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  Save Changes to AI
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
