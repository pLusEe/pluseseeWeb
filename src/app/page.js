"use client";

import { useMemo, useState, useEffect } from "react";
import RingCarousel from "../components/RingCarousel";
import AIChatSection from "../components/AIChatSection";
import defaultSiteContent from "../data/site-content.json";

export default function Home() {
  const [items, setItems] = useState([]);
  const [content, setContent] = useState(defaultSiteContent);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setContent(data);
        }
      })
      .catch(() => {});
  }, []);

  const ringItems = useMemo(() => {
    const filter = String(content?.home?.ring?.categoryFilter || "").trim().toLowerCase();
    if (!filter) return items;
    return items.filter((item) => String(item?.category || "").toLowerCase() === filter);
  }, [content?.home?.ring?.categoryFilter, items]);

  const aiInputPlaceholder =
    content?.home?.ai?.inputPlaceholder || defaultSiteContent.home.ai.inputPlaceholder;

  const scrollToChat = () => {
    const chatElement = document.getElementById("ai-chat");
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="snap-container" style={{ position: "relative", zIndex: 1 }}>
      <section id="ring" className="snap-section">
        {ringItems.length > 0 ? (
          <RingCarousel items={ringItems} />
        ) : (
          <div
            style={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              color: "#999",
            }}
          >
            正在加载作品...
          </div>
        )}

        <div className="scroll-arrow" onClick={scrollToChat}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M12 19L19 12M12 19L5 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <section id="ai-chat" className="snap-section">
        <AIChatSection inputPlaceholder={aiInputPlaceholder} />
      </section>
    </div>
  );
}
