import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";
import { getCountryFocusCoordinates, getLabelsForDensity, getWorldGlobeLabels, type WorldGlobeLabelDensity, WORLD_ELECTION_COORDINATES } from "@/lib/worldGlobeLabels";

type WorldElectionPoint = { countryCode: string; country?: string | null; status: string; [key: string]: unknown };

const EARTH_TEXTURE = "/manus-storage/earth-atmosphere-2048_bed8e884.jpg";
const COUNTRY_TOPOLOGY = "/manus-storage/countries-50m_1d29640f.json";

const statusColor = (status: string) => {
  if (status === "Voting Today") return 0xf8c95c;
  if (status === "Completed") return 0x57c98e;
  return 0xe8ad54;
};

function coordinateToVector(latitude: number, longitude: number, radius: number) {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128);
  gradient.addColorStop(0, "rgba(137, 224, 255, 0.64)");
  gradient.addColorStop(0.28, "rgba(36, 171, 245, 0.24)");
  gradient.addColorStop(0.65, "rgba(12, 73, 150, 0.08)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function makeCountryLabel(country: string, status: string, tracked: boolean) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;
  const fontSize = tracked ? 25 : 17;
  context.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
  const width = Math.max(tracked ? 106 : 78, Math.ceil(context.measureText(country).width) + (tracked ? 30 : 24));
  const height = tracked ? 44 : 32;
  canvas.width = width;
  canvas.height = height;
  context.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
  context.fillStyle = !tracked ? "#e4f4ff" : status === "Voting Today" ? "#fff7cb" : status === "Completed" ? "#c8ffe0" : "#fffdf4";
  context.strokeStyle = "rgba(4, 18, 32, 0.96)";
  context.lineWidth = tracked ? 3.2 : 2.6;
  context.shadowColor = "rgba(0, 0, 0, 0.98)";
  context.shadowBlur = 10;
  context.shadowOffsetY = 2;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.strokeText(country, width / 2, height / 2 + 1);
  context.fillText(country, width / 2, height / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
  const scale = tracked ? 0.00415 : 0.0026;
  sprite.scale.set(width * scale, height * scale, 1);
  return sprite;
}

function makeLeaderLine(from: THREE.Vector3, to: THREE.Vector3, color: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.76, depthTest: false }));
}

