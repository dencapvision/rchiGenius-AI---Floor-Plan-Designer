
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Wall, Furniture, FurnitureType } from '../types';
import { Sun, Moon, Clock, Layers } from 'lucide-react';

interface ThreeDViewerProps {
  walls: Wall[];
  furniture: Furniture[];
}

// Refined material map with natural tones and balanced saturation
const MATERIAL_MAP: Record<string, { color: number, roughness: number, metalness: number }> = {
  // Woods
  oak: { color: 0xc8aa7a, roughness: 0.82, metalness: 0.04 },
  walnut: { color: 0x48382c, roughness: 0.72, metalness: 0.08 },
  pine: { color: 0xdfc79d, roughness: 0.88, metalness: 0.02 },
  // Fabrics
  fabric_grey: { color: 0x828282, roughness: 1.0, metalness: 0.0 },
  velvet_navy: { color: 0x283645, roughness: 0.92, metalness: 0.0 },
  leather_black: { color: 0x181818, roughness: 0.32, metalness: 0.12 },
  // Metals
  metal_chrome: { color: 0xd9d9d9, roughness: 0.12, metalness: 1.0 },
  metal_brass: { color: 0xad8d4f, roughness: 0.35, metalness: 0.95 },
  // Stones
  marble_white: { color: 0xeaeaea, roughness: 0.18, metalness: 0.05 },
  concrete_raw: { color: 0x8c8c8c, roughness: 0.95, metalness: 0.0 },
  // Others
  plastic_white: { color: 0xfafafa, roughness: 0.42, metalness: 0.03 },
  terracotta: { color: 0xac5d40, roughness: 0.98, metalness: 0.0 },
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ walls, furniture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeOfDay, setTimeOfDay] = useState(14); // 0-24 (2 PM default)
  const WALL_HEIGHT = 150;

  // Procedural Wood Floor Texture
  const createFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Base Floor Tone (Subdued)
    ctx.fillStyle = '#bfa682';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Plank Lines
    ctx.strokeStyle = 'rgba(100, 75, 60, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 1024; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();
      
      // Grain pattern
      for (let j = 0; j < 1024; j += 256) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.beginPath();
        ctx.ellipse(i + 64, j + 128, 40, 200, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.anisotropy = 16;
    return texture;
  };

  const createWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Natural Off-white Base Plaster
    ctx.fillStyle = '#f9f9f7';
    ctx.fillRect(0, 0, 512, 512);
    
    // Layer 1: Soft Clouding (Mottled effect)
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 20 + Math.random() * 60;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(220, 220, 210, 0.15)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 2: Micro-grains (Gritty texture)
    for (let i = 0; i < 8000; i++) {
      const opacity = Math.random() * 0.04;
      ctx.fillStyle = `rgba(0,0,0,${opacity})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }

    // Layer 3: Subtle vertical streaks (Construction effect)
    ctx.strokeStyle = 'rgba(0,0,0,0.01)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 5, 512);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Walls are usually vertical, we repeat more horizontally than vertically typically
    texture.repeat.set(2, 1); 
    return texture;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 5000);
    camera.position.set(800, 1000, 1200);

    // Optimized Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    containerRef.current.appendChild(renderer.domElement);

    // Interaction Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below floor

    // Scene Environment Materials
    const floorTexture = createFloorTexture();
    const wallTexture = createWallTexture();
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      map: floorTexture, 
      roughness: 0.9, 
      metalness: 0.02 
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      map: wallTexture, 
      color: 0xffffff,
      roughness: 0.95, // High roughness for matte plaster look
      metalness: 0.0,
      bumpMap: wallTexture, // Reusing texture as bump map for micro-surface variation
      bumpScale: 0.5
    });

    // Lighting Ecosystem
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(500, 1200, 500);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 4000;
    sunLight.shadow.camera.left = -1500;
    sunLight.shadow.camera.right = 1500;
    sunLight.shadow.camera.top = 1500;
    sunLight.shadow.camera.bottom = -1500;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Ground & Bounds
    const groundGeo = new THREE.PlaneGeometry(4000, 4000);
    const ground = new THREE.Mesh(groundGeo, floorMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(4000, 80, 0x000000, 0x000000);
    (grid.material as THREE.LineBasicMaterial).opacity = 0.04;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    scene.add(grid);

    // Construct Walls
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

    // Populate Furniture with High-Fidelity Materials
    furniture.forEach(f => {
      let color = 0x607d8b;
      let roughness = 0.8;
      let metalness = 0.05;

      // Apply assigned material with natural saturation
      if (f.material && MATERIAL_MAP[f.material]) {
        const mat = MATERIAL_MAP[f.material];
        color = mat.color;
        roughness = mat.roughness;
        metalness = mat.metalness;
      } else {
        // Fallback natural colors
        switch (f.type) {
          case FurnitureType.BED: color = 0x546e7a; break;
          case FurnitureType.SOFA: color = 0x795548; break;
          case FurnitureType.TV: color = 0x212121; break;
          case FurnitureType.PLANT: color = 0x2e7d32; break;
          case FurnitureType.TABLE: color = 0x4e342e; break;
          case FurnitureType.DOOR: color = 0x3e2723; break;
          case FurnitureType.WINDOW: color = 0xb3e5fc; break;
        }
      }

      // Height logic
      let fHeight = 40;
      switch (f.type) {
        case FurnitureType.BED: fHeight = 35; break;
        case FurnitureType.SOFA: fHeight = 45; break;
        case FurnitureType.TV: fHeight = 65; break;
        case FurnitureType.PLANT: fHeight = 80; break;
        case FurnitureType.TABLE: fHeight = 55; break;
        case FurnitureType.DOOR: fHeight = 140; break;
        case FurnitureType.WINDOW: fHeight = 90; break;
      }

      const geometry = new THREE.BoxGeometry(f.width, fHeight, f.height);
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness, 
        metalness,
        transparent: f.type === FurnitureType.WINDOW,
        opacity: f.type === FurnitureType.WINDOW ? 0.45 : 1.0,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      const yPos = f.type === FurnitureType.WINDOW ? WALL_HEIGHT * 0.55 : fHeight / 2;
      mesh.position.set(f.position.x, yPos, f.position.y);
      mesh.rotation.y = -(f.rotation * Math.PI) / 180;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Time-based Atmospheric Sync
    const updateAtmosphere = (time: number) => {
      const cycle = (time - 6) / 12; // 0 at 6am, 1 at 6pm
      const isDay = time >= 6 && time <= 19;
      
      let skyColor = new THREE.Color(0xaeddf2);
      if (time < 5 || time > 21) skyColor.set(0x020408);
      else if (time < 8) skyColor.lerp(new THREE.Color(0xffcc99), 0.5);
      else if (time > 17 && time < 20) skyColor.lerp(new THREE.Color(0xff7f50), (time-17)/3);
      else if (time >= 20) skyColor.lerp(new THREE.Color(0x1a1a2e), 0.8);

      scene.background = skyColor;
      
      const theta = Math.PI * cycle;
      const sunX = Math.cos(theta) * 1500;
      const sunY = Math.sin(theta) * 1500;
      const sunZ = 600;

      if (isDay) {
        const intensityMult = Math.sin(theta);
        sunLight.intensity = Math.max(0.15, intensityMult * 1.9);
        sunLight.position.set(sunX, sunY, sunZ);
        
        // Color temperature shift (Golden hour vs Noon)
        const warmth = Math.abs(cycle - 0.5) * 2;
        sunLight.color.setHSL(0.1 + warmth * 0.04, 0.45, 0.92);
        ambientLight.intensity = 0.3 + intensityMult * 0.45;
      } else {
        sunLight.intensity = 0.12;
        sunLight.position.set(-800, 1200, -500);
        sunLight.color.set(0x99aaff);
        ambientLight.intensity = 0.08;
      }
    };

    updateAtmosphere(timeOfDay);

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
      {/* Dynamic Lighting Module */}
      <div className="absolute top-24 right-6 z-20 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-slate-200 w-64 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Environment</span>
          </div>
          <span className="text-[10px] font-mono font-black bg-indigo-50 px-2 py-1 rounded-lg text-indigo-700">
            {Math.floor(timeOfDay).toString().padStart(2, '0')}:00
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Sun size={14} className={timeOfDay >= 6 && timeOfDay <= 19 ? "text-amber-500" : "text-slate-300"} />
          <input 
            type="range" 
            min="0" 
            max="23" 
            value={timeOfDay} 
            onChange={(e) => setTimeOfDay(parseInt(e.target.value))}
            className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <Moon size={14} className={timeOfDay < 6 || timeOfDay > 19 ? "text-indigo-400" : "text-slate-300"} />
        </div>
      </div>

      {/* Render Diagnostics */}
      <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest z-10 flex items-center gap-5 shadow-2xl">
        <div className="flex gap-2.5 items-center">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]" />
          ArchiGenius Render Engine v2.1
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-300">PBR:</span>
          <span>ACES Filmic Tone</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-300">Materials:</span>
          <span>Plaster Detail</span>
        </div>
      </div>
    </div>
  );
};

export default ThreeDViewer;
