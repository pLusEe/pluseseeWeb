"use client";

import { useEffect, useState } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start off-screen
  const [hoverData, setHoverData] = useState({ active: false, text: "" });
  const [isClickable, setIsClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Only show after move

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const hoverTextTarget = target?.closest?.("[data-hover-text]");
      if (hoverTextTarget) {
        setHoverData({
          active: true,
          text: hoverTextTarget.getAttribute("data-hover-text"),
        });
        setIsClickable(false);
      } else {
        setHoverData({ active: false, text: "" });
        const clickableTarget = target?.closest?.("a, button, [role='button'], [data-cursor-clickable='true']");
        setIsClickable(!!clickableTarget);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`${styles.cursor} ${hoverData.active ? styles.active : ""} ${
        isClickable && !hoverData.active ? styles.clickable : ""
      } ${isVisible ? styles.visible : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {hoverData.active && <span className={styles.text}>{hoverData.text}</span>}
    </div>
  );
}
