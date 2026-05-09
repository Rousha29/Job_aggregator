import styles from './Comparateur.module.css';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';

export default function Comparateur() {
    return (
        <div className={styles.page}>

            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.logo}>
                        <span className={styles.logoMark}>JA</span>
                        <span className={styles.logoText}>Job Aggregator</span>
                    </div>
                    <BurgerMenu />
                </div>
            </header>

            <main className={styles.main}>

                {/* ── Hero ── */}
                <section className={styles.hero}>
                    <h1 className={styles.heroTitle}>
                        Notre IA compare <em>vos offres</em> favoris
                    </h1>
                </section>

                {/* ── Les deux slots ── */}
                <div className={styles.slots}>

                    <div className={styles.slot}>
                        <span className={styles.slotNumber}>1.</span>
                        <button className={styles.slotBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                        <p className={styles.slotHint}>Sélectionner une offre</p>
                    </div>

                    <div className={styles.slot}>
                        <span className={styles.slotNumber}>2.</span>
                        <button className={styles.slotBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                        <p className={styles.slotHint}>Sélectionner une offre</p>
                    </div>

                </div>

                {/* ── Bouton comparer ── */}
                <div className={styles.compareRow}>
                    <button className={styles.compareBtn}>Comparer</button>
                </div>

                {/* ── Tableau comparatif (placeholder visuel) ── */}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.thCriteria}>Critère</th>
                                <th className={styles.thOffer}>Offre 1</th>
                                <th className={styles.thOffer}>Offre 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Salaire', true, true],
                                ['Télétravail', true, false],
                                ['Expérience', false, true],
                                ['Type de contrat', true, true],
                                ['Localisation', false, true],
                                ['Stack technique', true, false],
                            ].map(([label, a, b], i) => (
                                <tr key={i} className={styles.tr}>
                                    <td className={styles.tdLabel}>{label as string}</td>
                                    <td className={styles.tdValue}>
                                        <span className={a ? styles.check : styles.cross}>
                                            {a ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td className={styles.tdValue}>
                                        <span className={b ? styles.check : styles.cross}>
                                            {b ? '✓' : '✗'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}