export default function WorldGlobe({ elections, onElectionSelect, immersive = false, labelDensity = "full", focusCountryCode = null }: { elections: WorldElectionPoint[]; onElectionSelect?: (election: WorldElectionPoint) => void; immersive?: boolean; labelDensity?: WorldGlobeLabelDensity; focusCountryCode?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Keep the full atmosphere inside a square mobile frame while letting Earth
    // use nearly all available width.
    camera.position.set(0, 0, 6.9);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load(EARTH_TEXTURE);
    texture.colorSpace = THREE.SRGBColorSpace;
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 64, 64),
      new THREE.MeshPhysicalMaterial({ map: texture, color: 0xffffff, roughness: 0.42, metalness: 0.06, clearcoat: 0.72, clearcoatRoughness: 0.22, emissive: 0x0e3148, emissiveIntensity: 0.2 }),
    );
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.32, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x73dcff, transparent: true, opacity: 0.3, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
    );
    const globe = new THREE.Group();
    globe.add(earth, atmosphere);
    scene.add(globe);

    const glowTexture = makeGlowTexture();
    const beaconGlow = glowTexture ? new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x5fd5ff, transparent: true, opacity: 0.68, depthWrite: false, blending: THREE.AdditiveBlending })) : null;
    if (beaconGlow) {
      beaconGlow.scale.set(6.5, 6.5, 1);
      beaconGlow.position.set(-0.1, 0.1, -0.7);
      scene.add(beaconGlow);
    }

    let borders: THREE.LineSegments | null = null;
    let borderHalo: THREE.LineSegments | null = null;
    let disposed = false;
    fetch(COUNTRY_TOPOLOGY)
      .then((response) => response.json())
      .then((topology) => {
        if (disposed) return;
        const collection: any = (topojson as any).feature(topology, topology.objects.countries);
        const points: number[] = [];
        (collection.features ?? []).forEach((feature: any) => {
          const polygons = feature.geometry?.type === "Polygon"
            ? [feature.geometry.coordinates]
            : feature.geometry?.type === "MultiPolygon" ? feature.geometry.coordinates : [];
          polygons.forEach((polygon: number[][][]) => polygon.forEach((ring: number[][]) => {
            for (let index = 0; index < ring.length - 1; index += 1) {
              const [lonA, latA] = ring[index];
              const [lonB, latB] = ring[index + 1];
              if (Math.abs(lonA - lonB) > 180) continue;
              const a = coordinateToVector(latA, lonA, 2.174);
              const b = coordinateToVector(latB, lonB, 2.174);
              points.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
          }));
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        borderHalo = new THREE.LineSegments(geometry.clone(), new THREE.LineBasicMaterial({ color: 0x45cfff, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending }));
        borderHalo.scale.setScalar(1.004);
        borders = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xffedb6, transparent: true, opacity: 0.88 }));
        globe.add(borderHalo);
        globe.add(borders);
      })
      .catch(() => undefined);

    const interactiveMarkers: THREE.Object3D[] = [];
    const markerGroups: THREE.Group[] = [];
    const labelOverlays: Array<{ sprite: THREE.Sprite; leader?: THREE.Line }> = [];
    const allLabels = getWorldGlobeLabels(elections);
    allLabels.filter((label) => label.tracked).forEach((label, index) => {
      const election = elections.find((item) => item.countryCode === label.countryCode);
      const coords = election ? WORLD_ELECTION_COORDINATES[election.countryCode] : undefined;
      if (!election || !coords) return;
      const markerGroup = new THREE.Group();
      markerGroup.userData = { election, pulseOffset: index * 0.43 };
      markerGroup.position.copy(coordinateToVector(coords[0], coords[1], 2.22));
      const marker = new THREE.Mesh(new THREE.SphereGeometry(election.status === "Voting Today" ? 0.075 : 0.052, 14, 14), new THREE.MeshBasicMaterial({ color: statusColor(election.status), transparent: true, opacity: 0.96 }));
      const pulse = new THREE.Mesh(new THREE.RingGeometry(election.status === "Voting Today" ? 0.084 : 0.062, election.status === "Voting Today" ? 0.11 : 0.084, 24), new THREE.MeshBasicMaterial({ color: statusColor(election.status), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      pulse.lookAt(markerGroup.position.clone().multiplyScalar(2));
      markerGroup.add(marker, pulse);
      interactiveMarkers.push(marker);
      markerGroups.push(markerGroup);
      globe.add(markerGroup);
    });

    getLabelsForDensity(elections, labelDensity).forEach((label) => {
      const election = label.tracked ? elections.find((item) => item.countryCode === label.countryCode) : undefined;
      const countryLabel = makeCountryLabel(label.country, label.status, label.tracked);
      if (!countryLabel) return;
      const surface = coordinateToVector(label.latitude, label.longitude, 2.205);
      const calloutPosition = coordinateToVector(label.labelLatitude, label.labelLongitude, 2.15 * label.altitude);
      countryLabel.position.copy(calloutPosition);
      countryLabel.userData = { election, countryLabel: label.country, isCountryLabel: true };
      const leader = label.tracked ? makeLeaderLine(surface, calloutPosition, statusColor(label.status)) : undefined;
      if (leader) {
        leader.userData = { isCountryLeader: true };
        interactiveMarkers.push(countryLabel);
        globe.add(leader);
      }
      labelOverlays.push({ sprite: countryLabel, leader });
      globe.add(countryLabel);
    });

    const stars = new THREE.BufferGeometry();
    const points = new Float32Array(600 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 22;
      points[i + 1] = (Math.random() - 0.5) * 16;
      points[i + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    stars.setAttribute("position", new THREE.BufferAttribute(points, 3));
    scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xe8eefc, size: 0.025, transparent: true, opacity: 0.7 })));
    scene.add(new THREE.HemisphereLight(0xe0f7ff, 0x1a3850, 3.1));
    const keyLight = new THREE.DirectionalLight(0xfff5d5, 4.8);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x45c9ff, 2.8);
    rimLight.position.set(-4, 0, -3);
    scene.add(rimLight);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const frameHeight = height || width || 360;
      renderer.setSize(width, frameHeight);
      camera.aspect = width / frameHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const findMarker = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(interactiveMarkers, false)[0];
    };
    const onPointerMove = (event: PointerEvent) => {
      renderer.domElement.style.cursor = findMarker(event) ? "pointer" : "grab";
    };
    const onPointerLeave = () => { renderer.domElement.style.cursor = "default"; };
    const onPointerUp = (event: PointerEvent) => {
      const hit = findMarker(event);
      const election = (hit?.object.userData?.election ?? hit?.object.parent?.userData?.election) as WorldElectionPoint | undefined;
      if (election) onElectionSelect?.(election);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    const focusCoordinates = getCountryFocusCoordinates(focusCountryCode);
    const focusTarget = focusCoordinates
      ? { x: (focusCoordinates[0] * Math.PI) / 180, y: ((focusCoordinates[1] + 180) * Math.PI) / 180 }
      : null;
    const shortestRotation = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
    let frame = 0;
    const animate = () => {
      if (focusTarget) {
        globe.rotation.y += shortestRotation(globe.rotation.y, focusTarget.y) * 0.055;
        globe.rotation.x += (focusTarget.x - globe.rotation.x) * 0.055;
      } else {
        globe.rotation.y += 0.00082;
        globe.rotation.x = Math.sin(Date.now() * 0.00015) * 0.08;
      }
      const time = Date.now() * 0.002;
      markerGroups.forEach((group) => {
        const pulse = group.children[1] as THREE.Mesh;
        const scale = 1 + Math.sin(time + group.userData.pulseOffset) * 0.22;
        pulse.scale.setScalar(scale);
        (pulse.material as THREE.MeshBasicMaterial).opacity = 0.34 + (Math.sin(time + group.userData.pulseOffset) + 1) * 0.14;
      });
      globe.updateMatrixWorld(true);
      const cameraDirection = camera.position.clone().normalize();
      labelOverlays.forEach(({ sprite, leader }) => {
        const labelDirection = sprite.getWorldPosition(new THREE.Vector3()).normalize();
        const visible = labelDirection.dot(cameraDirection) > 0.12;
        sprite.visible = visible;
        if (leader) leader.visible = visible;
      });
      if (beaconGlow) beaconGlow.material.opacity = 0.57 + Math.sin(time * 0.3) * 0.09;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      texture.dispose();
      glowTexture?.dispose();
      earth.geometry.dispose();
      (earth.material as THREE.Material).dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      borders?.geometry.dispose();
      (borders?.material as THREE.Material | undefined)?.dispose();
      borderHalo?.geometry.dispose();
      (borderHalo?.material as THREE.Material | undefined)?.dispose();
      markerGroups.forEach((group) => group.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose();
      }));
      labelOverlays.forEach(({ sprite, leader }) => {
        const material = sprite.material as THREE.SpriteMaterial;
        material.map?.dispose();
        material.dispose();
        if (leader) {
          leader.geometry.dispose();
          (leader.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [elections, focusCountryCode, labelDensity, onElectionSelect]);

  return <div ref={containerRef} className={immersive ? "aspect-square h-auto w-full sm:aspect-auto sm:h-[610px]" : "aspect-square h-auto w-full sm:aspect-auto sm:h-[440px]"} aria-label="Animated luminous Earth globe; select an election beacon to open country details" />;
}
