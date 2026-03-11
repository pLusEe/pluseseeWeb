"use client";

import { useState, useEffect } from "react";
import RingCarousel from "../components/RingCarousel";
import AIChatSection from "../components/AIChatSection";

export default function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(console.error);
  }, []);

  const scrollToChat = () => {
    const chatElement = document.getElementById("ai-chat");
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Immersive Animated Glitch Background */}
      <img 
        src="/ok.png"
        alt="Background"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0, // Set to 0 to sit above the root body background
          opacity: 0.05, // 5% opacity
          filter: "brightness(1.2) contrast(0.9)", // Softly brightened by 1.2x
          pointerEvents: "none"
        }}
      />
      <div className="snap-container" style={{ position: "relative", zIndex: 1 }}>

      {/* Section 1: 3D Ring Carousel */}
      <section id="ring" className="snap-section">
        {items.length > 0 ? (
          <RingCarousel items={items} />
        ) : (
          <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "#999" }}>
            正在加载作品...
          </div>
        )}

        {/* Scroll Down Arrow */}
        <div className="scroll-arrow" onClick={scrollToChat}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* Section 2: AI Chat — scrolled into view */}
      <section id="ai-chat" className="snap-section">
        <AIChatSection />
      </section>
    </div>
    </>
  );
}
