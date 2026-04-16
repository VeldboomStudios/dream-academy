"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import { BODY_BY_ID, getChildren, type SolarBody } from "./graph";
import { makeNebulaTexture, makePlanetTexture, seedFromString } from "./textures";

/**
 * A focused 3D "portrait" of a single planet from the Atlas.
 * Used on course detail pages so each course gets its own cosmic stage,
 * matching the visual language of /atlas.
 */
export function PlanetHero({ bodyId }: { bodyId: string }) {
  const body = BODY_BY_ID.get(bodyId);
  if (!body) return <HeroFallback message="Planeet niet gevonden" />;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 4.2], fov: 40, near: 0.1, far: 80 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#0A0604"]} />
      <fog attach="fog" args={["#0A0604", 12, 28]} />

      {/* Lighting — warm rim + hero key light */}
      <ambientLight intensity={0.35} color="#F5F0E6" />
      <directionalLight
        position={[5, 3, 4]}
        intensity={1.6}
        color={body.glowColor ?? body.color}
      />
      <directionalLight
        position={[-4, -2, -3]}
        intensity={0.35}
        color="#8AB2D8"
      />
      <pointLight
        position={[0, 0, 3.5]}
        intensity={2.2}
        color={body.glowColor ?? body.color}
        distance={8}
        decay={1.4}
      />

      <Suspense fallback={null}>
        <NebulaSphere />
      </Suspense>

      <Stars
        radius={40}
        depth={28}
        count={600}
        factor={2.2}
        saturation={0.25}
        fade
        speed={0.15}
      />
      <Sparkles
        count={40}
        scale={[10, 10, 10]}
        size={1.8}
        speed={0.25}
        color="#FFE6B0"
        opacity={0.7}
      />

      <HeroPlanet body={body} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.78}
      />
    </Canvas>
  );
}

/* ─── PLANET + ITS MOONS ──────────────────────────── */

function HeroPlanet({ body }: { body: SolarBody }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Scale the body up significantly — we want the planet to fill the frame
  const heroScale = useMemo(() => {
    const target = 1.1; // desired world-space radius
    return target / body.size;
  }, [body.size]);

  const planetTexture = useMemo(
    () =>
      makePlanetTexture({
        baseColor: body.color,
        seed: seedFromString(body.id),
        detail: 0.75,
        bands: body.size > 0.55,
      }),
    [body.id, body.color, body.size]
  );

  const moons = useMemo(() => getChildren(body.id), [body.id]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12;
    }
    if (groupRef.current) {
      // Subtle float to keep it alive
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef} scale={heroScale}>
      {/* Core planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[body.size, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          color="#ffffff"
          emissive={body.glowColor ?? body.color}
          emissiveIntensity={0.32}
          metalness={0.18}
          roughness={0.7}
        />
      </mesh>

      {/* Inner atmosphere */}
      <mesh scale={1.08}>
        <sphereGeometry args={[body.size, 48, 48]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.28}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer atmosphere */}
      <mesh scale={1.24}>
        <sphereGeometry args={[body.size, 32, 32]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.13}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer halo ring — evokes selection state from atlas */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[body.size * 1.55, body.size * 1.68, 96]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.42}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[body.size * 1.78, body.size * 1.86, 96]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Moons — orbit the planet on an angled plane */}
      {moons.map((moon, i) => (
        <HeroMoon key={moon.id} moon={moon} index={i} parentSize={body.size} />
      ))}
    </group>
  );
}

function HeroMoon({
  moon,
  index,
  parentSize,
}: {
  moon: SolarBody;
  index: number;
  parentSize: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = parentSize * (2.2 + index * 0.4);
  const period = 14 + index * 6;
  const inclination = 0.35 + index * 0.12;
  const offset = (index * Math.PI * 0.7) % (Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;
    const angle = (t * Math.PI * 2) / period + offset;
    groupRef.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * Math.sin(inclination),
      Math.sin(angle) * radius * Math.cos(inclination)
    );
    groupRef.current.rotation.y += 0.01;
  });

  const isHex = moon.badgeShape === "hex";

  return (
    <group ref={groupRef}>
      {isHex ? (
        <mesh>
          <cylinderGeometry args={[moon.size * 1.6, moon.size * 1.6, moon.size * 0.5, 6]} />
          <meshStandardMaterial
            color={moon.color}
            emissive={moon.color}
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[moon.size * 1.4, 24, 24]} />
          <meshStandardMaterial
            color={moon.color}
            emissive={moon.color}
            emissiveIntensity={0.35}
            metalness={0.2}
            roughness={0.7}
          />
        </mesh>
      )}
      <mesh scale={1.4}>
        <sphereGeometry args={[moon.size, 16, 16]} />
        <meshBasicMaterial
          color={moon.color}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─── BACKDROP ───────────────────────────────────── */

function NebulaSphere() {
  const texture = useMemo(() => makeNebulaTexture(), []);
  return (
    <mesh>
      <sphereGeometry args={[42, 32, 24]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function HeroFallback({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center w-full h-full text-label"
      style={{ color: "#F5F0E6", opacity: 0.6 }}
    >
      {message}
    </div>
  );
}
