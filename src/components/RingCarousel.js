"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import styles from "./RingCarousel.module.css";

const getThumb = (item) => {
  if (item.thumbUrl) return item.thumbUrl;
  if ((item.mediaType || "image") === "image" && item.mediaUrl) return item.mediaUrl;
  if (item.imageUrl) return item.imageUrl;
  return "/placeholder1.jpg";
};

const renderDetailMedia = (item) => {
  const src = item.mediaUrl || item.imageUrl;
  if (item.mediaType === "video") {
    return (
      <video className={styles.detailMedia} src={src} controls poster={getThumb(item)} />
    );
  }
  if (item.mediaType === "audio") {
    return (
      <div className={styles.detailMediaStack}>
        {getThumb(item) && <img src={getThumb(item)} alt={item.title} className={styles.detailMedia} />}
        <audio src={src} controls className={styles.detailAudio} />
      </div>
    );
  }
  if (item.mediaType === "text") {
    return <div className={styles.detailText}>{item.description || "No text content provided."}</div>;
  }
  return (
    <motion.img
      src={src}
      alt={item.title}
      className={styles.detailImage}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    />
  );
};

export default function RingCarousel({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dim, setDim] = useState({ w: 1200, h: 800 });
  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selectedItem;
  }, [selectedItem]);

  useEffect(() => {
    setDim({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ringRadius = Math.min(dim.w, dim.h) * 0.6;
  const ringPerspective = ringRadius * 4;

  const mouseX = useMotionValue(dim.w / 2);
  const mouseY = useMotionValue(dim.h / 2);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 200 });
  const detailMode = useMotionValue(0);
  useEffect(() => {
    const isOpen = !!selectedItem;
    detailMode.set(isOpen ? 1 : 0);
    if (isOpen) {
      mouseX.set(dim.w / 2);
      mouseY.set(dim.h / 2);
    }
  }, [selectedItem, dim.w, dim.h, mouseX, mouseY, detailMode]);

  const rotationYFromMouse = useTransform(smoothX, [0, dim.w], [50, -50]);
  const rotationXFromMouse = useTransform(smoothY, [0, dim.h], [-12, -5]);
  const translateZFromMouse = useTransform(smoothY, [0, dim.h], [40, -40]);
  const rotationZFromMouse = useTransform(smoothX, [0, dim.w], [-2, 2]);

  const wheelAngle = useMotionValue(90);
  const smoothWheelAngle = useSpring(wheelAngle, { damping: 25, stiffness: 60 });
  const rotationY = useTransform(
    [rotationYFromMouse, smoothWheelAngle, detailMode],
    ([fromMouse, wheel, mode]) => (mode ? wheel : fromMouse + wheel)
  );

  const entryZ = useMotionValue(-4000);
  const smoothEntryZ = useSpring(entryZ, { damping: 25, stiffness: 50 });

  useEffect(() => {
    wheelAngle.set(0);
    entryZ.set(0);
  }, []);

  const rotationX = useTransform(
    [rotationXFromMouse, detailMode],
    ([fromMouse, mode]) => (mode ? -8 : fromMouse)
  );
  const rotationZ = useTransform(
    [rotationZFromMouse, detailMode],
    ([fromMouse, mode]) => (mode ? 0 : fromMouse)
  );
  const translateZ = useTransform(
    [translateZFromMouse, detailMode],
    ([fromMouse, mode]) => (mode ? 0 : fromMouse)
  );
  const dynamicTranslateZ = useTransform(() => translateZ.get() + smoothEntryZ.get());
  const containerTransform = useMotionTemplate`translateZ(${dynamicTranslateZ}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;

  const handleMouseMove = (e) => {
    if (selectedRef.current) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const minItems = 29;
  let displayItems = [...items];
  if (items.length > 0) {
    while (displayItems.length < minItems) {
      displayItems = [...displayItems, ...items];
    }
    displayItems = displayItems.slice(0, Math.max(minItems, items.length * 3));
  }

  const sceneRef = useRef(null);
  const continuousDownScroll = useRef(0);
  const scrollEnergy = useMotionValue(0);
  const smoothEnergy = useSpring(scrollEnergy, { damping: 30, stiffness: 150 });
  const sceneScale = useTransform(smoothEnergy, [0, 400], [1, 0.55]);
  const sceneOpacity = useTransform(smoothEnergy, [0, 400], [1, 0]);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isTransitioning.current) return;

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
  }, [selectedItem, scrollEnergy, wheelAngle]);

  return (
    <motion.div
      ref={sceneRef}
      className={styles.scene}
      onMouseMove={handleMouseMove}
      onClick={() => setSelectedItem(null)}
      style={{
        scale: sceneScale,
        opacity: sceneOpacity,
        overflow: selectedItem ? "hidden" : "visible",
      }}
    >
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className={styles.detailPanel}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 40, stiffness: 220 }}
          >
            <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
              Back
            </button>

            {selectedItem.category && (
              <p className={styles.detailCategory}>{selectedItem.category}</p>
            )}
            <h2 className={styles.detailTitle}>{selectedItem.title}</h2>

            {renderDetailMedia(selectedItem)}

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

          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.ring}
        animate={{ left: selectedItem ? "78%" : "50%" }}
        transition={{ type: "spring", damping: 30, stiffness: 150 }}
        style={{ perspective: `${ringPerspective}px` }}
      >
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedRef.current) {
                    wheelAngle.set(-angle);
                  }
                  setSelectedItem(item);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className={`${styles.ringTitle} ${hoveredIndex === i ? styles.active : ""}`}>
                  {item.title}
                </div>
                <img
                  src={getThumb(item)}
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
