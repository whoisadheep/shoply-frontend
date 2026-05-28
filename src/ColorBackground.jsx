import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LiquidColorMesh() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    // Slow rotation
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.z += delta * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} scale={6}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial 
        color="#3b0764" 
        emissive="#1e1b4b"
        roughness={0.1}
        metalness={0.8}
        distort={0.4} 
        speed={1.5} 
      />
    </mesh>
  );
}

function FloatingBlobs() {
  const blob1 = useRef();
  const blob2 = useRef();

  useFrame((state, delta) => {
    blob1.current.rotation.x += delta * 0.2;
    blob1.current.rotation.y += delta * 0.3;
    
    blob2.current.rotation.x -= delta * 0.15;
    blob2.current.rotation.y -= delta * 0.25;
  });

  return (
    <>
      <mesh ref={blob1} position={[-3, 2, -4]} scale={3}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color="#4c1d95" roughness={0.2} metalness={0.8} distort={0.5} speed={2} />
      </mesh>
      
      <mesh ref={blob2} position={[3, -2, -3]} scale={4}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color="#0f172a" roughness={0.2} metalness={0.8} distort={0.6} speed={1.2} />
      </mesh>
    </>
  );
}

export default function ColorBackground() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: '#000000', pointerEvents: 'none', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#c084fc" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#3b82f6" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#9333ea" />
        
        <LiquidColorMesh />
        <FloatingBlobs />
        <Environment preset="city" />
      </Canvas>
      {/* CSS overlay to blur it out into a smooth gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backdropFilter: 'blur(100px)', zIndex: 1 }} />
    </div>
  );
}
