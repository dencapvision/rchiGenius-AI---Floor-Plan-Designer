
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Wall, Furniture, FurnitureType } from '../types';
import { Sun, Moon, Clock } from 'lucide-react';

interface ThreeDViewerProps {
  walls: Wall[];
  furniture: Furniture[];
}

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
    
    // Fill background (Light wood color)
    ctx.fillStyle = '#d2b48c';
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw wood planks
    ctx.strokeStyle = '#a0522d';
    ctx.lineWidth = 2;
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
        ctx.globalAlpha = 0.1;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    return texture;
  };

  const createWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Subtle plaster texture
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
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
    renderer.toneMappingExposure = 1.0;
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
      roughness: 0.8, 
      metalness: 0.1 
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      map: wallTexture, 
      color: 0xfafafa,
      roughness: 0.9,
      metalness: 0.0
    });

    // Lights and Atmosphere Logic
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(500, 1000, 500);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 3000;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    scene.add(sunLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(3000, 3000);
    const ground = new THREE.Mesh(groundGeo, floorMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid (Subtle)
    const grid = new THREE.GridHelper(3000, 60, 0x000000, 0x000000);
    (grid.material as THREE.LineBasicMaterial).opacity = 0.1;
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
      let color = 0x6366f1;
      let fHeight = 40;
      switch (f.type) {
        case FurnitureType.BED: color = 0x6366f1; fHeight = 35; break;
        case FurnitureType.SOFA: color = 0xef4444; fHeight = 50; break;
        case FurnitureType.TV: color = 0x334155; fHeight = 70; break;
        case FurnitureType.PLANT: color = 0x22c55e; fHeight = 90; break;
        case FurnitureType.TABLE: color = 0x8b4513; fHeight = 55; break;
        case FurnitureType.DOOR: color = 0x7c2d12; fHeight = 140; break;
        case FurnitureType.WINDOW: color = 0xbae6fd; fHeight = 80; break;
      }

      const geometry = new THREE.BoxGeometry(f.width, fHeight, f.height);
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.6, 
        metalness: 0.2,
        transparent: f.type === FurnitureType.WINDOW,
        opacity: f.type === FurnitureType.WINDOW ? 0.6 : 1.0
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
      const isDay = time > 6 && time < 18;
      const cycle = (time - 6) / 12; // 0 at 6am, 1 at 6pm
      
      // Sky color
      let skyColor = new THREE.Color(0x87ceeb); // Day sky blue
      if (time <= 6 || time >= 20) skyColor = new THREE.Color(0x0a1122); // Night
      else if (time < 8) skyColor.lerp(new THREE.Color(0xffa07a), (8 - time) / 2); // Sunrise
      else if (time > 17) skyColor.lerp(new THREE.Color(0xff4500), (time - 17) / 3); // Sunset

      scene.background = skyColor;
      
      // Sun position logic
      const theta = Math.PI * cycle;
      const sunX = Math.cos(theta) * 1000;
      const sunY = Math.sin(theta) * 1000;
      const sunZ = 400;

      if (isDay) {
        sunLight.intensity = Math.sin(theta) * 1.5;
        sunLight.position.set(sunX, sunY, sunZ);
        sunLight.color.setHSL(0.1, 0.5, 0.9);
        ambientLight.intensity = 0.4 + Math.sin(theta) * 0.3;
      } else {
        sunLight.intensity = 0.2; // Moonlight
        sunLight.position.set(-500, 800, -300);
        sunLight.color.set(0x99bbff);
        ambientLight.intensity = 0.15;
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
      <div className="absolute top-20 right-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200 w-64 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">Daylight System</span>
          </div>
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
            {Math.floor(timeOfDay).toString().padStart(2, '0')}:00
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Sun size={14} className={timeOfDay > 6 && timeOfDay < 18 ? "text-yellow-500" : "text-slate-300"} />
          <input 
            type="range" 
            min="0" 
            max="23" 
            value={timeOfDay} 
            onChange={(e) => setTimeOfDay(parseInt(e.target.value))}
            className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <Moon size={14} className={timeOfDay <= 6 || timeOfDay >= 18 ? "text-blue-500" : "text-slate-300"} />
        </div>
        
        <p className="text-[10px] text-slate-400 mt-3 italic text-center font-medium">
          Drag to simulate shadows and lighting atmosphere
        </p>
      </div>

      <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest z-10 flex items-center gap-3 shadow-2xl">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Realistic Render Engine
        </div>
        <span className="text-white/40">|</span>
        <span>Textures: Plaster & Wood</span>
      </div>
    </div>
  );
};

export default ThreeDViewer;
