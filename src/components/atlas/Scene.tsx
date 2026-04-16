"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { memo, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BODIES,
  BODY_BY_ID,
  getChildren,
  type SolarBody,
  type AstronautPlacement,
} from "./graph";
import { makeNebulaTexture, makePlanetTexture, seedFromString } from "./textures";

/* List all course IDs so we can iterate to find their meshes */
const COURSE_IDS = [
  "eerste-lijn", "dromer", "architect", "maker",
  "roboticus", "natuur", "wereldbouwer", "meester",
];

interface SceneProps {
  selectedId: string | null;
  hoveredId: string | null;
  highlightedJourney: string[] | null; // body ids in order, null = none
  astronauts?: AstronautPlacement[];
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

export function AtlasScene({
  selectedId,
  hoveredId,
  highlightedJourney,
  astronauts = [],
  onSelect,
  onHover,
}: SceneProps) {
  const planets = useMemo(() => BODIES.filter((b) => b.kind === "planet"), []);
  const sun = useMemo(() => BODIES.find((b) => b.kind === "sun")!, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 9, 18], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#0A0604"]} />
      <fog attach="fog" args={["#0A0604", 26, 55]} />

      {/* Ambient + sun light */}
      <ambientLight intensity={0.35} color="#F5F0E6" />
      <pointLight
        position={[0, 0, 0]}
        intensity={9}
        color="#FFD278"
        distance={22}
        decay={1.6}
      />
      {/* Rim light */}
      <directionalLight
        position={[10, 8, 5]}
        intensity={0.5}
        color="#F5F0E6"
      />

      {/* ═══ COSMIC BACKGROUND ═══════════════════════════ */}
      <NebulaSphere />

      {/* Star field — single layer is enough since nebula provides depth */}
      <Stars
        radius={60}
        depth={40}
        count={900}
        factor={3}
        saturation={0.3}
        fade
        speed={0.2}
      />

      {/* Foreground twinkles */}
      <Sparkles
        count={60}
        scale={[40, 40, 40]}
        size={1.5}
        speed={0.3}
        color="#FFE6B0"
        opacity={0.7}
      />

      {/* SUN */}
      <Sun body={sun} isSelected={selectedId === sun.id} onSelect={onSelect} onHover={onHover} />

      {/* Orbital rings for planets */}
      {planets.map((planet) => (
        <OrbitRing
          key={`ring-${planet.id}`}
          radius={planet.orbitalRadius!}
          inclination={planet.orbitalInclination ?? 0}
          highlighted={selectedId === planet.id || hoveredId === planet.id}
        />
      ))}

      {/* Planets (each handles its own orbital motion + moons) */}
      {planets.map((planet) => {
        const isSelected = selectedId === planet.id;
        const isHovered = hoveredId === planet.id;
        const childIds = getChildren(planet.id).map((c) => c.id);
        const childIsSelected = !!selectedId && childIds.includes(selectedId);
        const childIsHovered = !!hoveredId && childIds.includes(hoveredId);
        const isPaused = isSelected || childIsSelected;
        const showMoons = isSelected || isHovered || childIsSelected || childIsHovered;
        const isJourneyStop = highlightedJourney?.includes(planet.id) ?? false;
        const isDimmed =
          !!selectedId &&
          !isSelected &&
          !childIsSelected &&
          selectedId !== "core" &&
          !isJourneyStop;
        const selectedMoonId =
          childIsSelected ? selectedId : null;
        const hoveredMoonId =
          childIsHovered ? hoveredId : null;
        return (
          <Planet
            key={planet.id}
            body={planet}
            isSelected={isSelected}
            isHovered={isHovered}
            isPaused={isPaused}
            showMoons={showMoons}
            isJourneyStop={isJourneyStop}
            isDimmed={isDimmed}
            selectedMoonId={selectedMoonId}
            hoveredMoonId={hoveredMoonId}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}

      {/* Level labels — orbit annotations */}
      <LevelLabels />

      {/* Astronauts — students orbiting their current course, or in transit */}
      <AstronautSwarm astronauts={astronauts} onSelect={onSelect} />

      {/* Progression edges — prereq → unlocks lines between course planets */}
      <JourneyLines
        selectedId={selectedId}
        hoveredId={hoveredId}
        highlightedJourney={highlightedJourney}
      />

      {/* Camera controller */}
      <CameraRig selectedId={selectedId} />

      <OrbitControls
        enabled={!selectedId}
        enablePan={false}
        enableZoom
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={8}
        maxDistance={32}
        dampingFactor={0.08}
        enableDamping
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.7}
      />

      {/* Empty space click catcher */}
      <mesh
        onClick={(e) => {
          if (e.intersections.length === 1) onSelect(null);
        }}
      >
        <sphereGeometry args={[40, 16, 16]} />
        <meshBasicMaterial side={THREE.BackSide} transparent opacity={0} />
      </mesh>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════
 * THE SUN — glowing center
 * ═══════════════════════════════════════════════════ */

function Sun({
  body,
  isSelected,
  onSelect,
  onHover,
}: {
  body: SolarBody;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);

  // Procedural sun-surface texture (high detail, no bands)
  const surfaceTexture = useMemo(
    () =>
      makePlanetTexture({
        baseColor: body.color,
        seed: 7777,
        detail: 0.55,
        bands: false,
      }),
    [body.color]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.04;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z = t * 0.05;
      const s = 1 + Math.sin(t * 0.8) * 0.04;
      coronaRef.current.scale.setScalar(s);
    }
    if (flareRef.current) {
      flareRef.current.rotation.z = -t * 0.03;
      const s = 1 + Math.cos(t * 0.6) * 0.06;
      flareRef.current.scale.setScalar(s);
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(body.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(body.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Sun surface — textured + emissive */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[body.size, 64, 64]} />
        <meshBasicMaterial map={surfaceTexture} toneMapped={false} />
      </mesh>

      {/* Bright inner halo */}
      <mesh>
        <sphereGeometry args={[body.size * 1.12, 32, 32]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Mid corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[body.size * 1.45, 32, 32]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Outer flare */}
      <mesh ref={flareRef}>
        <sphereGeometry args={[body.size * 1.95, 24, 24]} />
        <meshBasicMaterial
          color={body.glowColor ?? body.color}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      <BodyLabel body={body} isSelected={isSelected} yOffset={body.size + 0.7} isSun />
    </group>
  );
}

/* ═══════════════════════════════════════════════════
 * PLANET — orbits the sun, may carry moons
 * ═══════════════════════════════════════════════════ */

interface PlanetProps {
  body: SolarBody;
  isSelected: boolean;
  isHovered: boolean;
  isPaused: boolean;
  showMoons: boolean;
  isJourneyStop: boolean;
  isDimmed: boolean;
  selectedMoonId: string | null;
  hoveredMoonId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

const Planet = memo(function Planet({
  body,
  isSelected,
  isHovered,
  isPaused,
  showMoons,
  isJourneyStop,
  isDimmed,
  selectedMoonId,
  hoveredMoonId,
  onSelect,
  onHover,
}: PlanetProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const children = useMemo(() => getChildren(body.id), [body.id]);

  // Generate (or fetch cached) procedural surface texture
  const planetTexture = useMemo(
    () =>
      makePlanetTexture({
        baseColor: body.color,
        seed: seedFromString(body.id),
        detail: 0.7,
        bands: body.size > 0.55, // bigger planets get gas-giant bands
      }),
    [body.id, body.color, body.size]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!orbitRef.current) return;

    if (!isPaused) {
      const period = body.orbitalPeriod ?? 60;
      const offset = body.orbitalOffset ?? 0;
      const angle = (t * (Math.PI * 2)) / period + offset;
      const r = body.orbitalRadius ?? 0;
      const inc = body.orbitalInclination ?? 0;
      orbitRef.current.position.set(
        Math.cos(angle) * r,
        Math.sin(angle) * r * Math.sin(inc),
        Math.sin(angle) * r * Math.cos(inc)
      );
    }

    // Self-rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
    }

    // Hover/select scale (only animate when changing)
    if (bodyRef.current) {
      const target = isSelected ? 1.35 : isHovered ? 1.15 : 1;
      const cur = bodyRef.current.scale.x;
      if (Math.abs(cur - target) > 0.005) {
        bodyRef.current.scale.setScalar(cur + (target - cur) * 0.1);
      }
    }
  });

  const emissive = isSelected ? 0.9 : isHovered || isJourneyStop ? 0.5 : 0.2;
  const opacity = isDimmed && !isJourneyStop ? 0.35 : 1;

  return (
    <group ref={orbitRef} name={`planet-${body.id}`}>
      <group
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(body.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(body.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        {/* Planet surface — procedural texture */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[body.size, body.size > 0.5 ? 48 : 32, body.size > 0.5 ? 48 : 32]} />
          <meshStandardMaterial
            map={planetTexture}
            color="#ffffff"
            emissive={body.glowColor ?? body.color}
            emissiveIntensity={emissive * 0.4}
            metalness={0.15}
            roughness={0.78}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* Atmosphere shell — soft outer glow */}
        <mesh scale={1.06}>
          <sphereGeometry args={[body.size, 32, 32]} />
          <meshBasicMaterial
            color={body.glowColor ?? body.color}
            transparent
            opacity={(isSelected ? 0.28 : isHovered ? 0.2 : 0.13) * opacity}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
        {/* Outer atmosphere — fainter, larger */}
        <mesh scale={1.18}>
          <sphereGeometry args={[body.size, 24, 24]} />
          <meshBasicMaterial
            color={body.glowColor ?? body.color}
            transparent
            opacity={(isSelected ? 0.12 : isHovered ? 0.08 : 0.05) * opacity}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Selection halo ring */}
        {(isSelected || isHovered) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[body.size * 1.5, body.size * 1.65, 64]} />
            <meshBasicMaterial
              color={body.glowColor ?? body.color}
              transparent
              opacity={isSelected ? 0.6 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Journey stop indicator — golden ring around tour stops */}
        {isJourneyStop && !isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[body.size * 1.7, body.size * 1.85, 64]} />
            <meshBasicMaterial
              color="#FFD278"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Label */}
        <BodyLabel body={body} isSelected={isSelected} isHovered={isHovered} isDimmed={isDimmed} yOffset={body.size + 0.3} />
      </group>

      {/* Moons orbit within this group (relative to planet) */}
      {children.map((moon) => (
        <Moon
          key={moon.id}
          body={moon}
          isSelected={selectedMoonId === moon.id}
          isHovered={hoveredMoonId === moon.id}
          visible={showMoons}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
});

/* ═══════════════════════════════════════════════════
 * MOON — orbits its parent planet
 * ═══════════════════════════════════════════════════ */

interface MoonProps {
  body: SolarBody;
  isSelected: boolean;
  isHovered: boolean;
  visible: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

const Moon = memo(function Moon({
  body,
  isSelected,
  isHovered,
  visible,
  onSelect,
  onHover,
}: MoonProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const [fade, setFade] = useRefLerp(visible ? 1 : 0.35);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!orbitRef.current) return;

    // Keep moons moving even when parent is paused — just slower
    const period = body.orbitalPeriod ?? 15;
    const offset = body.orbitalOffset ?? 0;
    const angle = (t * (Math.PI * 2)) / period + offset;
    const r = body.orbitalRadius ?? 1;
    orbitRef.current.position.set(
      Math.cos(angle) * r,
      Math.sin(angle * 0.6) * 0.15, // subtle vertical wobble
      Math.sin(angle) * r
    );

    // Hover/select scale
    if (bodyRef.current) {
      const target = isSelected ? 1.8 : isHovered ? 1.4 : 1;
      const cur = bodyRef.current.scale.x;
      bodyRef.current.scale.setScalar(cur + (target - cur) * 0.1);
    }

    // Fade
    setFade(visible ? 1 : 0.2);
  });

  return (
    <group ref={orbitRef} name={`moon-${body.id}`}>
      <group
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(body.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(body.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        {body.badgeShape === "hex" ? (
          <mesh>
            <cylinderGeometry args={[body.size, body.size, body.size * 0.35, 6]} />
            <meshStandardMaterial
              color={body.color}
              emissive={body.color}
              emissiveIntensity={isSelected ? 1.2 : 0.4}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={fade.current}
            />
          </mesh>
        ) : (
          <mesh>
            <sphereGeometry args={[body.size, 20, 20]} />
            <meshStandardMaterial
              color={body.color}
              emissive={body.color}
              emissiveIntensity={isSelected ? 1.0 : 0.3}
              metalness={0.3}
              roughness={0.5}
              transparent
              opacity={fade.current}
            />
          </mesh>
        )}

        {visible && (
          <BodyLabel
            body={body}
            isSelected={isSelected}
            isHovered={isHovered}
            yOffset={body.size + 0.22}
            isMoon
          />
        )}
      </group>
    </group>
  );
});

/* ═══════════════════════════════════════════════════
 * ORBIT RING — faint circle showing path
 * ═══════════════════════════════════════════════════ */

function OrbitRing({
  radius,
  inclination,
  highlighted,
}: {
  radius: number;
  inclination: number;
  highlighted: boolean;
}) {
  // Build the THREE.Line imperatively — using <line/> in JSX collides with
  // the SVG <line> type. <primitive/> sidesteps that entirely.
  const line = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0, radius, radius, 0, Math.PI * 2, false, 0,
    );
    const points = curve.getPoints(96);
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, 0, p.y)),
    );
    const material = new THREE.LineBasicMaterial({
      color: highlighted ? 0xE4B866 : 0x4A3A28,
      transparent: true,
      opacity: highlighted ? 0.5 : 0.22,
    });
    const threeLine = new THREE.Line(geometry, material);
    threeLine.rotation.z = inclination;
    return threeLine;
  }, [radius, inclination, highlighted]);

