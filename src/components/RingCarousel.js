"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useSpring, useMotionTemplate } from "framer-motion";
import styles from "./RingCarousel.module.css";

export default function RingCarousel({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dim, setDim] = useState({ w: 1200, h: 800 });
  // Ref mirror of selectedItem for use inside closures (e.g. handleMouseMove)
  const selectedRef = useRef(null);
  useEffect(() => { selectedRef.current = selectedItem; }, [selectedItem]);

  useEffect(() => {
    setDim({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic ring radius: accounts for perspective projection distortion
  // Front-most items appear at ~1.4x radius on screen, so 0.6 * 1.4 * 2 ≈ 1.68 viewport
  const ringRadius = Math.min(dim.w, dim.h) * 0.6;
  // Perspective scales proportionally with ring radius to maintain consistent 3D depth
  const ringPerspective = ringRadius * 4;

  const mouseX = useMotionValue(dim.w / 2);
  const mouseY = useMotionValue(dim.h / 2);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  const rotationYFromMouse = useTransform(smoothX, [0, dim.w], [50, -50]);
  const rotationX = useTransform(smoothY, [0, dim.h], [-12, -5]);
  const translateZ = useTransform(smoothY, [0, dim.h], [40, -40]);
  const rotationZ = useTransform(smoothX, [0, dim.w], [-2, 2]);

  // Start with a rotation and far away for entry animation
  const wheelAngle = useMotionValue(90);
  const smoothWheelAngle = useSpring(wheelAngle, { damping: 25, stiffness: 60 });
  const rotationY = useTransform(() => rotationYFromMouse.get() + smoothWheelAngle.get());

  const entryZ = useMotionValue(-4000);
  const smoothEntryZ = useSpring(entryZ, { damping: 25, stiffness: 50 });

  useEffect(() => {
    wheelAngle.set(0);
    entryZ.set(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dynamicTranslateZ = useTransform(() => translateZ.get() + smoothEntryZ.get());
  const containerTransform = useMotionTemplate`translateZ(${dynamicTranslateZ}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;

  const handleMouseMove = (e) => {
    // Freeze mouse tilt when the detail panel is open for a stable right-side view
    if (selectedRef.current) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  // Ensure enough items around the ring (min 29 for a dense ring)
  const minItems = 29;
  let displayItems = [...items];
  if (items.length > 0) {
    while (displayItems.length < minItems) {
      displayItems = [...displayItems, ...items];
    }
    displayItems = displayItems.slice(0, Math.max(minItems, items.length * 3));
  }

  const sceneRef = useRef(null);

  // Continuous scroll counter differentiates 'exploring' from 'swiping away'
  const continuousDownScroll = useRef(0);
  const scrollEnergy = useMotionValue(0);
  const smoothEnergy = useSpring(scrollEnergy, { damping: 30, stiffness: 150 });

  // Scale the ENTIRE scene down instead of the 3D inner ring to avoid 3D clipping bugs
  const sceneScale = useTransform(smoothEnergy, [0, 400], [1, 0.55]);
  const sceneOpacity = useTransform(smoothEnergy, [0, 400], [1, 0]);

  const isTransitioning = useRef(false);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isTransitioning.current) return;

      // When detail panel is open: allow ring spin but skip the snap-to-chat transition
      if (selectedItem) {
        wheelAngle.set(wheelAngle.get() - e.deltaY * 0.15);
        return;
      }

      if (e.deltaY > 0) {
        continuousDownScroll.current += e.deltaY;

        if (continuousDownScroll.current < 250) {
          wheelAngle.set(wheelAngle.get() - e.deltaY * 0.15);
        } else {
          wheelAngle.set(wheelAngle.get() - e.deltaY * 0.05);
          const newEnergy = scrollEnergy.get() + e.deltaY;
          scrollEnergy.set(Math.min(newEnergy, 500));

          if (newEnergy > 400) {
            isTransitioning.current = true;
            const chatElement = document.getElementById("ai-chat");
            if (chatElement) chatElement.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => {
              scrollEnergy.set(0);
              continuousDownScroll.current = 0;
              isTransitioning.current = false;
            }, 1000);
          }
        }
      } else {
        continuousDownScroll.current = Math.max(0, continuousDownScroll.current + e.deltaY);
        scrollEnergy.set(Math.max(0, scrollEnergy.get() + e.deltaY));
        wheelAngle.set(wheelAngle.get() - e.deltaY * 0.15);
      }
    };

    scene.addEventListener("wheel", handleWheel, { passive: false });
    return () => scene.removeEventListener("wheel", handleWheel);
  }, [selectedItem]);

  return (
    <motion.div
      ref={sceneRef}
      className={styles.scene}
      onMouseMove={handleMouseMove}
      // Clicking blank space in the scene closes the detail panel
      onClick={() => setSelectedItem(null)}
      style={{ 
        scale: sceneScale, 
        opacity: sceneOpacity,
        // overflow: hidden is only needed when the ring shifts right for split-screen
        // In normal state, keep visible so 3D items aren't clipped at screen edges
        overflow: selectedItem ? "hidden" : "visible",
      }}
    >
      {/* Left Detail Panel – slides in when an image is clicked */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className={styles.detailPanel}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 40, stiffness: 220 }}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedItem(null)}
            >
              ←
            </button>

            {selectedItem.category && (
              <p className={styles.detailCategory}>{selectedItem.category}</p>
            )}
            <h2 className={styles.detailTitle}>{selectedItem.title}</h2>

            <motion.img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              className={styles.detailImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />

            {selectedItem.description && (
              <motion.p
                className={styles.detailDesc}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {selectedItem.description}
              </motion.p>
            )}

            <motion.a
              href="#"
              className={styles.viewProject}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
            >
              view project →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Ring – anchor shifts right when detail panel opens */}
      <motion.div
        className={styles.ring}
        animate={{ left: selectedItem ? "78%" : "50%" }}
        transition={{ type: "spring", damping: 30, stiffness: 150 }}
        style={{ perspective: `${ringPerspective}px` }}
      >
        {/* Inner 3D container – receives the mouse/scroll rotations */}
        <motion.div
          style={{
            transformStyle: "preserve-3d",
            transform: containerTransform,
            width: 0,
            height: 0,
          }}
        >
          {displayItems.map((item, i) => {
            const angle = (i / displayItems.length) * 360;
            return (
              <div
                key={`${item.id}-${i}`}
                className={styles.ringItem}
                role="button"
                tabIndex={0}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${ringRadius}px) rotateY(90deg)`,
                  transformStyle: "preserve-3d",
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className={`${styles.ringTitle} ${hoveredIndex === i ? styles.active : ""}`}>
                  {item.title}
                </div>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={`${styles.ringImage} ${hoveredIndex === i ? styles.active : ""}`}
                />
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
