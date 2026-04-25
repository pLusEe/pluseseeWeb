"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./CommercialDesign.module.css";

const isVideoUrl = (url) => /\.(mp4|webm|mov|m4v|ogg)$/i.test(String(url || "").trim());
const isAudioUrl = (url) => /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(String(url || "").trim());
const toMediaSrc = (url) => encodeURI(String(url || "").trim());

const WECHAT_CSC_MEDIA = Array.from(
  { length: 14 },
  (_, index) => `/media/images/commercial-design/wechat-csc/客服中心${index + 1}.png`
);

const COMMERCIAL_PROJECTS = [
  {
    id: "wechat-cmsc",
    navLabel: "WeChat CMSC",
    date: "2024.01",
    title: "WeChat CMSC",
    paragraphs: [
      "该项目聚焦微信客服场景下的信息组织与视觉一致性，包含多种页面状态、操作路径与组件化表达。",
      "设计策略强调高可读性和快速识别，在复杂业务流中维持统一的品牌节奏与交互直觉。"
    ],
    media: WECHAT_CSC_MEDIA
  },
  {
    id: "horse-poster-260423",
    navLabel: "马年海报260423",
    date: "2024.02",
    title: "马年海报 260423",
    paragraphs: [
      "该项目为单张纵向长图海报，聚焦节庆语境下的品牌视觉表达与内容层级设计。",
      "我们通过大尺度构图与细节密度控制，让主视觉在不同屏幕尺寸下仍具备清晰的传播强度。"
    ],
    media: ["/media/images/commercial-design/马年海报260423.png"]
  },
  {
    id: "wechat-ai-ip-motion",
    navLabel: "微信经营助手IP",
    date: "2024.03",
    title: "微信经营助手智能体验创新与IP动效设计",
    paragraphs: [
      "该项目围绕产品体验创新与 IP 形象延展展开，兼顾功能性界面与叙事化动效语言。",
      "设计重点在于建立可复用的视觉规范，让角色表达、交互反馈与品牌语气形成同一套系统。"
    ],
    media: ["/media/images/commercial-design/微信经营助手智能体验创新与IP动效设计.png"]
  },
  {
    id: "feishu-pte",
    navLabel: "Feishu PTE",
    date: "2024.04",
    title: "Feishu PTE",
    paragraphs: [
      "该项目展示飞书相关视觉资产在不同传播触点中的应用，包括展示页面、关键信息图与投放物料。",
      "通过统一结构与模块化样式，保障高频更新场景下的输出效率与视觉稳定性。"
    ],
    media: [
      "/media/images/commercial-design/feishu-pt1/36.png",
      "/media/images/commercial-design/feishu-pt1/Frame 1321318981.png",
      "/media/images/commercial-design/feishu-pt1/for ppt.png",
      "/media/images/commercial-design/feishu-pt1/Frame 2036083845.png",
      "/media/images/commercial-design/feishu-pt1/1774436908953-___bn_3x.png",
      "/media/images/commercial-design/feishu-pt1/d5c024f6f45a65318b9d68d0f3a486b8 1.png"
    ]
  },
  {
    id: "feishu-pte2",
    navLabel: "Feishu PTE2",
    date: "2024.05",
    title: "Feishu PTE2",
    paragraphs: [
      "该项目是飞书体系的延展章节，强调更高密度画面中的信息聚焦与叙事连续性。",
      "通过同一视觉骨架下的多组素材组织，建立从单页到序列化展示的一致阅读体验。"
    ],
    media: [
      "/media/images/commercial-design/feishu-pt2/Frame 2036083849.png",
      "/media/images/commercial-design/feishu-pt2/Frame 2036083855.png",
      "/media/images/commercial-design/feishu-pt2/Frame 2036083856.png"
    ]
  }
];

