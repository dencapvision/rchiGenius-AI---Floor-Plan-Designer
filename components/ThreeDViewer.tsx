
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Wall, Furniture, FurnitureType } from '../types';
import { Sun, Moon, Clock, Layers, Maximize2 } from 'lucide-react';

interface ThreeDViewerProps {
  walls: Wall[];
  furniture: Furniture[];
}

const MATERIAL_MAP: Record<string, { color: number, roughness: number, metalness: number, transmission?: number }> = {
  oak: { color: 0xc8aa7a, roughness: 0.82, metalness: 0.04 },
  walnut: { color: 0x48382c, roughness: 0.72, metalness: 0.08 },
  pine: { color: 0xdfc79d, roughness: 0.88, metalness: 0.02 },
  fabric_grey: { color: 0x828282, roughness: 1.0, metalness: 0.0 },
  velvet_navy: { color: 0x283645, roughness: 0.92, metalness: 0.0 },
  leather_black: { color: 0x181818, roughness: 0.32, metalness: 0.12 },
  metal_chrome: { color: 0xd9d9d9, roughness: 0.05, metalness: 1.0 },
  metal_brass: { color: 0xad8d4f, roughness: 0.25, metalness: 1.0 },
  marble_white: { color: 0xfafafa, roughness: 0.1, metalness: 0.1 },
  concrete_raw: { color: 0x8c8c8c, roughness: 0.95, metalness: 0.0 },
  plastic_white: { color: 0xfafafa, roughness: 0.35, metalness: 0.05 },
  terracotta: { color: 0xac5d40, roughness: 0.98, metalness: 0.0 },
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ walls, furniture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(14); 
  const WALL_HEIGHT = 150;

  const createFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#bfa682';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = 'rgba(100, 75, 60, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 1024; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();
      for (let j = 0; j < 1024; j += 256) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.beginPath();
        ctx.ellipse(i + 64, j + 128 + (Math.random()*50), 40, 200, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.anisotropy = 16;
    return texture;
  };

  const createWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f9f9f7';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1); 
    return texture;
  };

  const createFurnitureMesh = (f: Furniture) => {
    const group = new THREE.Group();
    let matProps = MATERIAL_MAP[f.material || ''] || { color: 0x607d8b, roughness: 0.8, metalness: 0.05 };
    
    // Default fallback colors if no material selected
    if (!f.material) {
      switch (f.type) {
        case FurnitureType.BED: matProps.color = 0x546e7a; break;
        case FurnitureType.SOFA: matProps.color = 0x795548; break;
        case FurnitureType.TV: matProps.color = 0x212121; break;
        case FurnitureType.PLANT: matProps.color = 0x2e7d32; break;
        case FurnitureType.TABLE: matProps.color = 0x4e342e; break;
        case FurnitureType.DOOR: matProps.color = 0x3e2723; break;
        case FurnitureType.WINDOW: matProps.color = 0xb3e5fc; break;
      }
    }

    const mainMat = new THREE.MeshStandardMaterial({ 
      color: matProps.color, 
      roughness: matProps.roughness, 
      metalness: matProps.metalness,
      transparent: f.type === FurnitureType.WINDOW,
      opacity: f.type === FurnitureType.WINDOW ? 0.3 : 1.0,
      envMapIntensity: 1.5
    });

    const box = (w: number, h: number, d: number, mat: THREE.Material, y = 0) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, mat);
      m.position.y = y;
      m.castShadow = m.receiveShadow = true;
      group.add(m);
      return m;
    };

    switch (f.type) {
      case FurnitureType.BED:
        box(f.width, 15, f.height, mainMat, 7.5); // Base
        const mattressMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
        box(f.width * 0.95, 10, f.height * 0.95, mattressMat, 20); // Mattress
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
        box(f.width * 0.3, 5, f.height * 0.4, pillowMat, 26).position.x = -f.width * 0.3; // Pillow 1
        box(f.width * 0.3, 5, f.height * 0.4, pillowMat, 26).position.x = f.width * 0.3; // Pillow 2
        break;

      case FurnitureType.SOFA:
        box(f.width, 20, f.height, mainMat, 10); // Base
        box(f.width, 30, 15, mainMat, 25).position.z = -f.height / 2 + 7.5; // Backrest
        box(15, 25, f.height, mainMat, 20).position.x = -f.width / 2 + 7.5; // Armrest L
        box(15, 25, f.height, mainMat, 20).position.x = f.width / 2 - 7.5; // Armrest R
        break;

      case FurnitureType.TABLE:
        box(f.width, 5, f.height, mainMat, 55); // Top
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        const leg = (x: number, z: number) => {
          const l = box(5, 55, 5, legMat, 27.5);
          l.position.set(x, 27.5, z);
        };
        leg(-f.width/2 + 5, -f.height/2 + 5);
        leg(f.width/2 - 5, -f.height/2 + 5);
        leg(-f.width/2 + 5, f.height/2 - 5);
        leg(f.width/2 - 5, f.height/2 - 5);
        break;

      case FurnitureType.WINDOW:
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });
        box(f.width, 80, 5, mainMat, 40); // Glass
        box(f.width + 10, 5, 10, frameMat, 0); // Bottom Frame
        box(f.width + 10, 5, 10, frameMat, 80); // Top Frame
        box(5, 80, 10, frameMat, 40).position.x = -f.width/2;
        box(5, 80, 10, frameMat, 40).position.x = f.width/2;
        break;

      case FurnitureType.TV:
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.8 });
        box(f.width, f.height, 5, screenMat, f.height/2 + 20); // Screen
        box(f.width * 0.4, 20, 15, mainMat, 10); // Stand
        break;

      default:
        box(f.width, 40, f.height, mainMat, 20);
    }

    group.position.set(f.position.x, 0, f.position.y);
    group.rotation.y = -(f.rotation * Math.PI) / 180;
    return group;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(1000, 1200, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;

    // Materials
    const floorTexture = createFloorTexture();
    const wallTexture = createWallTexture();
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.85 });
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, bumpMap: wallTexture, bumpScale: 0.2, roughness: 0.95 });

    // Environment map (fake reflections)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), floorMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Walls
    walls.forEach(wall => {
      const dx = wall.end.x - wall.start.x;
      const dz = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, WALL_HEIGHT, wall.thickness), wallMat);
      mesh.position.set((wall.start.x + wall.end.x) / 2, WALL_HEIGHT / 2, (wall.start.y + wall.end.y) / 2);
      mesh.rotation.y = -angle;
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Furniture
    furniture.forEach(f => {
      const mesh = createFurnitureMesh(f);
      scene.add(mesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(1000, 2000, 1000);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -2000;
    sunLight.shadow.camera.right = 2000;
    sunLight.shadow.camera.top = 2000;
    sunLight.shadow.camera.bottom = -2000;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Interior lights for night
    const pointLights: THREE.PointLight[] = [];
    walls.slice(0, 3).forEach((w, i) => {
      const pl = new THREE.PointLight(0xffaa66, 0, 800);
      pl.position.set(w.start.x, 120, w.start.y);
      scene.add(pl);
      pointLights.push(pl);
    });

    const updateSky = (t: number) => {
      const cycle = (t - 6) / 12;
      const isDay = t >= 6 && t <= 19;
      
      let skyColor = new THREE.Color(0xaeddf2);
      if (t < 5 || t > 21) skyColor.set(0x020308);
      else if (t < 8) skyColor.lerp(new THREE.Color(0xffcc99), 0.5);
      else if (t > 17 && t < 20) skyColor.lerp(new THREE.Color(0xff7f50), (t-17)/3);
      else if (t >= 20) skyColor.lerp(new THREE.Color(0x0a0a20), 0.8);
      scene.background = skyColor;

      const theta = Math.PI * cycle;
      if (isDay) {
        sunLight.intensity = Math.sin(theta) * 1.5;
        sunLight.position.set(Math.cos(theta) * 1500, Math.sin(theta) * 1500, 600);
        const warmth = Math.abs(cycle - 0.5) * 2;
        sunLight.color.setHSL(0.1 + warmth * 0.05, 0.4, 0.9);
        pointLights.forEach(p => p.intensity = 0);
      } else {
        sunLight.intensity = 0.1;
        sunLight.color.set(0x99aaff);
        pointLights.forEach(p => p.intensity = 1.0);
      }
    };

    updateSky(timeOfDay);

    const animate = () => {
      if (!rendererRef.current) return;
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
      rendererRef.current = null;
    };
  }, [walls, furniture, timeOfDay]);

  const captureFrame = () => {
    if (!rendererRef.current) return;
    const link = document.createElement('a');
    link.download = 'floorplan-render.png';
    link.href = rendererRef.current.domElement.toDataURL('image/png');
    link.click();
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden group bg-slate-100">
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
        
        <button 
          onClick={captureFrame}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-lg"
        >
          <Maximize2 size={12} />
          Export Render
        </button>
      </div>

      {/* Render Diagnostics */}
      <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest z-10 flex items-center gap-5 shadow-2xl">
        <div className="flex gap-2.5 items-center">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]" />
          ArchiGenius Render Engine v3.0
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-300">PBR:</span>
          <span>Procedural Geometry</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-300">Materials:</span>
          <span>Dynamic EnvMap</span>
        </div>
      </div>
    </div>
  );
};

export default ThreeDViewer;