  return <primitive object={line} />;
}

/* ═══════════════════════════════════════════════════
 * LABEL
 * ═══════════════════════════════════════════════════ */

function BodyLabel({
  body,
  isSelected,
  isHovered,
  isDimmed = false,
  yOffset,
  isSun = false,
  isMoon = false,
}: {
  body: SolarBody;
  isSelected: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  yOffset: number;
  isSun?: boolean;
  isMoon?: boolean;
}) {
  const fontSize = isSun
    ? "1.35rem"
    : isMoon
      ? "0.62rem"
      : body.size > 0.7
        ? "0.92rem"
        : "0.78rem";

  const weight = isSun ? 500 : 500;
  const color = isSelected || isHovered ? "#FDF9F0" : "#F5F0E6";

  return (
    <Html
      center
      position={[0, yOffset, 0]}
      distanceFactor={11}
      style={{
        pointerEvents: "none",
        opacity: isDimmed ? 0.3 : 1,
        transition: "opacity 250ms",
      }}
    >
      <div
        className="font-display whitespace-nowrap select-none"
        style={{
          fontSize,
          fontWeight: weight,
          letterSpacing: "0.005em",
          color,
          textShadow:
            "0 0 14px rgba(10,7,4,0.95), 0 0 6px rgba(10,7,4,0.95), 0 2px 4px rgba(10,7,4,1)",
          padding: "1px 6px",
        }}
      >
        {body.label}
      </div>
    </Html>
  );
}

