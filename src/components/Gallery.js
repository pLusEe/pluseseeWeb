"use client";

import { useState } from "react";
import styles from "./Gallery.module.css";

const getThumb = (item) => {
  if (item.thumbUrl) return item.thumbUrl;
  if ((item.mediaType || "image") === "image" && item.mediaUrl) return item.mediaUrl;
  if (item.imageUrl) return item.imageUrl;
  return "/placeholder1.jpg";
};

export default function Gallery({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (selectedItem) {
    return (
      <div className={styles.detailView}>
        <button 
          className={styles.backButton} 
          onClick={() => setSelectedItem(null)}
          data-hover-text="CLOSE"
        >
          &times;
        </button>
        
        <div className={styles.detailContent}>
          <div className={styles.imageContainer}>
             <img src={getThumb(selectedItem)} alt={selectedItem.title} className={styles.detailImage} />
          </div>
          
          <div className={styles.detailInfo}>
             <h2 className={styles.detailTitle}>{selectedItem.title}</h2>
             <div className={styles.hr} />
             <p className={styles.description}>{selectedItem.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galleryGrid}>
      {items.map((item) => (
        <div 
          key={item.id} 
          className={styles.galleryItem}
          onClick={() => setSelectedItem(item)}
          data-hover-text={item.title}
        >
          <img src={getThumb(item)} alt={item.title} className={styles.gridImage} />
        </div>
      ))}
    </div>
  );
}
