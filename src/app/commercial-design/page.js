"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CommercialDesign.module.css";
import defaultSiteContent from "../../data/site-content.json";

const FALLBACK_IMAGE = "/media/images/placeholder1.jpg";

const getThumb = (item) => {
  if (item?.thumbUrl) return item.thumbUrl;
  if ((item?.mediaType || "image") === "image" && item?.mediaUrl) return item.mediaUrl;
  if (item?.imageUrl) return item.imageUrl;
  return FALLBACK_IMAGE;
};

const isVideoUrl = (url) => /\.(mp4|webm|mov|m4v|ogg)$/i.test(String(url || "").trim());
const isAudioUrl = (url) => /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(String(url || "").trim());

const toStyleObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const toArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);
const toStringSafe = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};
const toNumberSafe = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));
const normalizeMediaType = (value) => {
  const type = toStringSafe(value).trim().toLowerCase();
  if (type === "image" || type === "video" || type === "audio") return type;
  return "image";
};
const COMMERCIAL_TEXT_STANDARD = {
  fontFamily: "\"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
  fontSize: 22,
  lineHeight: 1.45,
  fontWeight: 500,
  color: "#111111",
  textAlign: "left",
};
const estimateCommercialTextBoxSize = (text) => {
  const source = toStringSafe(text).replace(/\r\n/g, "\n");
  const lines = source.split("\n");
  const normalizedLines = lines.length > 0 ? lines : [""];
  const longestLine = normalizedLines.reduce(
    (max, line) => Math.max(max, toStringSafe(line).length),
    1
  );
  const width = clampNumber(26 + longestLine * 1.2, 24, 78);
  const charsPerLine = Math.max(10, Math.floor((width - 8) / 1.15));
  const wrappedLines = normalizedLines.reduce((sum, line) => {
    const len = Math.max(1, toStringSafe(line).length);
    return sum + Math.max(1, Math.ceil(len / charsPerLine));
  }, 0);
  const height = clampNumber(10 + wrappedLines * 6.4, 12, 82);
  return { width, height };
};
const normalizeManualElement = (rawElement, fallbackId) => {
  const type = toStringSafe(rawElement?.type).toLowerCase() === "text" ? "text" : "media";
  const page = "both";
  const text = toStringSafe(rawElement?.text);
  const autoTextBox = estimateCommercialTextBoxSize(text);
  const width =
    type === "text"
      ? autoTextBox.width
      : clampNumber(toNumberSafe(rawElement?.width, 84), 5, 100);
  const height =
    type === "text"
      ? autoTextBox.height
      : clampNumber(toNumberSafe(rawElement?.height, 84), 5, 100);
  const x = clampNumber(toNumberSafe(rawElement?.x, 8), 0, 100 - width);
  const y = clampNumber(toNumberSafe(rawElement?.y, 8), 0, 100 - height);
  return {
    id: toStringSafe(rawElement?.id, fallbackId),
    type,
    page,
    x,
    y,
    width,
    height,
    zIndex: clampNumber(toNumberSafe(rawElement?.zIndex, type === "text" ? 10 : 6), 1, 99),
    opacity: clampNumber(toNumberSafe(rawElement?.opacity, 100), 5, 100),
    fit: "contain",
    mediaUrl: toStringSafe(rawElement?.mediaUrl),
    mediaType: normalizeMediaType(rawElement?.mediaType),
    text,
    color: COMMERCIAL_TEXT_STANDARD.color,
    fontFamily: COMMERCIAL_TEXT_STANDARD.fontFamily,
    fontSize: COMMERCIAL_TEXT_STANDARD.fontSize,
    lineHeight: COMMERCIAL_TEXT_STANDARD.lineHeight,
    fontWeight: COMMERCIAL_TEXT_STANDARD.fontWeight,
    textAlign: COMMERCIAL_TEXT_STANDARD.textAlign,
  };
};
const normalizeManualPage = (rawPage, pageIndex, projectId) => ({
  id: toStringSafe(rawPage?.id, `page-${pageIndex + 1}`),
  label: toStringSafe(rawPage?.label, `页面 ${pageIndex + 1}`),
  elements: toArray(rawPage?.elements)
    .map((element, elementIndex) =>
      normalizeManualElement(
        element,
        `${projectId}-page-${pageIndex + 1}-element-${elementIndex + 1}`
      )
    )
    .filter((element) =>
      element.type === "text" ? Boolean(toStringSafe(element.text).trim()) : Boolean(toStringSafe(element.mediaUrl).trim())
    ),
});
const normalizeManualProject = (rawProject, index) => ({
  id: toStringSafe(rawProject?.id, `project-${index + 1}`),
  label: toStringSafe(rawProject?.label, `Project ${index + 1}`),
  pages:
    toArray(rawProject?.pages).length > 0
      ? toArray(rawProject?.pages).map((page, pageIndex) =>
          normalizeManualPage(page, pageIndex, toStringSafe(rawProject?.id, `project-${index + 1}`))
        )
      : [
          normalizeManualPage(
            {
              id: "page-1",
              label: "页面 1",
              elements: toArray(rawProject?.elements),
            },
            0,
            toStringSafe(rawProject?.id, `project-${index + 1}`)
          ),
        ],
});

