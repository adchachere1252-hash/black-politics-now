import { useEffect, useRef } from "react";
import * as THREE from "three";

type WorldElectionPoint = { countryCode: string; status: string };

const COORDINATES: Record<string, [number, number]> = {
  DZ: [28, 3], AM: [40, 45], BD: [24, 90], BA: [44, 18], BR: [-10, -55], BG: [43, 25],
  CV: [16, -24], CO: [4, -72], CK: [-21, -159], CZ: [49, 15], ET: [9, 40], DE: [51, 10],
  GW: [12, -15], HT: [19, -72], HU: [47, 20], IN: [22, 79], IL: [31, 35], JP: [36, 138],
  KZ: [48, 68], MA: [32, -6], MX: [24, -102], MM: [21, 96], NL: [52, 5], NZ: [-41, 174],
  PE: [-10, -76], PH: [13, 122], PT: [39, -8], RO: [46, 25], RS: [44, 21], SG: [1, 104],
  SK: [49, 20], SO: [6, 46], KR: [36, 128], SE: [62, 15], TW: [24, 121], UG: [1, 32],
  US: [39, -98], VN: [16, 108], ZM: [-14, 28],
  TH: [15, 101], NP: [28, 84], CH: [47, 8], ST: [0, 6], RU: [61, 105], NI: [13, -85],
  PS: [32, 35], GM: [13, -16], SS: [7, 30], GB: [55, -3],
};

const EARTH_TEXTURE = "/manus-storage/earth-atmosphere-2048_bed8e884.jpg";

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

export default function WorldGlobe({ elections }: { elections: WorldElectionPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load(EARTH_TEXTURE);
    texture.colorSpace = THREE.SRGBColorSpace;
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 48, 48),
      new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 0.84, metalness: 0.02, emissive: 0x0a2132, emissiveIntensity: 0.16 }),
    );
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(2.17, 30, 18),
      new THREE.MeshBasicMaterial({ color: 0xd7f5ff, wireframe: true, transparent: true, opacity: 0.06 }),
    );
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.32, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x6fddff, transparent: true, opacity: 0.18, side: THREE.BackSide }),
    );
    const globe = new THREE.Group();
    globe.add(earth, wire, atmosphere);
    scene.add(globe);

    elections.forEach((election, index) => {
      const coords = COORDINATES[election.countryCode] ?? [((index * 17) % 120) - 55, ((index * 31) % 300) - 150];
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(election.status === "Voting Today" ? 0.075 : 0.052, 14, 14),
        new THREE.MeshBasicMaterial({ color: statusColor(election.status) }),
      );
      marker.position.copy(coordinateToVector(coords[0], coords[1], 2.22));
      globe.add(marker);
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
    scene.add(new THREE.HemisphereLight(0xd6f2ff, 0x13233a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xfff2cf, 3.6);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x45bfff, 1.7);
    rimLight.position.set(-4, 0, -3);
    scene.add(rimLight);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height || 440);
      camera.aspect = width / (height || 440);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    let frame = 0;
    const animate = () => {
      globe.rotation.y += 0.0018;
      globe.rotation.x = Math.sin(Date.now() * 0.00015) * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      texture.dispose();
      earth.geometry.dispose();
      (earth.material as THREE.Material).dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [elections]);

  return <div ref={containerRef} className="h-[360px] sm:h-[440px] w-full" aria-label="Animated globe showing countries with tracked elections" />;
}
