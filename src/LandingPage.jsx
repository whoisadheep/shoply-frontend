import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Bot, Zap, Clock, ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import ColorBackground from './ColorBackground';

// 3D Interactive Node
function AbstractNode() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.rotation.x = Math.cos(t / 4) / 2;
    
    // Slight mouse interaction (parallax)
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, (state.mouse.x * 2), 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, (state.mouse.y * 2), 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          wireframe={true}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#444444" roughness={0.2} metalness={1} />
      </mesh>
    </Float>
  );
}

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: 'transparent' }}>
      <ColorBackground />
      
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AbstractNode />
          <Environment preset="city" />
          <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </Canvas>
      </div>

      {/* HTML Overlay */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
        
        {/* Navbar */}
        <motion.nav 
          className="landing-nav"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={28} />
            Shoply AI
          </div>
          <button 
            onClick={onGetStarted}
            style={{ pointerEvents: 'auto', padding: '10px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            Dashboard Login
          </button>
        </motion.nav>

        {/* Hero Section */}
        <main className="hero-container">
          <div style={{ maxWidth: '600px' }}>
            <motion.h1 
              className="hero-title"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hire an AI Receptionist that never sleeps.
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect your business WhatsApp to our AI brain in 60 seconds. It answers FAQs, shares pricing, and collects leads 24/7.
            </motion.p>

            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={onGetStarted}
              style={{ pointerEvents: 'auto', padding: '16px 32px', background: '#fff', color: '#09090b', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Build your AI Agent <ArrowRight size={20} />
            </motion.button>
          </div>
        </main>

        {/* Features Footer */}
        <motion.div 
          className="features-footer"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="feature-item">
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}><Zap size={24} color="#a1a1aa" /></div>
            <div>
              <div style={{ fontWeight: 600 }}>Setup in Seconds</div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Just scan a QR code</div>
            </div>
          </div>
          <div className="feature-item">
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}><Clock size={24} color="#a1a1aa" /></div>
            <div>
              <div style={{ fontWeight: 600 }}>24/7 Instant Replies</div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Never miss a lead</div>
            </div>
          </div>
          <div className="feature-item">
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}><Bot size={24} color="#a1a1aa" /></div>
            <div>
              <div style={{ fontWeight: 600 }}>Custom Knowledge</div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Upload PDFs & FAQs</div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
