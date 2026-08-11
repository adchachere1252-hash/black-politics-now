import { useEffect, useRef } from "react";
import * as THREE from "three";

const EARTH_TEXTURE = "/manus-storage/earth-atmosphere-2048_bed8e884.jpg";

export default function MiniAuthenticGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load(EARTH_TEXTURE);
    texture.colorSpace = THREE.SRGBColorSpace;
    const earthMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.82, metalness: 0.02 });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1.55, 56, 42), earthMaterial);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({ color: 0x5a99df, transparent: true, opacity: 0.13, side: THREE.BackSide });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.68, 56, 42), atmosphereMaterial);
    const globe = new THREE.Group();
    globe.add(earth, atmosphere);
    globe.rotation.z = -0.12;
    scene.add(globe);

    scene.add(new THREE.HemisphereLight(0xa6caff, 0x03050a, 1.5));
    const key = new THREE.DirectionalLight(0xffd693, 2.2);
    key.position.set(3, 2, 4);
    scene.add(key);

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
      globe.rotation.y += 0.0022;
      globe.rotation.x = Math.sin(Date.now() * 0.00016) * 0.05;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      earth.geometry.dispose();
      atmosphere.geometry.dispose();
      earthMaterial.dispose();
      atmosphereMaterial.dispose();
      texture.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-label="Slowly rotating geographic Earth globe" />;
}
