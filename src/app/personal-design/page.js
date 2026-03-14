"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./PersonalDesign.module.css";
import portfolio from "../../data/portfolio.json";

const getThumb = (item) => {
  if (item?.thumbUrl) return item.thumbUrl;
  if ((item?.mediaType || "image") === "image" && item?.mediaUrl) return item.mediaUrl;
  if (item?.imageUrl) return item.imageUrl;
  return "/placeholder1.jpg";
};

export default function PersonalDesignPage() {
  const items = Array.isArray(portfolio) ? portfolio : [];
  const personalItems = useMemo(
    () => items.filter((item) => item.category === "personal design"),
    [items]
  );
  const pageItems = personalItems.length > 0 ? personalItems : items;
  const safeItems = pageItems.length > 0 ? pageItems : [{ id: "placeholder" }];
  const total = safeItems.length;

  const projects = useMemo(() => {
    const groups = [];
    const indexByName = new Map();

    const normalizeTitle = (title) =>
      String(title || "Untitled")
        .replace(/\s+[IVXLCDM]+$/i, "")
        .replace(/\s+\d+$/, "")
        .trim();

    safeItems.forEach((item, idx) => {
      const name = normalizeTitle(item.title);
      if (!indexByName.has(name)) {
        indexByName.set(name, groups.length);
        groups.push({ name, start: idx + 1, end: idx + 1 });
      } else {
        const g = groups[indexByName.get(name)];
        g.end = idx + 1;
      }
    });

    return groups;
  }, [safeItems]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const wheelLock = useRef(false);
  const pageRef = useRef(null);

  const leftItem = safeItems[currentIndex % total];
  const rightItem = safeItems[(currentIndex + 1) % total];
  const leftPageNum = ((currentIndex % total) + total) % total + 1;
  const rightPageNum = ((currentIndex + 1) % total) + 1;

  const turnPage = useCallback(
    (direction) => {
      if (wheelLock.current || total <= 1) return;
      const step = 2;
      const next =
        direction > 0
          ? (currentIndex + step) % total
          : (currentIndex - step + total) % total;
      wheelLock.current = true;
      setCurrentIndex(next);
      setTimeout(() => {
        wheelLock.current = false;
      }, 250);
    },
    [currentIndex, total]
  );

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const handleWheel = (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      turnPage(direction);
    };

    page.addEventListener("wheel", handleWheel, { passive: false });
    return () => page.removeEventListener("wheel", handleWheel);
  }, [turnPage]);

  const jumpToPage = useCallback(
    (start) => {
      if (total <= 1) return;
      const nextIndex = Math.max(0, Math.min(total - 1, start - 1));
      setCurrentIndex(nextIndex);
    },
    [total]
  );

  return (
    <div ref={pageRef} className={styles.bookPage}>
      <div className={styles.gridBg} />

      <div className={styles.bookSpread}>
        <aside className={styles.leftPage}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarTitle}>personal design</div>

            <div className={styles.projectList}>
              {projects.map((project, idx) => (
                <div key={`${project.name}-${project.start}`} className={styles.projectItem}>
                  <div className={styles.projectMeta}>
                    <span className={styles.projectLabel}>project {String(idx + 1).padStart(2, "0")}</span>
                    <span className={styles.projectName}>{project.name}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.projectRange}
                    onClick={() => jumpToPage(project.start)}
                  >
                    {project.start}-{project.end}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.pagesStage}>
          <section className={styles.rightPage} onClick={() => turnPage(-1)}>
            <div className={styles.pageFill}>
              <img
                src={getThumb(leftItem)}
                alt={leftItem?.title || "Personal design image"}
                className={styles.pageImage}
              />
              <span className={`${styles.pageNumber} ${styles.pageNumberLeft}`}>
                {String(leftPageNum).padStart(2, "0")}
              </span>
            </div>
          </section>

          <section className={styles.rightLeaf} onClick={() => turnPage(1)}>
            <div className={styles.pageFill}>
              <img
                src={getThumb(rightItem)}
                alt={rightItem?.title || "Personal design image"}
                className={styles.pageImage}
              />
              <span className={`${styles.pageNumber} ${styles.pageNumberRight}`}>
                {String(rightPageNum).padStart(2, "0")}
              </span>
            </div>
          </section>
        </div>

        <div className={`${styles.spine} ${styles.spineSecondary}`}>
          <div className={styles.spineImage} />
        </div>
      </div>
    </div>
  );
}
