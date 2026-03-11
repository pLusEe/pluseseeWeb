"use client";

import { useEffect, useState } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start off-screen
  const [hoverData, setHoverData] = useState({ active: false, text: "" });
  const [isVisible, setIsVisible] = useState(false); // Only show after move

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest("[data-hover-text]");
      if (target) {
        setHoverData({
          active: true,
          text: target.getAttribute("data-hover-text"),
        });
      } else {
        setHoverData({ active: false, text: "" });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div
      className={`${styles.cursor} ${hoverData.active ? styles.active : ""} ${isVisible ? styles.visible : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {hoverData.active && <span className={styles.text}>{hoverData.text}</span>}
    </div>
  );
}
