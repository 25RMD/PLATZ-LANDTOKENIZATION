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

// Helper function to create a star-shaped texture with enhanced glow
const createStarTexture = () => {
  const canvas = document.createElement('canvas');
  const size = 128; // Higher resolution for better glow
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  ctx.clearRect(0, 0, size, size);
  
  // Create multiple glow layers for enhanced effect
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Outer glow layer
  const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.5);
  outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  outerGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
  outerGlow.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
  outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = outerGlow;
  ctx.fillRect(0, 0, size, size);
  
  // Middle glow layer
  const middleGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.35);
  middleGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  middleGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  middleGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = middleGlow;
  ctx.fillRect(0, 0, size, size);
  
  // Create star shape
  const outerRadius = size * 0.25;
  const innerRadius = size * 0.1;
  const spikes = 5;
  
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  
  // Star gradient
  const starGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
  starGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  starGradient.addColorStop(0.2, 'rgba(255, 255, 240, 1.0)');
  starGradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.9)');
  starGradient.addColorStop(0.8, 'rgba(255, 255, 150, 0.6)');
  starGradient.addColorStop(1, 'rgba(255, 255, 100, 0.3)');
  
  ctx.fillStyle = starGradient;
  ctx.fill();
  
  // Add bright core
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.06, 0, Math.PI * 2);
  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.06);
  coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  coreGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
  ctx.fillStyle = coreGradient;
  ctx.fill();
  
  ctx.restore();
  
  return new THREE.CanvasTexture(canvas);
};

// Helper function to create points that roughly follow continent patterns
const getContinentPoints = (radius: number, count: number) => {
  const points = [];
  
  // Define rough continent regions (lat, lon ranges)
  const continents = [
    // North America
    { latRange: [25, 70], lonRange: [-160, -60], density: 0.15 },
    // South America  
    { latRange: [-55, 15], lonRange: [-80, -35], density: 0.12 },
    // Europe
    { latRange: [35, 70], lonRange: [-10, 40], density: 0.1 },
    // Africa
    { latRange: [-35, 35], lonRange: [-20, 50], density: 0.15 },
    // Asia
    { latRange: [10, 70], lonRange: [60, 180], density: 0.2 },
    // Australia/Oceania
    { latRange: [-45, -10], lonRange: [110, 180], density: 0.08 },
    // Additional scattered points for islands and other regions
    { latRange: [-90, 90], lonRange: [-180, 180], density: 0.2 }
  ];
  
  continents.forEach(continent => {
    const continentCount = Math.floor(count * continent.density);
    
    for (let i = 0; i < continentCount; i++) {
      // Random point within continent bounds
      const lat = continent.latRange[0] + Math.random() * (continent.latRange[1] - continent.latRange[0]);
      const lon = continent.lonRange[0] + Math.random() * (continent.lonRange[1] - continent.lonRange[0]);
      
      // Convert to spherical coordinates
      const phi = (lon + 180) * (Math.PI / 180); // longitude to phi
      const theta = (90 - lat) * (Math.PI / 180); // latitude to theta
      
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.cos(theta),
        z: radius * Math.sin(theta) * Math.sin(phi),
        phi,
        theta,
        continent: continents.indexOf(continent)
      });
    }
  });
  
  return points;
};

// Helper function to create random points on sphere surface
const getRandomSpherePoint = (radius: number) => {
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.random() * Math.PI;
  return {
    x: radius * Math.sin(theta) * Math.cos(phi),
    y: radius * Math.cos(theta),
    z: radius * Math.sin(theta) * Math.sin(phi),
    phi,
    theta
  };
};

