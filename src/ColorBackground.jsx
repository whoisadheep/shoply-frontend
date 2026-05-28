import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const glassMaterialProps = {
  roughness: 0.1,
  transmission: 1, // Add transparency
  thickness: 1.5, // Add refraction
  envMapIntensity: 2,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
};

function FloatingShapes() {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 10) / 2;
    group.current.rotation.x = Math.cos(t / 10) / 2;
  });

  return (
    <group ref={group}>
      {/* Pink Glass Sphere */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} position={[-4, 2, -5]}>
          <meshPhysicalMaterial {...glassMaterialProps} color="#ec4899" />
        </Sphere>
      </Float>

      {/* Blue Glass Donut */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <Torus args={[1.2, 0.4, 32, 64]} position={[4, -1, -4]} rotation={[1, 0.5, 0]}>
          <meshPhysicalMaterial {...glassMaterialProps} color="#3b82f6" />
        </Torus>
      </Float>

      {/* Purple Glass Icosahedron */}
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
        <Icosahedron args={[1.2, 0]} position={[-2, -3, -3]} rotation={[0, 1, 0]}>
          <meshPhysicalMaterial {...glassMaterialProps} color="#8b5cf6" />
        </Icosahedron>
      </Float>

      {/* Cyan Glass Sphere */}
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.8}>
        <Sphere args={[0.8, 64, 64]} position={[3, 3, -6]}>
          <meshPhysicalMaterial {...glassMaterialProps} color="#06b6d4" />
        </Sphere>
      </Float>
    </group>
  );
}

export default function ColorBackground() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: '#030712', pointerEvents: 'none', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#ffffff" />
        
        <FloatingShapes />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
