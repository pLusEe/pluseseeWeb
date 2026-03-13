"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Admin.module.css";

const CATEGORY_OPTIONS = [
  "personal design",
  "commercial design",
  "soundart",
  "media art",
  "photography",
];

const initialForm = {
  title: "",
  category: CATEGORY_OPTIONS[0],
  description: "",
  date: "",
  mediaType: "image",
};

const getThumb = (item) => {
  if (item.thumbUrl) return item.thumbUrl;
  if (item.mediaType === "image" && item.mediaUrl) return item.mediaUrl;
  return "/placeholder1.jpg";
};

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!mediaFile) {
      setMessage("请先上传媒体文件");
      setLoading(false);
      return;
    }

    try {
      let mediaUrl = "";

      const fd = new FormData();
      fd.append("file", mediaFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        mediaUrl = uploadData.url;
      }

      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          date: form.date,
          mediaType: form.mediaType,
          mediaUrl,
        }),
      });

      if (res.ok) {
        setMessage("已发布");
        setForm(initialForm);
        setMediaFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchItems();
      } else {
        setMessage("发布失败，请重试");
      }
    } catch (err) {
      setMessage("发生错误：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("确定要删除这条作品吗？")) return;
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchItems();
  };

  const groupedItems = CATEGORY_OPTIONS.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }));

  const otherItems = items.filter(
    (item) => !CATEGORY_OPTIONS.includes(item.category)
  );

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1>
          plusesee.me / <span>作品管理后台</span>
        </h1>
        <a href="/" className={styles.backLink}>
          返回首页
        </a>
      </header>

      <div className={styles.adminBody}>
        <section className={styles.formSection}>
          <h2>新建作品</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div
              className={styles.imageUploadZone}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                form.mediaType === "video" ? (
                  <video src={previewUrl} className={styles.imagePreview} controls />
                ) : form.mediaType === "audio" ? (
                  <audio src={previewUrl} controls style={{ width: "90%" }} />
                ) : (
                  <img src={previewUrl} alt="preview" className={styles.imagePreview} />
                )
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>点击上传媒体文件</span>
                  <small>图片 / 视频 / 音频</small>
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
                    {opt}
                  </option>
                ))}
              </select>
              <select
                className={styles.input}
                value={form.mediaType}
                onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
              >
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
              </select>
              <input
                className={styles.input}
                type="text"
                placeholder="标题（必填）"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                className={styles.textarea}
                placeholder="描述（必填）"
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

            {message && <p className={styles.message}>{message}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "发布中..." : "发布作品"}
            </button>
          </form>
        </section>

        <section className={styles.listSection}>
          <h2>现有作品（{items.length}）</h2>
          {groupedItems.map((group) => (
            <div key={group.category} className={styles.categoryGroup}>
              <div className={styles.categoryTitle}>
                {group.category}（{group.items.length}）
              </div>
              <div className={styles.itemGrid}>
                {group.items.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <img src={getThumb(item)} alt={item.title} className={styles.itemThumb} />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemCategory}>{item.category}</span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </button>
                  </div>
                ))}
                {group.items.length === 0 && (
                  <div className={styles.emptyHint}>暂无作品</div>
                )}
              </div>
            </div>
          ))}

          {otherItems.length > 0 && (
            <div className={styles.categoryGroup}>
              <div className={styles.categoryTitle}>其他（{otherItems.length}）</div>
              <div className={styles.itemGrid}>
                {otherItems.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <img src={getThumb(item)} alt={item.title} className={styles.itemThumb} />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemCategory}>{item.category || "未分类"}</span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
