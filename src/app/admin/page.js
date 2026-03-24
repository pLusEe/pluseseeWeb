
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Admin.module.css";
import defaultSiteContent from "../../data/site-content.json";

const CATEGORY_OPTIONS = [
  "personal design",
  "commercial design",
  "soundart",
  "media art",
  "photography",
];

const CATEGORY_LABELS = {
  "personal design": "个人设计",
  "commercial design": "商业设计",
  soundart: "声音艺术",
  "media art": "媒体艺术",
  photography: "摄影",
  other: "其他",
  uncategorized: "未分类",
};

const STYLE_FIELDS = [
  "top",
  "left",
  "right",
  "bottom",
  "width",
  "height",
  "objectPosition",
  "fontSize",
  "color",
];

const STYLE_FIELD_LABELS = {
  top: "上边距 (top)",
  left: "左边距 (left)",
  right: "右边距 (right)",
  bottom: "下边距 (bottom)",
  width: "宽度 (width)",
  height: "高度 (height)",
  objectPosition: "图像位置 (objectPosition)",
  fontSize: "字号 (fontSize)",
  color: "颜色 (color)",
};

const MEDIA_TYPE_LABELS = {
  image: "图片",
  video: "视频",
  audio: "音频",
};

const BOOK_FIELD_LABELS = {
  title: "标题",
  type: "类型",
  size: "尺寸",
  year: "年份",
  href: "链接地址",
  coverUrl: "封面图片 URL",
  openLabel: "按钮文案",
};

const BIO_FIELD_LABELS = {
  photoUrl: "个人照片 URL",
  kicker: "副标题",
  title: "标题",
  lead: "简介",
};

const PAGE_SIDE_LABELS = {
  front: "左页",
  back: "右页",
};

const PAGE_FIELD_LABELS = {
  title: "标题",
  text: "正文",
  background: "背景图 URL",
  pageNum: "页码",
};

const COMMERCIAL_SCHEMA = [
  {
    key: "all",
    label: "总览",
    textFields: [],
    images: [{ label: "右页图片", indexKey: "rightImageIndex", urlKey: "rightImageUrl", styleKey: "rightImageStyle" }],
  },
  {
    key: "sitesInUse",
    label: "实际应用",
    textFields: [],
    images: [
      { label: "左页图片", indexKey: "leftImageIndex", urlKey: "leftImageUrl", styleKey: "leftImageStyle" },
      { label: "右页图片", indexKey: "rightImageIndex", urlKey: "rightImageUrl", styleKey: "rightImageStyle" },
    ],
  },
  {
    key: "graphicDesign",
    label: "平面设计",
    textFields: [
      { key: "title", label: "标题", rows: 1 },
      { key: "body1", label: "正文 1", rows: 3 },
      { key: "body2", label: "正文 2", rows: 3 },
      { key: "credit", label: "署名", rows: 1 },
    ],
    images: [{ label: "右页图片", indexKey: "rightImageIndex", urlKey: "rightImageUrl", styleKey: "rightImageStyle" }],
  },
  {
    key: "style",
    label: "风格",
    textFields: [{ key: "overlayText", label: "叠加文案", rows: 3 }],
    images: [{ label: "左页图片", indexKey: "leftImageIndex", urlKey: "leftImageUrl", styleKey: "leftImageStyle" }],
    extraStyle: { key: "overlayStyle", label: "叠加样式" },
  },
  {
    key: "acrossSpread",
    label: "跨页",
    textFields: [],
    images: [{ label: "跨页图片", indexKey: "imageIndex", urlKey: "imageUrl", styleKey: "imageStyle" }],
  },
  {
    key: "archDesign",
    label: "建筑与空间",
    textFields: [
      { key: "title", label: "标题", rows: 1 },
      { key: "body", label: "正文", rows: 3 },
    ],
    images: [{ label: "右页图片", indexKey: "rightImageIndex", urlKey: "rightImageUrl", styleKey: "rightImageStyle" }],
  },
  {
    key: "art",
    label: "艺术",
    textFields: [],
    images: [
      { label: "左页图片", indexKey: "leftImageIndex", urlKey: "leftImageUrl", styleKey: "leftImageStyle" },
      { label: "右页图片", indexKey: "rightImageIndex", urlKey: "rightImageUrl", styleKey: "rightImageStyle" },
    ],
  },
  {
    key: "photo",
    label: "摄影",
    textFields: [],
    images: [{ label: "左页图片", indexKey: "leftImageIndex", urlKey: "leftImageUrl", styleKey: "leftImageStyle" }],
  },
  {
    key: "shops",
    label: "店铺",
    textFields: [{ key: "caption", label: "说明文字", rows: 1 }],
    images: [{ label: "右页图片", indexKey: "rightImageIndex", urlKey: "rightImageUrl", styleKey: "rightImageStyle" }],
  },
  {
    key: "extra",
    label: "补充",
    textFields: [
      { key: "title", label: "标题", rows: 1 },
      { key: "body", label: "正文", rows: 3 },
      { key: "linkLabel", label: "链接文案", rows: 1 },
    ],
    images: [],
  },
];

