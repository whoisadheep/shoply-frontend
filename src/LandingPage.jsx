import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Clock, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import MeshBackground from './MeshBackground';

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--bg-color)' }}>
      <MeshBackground />
      
      {/* HTML Content Overlay */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navbar */}
        <motion.nav 
          className="landing-nav"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={28} color="#FF6B6B" />
            Shoply AI
          </div>
          <button 
            onClick={onGetStarted}
            style={{ 
              pointerEvents: 'auto', padding: '10px 24px', 
              background: 'var(--panel-bg)', color: 'var(--text-primary)', 
              border: 'none', borderRadius: '30px', cursor: 'pointer', 
              fontWeight: 600, transition: 'all 0.25s', 
              boxShadow: 'var(--clay-shadow-sm)',
              fontFamily: 'var(--font-family)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--clay-shadow)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--clay-shadow-sm)'; }}
          >
            Sign In
          </button>
        </motion.nav>

        {/* Hero Section */}
        <main className="landing-main">
          <div className="landing-grid">
            
            {/* Left Copy */}
            <motion.div 
              className="landing-copy"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="landing-badge">
                <Zap size={14} fill="#FF6B6B" color="#FF6B6B" /> v2.0 Now Live
              </div>
              
              <h1 className="landing-title">
                The AI Receptionist for your WhatsApp.
              </h1>
              <p className="landing-subtitle">
                Never miss a customer inquiry again. Shoply automatically replies to messages, captures leads, and answers FAQs 24/7.
              </p>
              
              <button 
                onClick={onGetStarted}
                style={{ 
                  pointerEvents: 'auto', padding: '16px 32px', 
                  background: 'var(--accent-gradient)', color: '#fff', 
                  border: 'none', borderRadius: '30px', cursor: 'pointer', 
                  fontWeight: 600, fontSize: '1.1rem', 
                  display: 'inline-flex', alignItems: 'center', gap: '10px', 
                  transition: 'transform 0.25s, box-shadow 0.25s', 
                  boxShadow: '4px 4px 12px rgba(255,107,107,0.3), inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.1)',
                  fontFamily: 'var(--font-family)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '6px 6px 20px rgba(255,107,107,0.4), inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.12)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '4px 4px 12px rgba(255,107,107,0.3), inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.1)'; }}
              >
                Get Started for Free <ArrowRight size={20} />
              </button>

              <div className="landing-perks">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} color="#4CAF82" /> 60-second setup</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} color="#4CAF82" /> No credit card</span>
              </div>
            </motion.div>

            {/* Right 2D Floating Visual */}
            <motion.div 
              className="landing-visual"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              {/* Glass Mockup Card */}
              <div className="landing-mockup-card">
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '2px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--panel-bg-light)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-shadow-sm)' }}>
                    <Bot size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Shoply AI</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-color)' }}></div> Online
                    </div>
                  </div>
                </div>
                
                {/* Chat Area */}
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-color)' }}>
                  {/* Customer Message */}
                  <div style={{ alignSelf: 'flex-start', background: 'var(--panel-bg)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', maxWidth: '85%', fontSize: '0.9rem', color: 'var(--text-primary)', boxShadow: 'var(--clay-shadow-sm)' }}>
                    Hi! Are you open today? And do you sell headphones?
                  </div>
                  
                  {/* AI Response */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, originY: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    style={{ alignSelf: 'flex-end', background: 'var(--accent-gradient)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: '4px', maxWidth: '85%', fontSize: '0.9rem', color: '#fff', boxShadow: '4px 4px 10px rgba(255,107,107,0.2), inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.08)' }}
                  >
                    Yes, we're open until 8 PM! We have a wide range of headphones starting at ₹999. Would you like me to send you the catalog?
                  </motion.div>
                </div>

                {/* Input area mockup */}
                <div style={{ padding: '15px 20px', borderTop: '2px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--panel-bg-light)' }}>
                  <div style={{ flex: 1, height: '36px', background: 'var(--bg-color)', borderRadius: '18px', boxShadow: 'var(--clay-inset)' }}></div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-shadow-sm)' }}>
                    <MessageSquare size={16} color="#FF6B6B" />
                  </div>
                </div>
              </div>
              
              {/* Floating aesthetic elements */}
              <motion.div 
                className="floating-aesthetic-badge"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Clock size={16} color="#3b82f6" /> 24/7 Replies
              </motion.div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