const resolveImage = (safeItems, section, key, fallbackIndex) => {
  const urlKey = `${key}Url`;
  const indexKey = `${key}Index`;
  const rawUrl = String(section?.[urlKey] || "").trim();
  if (rawUrl) return rawUrl;

  const idx = Number.isInteger(section?.[indexKey]) ? section[indexKey] : fallbackIndex;
  return getThumb(safeItems[idx] || safeItems[fallbackIndex] || null);
};

const defaultCommercial = defaultSiteContent.commercialDesign;

export default function CommercialDesignPage() {
  const [activeSection, setActiveSection] = useState("all");
  const [items, setItems] = useState([]);
  const [commercial, setCommercial] = useState(defaultCommercial);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));

    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data?.commercialDesign && typeof data.commercialDesign === "object") {
          setCommercial({
            ...defaultCommercial,
            ...data.commercialDesign,
            sections: {
              ...defaultCommercial.sections,
              ...(data.commercialDesign.sections || {}),
            },
            manualLayouts: Array.isArray(data.commercialDesign.manualLayouts)
              ? data.commercialDesign.manualLayouts
              : Array.isArray(defaultCommercial.manualLayouts)
                ? defaultCommercial.manualLayouts
                : [],
          });
        }
      })
      .catch(() => {});
  }, []);

  const safeItems = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) return items;
    return [{ title: "Placeholder", mediaUrl: FALLBACK_IMAGE, thumbUrl: FALLBACK_IMAGE }];
  }, [items]);

  const sections = commercial?.sections || defaultCommercial.sections;
  const manualProjects = useMemo(
    () => toArray(commercial?.manualLayouts).map((project, index) => normalizeManualProject(project, index)),
    [commercial?.manualLayouts]
  );

  const navItems =
    manualProjects.length > 0
      ? manualProjects.map((project, index) => ({
          id: toStringSafe(project.id, `project-${index + 1}`),
          label: toStringSafe(project.label, `Project ${index + 1}`),
        }))
      : Array.isArray(commercial?.navItems) && commercial.navItems.length > 0
        ? commercial.navItems
        : defaultCommercial.navItems;
  const activeSectionId = navItems.some((item) => toStringSafe(item?.id) === toStringSafe(activeSection))
    ? activeSection
    : toStringSafe(navItems[0]?.id, "all");
  const activeNavId =
    navItems.find((item) => toStringSafe(item?.id) === toStringSafe(activeSectionId))?.id ||
    navItems.find((item) => toStringSafe(activeSectionId).startsWith(`${toStringSafe(item?.id)}--page-`))?.id ||
    toStringSafe(navItems[0]?.id, "all");
  const manualRenderedPages = manualProjects.flatMap((project, projectIndex) => {
    const projectId = toStringSafe(project.id, `project-${projectIndex + 1}`);
    const pages = toArray(project.pages);
    return pages.map((page, pageIndex) => ({
      projectId,
      pageId: toStringSafe(page.id, `page-${pageIndex + 1}`),
      anchorId: pageIndex === 0 ? projectId : `${projectId}--page-${pageIndex + 1}`,
      elements: toArray(page.elements),
    }));
  });

  const allHero = resolveImage(safeItems, sections.all, "rightImage", 0);
  const allNavTitle =
    navItems.find((item) => String(item?.id || "").trim() === "all")?.label || "Project 1";
  const allTitle = String(sections?.all?.title || allNavTitle);
  const allBody = String(sections?.all?.body || "");
  const sitesLeft = resolveImage(safeItems, sections.sitesInUse, "leftImage", 1);
  const sitesRight = resolveImage(safeItems, sections.sitesInUse, "rightImage", 2);
  const graphicRight = resolveImage(safeItems, sections.graphicDesign, "rightImage", 3);
  const styleLeft = resolveImage(safeItems, sections.style, "leftImage", 4);
  const acrossImage = resolveImage(safeItems, sections.acrossSpread, "image", 5);
  const archRight = resolveImage(safeItems, sections.archDesign, "rightImage", 0);
  const artLeft = resolveImage(safeItems, sections.art, "leftImage", 1);
  const artRight = resolveImage(safeItems, sections.art, "rightImage", 2);
  const photoLeft = resolveImage(safeItems, sections.photo, "leftImage", 3);
  const shopsRight = resolveImage(safeItems, sections.shops, "rightImage", 4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    const spreads = document.querySelectorAll(`.${styles.spread}`);
    spreads.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const renderMedia = (url, alt, className, style) => {
    if (isVideoUrl(url)) {
      return (
        <video
          src={url}
          className={className}
          style={style}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      );
    }
    return <img src={url} alt={alt} className={className} style={style} />;
  };

  const renderManualElement = (projectId, element, index) => {
    const style = {
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      zIndex: element.zIndex,
      opacity: element.opacity / 100,
    };

    if (element.type === "text") {
      return (
        <div
          key={`manual-text-${projectId}-${element.id}-${index}`}
          className={styles.manualElement}
          style={style}
        >
          <div
            className={styles.manualText}
            style={{
              color: element.color,
              fontFamily: element.fontFamily,
              fontSize: `${element.fontSize / 16}rem`,
              lineHeight: element.lineHeight,
              fontWeight: element.fontWeight,
              textAlign: element.textAlign,
            }}
          >
            {toStringSafe(element.text)}
          </div>
        </div>
      );
    }

    if (element.mediaType === "video" || isVideoUrl(element.mediaUrl)) {
      return (
        <div key={`manual-video-${projectId}-${element.id}-${index}`} className={styles.manualElement} style={style}>
          <video
            src={element.mediaUrl}
            className={styles.manualMedia}
            style={{ objectFit: "contain" }}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      );
    }

    if (element.mediaType === "audio" || isAudioUrl(element.mediaUrl)) {
      return (
        <div key={`manual-audio-${projectId}-${element.id}-${index}`} className={styles.manualElement} style={style}>
          <div className={styles.manualAudioWrap}>
            <audio src={element.mediaUrl} controls className={styles.manualAudio} />
          </div>
        </div>
      );
    }

    return (
      <div key={`manual-image-${projectId}-${element.id}-${index}`} className={styles.manualElement} style={style}>
        <img
          src={toStringSafe(element.mediaUrl) || FALLBACK_IMAGE}
          alt={toStringSafe(element.text, "Commercial media")}
          className={styles.manualMedia}
          style={{ objectFit: "contain" }}
        />
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bookContainer}>
        <div className={styles.spineOverlayContainer} aria-hidden="true">
          <img
            src={commercial?.spineImageUrl || defaultCommercial.spineImageUrl}
            alt=""
            className={styles.spineMultiply}
            draggable="false"
          />
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.navGroup}>
            <div className={styles.navTitle}>User Work</div>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  <a
                    href={`#${item.id}`}
                    className={`${styles.navLink} ${activeNavId === item.id ? styles.navLinkActive : ""}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            {manualProjects.length === 0 ? (
              <a href="#extra" className={styles.navExtra}>
                {sections?.extra?.linkLabel || "Extra Material"} <span>→</span>
              </a>
            ) : null}
          </div>
        </aside>

        {manualProjects.length > 0 ? (
          <>
            {manualRenderedPages.map((page, pageIndex) => (
              <section
                key={`manual-spread-${page.projectId}-${page.pageId}-${pageIndex}`}
                id={page.anchorId}
                className={`${styles.spread} ${styles.manualSpread}`}
              >
                <div className={styles.manualCanvas}>
                  <div className={styles.manualLayer}>
                    {toArray(page.elements).map((element, elementIndex) =>
                      renderManualElement(page.anchorId, element, elementIndex)
                    )}
                  </div>
                </div>
              </section>
            ))}
          </>
        ) : (
          <>
        <section id="all" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter}`}>
            <div className={`${styles.textBlock} ${styles.projectIntroBlock}`}>
              <h2 className={styles.textTitle}>{allTitle}</h2>
              {allBody ? <p className={styles.textBody}>{allBody}</p> : null}
            </div>
          </div>
          <div className={`${styles.rightPage} ${styles.flexCenter} ${styles.flushLeft}`}>
            {renderMedia(
              allHero,
              allTitle,
              styles.containedImg,
              toStyleObject(sections?.all?.rightImageStyle)
            )}
          </div>
        </section>

        <section id="sites-in-use" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter} ${styles.flushRight}`}>
            {renderMedia(
              sitesLeft,
              "Project 2 Left",
              styles.containedImg,
              toStyleObject(sections?.sitesInUse?.leftImageStyle)
            )}
          </div>
          <div className={`${styles.rightPage} ${styles.flexCenter} ${styles.flushLeft}`}>
            {renderMedia(
              sitesRight,
              "Project 2 Right",
              styles.containedImg,
              toStyleObject(sections?.sitesInUse?.rightImageStyle)
            )}
          </div>
        </section>

        <section id="graphic-design" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter}`}>
            <div className={styles.textBlock}>
              <h2 className={styles.textTitle}>{sections?.graphicDesign?.title || "Graphic & Print"}</h2>
              <p className={styles.textBody}>{sections?.graphicDesign?.body1 || ""}</p>
              {sections?.graphicDesign?.body2 ? <p className={styles.textBody}>{sections.graphicDesign.body2}</p> : null}
              {sections?.graphicDesign?.credit ? (
                <div className={styles.creditBottom}>{sections.graphicDesign.credit}</div>
              ) : null}
            </div>
          </div>
          <div className={`${styles.rightPage} ${styles.fullBleed}`}>
            {renderMedia(
              graphicRight,
              "Project 4",
              styles.fullBleedImg,
              toStyleObject(sections?.graphicDesign?.rightImageStyle)
            )}
          </div>
        </section>

        <section id="style" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.fullBleed} ${styles.flushRight}`}>
            {renderMedia(
              styleLeft,
              "Project 5",
              styles.fullBleedImg,
              toStyleObject(sections?.style?.leftImageStyle)
            )}
            {sections?.style?.overlayText ? (
              <div style={{ position: "absolute", ...toStyleObject(sections?.style?.overlayStyle) }}>
                {String(sections.style.overlayText)
                  .split("\n")
                  .map((line, idx) => (
                    <div key={`${line}-${idx}`}>{line}</div>
                  ))}
              </div>
            ) : null}
          </div>
          <div className={styles.rightPage}></div>
        </section>

        <section id="across-spread" className={`${styles.spread} ${styles.acrossSpread}`}>
          {renderMedia(
            acrossImage,
            "Across spread project",
            styles.acrossSpreadImg,
            toStyleObject(sections?.acrossSpread?.imageStyle)
          )}
          <div className={styles.leftPage}></div>
          <div className={styles.rightPage}></div>
        </section>

        <section id="arch-design" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter}`}>
            <div className={styles.textBlock}>
              <h2 className={styles.textTitle}>{sections?.archDesign?.title || "Architecture & Space"}</h2>
              <p className={styles.textBody}>{sections?.archDesign?.body || ""}</p>
            </div>
          </div>
          <div className={`${styles.rightPage} ${styles.flexCenter} ${styles.flushLeft}`}>
            {renderMedia(
              archRight,
              "Project Arch",
              styles.containedImg,
              toStyleObject(sections?.archDesign?.rightImageStyle)
            )}
          </div>
        </section>

        <section id="art" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter} ${styles.flushRight}`}>
            {renderMedia(
              artLeft,
              "Project Art",
              `${styles.containedImg} ${styles.shadowedImg}`,
              toStyleObject(sections?.art?.leftImageStyle)
            )}
          </div>
          <div className={`${styles.rightPage} ${styles.flexCenter} ${styles.flushLeft}`}>
            {renderMedia(
              artRight,
              "Project Art Right",
              `${styles.containedImg} ${styles.shadowedImg}`,
              toStyleObject(sections?.art?.rightImageStyle)
            )}
          </div>
        </section>

        <section id="photo" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter} ${styles.flushRight}`}>
            {renderMedia(
              photoLeft,
              "Project Photo",
              styles.containedImg,
              toStyleObject(sections?.photo?.leftImageStyle)
            )}
          </div>
          <div className={styles.rightPage}></div>
        </section>

        <section id="shops" className={styles.spread}>
          <div className={styles.leftPage}></div>
          <div className={`${styles.rightPage} ${styles.flexCenter} ${styles.flushLeft}`}>
            {renderMedia(
              shopsRight,
              "Project Shop",
              `${styles.containedImg} ${styles.shadowedImg}`,
              toStyleObject(sections?.shops?.rightImageStyle)
            )}
            {sections?.shops?.caption ? <div className={styles.caption}>{sections.shops.caption}</div> : null}
          </div>
        </section>

        <section id="extra" className={styles.spread}>
          <div className={`${styles.leftPage} ${styles.flexCenter}`}>
            <div className={styles.textBlock}>
              <h2 className={styles.textTitle}>{sections?.extra?.title || "Extra Material"}</h2>
              <p className={styles.textBody}>{sections?.extra?.body || ""}</p>
            </div>
          </div>
          <div className={`${styles.rightPage} ${styles.flexCenter}`}></div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}
