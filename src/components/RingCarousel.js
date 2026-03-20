"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import styles from "./RingCarousel.module.css";

const MIN_ITEMS = 42;
const CAMERA_START = new THREE.Vector3(0, 1.4, 26);
const LOOK_AT_START = new THREE.Vector3(0, 0.42, 0);
const GROUP_POSITION = new THREE.Vector3(0, 0.4, 0);

const getThumb = (item) => {
  if (item.thumbUrl) return item.thumbUrl;
  if ((item.mediaType || "image") === "image" && item.mediaUrl) return item.mediaUrl;
  if (item.imageUrl) return item.imageUrl;
  return "/placeholder1.jpg";
};

const getDisplayItems = (items) => {
  if (!items.length) return [];
  let next = [...items];
  while (next.length < MIN_ITEMS) next = [...next, ...items];
  return next.slice(0, Math.max(MIN_ITEMS, items.length * 3));
};

const angularDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

function Card({ index, texture, layout, selected, hovered, onSelect, onHover }) {
  const { camera } = useThree();
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const targetVector = useRef(new THREE.Vector3());
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const parentQuaternion = useRef(new THREE.Quaternion());
  const desiredQuaternion = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    const mesh = groupRef.current;
    if (!mesh || !layout) return;

    targetVector.current.copy(layout.position);
    mesh.position.x = THREE.MathUtils.damp(mesh.position.x, targetVector.current.x, 6.8, delta);
    mesh.position.y = THREE.MathUtils.damp(mesh.position.y, targetVector.current.y, 6.8, delta);
    mesh.position.z = THREE.MathUtils.damp(mesh.position.z, targetVector.current.z, 6.8, delta);

    if (layout.faceCamera && mesh.parent) {
      mesh.parent.getWorldQuaternion(parentQuaternion.current);
      desiredQuaternion.current.copy(parentQuaternion.current).invert().multiply(camera.quaternion);
      mesh.quaternion.slerp(desiredQuaternion.current, 1 - Math.exp(-8.5 * delta));
    } else {
      mesh.rotation.x = THREE.MathUtils.damp(mesh.rotation.x, layout.rotation.x, 7, delta);
      mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, layout.rotation.y, 7, delta);
      mesh.rotation.z = THREE.MathUtils.damp(mesh.rotation.z, layout.rotation.z, 7, delta);
    }

    const hoverScale = hovered && !selected ? 1.04 : 1;
    targetScale.current.setScalar(layout.scale * hoverScale);
    mesh.scale.x = THREE.MathUtils.damp(mesh.scale.x, targetScale.current.x, 8, delta);
    mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, targetScale.current.y, 8, delta);
    mesh.scale.z = THREE.MathUtils.damp(mesh.scale.z, targetScale.current.z, 8, delta);

    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, layout.opacity, 8.4, delta);
      materialRef.current.color.lerp(layout.tint, 1 - Math.exp(-7 * delta));
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(index);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(index);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHover(null);
      }}
    >
      <mesh>
        <planeGeometry args={[1.06, 0.66]} />
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          toneMapped={false}
          opacity={0.72}
          color={new THREE.Color("#ffffff")}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function CameraRig({ activeLayout, focusActive, radius }) {
  const { camera, pointer } = useThree();
  const cameraRef = useRef(camera);
  const lookAtTarget = useRef(LOOK_AT_START.clone());
  const focusProgress = useRef(0);
  const desiredPosition = useRef(CAMERA_START.clone());
  const desiredLookAt = useRef(LOOK_AT_START.clone());

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useFrame((_, delta) => {
    const activeCamera = cameraRef.current;
    if (!activeCamera) return;

    focusProgress.current = THREE.MathUtils.damp(focusProgress.current, focusActive ? 1 : 0, 4.8, delta);

    const idleDriftX = pointer.x * 0.14;
    const idleDriftY = pointer.y * 0.36;
    desiredPosition.current.set(CAMERA_START.x + idleDriftX, CAMERA_START.y + idleDriftY, CAMERA_START.z);
    desiredLookAt.current.set(LOOK_AT_START.x + pointer.x * 0.18, LOOK_AT_START.y + pointer.y * 0.22, LOOK_AT_START.z);

    if (activeLayout) {
      const eased = focusProgress.current * focusProgress.current * (3 - 2 * focusProgress.current);
      const focusX = 0;
      const focusY = GROUP_POSITION.y + activeLayout.position.y + 0.04;
      const focusCameraZ = radius + 7.2;
      const focusLookZ = radius - 1.1;
      desiredPosition.current.set(
        THREE.MathUtils.lerp(CAMERA_START.x + idleDriftX * 0.18, focusX + pointer.x * 0.015, eased),
        THREE.MathUtils.lerp(CAMERA_START.y + idleDriftY * 0.45, focusY + 0.06, eased),
        THREE.MathUtils.lerp(CAMERA_START.z, focusCameraZ, eased)
      );
      desiredLookAt.current.set(
        THREE.MathUtils.lerp(LOOK_AT_START.x + pointer.x * 0.04, focusX + pointer.x * 0.012, eased),
        THREE.MathUtils.lerp(LOOK_AT_START.y + pointer.y * 0.04, focusY, eased),
        THREE.MathUtils.lerp(LOOK_AT_START.z, focusLookZ, eased)
      );
    }

    activeCamera.position.x = THREE.MathUtils.damp(activeCamera.position.x, desiredPosition.current.x, 5.2, delta);
    activeCamera.position.y = THREE.MathUtils.damp(activeCamera.position.y, desiredPosition.current.y, 5.2, delta);
    activeCamera.position.z = THREE.MathUtils.damp(activeCamera.position.z, desiredPosition.current.z, 5.2, delta);

    lookAtTarget.current.lerp(desiredLookAt.current, 1 - Math.exp(-5.4 * delta));
    activeCamera.lookAt(lookAtTarget.current);
  });

  return null;
}

