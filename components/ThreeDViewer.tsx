
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Wall, Furniture, FurnitureType } from '../types';
import { Sun, Moon, Clock } from 'lucide-react';

interface ThreeDViewerProps {
  walls: Wall[];
  furniture: Furniture[];
}

// Refined material map with natural tones and adjusted PBR properties
const MATERIAL_MAP: Record<string, { color: number, roughness: number, metalness: number }> = {
  oak: { color: 0xd4b483, roughness: 0.85, metalness: 0.05 },
  walnut: { color: 0x4e3b31, roughness: 0.75, metalness: 0.1 },
  fabric_grey: { color: 0x8a8a8a, roughness: 1.0, metalness: 0.0 },
  velvet_navy: { color: 0x2c3e50, roughness: 0.9, metalness: 0.0 },
  leather_black: { color: 0x1a1a1a, roughness: 0.35, metalness: 0.1 },
  metal_chrome: { color: 0xe8e8e8, roughness: 0.15, metalness: 1.0 },
  plastic_white: { color: 0xfefefe, roughness: 0.4, metalness: 0.05 },
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ walls, furniture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeOfDay, setTimeOfDay] = useState(14); // 0-24 (2 PM default)
  const WALL_HEIGHT = 150;

  // Function to create procedural textures
  const createFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Fill background (Natural light wood color)
    ctx.fillStyle = '#c9ae8a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw wood planks
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      
      // Grain details
      for (let j = 0; j < 512; j += 128) {
        ctx.beginPath();
        ctx.moveTo(i, j + Math.random() * 64);
        ctx.lineTo(i + 64, j + 32 + Math.random() * 64);
        ctx.globalAlpha = 0.08;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  };

  const createWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Subtle plaster texture
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.set(600, 800, 1000);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Slightly boosted exposure for cleaner look
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Materials
    const floorTexture = createFloorTexture();
    const wallTexture = createWallTexture();
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      map: floorTexture, 
      roughness: 0.9, 
      metalness: 0.05 
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      map: wallTexture, 
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0
    });

    // Lights and Atmosphere Logic
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(500, 1000, 500);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 3000;
    sunLight.shadow.camera.left = -1200;
    sunLight.shadow.camera.right = 1200;
    sunLight.shadow.camera.top = 1200;
    sunLight.shadow.camera.bottom = -1200;
    scene.add(sunLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(3500, 3500);
    const ground = new THREE.Mesh(groundGeo, floorMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid (Minimalist)
    const grid = new THREE.GridHelper(3500, 70, 0x000000, 0x000000);
    (grid.material as THREE.LineBasicMaterial).opacity = 0.05;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    scene.add(grid);

    // Walls
    walls.forEach(wall => {
      const dx = wall.end.x - wall.start.x;
      const dz = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);

      const geometry = new THREE.BoxGeometry(length, WALL_HEIGHT, wall.thickness);
      const mesh = new THREE.Mesh(geometry, wallMaterial);
      mesh.position.set((wall.start.x + wall.end.x) / 2, WALL_HEIGHT / 2, (wall.start.y + wall.end.y) / 2);
      mesh.rotation.y = -angle;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Furniture
    furniture.forEach(f => {
      // Natural fallback colors
      let color = 0x5c6bc0;
      let fHeight = 40;
      let roughness = 0.8;
      let metalness = 0.05;

      // Apply selected material if exists
      if (f.material && MATERIAL_MAP[f.material]) {
        const matProps = MATERIAL_MAP[f.material];
        color = matProps.color;
        roughness = matProps.roughness;
        metalness = matProps.metalness;
      } else {
        // Natural fallback colors based on type
        switch (f.type) {
          case FurnitureType.BED: color = 0x5c6bc0; break; // Muted blue
          case FurnitureType.SOFA: color = 0x8d6e63; break; // Earthy brown
          case FurnitureType.TV: color = 0x263238; break; // Dark slate
          case FurnitureType.PLANT: color = 0x388e3c; break; // Forest green
          case FurnitureType.TABLE: color = 0x5d4037; break; // Deep wood
          case FurnitureType.DOOR: color = 0x4e342e; break; // Heavy wood
          case FurnitureType.WINDOW: color = 0x90caf9; break; // Glass blue
        }
      }

      // Proportional heights
      switch (f.type) {
        case FurnitureType.BED: fHeight = 35; break;
        case FurnitureType.SOFA: fHeight = 50; break;
        case FurnitureType.TV: fHeight = 70; break;
        case FurnitureType.PLANT: fHeight = 90; break;
        case FurnitureType.TABLE: fHeight = 55; break;
        case FurnitureType.DOOR: fHeight = 140; break;
        case FurnitureType.WINDOW: fHeight = 85; break;
      }

      const geometry = new THREE.BoxGeometry(f.width, fHeight, f.height);
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness, 
        metalness,
        transparent: f.type === FurnitureType.WINDOW,
        opacity: f.type === FurnitureType.WINDOW ? 0.4 : 1.0
      });
      const mesh = new THREE.Mesh(geometry, material);
      const yPos = f.type === FurnitureType.WINDOW ? WALL_HEIGHT * 0.6 : fHeight / 2;
      mesh.position.set(f.position.x, yPos, f.position.y);
      mesh.rotation.y = -(f.rotation * Math.PI) / 180;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Update Lighting based on Time of Day
    const updateLighting = (time: number) => {
      const isDay = time >= 6 && time <= 18;
      const cycle = (time - 6) / 12; // 0 at 6am, 1 at 6pm
      
      // Sky color logic
      let skyColor = new THREE.Color(0xb0e0e6); // Default soft sky
      if (time < 5 || time > 20) skyColor.set(0x05080c); // Midnight
      else if (time < 7) skyColor.lerp(new THREE.Color(0xffcc99), (time - 5) / 2); // Dawn
      else if (time < 17) skyColor.lerp(new THREE.Color(0x87ceeb), (time - 7) / 10); // Mid-day
      else if (time < 19) skyColor.lerp(new THREE.Color(0xff8c00), (time - 17) / 2); // Golden hour
      else if (time < 21) skyColor.lerp(new THREE.Color(0x1a1a2e), (time - 19) / 2); // Twilight

      scene.background = skyColor;
      
      const theta = Math.PI * cycle;
      const sunX = Math.cos(theta) * 1200;
      const sunY = Math.sin(theta) * 1200;
      const sunZ = 500;

      if (isDay) {
        sunLight.intensity = Math.max(0.2, Math.sin(theta) * 1.8);
        sunLight.position.set(sunX, sunY, sunZ);
        
        // Warm sun in morning/evening, neutral at noon
        const warmth = Math.abs(cycle - 0.5) * 2; // 1 at ends, 0 at noon
        sunLight.color.setHSL(0.1 + warmth * 0.05, 0.4, 0.9);
        ambientLight.intensity = 0.3 + Math.sin(theta) * 0.4;
      } else {
        sunLight.intensity = 0.15; // Soft moonlight
        sunLight.position.set(-600, 1000, -400);
        sunLight.color.set(0xaabbee);
        ambientLight.intensity = 0.1;
      }
    };

    updateLighting(timeOfDay);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = containerRef.current?.clientWidth || 0;
      const h = containerRef.current?.clientHeight || 0;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [walls, furniture, timeOfDay]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden group">
      {/* Time Control Overlay */}
      <div className="absolute top-24 right-6 z-20 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-slate-200 w-64 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-600" />
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Technical Lighting</span>
          </div>
          <span className="text-xs font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-lg text-indigo-700">
            {Math.floor(timeOfDay).toString().padStart(2, '0')}:00
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Sun size={14} className={timeOfDay >= 6 && timeOfDay <= 18 ? "text