const initialForm = {
  title: "",
  category: CATEGORY_OPTIONS[0],
  description: "",
  date: "",
  mediaType: "image",
};

const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};
const toArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);
const toStringSafe = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};
const toNumberSafe = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const getThumb = (item) => {
  if (item?.thumbUrl) return item.thumbUrl;
  if ((item?.mediaType || "image") === "image" && item?.mediaUrl) return item.mediaUrl;
  return "/media/images/placeholder1.jpg";
};
const mergeContent = (raw) => {
  const data = toObject(raw);
  const home = toObject(data.home);
  const commercial = toObject(data.commercialDesign);
  const personal = toObject(data.personalDesign);
  const library = toObject(personal.library);
  const book = toObject(personal.book2019);
  const bio = toObject(data.bio);
  const sections = toObject(commercial.sections);

  const mergedSections = COMMERCIAL_SCHEMA.reduce((acc, section) => {
    acc[section.key] = {
      ...toObject(defaultSiteContent.commercialDesign.sections?.[section.key]),
      ...toObject(sections?.[section.key]),
    };
    return acc;
  }, {});

  const rightNote = toArray(library.rightNote, defaultSiteContent.personalDesign.library.rightNote);

  return {
    ...defaultSiteContent,
    ...data,
    home: {
      ...defaultSiteContent.home,
      ...home,
      ai: {
        ...defaultSiteContent.home.ai,
        ...toObject(home.ai),
      },
      ring: {
        ...defaultSiteContent.home.ring,
        ...toObject(home.ring),
      },
    },
    commercialDesign: {
      ...defaultSiteContent.commercialDesign,
      ...commercial,
      navItems:
        toArray(commercial.navItems).length > 0
          ? toArray(commercial.navItems)
          : defaultSiteContent.commercialDesign.navItems,
      sections: mergedSections,
    },
    personalDesign: {
      ...defaultSiteContent.personalDesign,
      ...personal,
      library: {
        ...defaultSiteContent.personalDesign.library,
        ...library,
        book: {
          ...defaultSiteContent.personalDesign.library.book,
          ...toObject(library.book),
        },
        fallingImages:
          toArray(library.fallingImages).length > 0
            ? toArray(library.fallingImages)
            : defaultSiteContent.personalDesign.library.fallingImages,
        rightNote: [toStringSafe(rightNote[0]), toStringSafe(rightNote[1])],
      },
      book2019: {
        ...defaultSiteContent.personalDesign.book2019,
        ...book,
        pages: toArray(book.pages),
        projects:
          toArray(book.projects).length > 0
            ? toArray(book.projects)
            : defaultSiteContent.personalDesign.book2019.projects,
      },
    },
    bio: {
      ...defaultSiteContent.bio,
      ...bio,
      meta: toArray(bio.meta, defaultSiteContent.bio.meta),
      aboutParagraphs: toArray(bio.aboutParagraphs, defaultSiteContent.bio.aboutParagraphs),
      services: toArray(bio.services, defaultSiteContent.bio.services),
      collaborators: toArray(bio.collaborators, defaultSiteContent.bio.collaborators),
      projectExperience: toArray(bio.projectExperience, defaultSiteContent.bio.projectExperience),
      workExperience: toArray(bio.workExperience, defaultSiteContent.bio.workExperience),
    },
  };
};

const setByPath = (target, path, value) => {
  let current = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (!current[key] || typeof current[key] !== "object") current[key] = {};
    current = current[key];
  }
  current[path[path.length - 1]] = value;
};

