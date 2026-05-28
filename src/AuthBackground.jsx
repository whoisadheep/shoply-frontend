import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Particle Storm
function ParticleStorm() {
  const ref = useRef();
  
  // Create 2000 points scattered in a sphere
  const sphere = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 1.5 + Math.random() * 2; // Radius between 1.5 and 3.5
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    // Slow rotation
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
    
    // Slight mouse follow
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, (state.mouse.x * 0.5), 0.05);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, (state.mouse.y * 0.5), 0.05);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#8b5cf6" 
          size={0.02} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function AuthBackground() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: '#09090b', pointerEvents: 'none' }}>
      <Canvas eventSource={document.getElementById('root')} eventPrefix="client" camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
        <ParticleStorm />
      </Canvas>
    </div>
  );
}
