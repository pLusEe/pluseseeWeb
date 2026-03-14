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

  const handleClick = useCallback(
    (event) => {
      const page = pageRef.current;
      if (!page) return;
      const rect = page.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const isRight = clickX > rect.width / 2;
      turnPage(isRight ? 1 : -1);
    },
    [turnPage]
  );

  return (
    <div ref={pageRef} className={styles.bookPage} onClick={handleClick}>
      <div className={styles.gridBg} />

      <div className={styles.bookSpread}>
        <aside className={styles.leftPage}>
          <div className={styles.sidebarInner}>
            <a className={styles.sidebarLogo} href="/">
              PLUSESEE
            </a>

            <div className={styles.sidebarNav}>
              <div className={styles.sidebarLabel}>Work</div>
              <a className={styles.sidebarLink} href="/">
                Home
              </a>
              <a className={styles.sidebarLink} href="/personal-design">
                Personal Design
              </a>
            </div>

            <div className={styles.sidebarIndex}>
              <div className={styles.indexLabel}>Index</div>
              <button className={`${styles.indexItem} ${styles.indexActive}`} type="button">
                01
              </button>
              <button className={styles.indexItem} type="button">
                02
              </button>
            </div>
          </div>
        </aside>

        <div className={styles.spine}>
          <div className={styles.spineImage} />
        </div>

        <div className={styles.pagesStage}>
          <section className={styles.rightPage}>
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

          <section className={styles.rightLeaf}>
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
