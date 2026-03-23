import styles from "./Bio.module.css";

const services = [
  "Visual Identity Systems",
  "Art Direction",
  "Editorial Design",
  "Digital Experience",
  "Image Narrative",
];

const collaborators = [
  "Independent brands",
  "Cultural spaces",
  "Fashion studios",
  "Music projects",
  "Creative founders",
];

export default function BioPage() {
  return (
    <div className={styles.page}>
      <div className={styles.gridNoise} aria-hidden="true"></div>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>plusesee / bio</p>
          <h1 className={styles.title}>
            Multidisciplinary designer shaping visual rhythm across image, text, and space.
          </h1>
          <p className={styles.lead}>
            I build identities and visual worlds with editorial clarity, emotional precision,
            and strong structural balance.
          </p>
        </section>

        <section className={styles.content}>
          <aside className={styles.sideMeta}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Base</span>
              <span className={styles.metaValue}>China</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Focus</span>
              <span className={styles.metaValue}>Brand / Editorial / Digital</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Contact</span>
              <a className={styles.metaLink} href="mailto:hello@plusesee.me">
                hello@plusesee.me
              </a>
            </div>
          </aside>

          <div className={styles.columns}>
            <article className={styles.block}>
              <h2>About</h2>
              <p>
                My work combines system thinking with a tactile sense of composition. I am
                interested in contrast, pacing, and the way typography and imagery create a
                narrative voice.
              </p>
              <p>
                Every project starts with structure: what must remain consistent, what can
                change, and where expression should feel alive.
              </p>
            </article>

            <article className={styles.block}>
              <h2>Services</h2>
              <ul>
                {services.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className={styles.block}>
              <h2>Selected Collaborations</h2>
              <ul>
                {collaborators.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
