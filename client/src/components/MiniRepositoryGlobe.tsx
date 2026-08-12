import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";
import earcut from "earcut";

const COUNTRY_TOPOLOGY = "/manus-storage/countries-50m_1d29640f.json";
const RADIUS = 1.48;

function pointOnGlobe(lon: number, lat: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function ringsForFeature(feature: any): number[][][][] {
  if (feature.geometry?.type === "Polygon") return [feature.geometry.coordinates];
  if (feature.geometry?.type === "MultiPolygon") return feature.geometry.coordinates;
  return [];
}

export default function MiniRepositoryGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    globe.rotation.set(-0.18, -0.75, -0.05);
    const oceanMaterial = new THREE.MeshStandardMaterial({ color: 0x071222, roughness: 0.68, metalness: 0.18 });
    const ocean = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 56, 42), oceanMaterial);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({ color: 0x3e78b7, transparent: true, opacity: 0.13, side: THREE.BackSide });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(RADIUS + 0.13, 56, 42), atmosphereMaterial);
    globe.add(ocean, atmosphere);
    scene.add(globe);

    scene.add(new THREE.HemisphereLight(0x9cc9ff, 0x020306, 1.3));
    const light = new THREE.DirectionalLight(0xffd88d, 1.4);
    light.position.set(3, 2, 4);
    scene.add(light);

    let countryGeometry: THREE.BufferGeometry | null = null;
    let borderGeometry: THREE.BufferGeometry | null = null;
    let countryMaterial: THREE.MeshBasicMaterial | null = null;
    let borderMaterial: THREE.LineBasicMaterial | null = null;
    let disposed = false;

    fetch(COUNTRY_TOPOLOGY)
      .then((response) => response.json())
      .then((topology) => {
        if (disposed) return;
        const collection: any = (topojson as any).feature(topology, topology.objects.countries);
        const vertices: number[] = [];
        const indices: number[] = [];
        const borderPoints: number[] = [];

        (collection.features ?? []).forEach((feature: any) => {
          ringsForFeature(feature).forEach((polygon) => {
            const flattened: number[] = [];
            const holes: number[] = [];
            polygon.forEach((rawRing: number[][], ringIndex: number) => {
              const ring = rawRing.length > 1 && rawRing[0][0] === rawRing[rawRing.length - 1][0] && rawRing[0][1] === rawRing[rawRing.length - 1][1] ? rawRing.slice(0, -1) : rawRing;
              if (ringIndex > 0) holes.push(flattened.length / 2);
              ring.forEach(([lon, lat]) => flattened.push(lon, lat));
              rawRing.slice(0, -1).forEach(([lon, lat], index) => {
                const next = rawRing[index + 1];
                if (!next || Math.abs(next[0] - lon) > 180) return;
                const a = pointOnGlobe(lon, lat, RADIUS + 0.012);
                const b = pointOnGlobe(next[0], next[1], RADIUS + 0.012);
                borderPoints.push(a.x, a.y, a.z, b.x, b.y, b.z);
              });
            });
            const triangles = earcut(flattened, holes.length ? holes : undefined, 2);
            const base = vertices.length / 3;
            for (let i = 0; i < flattened.length; i += 2) {
              const point = pointOnGlobe(flattened[i], flattened[i + 1], RADIUS + 0.006);
              vertices.push(point.x, point.y, point.z);
            }
            triangles.forEach((index: number) => indices.push(base + index));
          });
        });

        countryGeometry = new THREE.BufferGeometry();
        countryGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        countryGeometry.setIndex(indices);
        countryGeometry.computeVertexNormals();
        countryMaterial = new THREE.MeshBasicMaterial({ color: 0x254c76, transparent: true, opacity: 0.97, side: THREE.DoubleSide });
        globe.add(new THREE.Mesh(countryGeometry, countryMaterial));

        borderGeometry = new THREE.BufferGeometry();
        borderGeometry.setAttribute("position", new THREE.Float32BufferAttribute(borderPoints, 3));
        borderMaterial = new THREE.LineBasicMaterial({ color: 0xc69d58, transparent: true, opacity: 0.52 });
        globe.add(new THREE.LineSegments(borderGeometry, borderMaterial));
      })
      .catch(() => undefined);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight || 180;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    let frame = 0;
    const animate = () => {
      globe.rotation.y += 0.002;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      ocean.geometry.dispose();
      oceanMaterial.dispose();
      atmosphere.geometry.dispose();
      atmosphereMaterial.dispose();
      countryGeometry?.dispose();
      borderGeometry?.dispose();
      countryMaterial?.dispose();
      borderMaterial?.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-label="Slowly rotating geographic political globe with country boundaries" />;
}