// Globe component that renders the 3D wireframe sphere
const Globe = ({ scrollY, isMobile }: { scrollY: number; isMobile: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const connectionsRef = useRef<THREE.Group>(null);
  const isFirstFrame = useRef(true);

  // Adjust quality based on device
  const quality = useMemo(() => {
    return isMobile ? { segments: 32, particles: 75, connections: 25 } : { segments: 64, particles: 150, connections: 50 };
  }, [isMobile]);

  // Create globe geometry with wireframe
  const globeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2, quality.segments, quality.segments);
  }, [quality.segments]);

  // Create grid lines around the globe (realistic Earth lat/lon)
  const gridLines = useMemo(() => {
    const group = new THREE.Group();
    const latLines = isMobile ? 9 : 18;
    const lonLines = isMobile ? 12 : 24;
    const lineRes = isMobile ? 32 : 64;
    
    // Latitude lines (horizontal circles)
    for (let i = 1; i < latLines; i++) {
      const lat = -90 + (i / latLines) * 180;
      const phi = (90 - lat) * (Math.PI / 180);
      const radius = 2 * Math.sin(phi);
      const y = 2 * Math.cos(phi);
      
      if (radius > 0.1) {
        const points = [];
        for (let j = 0; j <= lineRes; j++) {
          const angle = (j / lineRes) * Math.PI * 2;
          points.push(new THREE.Vector3(
            radius * Math.cos(angle),
            y,
            radius * Math.sin(angle)
          ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Special styling for equator and tropics
        let opacity, color;
        if (Math.abs(lat) < 1) { // Equator
          opacity = isMobile ? 0.8 : 1.0;
          color = '#ffffff';
        } else if (Math.abs(lat - 23.5) < 1 || Math.abs(lat + 23.5) < 1) { // Tropics
          opacity = isMobile ? 0.7 : 0.9;
          color = '#00ffaa';
        } else if (Math.abs(lat - 66.5) < 1 || Math.abs(lat + 66.5) < 1) { // Arctic/Antarctic circles
          opacity = isMobile ? 0.6 : 0.8;
          color = '#00aaff';
        } else {
          opacity = isMobile ? 0.4 : 0.6;
          color = '#ffffff';
        }
        
        const material = new THREE.LineBasicMaterial({ 
          color, 
          opacity, 
          transparent: true 
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
      }
    }

    // Longitude lines (vertical semicircles)
    for (let i = 0; i < lonLines; i++) {
      const lon = (i / lonLines) * 360 - 180;
      const angle = (lon + 180) * (Math.PI / 180);
      const points = [];
      
      for (let j = 0; j <= lineRes / 2; j++) {
        const lat = -90 + (j / (lineRes / 2)) * 180;
        const phi = (90 - lat) * (Math.PI / 180);
        points.push(new THREE.Vector3(
          2 * Math.sin(phi) * Math.cos(angle),
          2 * Math.cos(phi),
          2 * Math.sin(phi) * Math.sin(angle)
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Special styling for prime meridian and international date line
      let opacity, color;
      if (Math.abs(lon) < 1) { // Prime Meridian
        opacity = isMobile ? 0.8 : 1.0;
        color = '#ffffff';
      } else if (Math.abs(lon - 180) < 1 || Math.abs(lon + 180) < 1) { // International Date Line
        opacity = isMobile ? 0.7 : 0.9;
        color = '#00aaff';
      } else {
        opacity = isMobile ? 0.3 : 0.5;
        color = '#ffffff';
      }
      
      const material = new THREE.LineBasicMaterial({ 
        color, 
        opacity, 
        transparent: true 
      });
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    return group;
  }, [isMobile, quality]);

  // Create particles for land tokens with continent-based distribution
  const { particles, tokenPositions, highlightedTokens, continentData } = useMemo(() => {
    const particleCount = quality.particles;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const glowIntensity = new Float32Array(particleCount);
    const tokenPos = [];
    const highlighted = [];
    const continents = [];
    
    // Get continent-based points for more realistic distribution
    const continentPoints = getContinentPoints(2.0, Math.floor(particleCount * 0.7));
    const randomPoints = [];
    
    // Fill remaining with random ocean/space points
    for (let i = continentPoints.length; i < particleCount; i++) {
      randomPoints.push(getRandomSpherePoint(2.0));
    }
    
    const allPoints = [...continentPoints, ...randomPoints];
    
    for (let i = 0; i < particleCount; i++) {
      const point = allPoints[i] || getRandomSpherePoint(2.0);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      
      tokenPos.push(point);
      continents.push(point.continent || -1);
      
      // Different highlighting chances based on location
      const isLandPoint = i < continentPoints.length;
      const highlightChance = isLandPoint ? 0.2 : 0.08;
      const isHighlighted = Math.random() < highlightChance;
      highlighted.push(isHighlighted);
      
      if (isHighlighted) {
        // Highlighted tokens: vibrant glowing colors
        if (isLandPoint) {
          colors[i * 3] = 1.0; // R - Pure golden glow
          colors[i * 3 + 1] = 0.9; // G  
          colors[i * 3 + 2] = 0.3; // B
        } else {
          colors[i * 3] = 0.3; // R - Pure cyan glow
          colors[i * 3 + 1] = 0.9; // G
          colors[i * 3 + 2] = 1.0; // B
        }
        sizes[i] = isMobile ? 0.12 : 0.15;
        glowIntensity[i] = 1.0;
      } else {
        // Regular tokens: softer glowing colors
        if (isLandPoint) {
          colors[i * 3] = 0.8; // R (warm earth glow)
          colors[i * 3 + 1] = 0.7; // G
          colors[i * 3 + 2] = 0.4; // B
        } else {
          colors[i * 3] = 0.4; // R (ocean blue glow)
          colors[i * 3 + 1] = 0.7; // G
          colors[i * 3 + 2] = 0.9; // B
        }
        sizes[i] = isMobile ? 0.06 : 0.08;
        glowIntensity[i] = 0.6;
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('glowIntensity', new THREE.BufferAttribute(glowIntensity, 1));
    
    return { 
      particles: geometry, 
      tokenPositions: tokenPos, 
      highlightedTokens: highlighted,
      continentData: continents
    };
  }, [quality.particles, isMobile]);

  // Create connection lines between nearby tokens (skip on mobile for performance)
  const connections = useMemo(() => {
    if (isMobile) return new THREE.Group();
    
    const group = new THREE.Group();
    const connectionCount = quality.connections;
    
    for (let i = 0; i < connectionCount; i++) {
      const point1 = tokenPositions[Math.floor(Math.random() * tokenPositions.length)];
      const point2 = tokenPositions[Math.floor(Math.random() * tokenPositions.length)];
      
      if (point1 !== point2) {
        const points = [
          new THREE.Vector3(point1.x, point1.y, point1.z),
          new THREE.Vector3(point2.x, point2.y, point2.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
          color: '#ffffff', 
          opacity: 0.3, 
          transparent: true 
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
      }
    }
    
    return group;
  }, [tokenPositions, quality.connections, isMobile]);

  const particleMaterial = useMemo(() => {
    const starTexture = createStarTexture();
    
    return new THREE.PointsMaterial({
      size: isMobile ? 0.25 : 0.35, // Larger base size for better glow visibility
      map: starTexture,
      opacity: 1.0,
      transparent: true,
      blending: THREE.AdditiveBlending, // Critical for glow effect
      vertexColors: true,
      sizeAttenuation: true,
      alphaTest: 0.001,
      depthWrite: false, // Prevents z-fighting
      depthTest: true, // Ensures proper rendering order
    });
  }, [isMobile]);

  // Animation loop - WITH EXPLOSIVE SCROLL SCALING
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // On first frame, ensure everything is positioned correctly
    if (isFirstFrame.current) {
      if (meshRef.current && gridRef.current && particlesRef.current) {
        meshRef.current.position.set(0, 0, 0);
        gridRef.current.position.set(0, 0, 0);
        particlesRef.current.position.set(0, 0, 0);
        
        meshRef.current.rotation.set(0, 0, 0);
        gridRef.current.rotation.set(0, 0, 0);
        particlesRef.current.rotation.set(0, 0, 0);
        
        meshRef.current.scale.setScalar(1);
        gridRef.current.scale.setScalar(1);
        particlesRef.current.scale.setScalar(1);
      }
      
      if (!isMobile && connectionsRef.current) {
        connectionsRef.current.position.set(0, 0, 0);
        connectionsRef.current.rotation.set(0, 0, 0);
        connectionsRef.current.scale.setScalar(1);
      }
      
      isFirstFrame.current = false;
      return; // Skip animations on first frame
    }
    
    // Basic rotation based only on time
    if (meshRef.current && gridRef.current && particlesRef.current) {
      const baseRotation = time * (isMobile ? 0.03 : 0.05);
      
      meshRef.current.rotation.y = baseRotation;
      gridRef.current.rotation.y = baseRotation * 0.8;
      particlesRef.current.rotation.y = baseRotation * 0.6;
      
      // Subtle oscillation on X axis
      const oscillation = Math.sin(time * 0.3) * (isMobile ? 0.03 : 0.05);
      meshRef.current.rotation.x = oscillation;
      gridRef.current.rotation.x = oscillation * 0.8;
      
      // EXPLOSIVE SCALING EFFECT BASED ON SCROLL
      const timePulse = 1 + Math.sin(time * 0.8) * (isMobile ? 0.01 : 0.02);
      
      // Calculate explosive scale based on scroll with smooth easing
      const normalizedScrollY = Math.max(0, scrollY || 0);
      const scrollProgress = Math.min(normalizedScrollY / 3000, 1); // Normalize to 0-1 over 3000px for smoother progression
      
      // Smooth easing function for more immersive scaling
      const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      // Multi-stage scaling for cinematic effect
      let explosiveScale = 1;
      if (scrollProgress < 0.3) {
        // Gentle start
        explosiveScale = 1 + easeInOutQuad(scrollProgress / 0.3) * 0.5;
      } else if (scrollProgress < 0.7) {
        // Accelerating expansion
        const localProgress = (scrollProgress - 0.3) / 0.4;
        explosiveScale = 1.5 + easeOutExpo(localProgress) * (isMobile ? 4 : 6);
      } else {
        // Dramatic finale
        const localProgress = (scrollProgress - 0.7) / 0.3;
        const baseScale = 1.5 + (isMobile ? 4 : 6);
        explosiveScale = baseScale + Math.pow(localProgress, 2) * (isMobile ? 3.5 : 5.5);
      }
      
      // Add subtle oscillation based on scroll for organic feel
      const scrollOscillation = Math.sin(scrollProgress * Math.PI * 2) * 0.05 * scrollProgress;
      
      // Combine time pulse with explosive scaling
      const finalScale = timePulse * explosiveScale * (1 + scrollOscillation);
      
      meshRef.current.scale.setScalar(finalScale);
      gridRef.current.scale.setScalar(finalScale);
      particlesRef.current.scale.setScalar(finalScale);
      
      // Enhanced particle animations with dramatic twinkling
      const geometry = particlesRef.current.geometry;
      const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
      const sizes = geometry.getAttribute('size') as THREE.BufferAttribute;
      
      for (let i = 0; i < highlightedTokens.length; i++) {
        const isLandPoint = continentData[i] >= 0;
        
        if (highlightedTokens[i]) {
          // Dramatic pulsing and twinkling for highlighted tokens
          const mainPulse = Math.sin(time * 2 + i * 0.3) * 0.5 + 0.5;
          const fastTwinkle = Math.sin(time * 8 + i * 1.5) * 0.3 + 0.7;
          const slowGlow = Math.sin(time * 0.5 + i * 0.1) * 0.2 + 0.8;
          
          // Increase intensity with scroll for explosive effect
          const scrollIntensity = 1 + scrollProgress * 2; // Up to 3x intensity
          const intensity = mainPulse * fastTwinkle * slowGlow * scrollIntensity;
          
          if (isLandPoint) {
            // Golden glow with warm variations
            colors.setXYZ(i, 
              Math.min(1.0, 1.0 * intensity), 
              Math.min(1.0, (0.9 + Math.sin(time * 3 + i) * 0.1) * intensity), 
              Math.min(1.0, (0.3 + Math.sin(time * 4 + i) * 0.2) * intensity)
            );
          } else {
            // Cyan glow with cool variations
            colors.setXYZ(i, 
              Math.min(1.0, (0.3 + Math.sin(time * 2 + i) * 0.2) * intensity), 
              Math.min(1.0, (0.9 + Math.sin(time * 3.5 + i) * 0.1) * intensity), 
              Math.min(1.0, 1.0 * intensity)
            );
          }
          
          // Dynamic size with complex twinkling and scroll scaling
          const baseSize = isMobile ? 0.12 : 0.15;
          const sizePulse = Math.sin(time * 6 + i * 0.7) * 0.05;
          const sizeTwinkle = Math.sin(time * 15 + i * 2) * 0.02;
          const scrollSizeBoost = 1 + scrollProgress * 0.5; // Up to 1.5x size
          sizes.setX(i, (baseSize + sizePulse + sizeTwinkle) * scrollSizeBoost);
          
        } else {
          // Subtle breathing effect for regular tokens
          const breathe = Math.sin(time * 1.5 + i * 0.05) * 0.2 + 0.8;
          const subtleTwinkle = Math.sin(time * 4 + i * 0.3) * 0.15 + 0.85;
          
          // Slight intensity boost with scroll
          const scrollIntensity = 1 + scrollProgress * 0.5;
          const intensity = breathe * subtleTwinkle * scrollIntensity;
          
          if (isLandPoint) {
            // Warm earth glow
            colors.setXYZ(i, 
              Math.min(1.0, 0.8 * intensity), 
              Math.min(1.0, 0.7 * intensity), 
              Math.min(1.0, 0.4 * intensity)
            );
          } else {
            // Cool ocean glow
            colors.setXYZ(i, 
              Math.min(1.0, 0.4 * intensity), 
              Math.min(1.0, 0.7 * intensity), 
              Math.min(1.0, 0.9 * intensity)
            );
          }
          
          // Gentle size variation with scroll boost
          const baseSize = isMobile ? 0.06 : 0.08;
          const sizeVariation = Math.sin(time * 3 + i * 0.2) * 0.02;
          const scrollSizeBoost = 1 + scrollProgress * 0.3;
          sizes.setX(i, (baseSize + sizeVariation) * scrollSizeBoost);
        }
      }
      
      colors.needsUpdate = true;
      sizes.needsUpdate = true;
    }
    
    // Handle connections separately (desktop only)
    if (!isMobile && connectionsRef.current) {
      const baseRotation = time * 0.05;
      connectionsRef.current.rotation.y = baseRotation * 0.4;
      
      // Scale connections with scroll using same easing as globe
      const normalizedScrollY = Math.max(0, scrollY || 0);
      const scrollProgress = Math.min(normalizedScrollY / 3000, 1);
      
      // Use same multi-stage scaling as globe for consistency
      let explosiveScale = 1;
      if (scrollProgress < 0.3) {
        explosiveScale = 1 + ((t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)(scrollProgress / 0.3) * 0.5;
      } else if (scrollProgress < 0.7) {
        const localProgress = (scrollProgress - 0.3) / 0.4;
        explosiveScale = 1.5 + ((t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t))(localProgress) * 6;
      } else {
        const localProgress = (scrollProgress - 0.7) / 0.3;
        explosiveScale = 7.5 + Math.pow(localProgress, 2) * 5.5;
      }
      
      connectionsRef.current.scale.setScalar(explosiveScale);
      
      // Animate connection line opacity with scroll intensity
      const scrollOpacityBoost = 1 + scrollProgress * 2;
      connectionsRef.current.children.forEach((child, index) => {
        const lineMaterial = (child as THREE.Line).material as THREE.LineBasicMaterial;
        const phase = (index * 0.1) + time * 1.5;
        const baseOpacity = 0.15 + Math.sin(phase) * 0.15;
        lineMaterial.opacity = Math.min(0.8, baseOpacity * scrollOpacityBoost);
      });
    }
  });

  return (
    <group>
      {/* Main globe wireframe */}
      <mesh ref={meshRef} geometry={globeGeometry}>
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          opacity={isMobile ? 0.15 : 0.25} 
          transparent 
        />
      </mesh>
      
      {/* Grid lines */}
      <primitive ref={gridRef} object={gridLines} />
      
      {/* Connection lines (desktop only) */}
      {!isMobile && <primitive ref={connectionsRef} object={connections} />}
      
      {/* Particles representing land tokens */}
      <points ref={particlesRef} geometry={particles} material={particleMaterial} />
    </group>
  );
};

// Camera controls for the scene - WITH EXPLOSIVE SCROLL RESPONSE
const CameraController = ({ scrollY, isMobile }: { scrollY: number; isMobile: boolean }) => {
  const { camera } = useThree();
  const isFirstFrame = useRef(true);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Calculate scroll-based camera distance with smooth easing
    const normalizedScrollY = Math.max(0, scrollY || 0);
    const scrollProgress = Math.min(normalizedScrollY / 3000, 1);
    
    // Smooth easing for camera movement
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easedProgress = easeInOutCubic(scrollProgress);
    
    // Multi-stage camera pullback for cinematic effect
    const baseDistance = isMobile ? 10 : 8;
    let explosiveDistance = baseDistance;
    
    if (scrollProgress < 0.3) {
      // Subtle pullback at start
      explosiveDistance = baseDistance + easedProgress * 2;
    } else if (scrollProgress < 0.7) {
      // Accelerating pullback
      const localProgress = (scrollProgress - 0.3) / 0.4;
      explosiveDistance = baseDistance + 2 + easeInOutCubic(localProgress) * (isMobile ? 15 : 20);
    } else {
      // Dramatic final pullback
      const localProgress = (scrollProgress - 0.7) / 0.3;
      const midDistance = baseDistance + 2 + (isMobile ? 15 : 20);
      explosiveDistance = midDistance + Math.pow(localProgress, 1.5) * (isMobile ? 20 : 30);
    }
    
    // Add subtle camera shake for immersion
    const cameraShake = scrollProgress > 0.5 ? Math.sin(time * 15) * 0.02 * (scrollProgress - 0.5) : 0;
    
    // On first frame, set initial camera position
    if (isFirstFrame.current) {
      camera.position.set(0, 0, baseDistance);
      camera.lookAt(0, 0, 0);
      isFirstFrame.current = false;
      return;
    }
    
    // Reduce orbit as globe gets bigger to maintain focus
    const orbitRadius = (isMobile ? 0.2 : 0.5) * (1 - scrollProgress * 0.7);
    const orbitSpeed = time * (isMobile ? 0.05 : 0.1) * (1 - scrollProgress * 0.5); // Slow down orbit
    
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

// Main component - WITH EXPLOSIVE SCROLL SCALING
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
                position: [0, 0, isMobile ? 10 : 8], 
                fov: 45,
                near: 0.1,
                far: 1000
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
              
              {/* Point lights for cyber glow effect */}
              <pointLight position={[10, 10, 10]} intensity={isMobile ? 0.8 : 1.2} color="#00ffff" />
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