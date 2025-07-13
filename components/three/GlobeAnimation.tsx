"use client";
import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';

// Fallback component for when Three.js fails to load
const GlobeFallback = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div className="relative w-64 h-64 rounded-full border-2 border-cyan-400/30 animate-pulse">
        <div className="absolute inset-4 rounded-full border border-cyan-400/20 animate-spin"></div>
        <div className="absolute inset-8 rounded-full border border-white/20 animate-bounce"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

// Loading component
const GlobeLoading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-cyan-400 font-mono text-sm animate-pulse">
        Loading 3D Globe...
      </div>
    </div>
  );
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Helper function to create realistic Earth diffuse texture
const createEarthTexture = () => {
  const canvas = document.createElement('canvas');
  const size = 2048; // Higher resolution for better detail
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Create realistic ocean gradient
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, size);
  oceanGradient.addColorStop(0, '#0f172a'); // Very deep blue
  oceanGradient.addColorStop(0.3, '#1e40af'); // Deep blue
  oceanGradient.addColorStop(0.5, '#2563eb'); // Ocean blue
  oceanGradient.addColorStop(0.7, '#3b82f6'); // Lighter blue
  oceanGradient.addColorStop(1, '#1e40af'); // Back to deep
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add ocean depth variations
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 100 + 50;
    
    const depthGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    depthGradient.addColorStop(0, 'rgba(15, 23, 42, 0.3)'); // Darker depths
    depthGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    ctx.fillStyle = depthGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create realistic continent shapes and positions
  const continents = [
    // North America
    {
      x: 0.2, y: 0.3, width: 0.3, height: 0.4,
      color: '#166534', // Dark green
      shapes: [
        { x: 0.1, y: 0.1, w: 0.25, h: 0.35 }, // Main landmass
        { x: 0.05, y: 0.45, w: 0.15, h: 0.15 }, // Mexico
        { x: 0.35, y: 0.05, w: 0.1, h: 0.2 }, // Greenland
      ]
    },
    // South America
    {
      x: 0.25, y: 0.6, width: 0.15, height: 0.35,
      color: '#15803d',
      shapes: [
        { x: 0.05, y: 0.1, w: 0.12, h: 0.3 }, // Main continent
        { x: 0.02, y: 0.05, w: 0.08, h: 0.1 }, // Northern part
      ]
    },
    // Africa
    {
      x: 0.48, y: 0.35, width: 0.18, height: 0.45,
      color: '#22c55e',
      shapes: [
        { x: 0.02, y: 0.1, w: 0.14, h: 0.35 }, // Main Africa
        { x: 0.12, y: 0.02, w: 0.06, h: 0.12 }, // North Africa
      ]
    },
    // Europe
    {
      x: 0.45, y: 0.15, width: 0.15, height: 0.2,
      color: '#16a34a',
      shapes: [
        { x: 0.02, y: 0.05, w: 0.12, h: 0.15 }, // Main Europe
        { x: 0.08, y: 0.02, w: 0.06, h: 0.08 }, // Scandinavia
      ]
    },
    // Asia
    {
      x: 0.55, y: 0.15, width: 0.4, height: 0.45,
      color: '#15803d',
      shapes: [
        { x: 0.05, y: 0.1, w: 0.35, h: 0.3 }, // Main Asia
        { x: 0.25, y: 0.05, w: 0.15, h: 0.15 }, // Siberia
        { x: 0.15, y: 0.35, w: 0.2, h: 0.1 }, // India
      ]
    },
    // Australia
    {
      x: 0.75, y: 0.7, width: 0.2, height: 0.15,
      color: '#ca8a04',
      shapes: [
        { x: 0.02, y: 0.02, w: 0.16, h: 0.11 }, // Australia
        { x: 0.12, y: 0.12, w: 0.06, h: 0.03 }, // Tasmania
      ]
    }
  ];
  
  // Draw continents with realistic shapes
  continents.forEach(continent => {
    continent.shapes.forEach(shape => {
      const baseX = continent.x * size + shape.x * size;
      const baseY = continent.y * size + shape.y * size;
      const width = shape.w * size;
      const height = shape.h * size;
      
      // Create terrain gradient
      const terrainGradient = ctx.createRadialGradient(
        baseX + width/2, baseY + height/2, 0,
        baseX + width/2, baseY + height/2, Math.max(width, height)/2
      );
      terrainGradient.addColorStop(0, continent.color);
      terrainGradient.addColorStop(0.4, '#22c55e'); // Lighter green
      terrainGradient.addColorStop(0.7, '#16a34a'); // Medium green
      terrainGradient.addColorStop(1, '#15803d'); // Darker green
      
      ctx.fillStyle = terrainGradient;
      
      // Create organic continent shape
      ctx.beginPath();
      const points = 32;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const noise1 = Math.sin(angle * 3) * 0.1;
        const noise2 = Math.cos(angle * 5) * 0.05;
        const noise3 = Math.sin(angle * 7) * 0.03;
        const totalNoise = noise1 + noise2 + noise3;
        
        const radiusX = (width / 2) * (1 + totalNoise);
        const radiusY = (height / 2) * (1 + totalNoise * 0.8);
        
        const x = baseX + width/2 + Math.cos(angle) * radiusX;
        const y = baseY + height/2 + Math.sin(angle) * radiusY;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // Add mountain ranges and terrain features
      for (let j = 0; j < 20; j++) {
        const mx = baseX + Math.random() * width;
        const my = baseY + Math.random() * height;
        const mRadius = Math.random() * 30 + 10;
        
        const mountainGradient = ctx.createRadialGradient(mx, my, 0, mx, my, mRadius);
        mountainGradient.addColorStop(0, '#365314'); // Dark green/brown
        mountainGradient.addColorStop(0.5, '#16a34a');
        mountainGradient.addColorStop(1, 'rgba(22, 163, 74, 0)');
        
        ctx.fillStyle = mountainGradient;
        ctx.beginPath();
        ctx.arc(mx, my, mRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
  
  // Add ice caps
  // North pole
  const northPoleGradient = ctx.createRadialGradient(size/2, 0, 0, size/2, 0, size * 0.15);
  northPoleGradient.addColorStop(0, '#f8fafc'); // White
  northPoleGradient.addColorStop(0.7, '#e2e8f0'); // Light gray
  northPoleGradient.addColorStop(1, 'rgba(226, 232, 240, 0)');
  
  ctx.fillStyle = northPoleGradient;
  ctx.beginPath();
  ctx.arc(size/2, 0, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // South pole
  const southPoleGradient = ctx.createRadialGradient(size/2, size, 0, size/2, size, size * 0.12);
  southPoleGradient.addColorStop(0, '#f8fafc');
  southPoleGradient.addColorStop(0.7, '#e2e8f0');
  southPoleGradient.addColorStop(1, 'rgba(226, 232, 240, 0)');
  
  ctx.fillStyle = southPoleGradient;
  ctx.beginPath();
  ctx.arc(size/2, size, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  
  // Add subtle cloud patterns
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 40 + 20;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Helper function to create realistic Earth normal map
const createEarthNormalMap = () => {
  const canvas = document.createElement('canvas');
  const size = 1024;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Create base normal map color (neutral)
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);
  
  // Add mountain ranges with proper normal mapping
  const mountainRanges = [
    // Himalayas
    { x: 0.7, y: 0.35, w: 0.15, h: 0.05, intensity: 0.8 },
    // Andes
    { x: 0.28, y: 0.6, w: 0.03, h: 0.3, intensity: 0.7 },
    // Rockies
    { x: 0.15, y: 0.3, w: 0.05, h: 0.2, intensity: 0.6 },
    // Alps
    { x: 0.48, y: 0.25, w: 0.06, h: 0.03, intensity: 0.5 },
    // Urals
    { x: 0.58, y: 0.2, w: 0.02, h: 0.15, intensity: 0.4 },
  ];
  
  mountainRanges.forEach(range => {
    const baseX = range.x * size;
    const baseY = range.y * size;
    const width = range.w * size;
    const height = range.h * size;
    
    for (let i = 0; i < 50; i++) {
      const x = baseX + Math.random() * width;
      const y = baseY + Math.random() * height;
      const radius = Math.random() * 20 + 10;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const intensity = range.intensity * (0.5 + Math.random() * 0.5);
      gradient.addColorStop(0, `rgba(${128 + intensity * 127}, ${128 + intensity * 127}, ${255}, 1)`);
      gradient.addColorStop(1, 'rgba(128, 128, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Add ocean depth variations
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 30 + 10;
    const depth = Math.random() * 0.2 + 0.1;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${128 - depth * 127}, ${128 - depth * 127}, ${255}, 1)`);
    gradient.addColorStop(1, 'rgba(128, 128, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Globe component that renders the realistic Earth sphere
const Globe = ({ scrollY, isMobile }: { scrollY: number; isMobile: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isFirstFrame = useRef(true);

  // Adjust quality based on device
  const quality = useMemo(() => {
    return isMobile ? { segments: 32 } : { segments: 64 };
  }, [isMobile]);

  // Create globe geometry with higher detail for realistic Earth
  const globeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2.2, quality.segments, quality.segments);
  }, [quality.segments]);

  // Create realistic Earth material
  const earthMaterial = useMemo(() => {
    const diffuseTexture = createEarthTexture();
    const normalTexture = createEarthNormalMap();
    
    return new THREE.MeshPhongMaterial({
      map: diffuseTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      shininess: 10,
      specular: new THREE.Color(0x111111),
      transparent: true,
      opacity: isMobile ? 0.85 : 0.9,
    });
  }, [isMobile]);



  // Animation loop with scroll scaling
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // On first frame, ensure everything is positioned correctly
    if (isFirstFrame.current) {
      if (meshRef.current) {
        meshRef.current.position.set(0, 0, 0);
        meshRef.current.rotation.set(0, 0, 0);
        meshRef.current.scale.setScalar(1);
      }
      
      isFirstFrame.current = false;
      return;
    }
    
    // Basic rotation based only on time
    if (meshRef.current) {
      const baseRotation = time * (isMobile ? 0.08 : 0.12);
      
      meshRef.current.rotation.y = baseRotation;
      
      // Subtle oscillation on X axis
      const oscillation = Math.sin(time * 0.3) * (isMobile ? 0.03 : 0.05);
      meshRef.current.rotation.x = oscillation;
      
      // EXPLOSIVE SCALING EFFECT BASED ON SCROLL
      const timePulse = 1 + Math.sin(time * 0.8) * (isMobile ? 0.01 : 0.02);
      
      // Calculate conservative scale based on scroll
      const normalizedScrollY = Math.max(0, scrollY || 0);
      const scrollProgress = Math.min(normalizedScrollY / 2500, 1);
      
      // Smooth easing function for more immersive scaling
      const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      // Balanced scaling that's dramatic but stays in view
      let explosiveScale = 1;
      
      if (scrollProgress < 0.3) {
        explosiveScale = 1 + easeInOutQuad(scrollProgress / 0.3) * (isMobile ? 1.0 : 1.5);
      } else if (scrollProgress < 0.7) {
        const localProgress = (scrollProgress - 0.3) / 0.4;
        explosiveScale = 1 + (isMobile ? 1.0 : 1.5) + easeOutExpo(localProgress) * (isMobile ? 1.8 : 2.5);
      } else {
        const localProgress = (scrollProgress - 0.7) / 0.3;
        explosiveScale = 1 + (isMobile ? 1.0 : 1.5) + (isMobile ? 1.8 : 2.5) + Math.pow(localProgress, 0.8) * (isMobile ? 1.5 : 2.0);
      }
      
      // Clamp maximum scale to prevent clipping
      const maxScale = isMobile ? 4.5 : 6.0;
      explosiveScale = Math.min(explosiveScale, maxScale);
      
      const finalScale = explosiveScale * timePulse;
      
      meshRef.current.scale.setScalar(finalScale);
    }
  });

  return (
    <group>
      {/* Main Earth globe */}
      <mesh ref={meshRef} geometry={globeGeometry} material={earthMaterial} />
    </group>
  );
};

// Camera controls for the scene
const CameraController = ({ scrollY, isMobile }: { scrollY: number; isMobile: boolean }) => {
  const { camera } = useThree();
  const isFirstFrame = useRef(true);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Calculate scroll-based camera distance
    const normalizedScrollY = Math.max(0, scrollY || 0);
    const scrollProgress = Math.min(normalizedScrollY / 2500, 1);
    
    // Smooth easing for camera movement
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easedProgress = easeInOutCubic(scrollProgress);
    
    // Camera pullback to accommodate scaled globe - MUCH MORE AGGRESSIVE
    const baseDistance = isMobile ? 12 : 10;
    let explosiveDistance = baseDistance;
    
    if (scrollProgress < 0.3) {
      explosiveDistance = baseDistance + easedProgress * (isMobile ? 15 : 20);
    } else if (scrollProgress < 0.7) {
      const localProgress = (scrollProgress - 0.3) / 0.4;
      explosiveDistance = baseDistance + (isMobile ? 15 : 20) + easeInOutCubic(localProgress) * (isMobile ? 35 : 50);
    } else {
      const localProgress = (scrollProgress - 0.7) / 0.3;
      const midDistance = baseDistance + (isMobile ? 15 : 20) + (isMobile ? 35 : 50);
      explosiveDistance = midDistance + Math.pow(localProgress, 1.2) * (isMobile ? 50 : 80);
    }
    
    // Add moderate camera shake for immersion
    const cameraShake = scrollProgress > 0.4 ? Math.sin(time * 15) * 0.03 * (scrollProgress - 0.4) : 0;
    
    // On first frame, set initial camera position
    if (isFirstFrame.current) {
      camera.position.set(0, 0, baseDistance);
      camera.lookAt(0, 0, 0);
      isFirstFrame.current = false;
      return;
    }
    
    // Reduce orbit as globe gets bigger to maintain focus
    const orbitRadius = (isMobile ? 0.2 : 0.5) * (1 - scrollProgress * 0.7);
    const orbitSpeed = time * (isMobile ? 0.08 : 0.15) * (1 - scrollProgress * 0.5);
    
    // Apply smooth camera positioning with shake
    camera.position.x = Math.sin(orbitSpeed) * orbitRadius + cameraShake;
    camera.position.z = explosiveDistance + Math.cos(orbitSpeed) * orbitRadius;
    camera.position.y = Math.sin(time * 0.2) * (isMobile ? 0.1 : 0.2) * (1 - scrollProgress * 0.5) + cameraShake * 0.5;
    
    // Slight camera tilt for dramatic effect at high scroll
    if (scrollProgress > 0.8) {
      const tiltAmount = (scrollProgress - 0.8) / 0.2 * 0.1;
      camera.rotation.z = Math.sin(time * 0.5) * tiltAmount;
    }
    
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

// Error Boundary Component
class GlobeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Globe Animation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Main component
interface GlobeAnimationProps {
  className?: string;
}

const GlobeAnimation: React.FC<GlobeAnimationProps> = ({ className = "" }) => {
  const { scrollY } = useScroll();
  const [scrollValue, setScrollValue] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
    
    // Get initial scroll value
    const initialScroll = scrollY.get() || 0;
    setScrollValue(initialScroll);
    
    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    const unsubscribe = scrollY.onChange((latest) => {
      setScrollValue(latest);
    });
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [scrollY]);

  // Don't render on server-side
  if (!isClient) {
    return <GlobeLoading />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <GlobeErrorBoundary fallback={<GlobeFallback className={className} />}>
        <Suspense fallback={<GlobeLoading />}>
          {isReady && (
            <Canvas
              camera={{ 
                position: [0, 0, isMobile ? 12 : 10], 
                fov: 60,
                near: 0.1,
                far: 2000
              }}
              style={{ background: 'transparent' }}
              gl={{ 
                antialias: !isMobile,
                alpha: true,
                powerPreference: isMobile ? "low-power" : "high-performance",
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false
              }}
              dpr={isMobile ? 1 : (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1)}
              resize={{ polyfill: ResizeObserver }}
            >
              {/* Ambient lighting */}
              <ambientLight intensity={isMobile ? 0.6 : 0.8} />
              
              {/* Point lights for realistic Earth lighting */}
              <pointLight position={[10, 10, 10]} intensity={isMobile ? 0.8 : 1.2} color="#ffffff" />
              <pointLight position={[-10, -10, -10]} intensity={isMobile ? 0.6 : 1.0} color="#ffffff" />
              {!isMobile && <pointLight position={[0, 10, -10]} intensity={0.8} color="#ffffff" />}
              
              {/* Globe and animations with scroll effects */}
              <Globe scrollY={scrollValue} isMobile={isMobile} />
              
              {/* Camera controller with scroll effects */}
              <CameraController scrollY={scrollValue} isMobile={isMobile} />
            </Canvas>
          )}
        </Suspense>
      </GlobeErrorBoundary>
    </div>
  );
};

export default GlobeAnimation; 