export default function CommercialDesignPage() {
  const [activeProjectId, setActiveProjectId] = useState(COMMERCIAL_PROJECTS[0].id);
  const [spineLeftPx, setSpineLeftPx] = useState(null);
  const sectionRefMap = useRef(new Map());
  const videoRefMap = useRef(new Map());
  const leftPanelRef = useRef(null);
  const rightColumnRef = useRef(null);

  const projects = useMemo(() => COMMERCIAL_PROJECTS, []);

  const updateSpineLeft = useCallback(() => {
    const rightRect = rightColumnRef.current?.getBoundingClientRect();
    if (!rightRect) return;
    if (!Number.isFinite(rightRect.left)) return;
    const scrollbarCompensation = Math.max(0, window.innerWidth - document.documentElement.clientWidth) / 2;
    setSpineLeftPx(rightRect.left + scrollbarCompensation);
  }, []);

  useEffect(() => {
    const headerNodes = Array.from(document.querySelectorAll(".logo-area, .nav")).filter(
      (node) => node instanceof HTMLElement
    );
    if (headerNodes.length === 0) return;

    let hidden = false;
    let lastScrollTop = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
    let frame = 0;

    const setHidden = (nextHidden) => {
      if (hidden === nextHidden) return;
      hidden = nextHidden;
      headerNodes.forEach((node) => {
        node.style.opacity = nextHidden ? "0" : "1";
        node.style.transform = nextHidden ? "translate3d(0, -40px, 0)" : "translate3d(0, 0, 0)";
        node.style.pointerEvents = nextHidden ? "none" : "auto";
      });
    };

    const applyByScrollDirection = () => {
      const scrollTop = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
      const delta = scrollTop - lastScrollTop;
      if (scrollTop <= 8) {
        setHidden(false);
      } else if (delta > 1.2) {
        setHidden(true);
      } else if (delta < -1.2) {
        setHidden(false);
      }
      lastScrollTop = scrollTop;
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(applyByScrollDirection);
    };

    headerNodes.forEach((node) => {
      node.style.transition = "transform 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.willChange = "transform, opacity";
    });
    setHidden(false);

    document.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("scroll", onScroll, true);
      headerNodes.forEach((node) => {
        node.style.opacity = "";
        node.style.transform = "";
        node.style.pointerEvents = "";
        node.style.transition = "";
        node.style.willChange = "";
      });
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const nextId = String(entry.target.getAttribute("data-project-id") || "");
          if (nextId) setActiveProjectId(nextId);
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0
      }
    );

    sectionRefMap.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;

          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {});
            }
            return;
          }

          video.pause();
          try {
            video.currentTime = 0;
          } catch {}
        });
      },
      {
        root: null,
        rootMargin: "-12% 0px -12% 0px",
        threshold: 0.35
      }
    );

    videoRefMap.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateSpineLeft);
    };
    schedule();

    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(schedule);
      if (leftPanelRef.current) observer.observe(leftPanelRef.current);
      if (rightColumnRef.current) observer.observe(rightColumnRef.current);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      if (observer) observer.disconnect();
    };
  }, [updateSpineLeft, activeProjectId]);

  const setSectionRef = useCallback((projectId, node) => {
    if (!projectId) return;
    if (node) {
      sectionRefMap.current.set(projectId, node);
    } else {
      sectionRefMap.current.delete(projectId);
    }
  }, []);

  const setVideoRef = useCallback((mediaKey, node) => {
    if (!mediaKey) return;
    if (node) {
      videoRefMap.current.set(mediaKey, node);
    } else {
      videoRefMap.current.delete(mediaKey);
    }
  }, []);

  const jumpToProject = useCallback((projectId) => {
    const target = sectionRefMap.current.get(projectId);
    if (!target) return;
    setActiveProjectId(projectId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.spineOverlayContainer} aria-hidden="true">
        <img
          src="/ui/crease-multiply2.png"
          alt=""
          className={styles.spineMultiply}
          style={spineLeftPx !== null ? { left: `${spineLeftPx}px` } : undefined}
          draggable="false"
        />
      </div>

      <div className={styles.layout}>
        <aside className={styles.navRail} aria-label="Project navigation">
          <div className={styles.navInner}>
            {projects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={`${styles.navItem} ${activeProject.id === project.id ? styles.navItemActive : ""}`}
                onClick={() => jumpToProject(project.id)}
              >
                <span className={styles.navIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.navLabel}>{project.navLabel}</span>
              </button>
            ))}
          </div>
        </aside>

        <aside ref={leftPanelRef} className={styles.leftPanel}>
          <div className={styles.leftPanelInner}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeProject.id}
                className={styles.projectMetaMotion}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -22 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className={styles.kicker}>{activeProject.date}</p>
                <h2 className={styles.projectTitle}>{activeProject.title}</h2>
                <div className={styles.projectCopy}>
                  {activeProject.paragraphs.map((paragraph, idx) => (
                    <p key={`${paragraph}-${idx}`}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>

        <main ref={rightColumnRef} className={styles.rightColumn}>
          {projects.map((project, projectIndex) => {
            const nextProject = projects[projectIndex + 1];
            const transitionId = nextProject ? `${project.id}-to-${nextProject.id}` : "";

            return (
              <Fragment key={project.id}>
                <section
                  ref={(node) => setSectionRef(project.id, node)}
                  data-project-id={project.id}
                  id={`project-${project.id}`}
                  className={styles.projectSection}
                >
                  <div className={styles.projectMediaStack}>
                    {project.media.map((url, index) => {
                      const src = toMediaSrc(url);
                      const mediaKey = `${project.id}-${index}-${src}`;
                      if (isVideoUrl(src)) {
                        return (
                          <video
                            ref={(node) => setVideoRef(mediaKey, node)}
                            key={mediaKey}
                            src={src}
                            className={styles.projectVideo}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                        );
                      }

                      if (isAudioUrl(src)) {
                        return (
                          <div key={mediaKey} className={styles.audioWrap}>
                            <audio src={src} controls className={styles.projectAudio} />
                          </div>
                        );
                      }

                      return <img key={mediaKey} src={src} alt={project.title} className={styles.projectImage} />;
                    })}

                    {project.id === "wechat-ai-ip-motion" ? (
                      <video
                        ref={(node) => setVideoRef(`${project.id}-cat-hello`, node)}
                        key={`${project.id}-cat-hello`}
                        src="/media/videos/cat-hello.mp4"
                        className={styles.projectVideo}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : null}
                  </div>
                </section>

                {nextProject ? (
                  <div
                    className={styles.projectTransition}
                    aria-hidden="true"
                  />
                ) : null}
              </Fragment>
            );
          })}
        </main>
      </div>
    </div>
  );
}