/* ═══════════════════════════════════════════════════
 * CAMERA RIG — tweens to selected body's world position
 * ═══════════════════════════════════════════════════ */

function CameraRig({ selectedId }: { selectedId: string | null }) {
  const { camera, scene } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());
  const tempWorld = useRef(new THREE.Vector3());
  const wasSelected = useRef(false);
  const cachedObj = useRef<THREE.Object3D | null>(null);
  const cachedId = useRef<string | null>(null);

  useFrame(() => {
    // When nothing is selected, OrbitControls owns the camera entirely.
    // We only nudge it on the SAME frame it's deselected so the user
    // doesn't keep flying somewhere from the last selected position.
    if (!selectedId) {
      // Sync look-at with the camera's current direction once, so when
      // a future selection happens we lerp from a clean state.
      camera.getWorldDirection(currentLook.current).add(camera.position);
      wasSelected.current = false;
      return;
    }

    const body = BODY_BY_ID.get(selectedId);
    if (!body) return;

    // First frame of a new selection — initialize look from where the camera
    // is currently pointing so the lerp starts from the user's perspective.
    if (!wasSelected.current) {
      camera.getWorldDirection(currentLook.current).multiplyScalar(10).add(camera.position);
      wasSelected.current = true;
    }

    const worldPos = getBodyWorldPosition(
      scene,
      body,
      tempWorld.current,
      cachedObj,
      cachedId
    );
    if (!worldPos) return;

    const dist =
      body.kind === "sun"
        ? 5
        : body.kind === "moon"
          ? 1.2
          : Math.max(2.2, body.size * 4);

    const dir =
      body.kind === "sun"
        ? new THREE.Vector3(0, 0, 1)
        : worldPos.clone().setY(0).normalize();
    if (dir.lengthSq() === 0) dir.set(0, 0, 1);

    targetPos.current.set(
      worldPos.x + dir.x * dist,
      worldPos.y + Math.max(0.8, body.size * 1.5),
      worldPos.z + dir.z * dist
    );
    targetLook.current.copy(worldPos);

    camera.position.lerp(targetPos.current, 0.06);
    currentLook.current.lerp(targetLook.current, 0.08);
    camera.lookAt(currentLook.current);
  });

  return null;
}