const normalizeForSave = (config) => {
  const next = mergeContent(config);

  next.commercialDesign.navItems = toArray(next.commercialDesign.navItems)
    .map((item, idx) => ({
      id: toStringSafe(item?.id, `tab-${idx + 1}`).trim(),
      label: toStringSafe(item?.label).trim(),
    }))
    .filter((item) => item.id || item.label);

  if (next.commercialDesign.navItems.length === 0) {
    next.commercialDesign.navItems = defaultSiteContent.commercialDesign.navItems;
  }

  next.personalDesign.library.fallingImages = toArray(next.personalDesign.library.fallingImages)
    .map((item) => ({
      src: toStringSafe(item?.src).trim(),
      rotate: toNumberSafe(item?.rotate, 0),
      width: toNumberSafe(item?.width, 1279),
      height: toNumberSafe(item?.height, 1706),
    }))
    .filter((item) => item.src);

  if (next.personalDesign.library.fallingImages.length === 0) {
    next.personalDesign.library.fallingImages = defaultSiteContent.personalDesign.library.fallingImages;
  }

  next.personalDesign.book2019.projects = toArray(next.personalDesign.book2019.projects)
    .map((item, idx) => ({
      start: toNumberSafe(item?.start, idx * 2 + 1),
      end: toNumberSafe(item?.end, idx * 2 + 2),
      name: toStringSafe(item?.name).trim(),
    }))
    .filter((item) => item.name || item.start || item.end);

  next.bio.meta = toArray(next.bio.meta)
    .map((item) => ({
      label: toStringSafe(item?.label).trim(),
      value: toStringSafe(item?.value).trim(),
      href: toStringSafe(item?.href).trim(),
    }))
    .filter((item) => item.label || item.value || item.href);

  const textLists = ["aboutParagraphs", "services", "collaborators", "projectExperience", "workExperience"];
  textLists.forEach((field) => {
    next.bio[field] = toArray(next.bio[field])
      .map((item) => toStringSafe(item).trim())
      .filter(Boolean);
  });

  return next;
};
export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const [config, setConfig] = useState(() => mergeContent(defaultSiteContent));
  const [savedConfig, setSavedConfig] = useState(() => mergeContent(defaultSiteContent));
  const [contentLoading, setContentLoading] = useState(false);
  const [contentMessage, setContentMessage] = useState("");
  const [configFile, setConfigFile] = useState(null);
  const [configUploadUrl, setConfigUploadUrl] = useState("");
  const [configUploading, setConfigUploading] = useState(false);
  const [workFilter, setWorkFilter] = useState("all");
  const [workQuery, setWorkQuery] = useState("");

  const fetchItems = async () => {
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      const merged = mergeContent(data);
      setConfig(merged);
      setSavedConfig(merged);
    } catch {
      setContentMessage("内容配置加载失败，已使用本地默认值。");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchContent();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateConfigPath = (path, value) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      setByPath(next, path, value);
      return next;
    });
  };

  const updateArrayItem = (path, index, updater) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      let list = next;
      for (let i = 0; i < path.length; i += 1) list = list[path[i]];
      list[index] = updater(list[index]);
      return next;
    });
  };

  const addArrayItem = (path, item) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      let list = next;
      for (let i = 0; i < path.length; i += 1) list = list[path[i]];
      list.push(item);
      return next;
    });
  };

  const removeArrayItem = (path, index) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      let list = next;
      for (let i = 0; i < path.length; i += 1) list = list[path[i]];
      list.splice(index, 1);
      return next;
    });
  };

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetWorkForm = () => {
    setForm(initialForm);
    setMediaFile(null);
    setPreviewUrl(null);
    setEditingItem(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let mediaUrl = editingItem?.mediaUrl || "";
      let thumbUrl = editingItem?.thumbUrl || "";

      if (mediaFile) {
        const fd = new FormData();
        fd.append("file", mediaFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadData?.url) throw new Error(uploadData?.error || "上传失败");
        mediaUrl = uploadData.url;
        if (form.mediaType === "image") thumbUrl = mediaUrl;
      }

      if (!editingItem && !mediaUrl) throw new Error("请先上传媒体文件");

      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        date: form.date,
        mediaType: form.mediaType,
        mediaUrl,
        thumbUrl,
      };

      const body = editingItem ? { action: "update", id: editingItem.id, ...payload } : payload;
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "保存失败");
      }

      setMessage(editingItem ? "作品已更新" : "作品已发布");
      resetWorkForm();
      fetchItems();
    } catch (err) {
      setMessage(`操作失败：${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("确认删除这个作品吗？")) return;
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (editingItem?.id === id) resetWorkForm();
    fetchItems();
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      category: item.category || CATEGORY_OPTIONS[0],
      description: item.description || "",
      date: item.date || "",
      mediaType: item.mediaType || "image",
    });
    setMediaFile(null);
    setPreviewUrl(item.mediaUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveConfig = async () => {
    setContentLoading(true);
    setContentMessage("");
    try {
      const payload = normalizeForSave(config);
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "配置保存失败");
      }
      setConfig(payload);
      setSavedConfig(payload);
      setContentMessage("站点内容已保存");
    } catch (err) {
      setContentMessage(`配置保存失败：${err.message}`);
    } finally {
      setContentLoading(false);
    }
  };

  const uploadForConfig = async () => {
    if (!configFile) return;
    setConfigUploading(true);
    setContentMessage("");
    try {
      const fd = new FormData();
      fd.append("file", configFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data?.url) throw new Error(data?.error || "上传失败");
      setConfigUploadUrl(data.url);
      setContentMessage("素材已上传，请把 URL 粘贴到任意字段。");
    } catch (err) {
      setContentMessage(`素材上传失败：${err.message}`);
    } finally {
      setConfigUploading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const keyword = workQuery.trim().toLowerCase();
    return items.filter((item) => {
      const category = toStringSafe(item?.category).toLowerCase();
      const title = toStringSafe(item?.title).toLowerCase();
      const desc = toStringSafe(item?.description).toLowerCase();

      const categoryMatch = workFilter === "all" ? true : category === workFilter;
      const textMatch = keyword ? title.includes(keyword) || desc.includes(keyword) : true;
      return categoryMatch && textMatch;
    });
  }, [items, workFilter, workQuery]);

  const groupedItems = useMemo(
    () =>
      CATEGORY_OPTIONS.map((category) => ({
        category,
        items: filteredItems.filter((item) => item.category === category),
      })),
    [filteredItems]
  );

  const otherItems = useMemo(
    () => filteredItems.filter((item) => !CATEGORY_OPTIONS.includes(item.category)),
    [filteredItems]
  );

  const getCategoryLabel = (category) => {
    if (!category) return CATEGORY_LABELS.uncategorized;
    return CATEGORY_LABELS[category] || category;
  };

  const renderStringListEditor = (title, path, placeholder) => {
    let list = config;
    for (let i = 0; i < path.length; i += 1) list = list[path[i]];
    const itemsList = toArray(list);

    return (
      <div className={styles.configCard}>
        <h3>{title}</h3>
        <div className={styles.listEditor}>
          {itemsList.map((value, idx) => (
            <div key={`${title}-${idx}`} className={styles.rowEditor}>
              <input
                className={styles.input}
                value={toStringSafe(value)}
                placeholder={placeholder}
                onChange={(event) => updateArrayItem(path, idx, () => event.target.value)}
              />
              <button type="button" className={styles.deleteBtn} onClick={() => removeArrayItem(path, idx)}>
                {"删除"}
              </button>
            </div>
          ))}
        </div>
        <button type="button" className={styles.ghostBtn} onClick={() => addArrayItem(path, "")}>{"添加条目"}</button>
      </div>
    );
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1>
          plusesee.me / <span>{"作品与内容后台"}</span>
        </h1>
        <Link href="/" className={styles.backLink}>{"返回首页"}</Link>
      </header>

      <div className={styles.adminBody}>
        <section className={styles.listSection}>
          <div className={styles.moduleSection}>
            <h2>{"1. 作品库管理"}</h2>
            <div className={styles.workManagerGrid}>
              <div className={styles.configCard}>
                <h3>{editingItem ? "编辑作品" : "新建作品"}</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div
                    className={`${styles.imageUploadZone} ${styles.compactUpload}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      form.mediaType === "video" ? (
                        <video src={previewUrl} className={styles.imagePreview} controls />
                      ) : form.mediaType === "audio" ? (
                        <audio src={previewUrl} controls style={{ width: "90%" }} />
                      ) : (
                        <img src={previewUrl} alt="预览" className={styles.imagePreview} />
                      )
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span>{"上传媒体文件"}</span>
                        <small>{"图片 / 视频 / 音频"}</small>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      form.mediaType === "video"
                        ? "video/*"
                        : form.mediaType === "audio"
                          ? "audio/*"
                          : "image/*"
                    }
                    onChange={handleMediaChange}
                    style={{ display: "none" }}
                  />
                  <div className={styles.fields}>
                    <select
                      className={styles.input}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {getCategoryLabel(opt)}
                        </option>
                      ))}
                    </select>
                    <select
                      className={styles.input}
                      value={form.mediaType}
                      onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                    >
                      <option value="image">{MEDIA_TYPE_LABELS.image}</option>
                      <option value="video">{MEDIA_TYPE_LABELS.video}</option>
                      <option value="audio">{MEDIA_TYPE_LABELS.audio}</option>
                    </select>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="标题"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                    <textarea
                      className={styles.textarea}
                      placeholder="描述"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      required
                    />
                    <input
                      className={styles.input}
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  {message ? <p className={styles.message}>{message}</p> : null}
                  <div className={styles.inlineActions}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? "保存中..." : editingItem ? "更新作品" : "发布作品"}
                    </button>
                    {editingItem ? (
                      <button type="button" className={styles.ghostBtn} onClick={resetWorkForm}>
                        {"取消编辑"}
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>

              <div className={styles.configCard}>
                <h3>{"作品"} ({filteredItems.length}/{items.length})</h3>
                <div className={styles.workFilterBar}>
                  <select
                    className={styles.input}
                    value={workFilter}
                    onChange={(e) => setWorkFilter(e.target.value)}
                  >
                    <option value="all">{"全部分类"}</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                  <input
                    className={styles.input}
                    placeholder="按标题或描述搜索"
                    value={workQuery}
                    onChange={(e) => setWorkQuery(e.target.value)}
                  />
                </div>

                {groupedItems.map((group) => (
                  <div key={group.category} className={styles.categoryGroup}>
                    <div className={styles.categoryTitle}>
                      {getCategoryLabel(group.category)} ({group.items.length})
                    </div>
                    <div className={styles.itemGrid}>
                      {group.items.map((item) => (
                        <div key={item.id} className={styles.itemCard}>
                          <img src={getThumb(item)} alt={item.title} className={styles.itemThumb} />
                          <div className={styles.itemInfo}>
                            <span className={styles.itemTitle}>{item.title}</span>
                            <span className={styles.itemCategory}>{getCategoryLabel(item.category)}</span>
                          </div>
                          <div className={styles.cardActions}>
                            <button className={styles.editBtn} onClick={() => startEdit(item)}>
                              {"编辑"}
                            </button>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                              {"删除"}
                            </button>
                          </div>
                        </div>
                      ))}
                      {group.items.length === 0 ? <div className={styles.emptyHint}>{"暂无作品"}</div> : null}
                    </div>
                  </div>
                ))}

                {otherItems.length > 0 ? (
                  <div className={styles.categoryGroup}>
                    <div className={styles.categoryTitle}>{CATEGORY_LABELS.other} ({otherItems.length})</div>
                    <div className={styles.itemGrid}>
                      {otherItems.map((item) => (
                        <div key={item.id} className={styles.itemCard}>
                          <img src={getThumb(item)} alt={item.title} className={styles.itemThumb} />
                          <div className={styles.itemInfo}>
                            <span className={styles.itemTitle}>{item.title}</span>
                            <span className={styles.itemCategory}>{getCategoryLabel(item.category || "uncategorized")}</span>
                          </div>
                          <div className={styles.cardActions}>
                            <button className={styles.editBtn} onClick={() => startEdit(item)}>
                              {"编辑"}
                            </button>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                              {"删除"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.configSection}>
            <h2>{"2. 站点内容管理"}</h2>
            <p className={styles.tip}>
              {"统一维护首页圆环与 AI、商业设计排版、个人库及 2019-2024 子模块、个人简介。"}
            </p>

            <div className={styles.uploadHelper}>
              <div className={styles.label}>{"配置素材上传"}</div>
              <div className={styles.inlineActions}>
                <input className={styles.input} type="file" onChange={(e) => setConfigFile(e.target.files?.[0] || null)} />
                <button className={styles.ghostBtn} type="button" onClick={uploadForConfig} disabled={!configFile || configUploading}>
                  {configUploading ? "上传中..." : "上传并获取 URL"}
                </button>
              </div>
              {configUploadUrl ? (
                <div className={styles.urlBox}>
                  <code>{configUploadUrl}</code>
                  <button className={styles.ghostBtn} type="button" onClick={() => navigator.clipboard.writeText(configUploadUrl)}>{"复制"}</button>
                </div>
              ) : null}
            </div>

            <div className={styles.moduleSection}>
              <h3 className={styles.moduleTitle}>{"2.1 首页圆环与 AI"}</h3>
              <div className={styles.configCard}>
                <h3>{"首页圆环与 AI"}</h3>
                <label className={styles.label}>{"圆环分类过滤"}</label>
                <input
                  className={styles.input}
                  value={toStringSafe(config.home?.ring?.categoryFilter)}
                  onChange={(e) => updateConfigPath(["home", "ring", "categoryFilter"], e.target.value)}
                />
                <label className={styles.label}>{"AI 系统提示词"}</label>
                <textarea
                  className={styles.textarea}
                  rows={6}
                  value={toStringSafe(config.home?.ai?.systemPrompt)}
                  onChange={(e) => updateConfigPath(["home", "ai", "systemPrompt"], e.target.value)}
                />
                <label className={styles.label}>{"AI 离线提示语"}</label>
                <input
                  className={styles.input}
                  value={toStringSafe(config.home?.ai?.offlineMessage)}
                  onChange={(e) => updateConfigPath(["home", "ai", "offlineMessage"], e.target.value)}
                />
                <label className={styles.label}>{"AI 输入占位文案"}</label>
                <input
                  className={styles.input}
                  value={toStringSafe(config.home?.ai?.inputPlaceholder)}
                  onChange={(e) => updateConfigPath(["home", "ai", "inputPlaceholder"], e.target.value)}
                />
              </div>
            </div>

            <div className={styles.moduleSection}>
              <h3 className={styles.moduleTitle}>{"2.2 商业设计排版"}</h3>
              <div className={styles.fields}>
                <div className={styles.configCard}>
                  <h3>{"导航"}</h3>
                  {toArray(config.commercialDesign?.navItems).map((item, idx) => (
                    <div key={`nav-${idx}`} className={styles.rowEditor}>
                      <input className={styles.input} placeholder="标识 id" value={toStringSafe(item?.id)} onChange={(e) => updateArrayItem(["commercialDesign", "navItems"], idx, (row) => ({ ...row, id: e.target.value }))} />
                      <input className={styles.input} placeholder="显示名称" value={toStringSafe(item?.label)} onChange={(e) => updateArrayItem(["commercialDesign", "navItems"], idx, (row) => ({ ...row, label: e.target.value }))} />
                      <button type="button" className={styles.deleteBtn} onClick={() => removeArrayItem(["commercialDesign", "navItems"], idx)}>{"删除"}</button>
                    </div>
                  ))}
                  <button type="button" className={styles.ghostBtn} onClick={() => addArrayItem(["commercialDesign", "navItems"], { id: "", label: "" })}>{"添加导航"}</button>
                  <label className={styles.label}>{"书脊图片 URL"}</label>
                  <input className={styles.input} value={toStringSafe(config.commercialDesign?.spineImageUrl)} onChange={(e) => updateConfigPath(["commercialDesign", "spineImageUrl"], e.target.value)} />
                </div>

                {COMMERCIAL_SCHEMA.map((section) => {
                  const sectionData = toObject(config.commercialDesign?.sections?.[section.key]);
                  return (
                    <div key={section.key} className={styles.configCard}>
                      <h3>{section.label}</h3>
                      {section.textFields.map((field) => (
                        <label key={`${section.key}-${field.key}`} className={styles.label}>
                          {field.label}
                          {field.rows > 1 ? (
                            <textarea
                              className={styles.textarea}
                              rows={field.rows}
                              value={toStringSafe(sectionData[field.key])}
                              onChange={(e) => updateConfigPath(["commercialDesign", "sections", section.key, field.key], e.target.value)}
                            />
                          ) : (
                            <input
                              className={styles.input}
                              value={toStringSafe(sectionData[field.key])}
                              onChange={(e) => updateConfigPath(["commercialDesign", "sections", section.key, field.key], e.target.value)}
                            />
                          )}
                        </label>
                      ))}

                      {section.images.map((img) => (
                        <div key={`${section.key}-${img.urlKey}`} className={styles.subCard}>
                          <h4>{img.label}</h4>
                          <div className={styles.rowEditor}>
                            <input
                              className={styles.input}
                              type="number"
                              value={toNumberSafe(sectionData[img.indexKey], 0)}
                              onChange={(e) => updateConfigPath(["commercialDesign", "sections", section.key, img.indexKey], toNumberSafe(e.target.value, 0))}
                            />
                            <input
                              className={styles.input}
                              value={toStringSafe(sectionData[img.urlKey])}
                              placeholder="自定义图片 URL"
                              onChange={(e) => updateConfigPath(["commercialDesign", "sections", section.key, img.urlKey], e.target.value)}
                            />
                          </div>
                          <details>
                            <summary>{"样式"}</summary>
                            <div className={styles.fields}>
                              {STYLE_FIELDS.map((cssKey) => (
                                <label key={`${section.key}-${img.styleKey}-${cssKey}`} className={styles.label}>
                                  {STYLE_FIELD_LABELS[cssKey] || cssKey}
                                  <input
                                    className={styles.input}
                                    value={toStringSafe(sectionData?.[img.styleKey]?.[cssKey])}
                                    onChange={(e) => updateConfigPath(["commercialDesign", "sections", section.key, img.styleKey, cssKey], e.target.value)}
                                  />
                                </label>
                              ))}
                            </div>
                          </details>
                        </div>
                      ))}

                      {section.extraStyle ? (
                        <details>
                          <summary>{section.extraStyle.label}</summary>
                          <div className={styles.fields}>
                            {STYLE_FIELDS.map((cssKey) => (
                              <label key={`${section.key}-${section.extraStyle.key}-${cssKey}`} className={styles.label}>
                                {STYLE_FIELD_LABELS[cssKey] || cssKey}
                                <input
                                  className={styles.input}
                                  value={toStringSafe(sectionData?.[section.extraStyle.key]?.[cssKey])}
                                  onChange={(e) => updateConfigPath(["commercialDesign", "sections", section.key, section.extraStyle.key, cssKey], e.target.value)}
                                />
                              </label>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.moduleSection}>
              <h3 className={styles.moduleTitle}>{"2.3 个人库"}</h3>
              <div className={styles.fields}>
                <div className={styles.configCard}>
                  <h3>{"书籍信息"}</h3>
                  {["title", "type", "size", "year", "href", "coverUrl", "openLabel"].map((field) => (
                    <label key={field} className={styles.label}>
                      {BOOK_FIELD_LABELS[field] || field}
                      <input
                        className={styles.input}
                        value={toStringSafe(config.personalDesign?.library?.book?.[field])}
                        onChange={(e) => updateConfigPath(["personalDesign", "library", "book", field], e.target.value)}
                      />
                    </label>
                  ))}
                  <label className={styles.label}>
                    {"右侧说明 第 1 行"}
                    <input
                      className={styles.input}
                      value={toStringSafe(config.personalDesign?.library?.rightNote?.[0])}
                      onChange={(e) => updateConfigPath(["personalDesign", "library", "rightNote", 0], e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    {"右侧说明 第 2 行"}
                    <input
                      className={styles.input}
                      value={toStringSafe(config.personalDesign?.library?.rightNote?.[1])}
                      onChange={(e) => updateConfigPath(["personalDesign", "library", "rightNote", 1], e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    {"左侧版权文案"}
                    <input
                      className={styles.input}
                      value={toStringSafe(config.personalDesign?.library?.leftCopyright)}
                      onChange={(e) => updateConfigPath(["personalDesign", "library", "leftCopyright"], e.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.configCard}>
                  <h3>{"飘落图片"}</h3>
                  {toArray(config.personalDesign?.library?.fallingImages).map((img, idx) => (
                    <div key={`fall-${idx}`} className={styles.subCard}>
                      <h4>{"图片"} {idx + 1}</h4>
                      <label className={styles.label}>
                        {"图片 URL (src)"}
                        <input className={styles.input} value={toStringSafe(img?.src)} onChange={(e) => updateArrayItem(["personalDesign", "library", "fallingImages"], idx, (row) => ({ ...row, src: e.target.value }))} />
                      </label>
                      <div className={styles.rowEditor}>
                        <input className={styles.input} type="number" value={toNumberSafe(img?.rotate, 0)} onChange={(e) => updateArrayItem(["personalDesign", "library", "fallingImages"], idx, (row) => ({ ...row, rotate: toNumberSafe(e.target.value, 0) }))} />
                        <input className={styles.input} type="number" value={toNumberSafe(img?.width, 1279)} onChange={(e) => updateArrayItem(["personalDesign", "library", "fallingImages"], idx, (row) => ({ ...row, width: toNumberSafe(e.target.value, 1279) }))} />
                        <input className={styles.input} type="number" value={toNumberSafe(img?.height, 1706)} onChange={(e) => updateArrayItem(["personalDesign", "library", "fallingImages"], idx, (row) => ({ ...row, height: toNumberSafe(e.target.value, 1706) }))} />
                      </div>
                      <button type="button" className={styles.deleteBtn} onClick={() => removeArrayItem(["personalDesign", "library", "fallingImages"], idx)}>{"删除图片"}</button>
                    </div>
                  ))}
                  <button type="button" className={styles.ghostBtn} onClick={() => addArrayItem(["personalDesign", "library", "fallingImages"], { src: "", rotate: 0, width: 1279, height: 1706 })}>{"添加图片"}</button>
                </div>
              </div>
              <div className={styles.childModule}>
                <h4 className={styles.childTitle}>{"2.3.1 个人设计 2019-2024（子模块）"}</h4>
                <div className={styles.fields}>
                <div className={styles.configCard}>
                  <h3>{"书页内容"}</h3>
                  {toArray(config.personalDesign?.book2019?.pages).map((page, idx) => (
                    <div key={`page-${idx}`} className={styles.subCard}>
                      <h4>{"跨页"} {idx + 1}</h4>
                      {["front", "back"].map((side) => (
                        <div key={`${idx}-${side}`} className={styles.fields}>
                          <div className={styles.label}>{PAGE_SIDE_LABELS[side] || side}</div>
                          {["title", "text", "background", "pageNum"].map((field) => (
                            <label key={`${idx}-${side}-${field}`} className={styles.label}>
                              {PAGE_FIELD_LABELS[field] || field}
                              <input
                                className={styles.input}
                                type={field === "pageNum" ? "number" : "text"}
                                value={field === "pageNum" ? toNumberSafe(page?.[side]?.[field], side === "front" ? idx * 2 + 1 : idx * 2 + 2) : toStringSafe(page?.[side]?.[field])}
                                onChange={(e) =>
                                  updateArrayItem(["personalDesign", "book2019", "pages"], idx, (row) => ({
                                    ...row,
                                    [side]: {
                                      ...toObject(row?.[side]),
                                      [field]: field === "pageNum" ? toNumberSafe(e.target.value, side === "front" ? idx * 2 + 1 : idx * 2 + 2) : e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          ))}
                        </div>
                      ))}
                      <button type="button" className={styles.deleteBtn} onClick={() => removeArrayItem(["personalDesign", "book2019", "pages"], idx)}>{"删除跨页"}</button>
                    </div>
                  ))}
                  <button type="button" className={styles.ghostBtn} onClick={() => addArrayItem(["personalDesign", "book2019", "pages"], { front: { title: "", text: "", background: "", pageNum: 1 }, back: { title: "", text: "", background: "", pageNum: 2 } })}>{"添加跨页"}</button>
                </div>

                <div className={styles.configCard}>
                  <h3>{"项目页码范围"}</h3>
                  {toArray(config.personalDesign?.book2019?.projects).map((project, idx) => (
                    <div key={`project-${idx}`} className={styles.rowEditor}>
                      <input className={styles.input} type="number" value={toNumberSafe(project?.start, 1)} onChange={(e) => updateArrayItem(["personalDesign", "book2019", "projects"], idx, (row) => ({ ...row, start: toNumberSafe(e.target.value, 1) }))} />
                      <input className={styles.input} type="number" value={toNumberSafe(project?.end, 2)} onChange={(e) => updateArrayItem(["personalDesign", "book2019", "projects"], idx, (row) => ({ ...row, end: toNumberSafe(e.target.value, 2) }))} />
                      <input className={styles.input} value={toStringSafe(project?.name)} onChange={(e) => updateArrayItem(["personalDesign", "book2019", "projects"], idx, (row) => ({ ...row, name: e.target.value }))} />
                      <button type="button" className={styles.deleteBtn} onClick={() => removeArrayItem(["personalDesign", "book2019", "projects"], idx)}>{"删除"}</button>
                    </div>
                  ))}
                  <button type="button" className={styles.ghostBtn} onClick={() => addArrayItem(["personalDesign", "book2019", "projects"], { start: 1, end: 2, name: "" })}>{"添加项目范围"}</button>
                </div>
              </div>
              </div>
            </div>

            <div className={styles.moduleSection}>
              <h3 className={styles.moduleTitle}>{"2.4 个人简介"}</h3>
              <div className={styles.fields}>
                <div className={styles.configCard}>
                  <h3>{"基础信息"}</h3>
                  {["photoUrl", "kicker", "title", "lead"].map((field) => (
                    <label key={field} className={styles.label}>
                      {BIO_FIELD_LABELS[field] || field}
                      {field === "title" || field === "lead" ? (
                        <textarea className={styles.textarea} rows={3} value={toStringSafe(config.bio?.[field])} onChange={(e) => updateConfigPath(["bio", field], e.target.value)} />
                      ) : (
                        <input className={styles.input} value={toStringSafe(config.bio?.[field])} onChange={(e) => updateConfigPath(["bio", field], e.target.value)} />
                      )}
                    </label>
                  ))}
                </div>

                <div className={styles.configCard}>
                  <h3>{"元信息"}</h3>
                  {toArray(config.bio?.meta).map((item, idx) => (
                    <div key={`meta-${idx}`} className={styles.rowEditor}>
                      <input className={styles.input} placeholder="标签" value={toStringSafe(item?.label)} onChange={(e) => updateArrayItem(["bio", "meta"], idx, (row) => ({ ...row, label: e.target.value }))} />
                      <input className={styles.input} placeholder="内容" value={toStringSafe(item?.value)} onChange={(e) => updateArrayItem(["bio", "meta"], idx, (row) => ({ ...row, value: e.target.value }))} />
                      <input className={styles.input} placeholder="链接" value={toStringSafe(item?.href)} onChange={(e) => updateArrayItem(["bio", "meta"], idx, (row) => ({ ...row, href: e.target.value }))} />
                      <button type="button" className={styles.deleteBtn} onClick={() => removeArrayItem(["bio", "meta"], idx)}>{"删除"}</button>
                    </div>
                  ))}
                  <button type="button" className={styles.ghostBtn} onClick={() => addArrayItem(["bio", "meta"], { label: "", value: "", href: "" })}>{"添加元信息"}</button>
                </div>

                {renderStringListEditor("关于段落", ["bio", "aboutParagraphs"], "段落内容")}
                {renderStringListEditor("服务内容", ["bio", "services"], "服务内容")}
                {renderStringListEditor("合作方", ["bio", "collaborators"], "合作方")}
                {renderStringListEditor("项目经验", ["bio", "projectExperience"], "项目经历")}
                {renderStringListEditor("工作经验", ["bio", "workExperience"], "工作经历")}
              </div>
            </div>

            {contentMessage ? <p className={styles.message}>{contentMessage}</p> : null}
            <div className={styles.inlineActions}>
              <button className={styles.submitBtn} type="button" onClick={saveConfig} disabled={contentLoading}>{contentLoading ? "保存中..." : "保存站点配置"}</button>
              <button className={styles.ghostBtn} type="button" onClick={() => setConfig(structuredClone(savedConfig))} disabled={contentLoading}>{"重置未保存修改"}</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
