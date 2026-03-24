"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Bio.module.css";
import defaultSiteContent from "../../data/site-content.json";

const defaultBio = defaultSiteContent.bio;

export default function BioPage() {
  const [bio, setBio] = useState(defaultBio);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data?.bio && typeof data.bio === "object") {
          setBio({
            ...defaultBio,
            ...data.bio,
            meta: Array.isArray(data.bio.meta) ? data.bio.meta : defaultBio.meta,
            aboutParagraphs: Array.isArray(data.bio.aboutParagraphs)
              ? data.bio.aboutParagraphs
              : defaultBio.aboutParagraphs,
            services: Array.isArray(data.bio.services) ? data.bio.services : defaultBio.services,
            collaborators: Array.isArray(data.bio.collaborators)
              ? data.bio.collaborators
              : defaultBio.collaborators,
            projectExperience: Array.isArray(data.bio.projectExperience)
              ? data.bio.projectExperience
              : defaultBio.projectExperience,
            workExperience: Array.isArray(data.bio.workExperience)
              ? data.bio.workExperience
              : defaultBio.workExperience,
          });
        }
      })
      .catch(() => {});
  }, []);

  const metaItems = useMemo(() => (Array.isArray(bio.meta) ? bio.meta : []), [bio.meta]);

  return (
    <div className={styles.page}>
      <div className={styles.gridNoise} aria-hidden="true"></div>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>{bio.kicker}</p>
            <h1 className={styles.title}>{bio.title}</h1>
            <p className={styles.lead}>{bio.lead}</p>
          </div>
          {bio.photoUrl ? (
            <div className={styles.heroMedia}>
              <img src={bio.photoUrl} alt="Bio portrait" className={styles.portrait} />
            </div>
          ) : null}
        </section>

        <section className={styles.content}>
          <aside className={styles.sideMeta}>
            {metaItems.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className={styles.metaBlock}>
                <span className={styles.metaLabel}>{item.label}</span>
                {item.href ? (
                  <a className={styles.metaLink} href={item.href}>
                    {item.value}
                  </a>
                ) : (
                  <span className={styles.metaValue}>{item.value}</span>
                )}
              </div>
            ))}
          </aside>

          <div className={styles.columns}>
            <article className={styles.block}>
              <h2>About</h2>
              {(bio.aboutParagraphs || []).map((paragraph, idx) => (
                <p key={`about-${idx}`}>{paragraph}</p>
              ))}
            </article>

            <article className={styles.block}>
              <h2>Services</h2>
              <ul>
                {(bio.services || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className={styles.block}>
              <h2>Selected Collaborations</h2>
              <ul>
                {(bio.collaborators || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            {(bio.projectExperience || []).length > 0 ? (
              <article className={styles.block}>
                <h2>Project Experience</h2>
                <ul>
                  {(bio.projectExperience || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ) : null}

            {(bio.workExperience || []).length > 0 ? (
              <article className={styles.block}>
                <h2>Work Experience</h2>
                <ul>
                  {(bio.workExperience || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