/**
 * Read a body's current world-space position by traversing the scene graph.
 * Falls back to the origin for the sun.
 */
function getBodyWorldPosition(
  scene: THREE.Scene,
  body: SolarBody,
  target: THREE.Vector3,
  cache?: { current: THREE.Object3D | null },
  cacheId?: { current: string | null }
): THREE.Vector3 | null {
  if (body.kind === "sun") {
    target.set(0, 0, 0);
    return target;
  }

  // Use cached reference if it matches the current id
  let obj: THREE.Object3D | null | undefined = null;
  if (cache && cacheId && cacheId.current === body.id && cache.current) {
    obj = cache.current;
  } else {
    const name = body.kind === "moon" ? `moon-${body.id}` : `planet-${body.id}`;
    obj = scene.getObjectByName(name);
    if (cache && cacheId && obj) {
      cache.current = obj;
      cacheId.current = body.id;
    }
  }

  if (!obj) return null;

  obj.getWorldPosition(target);
  return target;
}

/* ═══════════════════════════════════════════════════
 * JOURNEY LINES — animated edges between course planets
 * Showing prerequisite → unlock relationships
 * ═══════════════════════════════════════════════════ */

function JourneyLines({
  selectedId,
  hoveredId,
  highlightedJourney,
}: {
  selectedId: string | null;
  hoveredId: string | null;
  highlightedJourney: string[] | null;
}) {
  const { scene } = useThree();
  const lineRefs = useRef<Map<string, THREE.Line>>(new Map());
  const objCache = useRef<Map<string, THREE.Object3D | null>>(new Map());
  const tempA = useRef(new THREE.Vector3());
  const tempB = useRef(new THREE.Vector3());

  // Resolve a planet group by id, caching the lookup
  function planetObj(id: string): THREE.Object3D | null {
    const cached = objCache.current.get(id);
    if (cached !== undefined) return cached;
    const found = scene.getObjectByName(`planet-${id}`) ?? null;
    if (found) objCache.current.set(id, found);
    return found;
  }

  // Build the static set of all course→course edges (prereq → child)
  const edges = useMemo(() => {
    const result: Array<{ key: string; from: string; to: string }> = [];
    for (const id of COURSE_IDS) {
      const body = BODY_BY_ID.get(id);
      if (!body?.prereqs) continue;
      for (const reqId of body.prereqs) {
        result.push({
          key: `${reqId}->${id}`,
          from: reqId,
          to: id,
        });
      }
    }
    return result;
  }, []);

  // Determine which edges should be visible/highlighted
  function edgeStyle(from: string, to: string): {
    visible: boolean;
    highlight: boolean;
    faint: boolean;
  } {
    // Tour mode: highlight only consecutive pairs from the tour
    if (highlightedJourney) {
      for (let i = 0; i < highlightedJourney.length - 1; i++) {
        if (highlightedJourney[i] === from && highlightedJourney[i + 1] === to)
          return { visible: true, highlight: true, faint: false };
      }
      return { visible: false, highlight: false, faint: false };
    }
    // Selection mode: show edges connected to the selected course
    if (selectedId && (selectedId === from || selectedId === to)) {
      return { visible: true, highlight: true, faint: false };
    }
    // Hover mode: faintly show edges connected to hovered
    if (hoveredId && (hoveredId === from || hoveredId === to)) {
      return { visible: true, highlight: false, faint: true };
    }
    // Idle: hide all edges (less visual noise, big perf win)
    return { visible: false, highlight: false, faint: false };
  }

  useFrame(() => {
    for (const edge of edges) {
      const lineObj = lineRefs.current.get(edge.key);
      if (!lineObj) continue;

      const style = edgeStyle(edge.from, edge.to);
      // Skip hidden lines entirely — major perf win
      if (!style.visible) {
        if (lineObj.visible) lineObj.visible = false;
        continue;
      }

      const fromObj = planetObj(edge.from);
      const toObj = planetObj(edge.to);
      if (!fromObj || !toObj) {
        lineObj.visible = false;
        continue;
      }

      lineObj.visible = true;
      fromObj.getWorldPosition(tempA.current);
      toObj.getWorldPosition(tempB.current);

      const positions = (lineObj.geometry as THREE.BufferGeometry).attributes
        .position as THREE.BufferAttribute;
      // Curve via mid-point lifted up
      const midX = (tempA.current.x + tempB.current.x) / 2;
      const midY = (tempA.current.y + tempB.current.y) / 2 + 0.4;
      const midZ = (tempA.current.z + tempB.current.z) / 2;
      const segments = 32;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Quadratic Bezier
        const x =
          (1 - t) ** 2 * tempA.current.x +
          2 * (1 - t) * t * midX +
          t ** 2 * tempB.current.x;
        const y =
          (1 - t) ** 2 * tempA.current.y +
          2 * (1 - t) * t * midY +
          t ** 2 * tempB.current.y;
        const z =
          (1 - t) ** 2 * tempA.current.z +
          2 * (1 - t) * t * midZ +
          t ** 2 * tempB.current.z;
        positions.setXYZ(i, x, y, z);
      }
      positions.needsUpdate = true;

      // Update color/opacity based on style
      const mat = lineObj.material as THREE.LineBasicMaterial;
      if (style.highlight) {
        mat.color.set("#FFD278");
        mat.opacity = 0.85;
      } else if (style.faint) {
        mat.color.set("#A89B85");
        mat.opacity = 0.16;
      } else {
        mat.color.set("#E4B866");
        mat.opacity = 0.5;
      }
    }
  });

  // Build one THREE.Line per edge imperatively — avoids the JSX <line>
  // clashing with the SVG line type in TypeScript.
  const lines = useMemo(() => {
    return edges.map((edge) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(33 * 3), 3),
      );
      const material = new THREE.LineBasicMaterial({
        color: 0xA89B85,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });
      const l = new THREE.Line(geometry, material);
      lineRefs.current.set(edge.key, l);
      return { edge, object: l };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges]);

  return (
    <>
      {lines.map(({ edge, object }) => (
        <primitive key={edge.key} object={object} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
 * LEVEL LABELS — Roman numerals at each curriculum orbit
 * ═══════════════════════════════════════════════════ */

function LevelLabels() {
  const labels = [
    { level: 1, radius: 5.2, label: "I", title: "Instap" },
    { level: 2, radius: 6.2, label: "II", title: "Vaardigheden" },
    { level: 3, radius: 7.2, label: "III", title: "Meesterschap" },
    { level: 4, radius: 8.2, label: "IV", title: "Capstone" },
  ];

  return (
    <>
      {labels.map((l) => (
        <Html
          key={l.level}
          position={[l.radius + 0.2, -0.3, 0]}
          distanceFactor={11}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            className="font-display select-none whitespace-nowrap text-center"
            style={{
              color: "#FFD278",
              opacity: 0.55,
              textShadow: "0 0 12px rgba(10,7,4,0.95)",
              padding: "2px 8px",
            }}
          >
            <div style={{ fontSize: "1.4rem", lineHeight: 1, fontWeight: 500 }}>
              {l.label}
            </div>
            <div
              className="text-label-mono"
              style={{ fontSize: "0.55rem", marginTop: "2px", letterSpacing: "0.15em" }}
            >
              {l.title}
            </div>
          </div>
        </Html>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
 * NEBULA — giant inside-out sphere with cosmic backdrop
 * ═══════════════════════════════════════════════════ */

function NebulaSphere() {
  const texture = useMemo(() => makeNebulaTexture(), []);
  const meshRef = useRef<THREE.Mesh>(null);

  // Slow drift so the cosmos doesn't feel static
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.005;
  });

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[80, 32, 24]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════
 * ASTRONAUTS — students orbiting their current course
 * Each astronaut is attached to a course planet; if it has
 * a `targetCourseId`, it drifts along the prereq→unlock arc
 * toward the next planet.
 * ═══════════════════════════════════════════════════ */

function AstronautSwarm({
  astronauts,
  onSelect,
}: {
  astronauts: AstronautPlacement[];
  onSelect: (id: string | null) => void;
}) {
  // Group astronauts by their current course so we can stagger orbit angles
  const grouped = useMemo(() => {
    const out = new Map<string, AstronautPlacement[]>();
    for (const a of astronauts) {
      const list = out.get(a.currentCourseId) ?? [];
      list.push(a);
      out.set(a.currentCourseId, list);
    }
    return out;
  }, [astronauts]);

  return (
    <>
      {astronauts.map((a) => {
        const siblings = grouped.get(a.currentCourseId) ?? [];
        const indexInGroup = siblings.indexOf(a);
        const total = Math.max(siblings.length, 1);
        return (
          <Astronaut
            key={a.studentId}
            placement={a}
            indexInGroup={indexInGroup}
            groupSize={total}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}

const Astronaut = memo(function Astronaut({
  placement,
  indexInGroup,
  groupSize,
  onSelect,
}: {
  placement: AstronautPlacement;
  indexInGroup: number;
  groupSize: number;
  onSelect: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);

  // Lookup bodies once
  const fromBody = BODY_BY_ID.get(placement.currentCourseId);
  const toBody = placement.targetCourseId
    ? BODY_BY_ID.get(placement.targetCourseId)
    : null;

  // Stable per-astronaut offsets so the swarm doesn't pulse in sync
  const offset = useMemo(
    () => ({
      angle: (indexInGroup / groupSize) * Math.PI * 2,
      tilt: (indexInGroup % 3) * 0.22 - 0.22,
      rate: 0.7 + (indexInGroup % 5) * 0.06,
      bobPhase: indexInGroup * 0.7,
    }),
    [indexInGroup, groupSize],
  );

  useFrame((state) => {
    if (!groupRef.current || !fromBody) return;
    const t = state.clock.getElapsedTime();

    // Planet positions follow their orbital paths — recompute here so
    // astronauts stick to moving planets.
    const fromPos = bodyOrbitPosition(fromBody, t);
    const toPos = toBody ? bodyOrbitPosition(toBody, t) : null;

    let basePos: THREE.Vector3;
    if (toPos && placement.transitProgress !== undefined) {
      // In transit — lerp along a slight arc between the two planets
      const p = placement.transitProgress;
      basePos = fromPos.clone().lerp(toPos, p);
      // Add a gentle vertical arc so transits feel like trajectories, not lines
      const arc = Math.sin(p * Math.PI) * 0.8;
      basePos.y += arc;
    } else {
      basePos = fromPos.clone();
    }

    // Orbit the astronaut tightly around its current anchor
    const anchorSize = fromBody.size;
    const orbitR = anchorSize * (1.9 + (indexInGroup % 3) * 0.22);
    const orbitAngle = t * offset.rate + offset.angle;
    groupRef.current.position.set(
      basePos.x + Math.cos(orbitAngle) * orbitR,
      basePos.y + Math.sin(orbitAngle) * orbitR * Math.sin(offset.tilt),
      basePos.z + Math.sin(orbitAngle) * orbitR * Math.cos(offset.tilt),
    );

    // Face the direction of motion
    groupRef.current.rotation.y = orbitAngle + Math.PI / 2;

    // Light bob so the figure feels alive
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * 1.4 + offset.bobPhase) * 0.02;
    }
  });

  if (!fromBody) return null;

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(placement.currentCourseId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <group ref={bobRef}>
        <AstronautFigure color={placement.color} />
        <Html
          center
          position={[0, 0.24, 0]}
          distanceFactor={8}
          occlude={false}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: "9px",
              color: "#F5F0E6",
              backgroundColor: "rgba(10,6,4,0.7)",
              padding: "2px 7px",
              borderRadius: "999px",
              border: `1px solid ${placement.color}66`,
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
            }}
          >
            {placement.name.split(" ")[0]}
          </div>
        </Html>
      </group>
    </group>
  );
});

function AstronautFigure({ color }: { color: string }) {
  // Stylised astronaut — helmet + body + backpack with a warm accent. Kept
  // tiny (≈0.12u) so dozens of them fit comfortably around a planet.
  const HELMET_R = 0.07;
  const BODY_R = 0.065;
  return (
    <group scale={1}>
      {/* Body */}
      <mesh position={[0, -0.06, 0]}>
        <capsuleGeometry args={[BODY_R, 0.06, 6, 12]} />
        <meshStandardMaterial
          color="#F5F0E6"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      {/* Accent sash / unit colour */}
      <mesh position={[0, -0.05, 0.055]}>
        <boxGeometry args={[0.09, 0.02, 0.005]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[HELMET_R, 20, 16]} />
        <meshStandardMaterial
          color="#1a1611"
          metalness={0.85}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* Helmet visor highlight */}
      <mesh position={[0, 0.035, HELMET_R * 0.55]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[HELMET_R * 0.78, 16, 12, 0, Math.PI, Math.PI / 3, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>
      {/* Backpack */}
      <mesh position={[0, -0.06, -0.07]}>
        <boxGeometry args={[0.09, 0.08, 0.045]} />
        <meshStandardMaterial color="#2B2620" roughness={0.8} />
      </mesh>
      {/* Thruster glow — behind the backpack */}
      <mesh position={[0, -0.11, -0.1]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.75}
        />
      </mesh>
      {/* Outer glow halo */}
      <mesh position={[0, -0.11, -0.1]} scale={2.2}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
      {/* Arms — small cylinders at sides */}
      <mesh position={[0.08, -0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[0.018, 0.06, 4, 8]} />
        <meshStandardMaterial color="#F5F0E6" roughness={0.6} />
      </mesh>
      <mesh position={[-0.08, -0.05, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[0.018, 0.06, 4, 8]} />
        <meshStandardMaterial color="#F5F0E6" roughness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Compute the world-space position of a body at time t.
 * Matches the orbital math inside <Planet> so astronauts track their planet.
 */
function bodyOrbitPosition(body: SolarBody, t: number): THREE.Vector3 {
  const r = body.orbitalRadius ?? 0;
  const period = body.orbitalPeriod ?? 60;
  const offset = body.orbitalOffset ?? 0;
  const inc = body.orbitalInclination ?? 0;
  const angle = (t * (Math.PI * 2)) / period + offset;
  return new THREE.Vector3(
    Math.cos(angle) * r,
    Math.sin(angle) * r * Math.sin(inc),
    Math.sin(angle) * r * Math.cos(inc),
  );
}

/* ─── UTIL ──────────────────────────────────────────── */

function useRefLerp(initial: number) {
  const ref = useRef(initial);
  const set = (target: number) => {
    ref.current = ref.current + (target - ref.current) * 0.08;
  };
  return [ref, set] as const;
}
