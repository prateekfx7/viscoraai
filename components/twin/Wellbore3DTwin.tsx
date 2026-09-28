"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Activity,
  Compass,
  Eye,
  FastForward,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Wellbore3DTwinProps {
  spm?: number;
  temperatureC?: number;
  viscosityCp?: number;
  strokeLength?: number; // in inches (e.g. 86 or 100)
  isShockActive?: boolean;
  autoPilotEnabled?: boolean;
}

export function Wellbore3DTwin({
  spm = 5.2,
  temperatureC = 94.6,
  viscosityCp = 850,
  strokeLength = 86,
  isShockActive = false,
  autoPilotEnabled = true,
}: Wellbore3DTwinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"surface" | "full" | "reservoir">("surface");
  const [isRotating, setIsRotating] = useState(true);

  // References to dynamic Three.js objects for animation
  const animRefs = useRef<{
    walkingBeam?: THREE.Group;
    horseHead?: THREE.Mesh;
    polishedRod?: THREE.Mesh;
    counterweight?: THREE.Group;
    pitmanArm?: THREE.Mesh;
    wellboreString?: THREE.Mesh;
    heatGlowMesh?: THREE.Mesh;
    steamParticles?: THREE.Points;
    camera?: THREE.PerspectiveCamera;
    controls?: {
      target: THREE.Vector3;
      spherical: { radius: number; theta: number; phi: number };
    };
  }>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep industrial slate
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 16, 26);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const downholeSpot = new THREE.SpotLight(0xf59e0b, 3.5, 45, Math.PI / 4, 0.4);
    downholeSpot.position.set(0, -5, 0);
    downholeSpot.target.position.set(0, -35, 0);
    scene.add(downholeSpot);
    scene.add(downholeSpot.target);

    // --- Ground Grid & Surface Platform ---
    const grid = new THREE.GridHelper(60, 40, 0x38bdf8, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Surface wellhead concrete pad
    const padGeo = new THREE.BoxGeometry(16, 0.8, 12);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1,
    });
    const concretePad = new THREE.Mesh(padGeo, padMat);
    concretePad.position.set(0, -0.4, 0);
    concretePad.receiveShadow = true;
    scene.add(concretePad);

    // Wellhead Flange / BOP (Blowout Preventer)
    const bopGroup = new THREE.Group();
    const flangeGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.4, 20);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const flange = new THREE.Mesh(flangeGeo, flangeMat);
    flange.position.y = 1.2;
    flange.castShadow = true;
    bopGroup.add(flange);
    scene.add(bopGroup);

    // --- 3D Sucker Rod Pump Jack Structure ---
    const srpGroup = new THREE.Group();
    srpGroup.position.set(-2, 0, 0);

    // 1. Samson Post (Support A-Frame)
    const samsonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.5 });
    const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 9, 8);

    const leg1 = new THREE.Mesh(postGeo, samsonMat);
    leg1.position.set(-4, 4.5, 1.6);
    leg1.rotation.z = 0.2;
    leg1.rotation.x = -0.15;
    srpGroup.add(leg1);

    const leg2 = new THREE.Mesh(postGeo, samsonMat);
    leg2.position.set(-4, 4.5, -1.6);
    leg2.rotation.z = 0.2;
    leg2.rotation.x = 0.15;
    srpGroup.add(leg2);

    const leg3 = new THREE.Mesh(postGeo, samsonMat);
    leg3.position.set(-6.5, 4.5, 0);
    leg3.rotation.z = -0.25;
    srpGroup.add(leg3);

    // Center pivot bearing at top of Samson post
    const pivotGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.2, 16);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const pivot = new THREE.Mesh(pivotGeo, steelMat);
    pivot.position.set(-4.5, 8.8, 0);
    pivot.rotation.x = Math.PI / 2;
    srpGroup.add(pivot);

    // 2. Walking Beam (Articulating Rocking Group)
    const walkingBeam = new THREE.Group();
    walkingBeam.position.set(-4.5, 8.8, 0);

    // Beam steel beam
    const beamGeo = new THREE.BoxGeometry(11, 0.8, 0.8);
    const beamMesh = new THREE.Mesh(beamGeo, samsonMat);
    beamMesh.position.set(0.8, 0, 0);
    beamMesh.castShadow = true;
    walkingBeam.add(beamMesh);

    // 3. Horse Head (Front of walking beam, positioned over wellhead)
    const horseHeadGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.6, 16, 1, false, 0, Math.PI / 2.2);
    const horseHead = new THREE.Mesh(horseHeadGeo, samsonMat);
    horseHead.rotation.z = -Math.PI / 1.1;
    horseHead.position.set(6.2, 0.8, 0);
    horseHead.castShadow = true;
    walkingBeam.add(horseHead);

    srpGroup.add(walkingBeam);

    // 4. Counterweight Crank & Pitman Arm
    const crankGroup = new THREE.Group();
    crankGroup.position.set(-8.5, 2.8, 0);

    const crankGeo = new THREE.BoxGeometry(1.6, 3.8, 0.6);
    const crankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const crank = new THREE.Mesh(crankGeo, crankMat);
    crank.position.y = 1.2;
    crankGroup.add(crank);

    // Gearbox Base
    const gearBoxGeo = new THREE.BoxGeometry(3, 2.8, 2.5);
    const gearBox = new THREE.Mesh(gearBoxGeo, crankMat);
    gearBox.position.set(-8.5, 1.4, 0);
    srpGroup.add(gearBox);
    srpGroup.add(crankGroup);

    // 5. Polished Rod (plunging into wellhead)
    const rodGeo = new THREE.CylinderGeometry(0.08, 0.08, 7.5, 12);
    const polishedRod = new THREE.Mesh(rodGeo, steelMat);
    polishedRod.position.set(0, 4.2, 0);
    polishedRod.castShadow = true;
    scene.add(polishedRod);

    scene.add(srpGroup);

    // --- Subsurface Wellbore & Geological Strata (Downhole 1,050m) ---
    const wellboreGroup = new THREE.Group();

    // Geological layers (translucent cylinders)
    const strataColors = [0x334155, 0x1e293b, 0x475569, 0xb45309]; // Topsoil -> Shale -> Sandstone -> Heavy Oil Res
    const layerHeights = [8, 10, 12, 10];
    let currentY = -4;

    for (let i = 0; i < strataColors.length; i++) {
      const strataGeo = new THREE.CylinderGeometry(14, 14, layerHeights[i], 24);
      const strataMat = new THREE.MeshStandardMaterial({
        color: strataColors[i],
        transparent: true,
        opacity: 0.28,
        roughness: 0.9,
      });
      const strata = new THREE.Mesh(strataGeo, strataMat);
      strata.position.y = currentY - layerHeights[i] / 2;
      wellboreGroup.add(strata);
      currentY -= layerHeights[i];
    }

    // Outer Well Casing Tube
    const casingGeo = new THREE.CylinderGeometry(0.7, 0.7, 44, 24, 1, true);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.45,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.position.y = -22;
    wellboreGroup.add(casing);

    // Inner Sucker Rod String inside Tubing (1050m equivalent)
    const rodStringGeo = new THREE.CylinderGeometry(0.06, 0.06, 40, 8);
    const rodString = new THREE.Mesh(rodStringGeo, steelMat);
    rodString.position.y = -20;
    wellboreGroup.add(rodString);

    // Downhole Reservoir Thermal Glow Mesh (CSS Steam Pocket)
    const glowGeo = new THREE.SphereGeometry(3.5, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const heatGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    heatGlowMesh.position.set(0, -38, 0);
    wellboreGroup.add(heatGlowMesh);

    // Bottom Heavy Crude Viscous Pool
    const oilPoolGeo = new THREE.CylinderGeometry(3.2, 3.2, 4, 24);
    const oilPoolMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.2,
      metalness: 0.8,
    });
    const oilPool = new THREE.Mesh(oilPoolGeo, oilPoolMat);
    oilPool.position.set(0, -40, 0);
    wellboreGroup.add(oilPool);

    // Steam / Hydrodynamic Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 4;
      particlePos[i + 1] = -38 + Math.random() * 8;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
    });
    const steamParticles = new THREE.Points(particleGeo, particleMat);
    wellboreGroup.add(steamParticles);

    scene.add(wellboreGroup);

    // Store refs
    animRefs.current = {
      walkingBeam,
      horseHead,
      polishedRod,
      counterweight: crankGroup,
      wellboreString: rodString,
      heatGlowMesh,
      steamParticles,
      camera,
      controls: {
        target: new THREE.Vector3(0, 3, 0),
        spherical: { radius: 36, theta: 0.7, phi: 1.1 },
      },
    };

    // --- Interactive Mouse Drag / Orbit ---
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !animRefs.current.controls) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;

      animRefs.current.controls.spherical.theta -= dx * 0.008;
      animRefs.current.controls.spherical.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 + 0.3, animRefs.current.controls.spherical.phi + dy * 0.008)
      );

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!animRefs.current.controls) return;
      animRefs.current.controls.spherical.radius = Math.max(
        10,
        Math.min(90, animRefs.current.controls.spherical.radius + e.deltaY * 0.05)
      );
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // --- Animation Loop ---
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // SPM calculation: Frequency = SPM / 60 Hz
      const frequency = (spm / 60) * 2 * Math.PI;
      const tiltAngle = Math.sin(elapsedTime * frequency) * 0.22; // ~12 degrees rocking

      // Rock walking beam
      if (animRefs.current.walkingBeam) {
        animRefs.current.walkingBeam.rotation.z = tiltAngle;
      }

      // Rotate counterweights
      if (animRefs.current.counterweight) {
        animRefs.current.counterweight.rotation.z = -elapsedTime * frequency;
      }

      // Reciprocate polished rod & wellbore string vertically
      const verticalTravel = -Math.sin(elapsedTime * frequency) * (strokeLength / 86) * 1.4;
      if (animRefs.current.polishedRod) {
        animRefs.current.polishedRod.position.y = 4.2 + verticalTravel;
      }
      if (animRefs.current.wellboreString) {
        animRefs.current.wellboreString.position.y = -20 + verticalTravel * 0.8;
      }

      // Downhole reservoir pulse
      if (animRefs.current.heatGlowMesh) {
        const pulse = 1.0 + Math.sin(elapsedTime * 3) * 0.06;
        animRefs.current.heatGlowMesh.scale.set(pulse, pulse, pulse);
      }

      // Orbit camera positioning
      if (animRefs.current.controls && animRefs.current.camera) {
        if (isRotating && !isDragging) {
          animRefs.current.controls.spherical.theta += 0.002;
        }

        const { radius, theta, phi } = animRefs.current.controls.spherical;
        const target = animRefs.current.controls.target;

        animRefs.current.camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
        animRefs.current.camera.position.y = target.y + radius * Math.cos(phi);
        animRefs.current.camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
        animRefs.current.camera.lookAt(target);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, [spm, strokeLength, isRotating]);

  // Camera presets
  const switchCameraView = (view: "surface" | "full" | "reservoir") => {
    setActiveView(view);
    const controls = animRefs.current.controls;
    if (!controls) return;

    if (view === "surface") {
      controls.target.set(0, 4, 0);
      controls.spherical.radius = 28;
      controls.spherical.phi = 1.1;
    } else if (view === "full") {
      controls.target.set(0, -16, 0);
      controls.spherical.radius = 64;
      controls.spherical.phi = 1.25;
    } else if (view === "reservoir") {
      controls.target.set(0, -38, 0);
      controls.spherical.radius = 24;
      controls.spherical.phi = 1.1;
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border/80 bg-slate-950 shadow-sm flex flex-col">
      {/* Top Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border-b border-slate-800 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            3D Wellbore & SRP Digital Twin (Three.js WebGL)
          </span>
          <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
            Baghewala BGW-04
          </Badge>
        </div>

        {/* Camera Preset Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => switchCameraView("surface")}
            className={`h-7 px-2.5 text-[11px] font-mono rounded-lg transition-all ${
              activeView === "surface"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Surface Pump
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => switchCameraView("full")}
            className={`h-7 px-2.5 text-[11px] font-mono rounded-lg transition-all ${
              activeView === "full"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1,050m Wellbore
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => switchCameraView("reservoir")}
            className={`h-7 px-2.5 text-[11px] font-mono rounded-lg transition-all ${
              activeView === "reservoir"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            CSS Reservoir
          </Button>
        </div>

        {/* Rotate & Speed Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/80 transition-all"
            title="Toggle 3D Auto-Rotation"
          >
            <RotateCcw className={`size-3 ${isRotating ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRotating ? "Orbiting" : "Paused"}</span>
          </button>
        </div>
      </div>

      {/* Main WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[400px] sm:h-[460px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating HUD Telemetry Overlay on Canvas */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Telemetry HUD */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono shadow-md">
            <span className="text-[10px] text-slate-400 block uppercase">Kinematic Speed</span>
            <span className="text-sm font-extrabold text-white">{spm.toFixed(1)} SPM</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono shadow-md">
            <span className="text-[10px] text-slate-400 block uppercase">In-Situ Viscosity</span>
            <span
              className={`text-sm font-extrabold ${
                isShockActive ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {viscosityCp} cP
            </span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono shadow-md">
            <span className="text-[10px] text-slate-400 block uppercase">Bottomhole Temp</span>
            <span className="text-sm font-extrabold text-orange-400">{temperatureC.toFixed(1)}°C</span>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="pointer-events-auto">
          {isShockActive ? (
            <div className="flex items-center gap-2 bg-rose-500/20 backdrop-blur-md border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-mono animate-pulse shadow-md">
              <span className="size-2 rounded-full bg-rose-500" />
              <span className="font-bold">Downstroke Drag Hazard Detected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-mono shadow-md">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Stokes Fall Velocity: 2.45 ft/s (Nominal)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
