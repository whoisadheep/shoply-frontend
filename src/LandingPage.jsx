import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Clock, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import MeshBackground from './MeshBackground';

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: 'transparent' }}>
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
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={28} color="#ec4899" />
            Shoply AI
          </div>
          <button 
            onClick={onGetStarted}
            style={{ pointerEvents: 'auto', padding: '10px 24px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Sign In
          </button>
        </motion.nav>

        {/* Hero Section */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2rem' }}>
          <div className="landing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1200px', width: '100%', alignItems: 'center' }}>
            
            {/* Left Copy */}
            <motion.div 
              className="landing-copy"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '20px', color: '#fbcfe8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <Zap size={14} fill="#ec4899" color="#ec4899" /> v2.0 Now Live
              </div>
              
              <h1 style={{ fontSize: '4rem', lineHeight: 1.1, fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                The AI Receptionist for your WhatsApp.
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '500px' }}>
                Never miss a customer inquiry again. Shoply automatically replies to messages, captures leads, and answers FAQs 24/7.
              </p>
              
              <button 
                onClick={onGetStarted}
                style={{ pointerEvents: 'auto', padding: '16px 32px', background: '#ec4899', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(236, 72, 153, 0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(236, 72, 153, 0.4)'; }}
              >
                Get Started for Free <ArrowRight size={20} />
              </button>

              <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} /> 60-second setup</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} /> No credit card</span>
              </div>
            </motion.div>

            {/* Right 2D Floating Visual */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {/* Glass Mockup Card */}
              <div style={{
                width: '380px',
                height: '480px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Shoply AI</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-color)' }}></div> Online
                    </div>
                  </div>
                </div>
                
                {/* Chat Area */}
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {/* Customer Message */}
                  <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', maxWidth: '85%', fontSize: '0.9rem' }}>
                    Hi! Are you open today? And do you sell headphones?
                  </div>
                  
                  {/* AI Response */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, originY: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: '4px', maxWidth: '85%', fontSize: '0.9rem', color: '#fff' }}
                  >
                    Yes, we're open until 8 PM! We have a wide range of headphones starting at ₹999. Would you like me to send you the catalog?
                  </motion.div>
                </div>

                {/* Input area mockup */}
                <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px' }}></div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={16} color="#ec4899" />
                  </div>
                </div>
              </div>
              
              {/* Floating aesthetic elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '10%', right: '-5%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}
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