function RingScene({ displayItems, selectedIndex, hoveredIndex, rotationTarget, onHover, onSelect }) {
  const groupRef = useRef(null);
  const textures = useTexture(displayItems.map(getThumb));
  const { viewport, pointer } = useThree();
  const groupScale = useRef(new THREE.Vector3(1, 1, 1));
  const preparedTextures = useMemo(
    () =>
      textures.map((texture) => {
        const nextTexture = texture.clone();
        nextTexture.colorSpace = THREE.SRGBColorSpace;
        nextTexture.anisotropy = 8;
        nextTexture.needsUpdate = true;
        return nextTexture;
      }),
    [textures]
  );

  const radius = Math.min(viewport.width, viewport.height) * 0.66;
  const selectedAngle =
    selectedIndex === null || displayItems.length === 0
      ? null
      : (selectedIndex / displayItems.length) * Math.PI * 2;
  const sceneRotationTarget = selectedAngle === null ? rotationTarget + pointer.x * 0.14 : 0;

  const layoutMap = useMemo(() => {
    const next = new Map();
    const count = displayItems.length;

    displayItems.forEach((_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const selected = index === selectedIndex;
      let position;
      let scale;
      let opacity;
      let tint;
      let rotation;

      if (selectedAngle === null) {
        const phase = angle + sceneRotationTarget;
        const frontness = (Math.cos(phase) + 1) / 2;

        position = new THREE.Vector3(
          Math.sin(angle) * radius,
          (frontness - 0.5) * 0.18,
          Math.cos(angle) * radius
        );
        scale = 0.76 + frontness * 0.82;
        opacity = 0.36 + frontness * 0.46;
        tint = new THREE.Color(1, 1, 1);
        rotation = new THREE.Euler(0, angle + Math.PI / 2, 0);
      } else {
        const relativeAngle = angularDelta(angle, selectedAngle);
        const frontness = (Math.cos(relativeAngle) + 1) / 2;
        const focusDistance = Math.abs(relativeAngle) / Math.PI;
        const focusBoost = 1 - focusDistance;
        const backgroundDepth = selected
          ? 0
          : radius * 0.34 + focusBoost * radius * 0.22 + frontness * radius * 0.06;

        position = new THREE.Vector3(
          Math.sin(relativeAngle) * radius * 0.94,
          (frontness - 0.5) * 0.16 + (selected ? 0.08 : focusBoost * 0.015),
          Math.cos(relativeAngle) * radius - backgroundDepth
        );
        scale = selected ? 1.14 : 0.42 + frontness * 0.24 - focusBoost * 0.08;
        opacity = selected ? 1 : 0.04 + frontness * 0.2;
        tint = selected
          ? new THREE.Color("#ffffff")
          : new THREE.Color(0.64 + frontness * 0.12, 0.64 + frontness * 0.12, 0.67 + frontness * 0.1);
        rotation = new THREE.Euler(-0.01 + focusBoost * 0.025, relativeAngle + Math.PI / 2, focusBoost * 0.016);
      }

      next.set(index, {
        position,
        rotation,
        scale,
        opacity,
        faceCamera: selected,
        tint,
      });
    });

    return next;
  }, [displayItems, radius, sceneRotationTarget, selectedAngle, selectedIndex]);

  const activeLayout = selectedIndex === null ? null : layoutMap.get(selectedIndex);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetX = selectedIndex === null ? 0.15 + pointer.y * 0.05 : 0.06;
    const targetScale = selectedIndex === null ? 1 : 1.16;
    groupScale.current.setScalar(targetScale);
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      sceneRotationTarget,
      selectedIndex === null ? 4.2 : 3.2,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetX, 4.6, delta);
    groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, groupScale.current.x, selectedIndex === null ? 3.4 : 5.8, delta);
    groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, groupScale.current.y, selectedIndex === null ? 3.4 : 5.8, delta);
    groupRef.current.scale.z = THREE.MathUtils.damp(groupRef.current.scale.z, groupScale.current.z, selectedIndex === null ? 3.4 : 5.8, delta);
  });

  return (
    <>
      <CameraRig activeLayout={activeLayout} focusActive={selectedIndex !== null} radius={radius} />
      <group ref={groupRef} position={GROUP_POSITION.toArray()}>
        {displayItems.map((item, index) => (
          <Card
            key={`${item.id}-${index}`}
            index={index}
            texture={preparedTextures[index]}
            layout={layoutMap.get(index)}
            selected={selectedIndex === index}
            hovered={hoveredIndex === index}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </group>
    </>
  );
}

export default function RingCarousel({ items }) {
  const sceneRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [rotationTarget, setRotationTarget] = useState(Math.PI / 2);
  const [scrollEnergy, setScrollEnergy] = useState(0);
  const displayItems = useMemo(() => getDisplayItems(items), [items]);
  const hoveredItem = hoveredIndex !== null ? displayItems[hoveredIndex] : null;
  const selectedItem = selectedIndex !== null ? displayItems[selectedIndex] : null;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let downMomentum = 0;
    let locked = false;

    const handleWheel = (event) => {
      if (selectedIndex !== null) return;
      event.preventDefault();

      const delta = event.deltaY;
      setRotationTarget((current) => current - delta * 0.00115);

      if (delta > 0) {
        downMomentum += delta;
        setScrollEnergy((current) => Math.min(1, current + delta / 800));
        if (downMomentum > 520 && !locked) {
          locked = true;
          document.getElementById("ai-chat")?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            downMomentum = 0;
            setScrollEnergy(0);
            locked = false;
          }, 1000);
        }
      } else {
        downMomentum = Math.max(0, downMomentum + delta);
        setScrollEnergy((current) => Math.max(0, current + delta / 800));
      }
    };

    scene.addEventListener("wheel", handleWheel, { passive: false });
    return () => scene.removeEventListener("wheel", handleWheel);
  }, [selectedIndex]);

  useEffect(() => {
    const scene = sceneRef.current;
    const snapContainer = scene?.closest(".snap-container");
    if (!scene || !snapContainer) return undefined;

    const handleScroll = () => {
      const rect = scene.getBoundingClientRect();
      if (Math.abs(rect.top) < window.innerHeight * 0.12) {
        setScrollEnergy(0);
      }
    };

    handleScroll();
    snapContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => snapContainer.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        setHoveredIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const closeExpanded = () => {
    setSelectedIndex(null);
    setHoveredIndex(null);
  };

  return (
    <div
      ref={sceneRef}
      className={styles.scene}
      style={{
        opacity: 1 - scrollEnergy * 0.08,
      }}
    >
      <div className={styles.canvasWrap}>
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: CAMERA_START.toArray(), fov: 17.5 }}
          gl={{ alpha: true, antialias: true }}
          onPointerMissed={() => {
            if (selectedIndex !== null) closeExpanded();
          }}
        >
          <ambientLight intensity={1.05} />
          <directionalLight position={[4, 5, 10]} intensity={0.72} />
          <RingScene
            displayItems={displayItems}
            selectedIndex={selectedIndex}
            hoveredIndex={hoveredIndex}
            rotationTarget={rotationTarget}
            onHover={setHoveredIndex}
            onSelect={(index) => {
              setSelectedIndex(index);
              setHoveredIndex(index);
            }}
          />
        </Canvas>
      </div>

      {selectedItem && (
        <div className={styles.infoPanel} onClick={(event) => event.stopPropagation()}>
          <button className={styles.backButton} type="button" onClick={closeExpanded}>
            Exit View
          </button>
          {selectedItem.category && <p className={styles.category}>{selectedItem.category}</p>}
          <h2 className={styles.title}>{selectedItem.title}</h2>
          {selectedItem.description && <p className={styles.description}>{selectedItem.description}</p>}
        </div>
      )}

      {!selectedItem && hoveredItem && (
        <div className={styles.hoverLabel}>
          <span className={styles.hoverCategory}>{hoveredItem.category || "work"}</span>
          <span className={styles.hoverTitle}>{hoveredItem.title}</span>
        </div>
      )}
    </div>
  );
}
