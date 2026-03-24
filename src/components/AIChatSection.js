"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIChatSection.module.css";

const BOT_AVATAR = "P";
const DEFAULT_HERO_VIDEO_URL = "/media/videos/logo.webm";
const DEFAULT_INPUT_PLACEHOLDER = "可以问我简历、作品、服务范围、合作方式等问题";

export default function AIChatSection({
  heroVideoUrl = DEFAULT_HERO_VIDEO_URL,
  inputPlaceholder = DEFAULT_INPUT_PLACEHOLDER,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingIndex, setTypingIndex] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (!lastMsg || lastMsg.role !== "bot") return;
    if (lastMsg.displayText === lastMsg.text) return;

    let charIdx = lastMsg.displayText?.length || 0;
    setTypingIndex(lastIdx);

    if (typingRef.current) clearInterval(typingRef.current);

    typingRef.current = setInterval(() => {
      charIdx++;
      setMessages((prev) =>
        prev.map((m, i) => (i === lastIdx ? { ...m, displayText: m.text.slice(0, charIdx) } : m))
      );
      if (charIdx >= lastMsg.text.length) {
        clearInterval(typingRef.current);
        setTypingIndex(null);
      }
    }, 18);

    return () => clearInterval(typingRef.current);
  }, [messages.length]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.content || "（无回复）", displayText: "" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "抱歉，出现了网络错误。", displayText: "" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isChatStarted = messages.length > 0;

  return (
    <div className={`${styles.section} ${isChatStarted ? styles.chatActive : styles.chatEmpty}`}>
      <div className={styles.chatContainer}>
        {!isChatStarted ? (
          <div className={styles.heroCenter}>
            <video src={heroVideoUrl} autoPlay loop muted playsInline className={styles.heroLogo} />
          </div>
        ) : (
          <div className={styles.messagesArea}>
            <div className={styles.messagesList}>
              {messages.map((msg, i) => (
                <div key={i} className={`${styles.messageRow} ${msg.role === "user" ? styles.userRow : styles.botRow}`}>
                  {msg.role === "bot" && <div className={styles.avatar}>{BOT_AVATAR}</div>}
                  <div className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.botBubble}`}>
                    {msg.role === "bot" ? (msg.displayText ?? msg.text) : msg.text}
                    {msg.role === "bot" && typingIndex === i && msg.displayText !== msg.text && (
                      <span style={{ opacity: 0.5, animation: "blink 1s step-end infinite" }}>|</span>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className={`${styles.messageRow} ${styles.botRow}`}>
                  <div className={styles.avatar}>{BOT_AVATAR}</div>
                  <div className={`${styles.bubble} ${styles.botBubble} ${styles.loadingBubble}`}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} className={styles.bottomSpacer} />
            </div>
          </div>
        )}

        <div className={styles.inputArea}>
          <div className={styles.inputBox}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              rows={1}
            />
            <button
              className={`${styles.sendBtn} ${input.trim() && !loading ? styles.sendActive : ""}`}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
