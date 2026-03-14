"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./PersonalDesign.module.css";

function getThumb(item) {
  if (item.thumbUrl) return item.thumbUrl;
  if ((item.mediaType || "image") === "image" && item.mediaUrl) return item.mediaUrl;
  if (item.imageUrl) return item.imageUrl;
  return "/placeholder1.jpg";
}

export default function PersonalDesignPage() {
  const [items, setItems] = useState([]);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) =>
        setItems(data.filter((i) => (i.category || "").toLowerCase() === "personal design"))
      )
      .catch(console.error);
  }, []);

  const sections = items.length ? Math.ceil(items.length / 6) : 1;
  const sectionItems = (n) => items.slice(n * 6, (n + 1) * 6);

  return (
    <div className={styles.bookPage}>
      {/* Dotted grid background - technical canvas */}
      <div className={styles.gridBg} aria-hidden />

      {/* Book spread container */}
      <div className={styles.bookSpread}>
        {/* Left page - fixed functional sidebar */}
        <aside className={styles.leftPage}>
          <div className={styles.sidebarInner}>
            <Link href="/" className={styles.sidebarLogo}>plusesee.me</Link>
            <nav className={styles.sidebarNav}>
              <span className={styles.sidebarLabel}>Personal Design</span>
              <Link href="/" className={styles.sidebarLink}>← Home</Link>
              <Link href="/admin" className={styles.sidebarLink}>Admin</Link>
            </nav>
            <div className={styles.sidebarIndex}>
              <span className={styles.indexLabel}>Index</span>
              {Array.from({ length: sections }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.indexItem} ${activeSection === i ? styles.indexActive : ""}`}
                  onClick={() => setActiveSection(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Book spine - crease image */}
        <div className={styles.spine} aria-hidden>
          <div className={styles.spineImage} />
        </div>

        {/* Right page - floating white paper */}
        <article className={styles.rightPage}>
          {/* Running heads */}
          <header className={styles.runningHead}>
            <span className={styles.folioLeft}>Vol. 01</span>
            <span className={styles.folioRight}>Index</span>
          </header>

          <div className={styles.paperContent}>
            {/* Section slides - page-turn feel */}
            {Array.from({ length: sections }, (_, i) => (
              <section
                key={i}
                className={`${styles.paperSection} ${activeSection === i ? styles.paperActive : ""}`}
              >
                <div className={styles.galleryGrid}>
                  {sectionItems(i).map((item) => (
                    <figure key={item.id} className={styles.galleryItem}>
                      <div className={styles.galleryImage}>
                        <img src={getThumb(item)} alt={item.title} />
                      </div>
                      <figcaption className={styles.galleryCaption}>
                        <strong>{item.title}</strong>
                        {item.description && (
                          <span className={styles.galleryDesc}>{item.description}</span>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Page folio - bottom corners */}
          <footer className={styles.pageFolio}>
            <span className={styles.folioNum}>{activeSection + 1} / {sections}</span>
          </footer>
        </article>
      </div>
    </div>
  );
}
