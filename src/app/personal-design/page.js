"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./PersonalDesignLibrary.module.css";
import portfolio from "../../data/portfolio.json";

const getThumb = (item) => {
  if (item?.thumbUrl) return item.thumbUrl;
  if ((item?.mediaType || "image") === "image" && item?.mediaUrl) return item.mediaUrl;
  if (item?.imageUrl) return item.imageUrl;
  return "/placeholder1.jpg";
};

const hoverImages = [
  { src: "/portfolio1.jpg", rotate: 90, width: 1279, height: 1865 },
  { src: "/portfolio2.jpg", rotate: 0, width: 1279, height: 1993 },
  { src: "/portfolio3.jpg", rotate: 270, width: 1279, height: 1706 },
  { src: "/portfolio4.jpg", rotate: 0, width: 1279, height: 1706 },
];

export default function PersonalDesignLibraryPage() {
  const [previewPinned, setPreviewPinned] = useState(false);

  const items = Array.isArray(portfolio) ? portfolio : [];
  const personalItems = items.filter((item) => item.category === "personal design");
  const coverImage = getThumb(personalItems[0] || items[0]);

  const book = {
    title: "PERSONAL DESIGN ARCHIVE",
    type: "PERSONAL PORTFOLIO",
    size: "DIGITAL ARCHIVE",
    year: "2019-2024",
    href: "/personal-design/2019-2024",
    cover: coverImage,
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.books}>
          <article className={`${styles.book} ${styles.bookWithPreview}`}>
            <div
              className={`${styles.coverStage} ${previewPinned ? styles.previewPinned : ""}`}
              onMouseEnter={() => setPreviewPinned(true)}
              onFocusCapture={() => setPreviewPinned(true)}
            >
              <Link href={book.href} className={`${styles.coverLink} ${styles.coverTrigger}`}>
                <div className={styles.coverWrap}>
                  <img src={book.cover} alt={`${book.title} cover`} className={styles.coverImage} />
                </div>
              </Link>

              <div className={styles.previewRail}>
                {hoverImages.map((item, idx) => {
                  const ratio = item.width / item.height;
                  const rotated = item.rotate === 90 || item.rotate === 270;

                  return (
                    <div
                      key={item.src}
                      className={`${styles.previewItem} ${rotated ? styles.previewItemRotated : ""}`}
                      style={{ "--img-ratio": `${ratio}` }}
                    >
                      <img
                        src={item.src}
                        alt={`portfolio preview ${idx + 1}`}
                        className={`${styles.previewImage} ${
                          item.rotate === 90
                            ? styles.previewImageRotate90
                            : item.rotate === 270
                              ? styles.previewImageRotate270
                              : ""
                        }`}
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <section className={styles.info}>
              <div className={styles.metaRow}>
                <span>[TYPE]</span>
                <span>{book.type}</span>
              </div>
              <div className={styles.metaRow}>
                <span>[SIZE]</span>
                <span>{book.size}</span>
              </div>
              <div className={styles.metaRow}>
                <span>[YEAR]</span>
                <span>{book.year}</span>
              </div>

              <Link href={book.href} className={styles.openBtn}>
                OPEN PORTFOLIO
              </Link>
            </section>
          </article>
        </section>

        <p className={styles.rightNote} aria-hidden="true">
          <span>welcome to the</span>
          <span>archive</span>
        </p>

        <p className={styles.leftCopyright} aria-hidden="true">
          &copy; 2026 plusesee.me
        </p>
      </main>
    </div>
  );
}
