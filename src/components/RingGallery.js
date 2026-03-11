"use client";

import { useState, useEffect } from "react";
import styles from "./RingGallery.module.css";

const ROLES = [
  "Architects.",
  "Designers.",
  "Retail Planners.",
  "Innovators.",
  "Creators."
];

function GalleryDetailView({ selectedItem, onClose }) {
  return (
    <div className={styles.detailView}>
      <button 
        className={styles.backButton} 
        onClick={onClose}
        data-hover-text="CLOSE"
      >
        &times;
      </button>
      
      <div className={styles.detailContent}>
        <div className={styles.imageContainer}>
           <img src={selectedItem.imageUrl} alt={selectedItem.title} className={styles.detailImage} />
        </div>
        
        <div className={styles.detailInfo}>
           <h2 className={styles.detailTitle}>{selectedItem.title}</h2>
           <div className={styles.hr} />
           <p className={styles.description}>{selectedItem.description}</p>
           <div className={styles.promptSection}>
              <span className={styles.promptLabel}>TECHNICAL INFO</span>
              <span className={styles.promptValue}>{selectedItem.prompt}</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function RingGallery({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fill array for a dense, visually complete ring
  const minItems = 12; // 12 items makes a nice dense circle
  let displayItems = [...items];
  if (items.length > 0) {
    while (displayItems.length < minItems) {
      displayItems = [...displayItems, ...items];
    }
  }
  displayItems = displayItems.slice(0, Math.max(minItems, items.length));

  if (selectedItem) {
    return <GalleryDetailView selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />;
  }

  return (
    <div className={styles.scene}>
      <div className={styles.centerHero}>
        <h2>
          WE ARE <br />
          <span className={styles.role} key={roleIndex}>{ROLES[roleIndex]}</span>
        </h2>
      </div>

      <div className={styles.orbitContainer}>
        {displayItems.map((item, i) => {
          const angle = (360 / displayItems.length) * i;
          return (
            <div 
              key={`${item.id}-${i}`} 
              className={styles.itemPivot} 
              style={{ '--angle': `${angle}deg` }}
            >
              <div 
                className={styles.itemContent} 
                onClick={() => setSelectedItem(item)}
                data-hover-text={item.title}
              >
                  <div className={styles.imageScaleWrapper}>
                    <img src={item.imageUrl} alt={item.title} className={styles.image} />
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
