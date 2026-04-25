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
    title: "微信支付客服中心人工客服体验改版",
    paragraphs: [
      "这里放置项目一的占位说明文字，用来模拟后续正式项目介绍的篇幅与阅读密度。你可以在这里补充项目背景、问题定义、体验目标、设计范围、核心页面以及改版前后的变化，让左侧信息区在视觉上形成更完整的段落长度与呼吸节奏。",
      "这里继续放置第二段占位说明文字，用来模拟更详细的项目叙述内容。后续可以替换成设计方法、关键策略、交互亮点、品牌语气、测试结论与落地结果等信息，让整段文案在页面中拥有更接近最终作品集展示的体量。"
    ],
    media: WECHAT_CSC_MEDIA
  },
  {
    id: "horse-poster-260423",
    navLabel: "马年海报260423",
    date: "2024.02",
    title: "微信支付马年春节商户年历海报设计",
    paragraphs: [
      "这里放置项目二的占位说明文字，用来模拟节庆海报项目在作品集中的完整文案长度。后续你可以写入海报的创意来源、文化意象、视觉风格、节日氛围、商户沟通目标以及画面层级安排，让读者更容易理解整张长图背后的设计逻辑。",
      "这里继续放置第二段占位说明文字，用来模拟更深入的设计解释与展示说明。你可以在后续替换为构图策略、色彩设定、字体处理、延展场景、传播应用与最终呈现效果，让页面在阅读上更接近最终定稿时的完整状态。"
    ],
    media: ["/media/images/commercial-design/马年海报260423.png"]
  },
  {
    id: "wechat-ai-ip-motion",
    navLabel: "微信经营助手IP",
    date: "2024.03",
    title: "微信经营助手智能体验探索与IP动效设计",
    paragraphs: [
      "这里放置项目三的占位说明文字，用来模拟智能体验探索与 IP 动效项目的完整项目介绍。后续你可以补入项目起点、角色设定、体验假设、交互路径、情绪目标、动效语言与系统化思考，让整段文字既能解释方法，也能呼应右侧的视觉素材与视频内容。",
      "这里继续放置第二段占位说明文字，用来模拟更长篇幅的作品叙述内容。之后可以替换成设计验证过程、界面节奏、品牌角色延展、触点适配、细节打磨与设计总结，让这个项目在作品集里形成更有层次、更完整的阅读体验。"
    ],
    media: ["/media/images/commercial-design/微信经营助手智能体验创新与IP动效设计.png"]
  },
  {
    id: "feishu-pte",
    navLabel: "Feishu PTE",
    date: "2024.04",
    title: "飞书ToB品牌传播与获客视觉设计",
    paragraphs: [
      "这里放置项目四的占位说明文字，用来模拟 ToB 品牌传播与获客视觉项目在作品集中的介绍长度。后续你可以写入目标用户、传播语境、转化场景、视觉模块、信息组织与商业传播目标，让整段说明既能服务品牌表达，也能支撑业务导向的阅读理解。",
      "这里继续放置第二段占位说明文字，用来模拟更多关于设计系统与传播执行的描述内容。之后可以补充不同渠道适配、模块复用方式、投放节奏、品牌一致性与最终效果反馈，让页面中的文案体量和右侧图片数量更加匹配。"
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
    title: "飞书2024未来无限大会全链路视觉设计",
    paragraphs: [
      "这里放置项目五的占位说明文字，用来模拟大会全链路视觉设计项目所需要的完整介绍篇幅。后续你可以加入大会主题、阶段节奏、主视觉系统、会前会中会后物料、空间导视、线上线下触点以及叙事结构，让项目更完整地呈现其系统性与规模感。",
      "这里继续放置第二段占位说明文字，用来模拟更深入的活动视觉设计说明。之后可以替换成视觉延展逻辑、信息密度控制、关键节点物料、执行协作方式与设计复盘内容，让最终页面拥有更饱满、更专业的作品集阅读节奏。"
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
                      <>
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
                        <video
                          ref={(node) => setVideoRef(`${project.id}-payment-cat`, node)}
                          key={`${project.id}-payment-cat`}
                          src="/media/videos/客服支付猫动态.mp4"
                          className={styles.projectVideo}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      </>
                    ) : null}

                    {project.id === "wechat-cmsc" ? (
                      <video
                        ref={(node) => setVideoRef(`${project.id}-service-rating`, node)}
                        key={`${project.id}-service-rating`}
                        src="/media/videos/客服中心人工客服评价.mp4"
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
