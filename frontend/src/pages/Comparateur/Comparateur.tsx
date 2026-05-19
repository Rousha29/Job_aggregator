import { useEffect, useState } from 'react';
import styles from './Comparateur.module.css';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import api from '../../services/api';

// Types

interface IdealOffer {
    title: string;
    location: string;
    contract_type: string;
    level: string;
    skills: string[];
    description: string;
    salary_min: string;
    salary_max: string;
}

interface OfferResult {
    pros: string[];
    cons: string[];
    match_score: number;
    matched_skills?: string[];
}

interface OfferData {
    id: string;
    title: string;
    company: string;
    location: string;
    contract_type: string;
    level: string;
    salary_min: number | null;
    salary_max: number | null;
    remote: boolean;
}

interface CompareResult {
    winner: 'offer1' | 'offer2';
    offer1: OfferResult;
    offer2: OfferResult;
    offer1_data: OfferData;
    offer2_data: OfferData;
    ideal_offer: IdealOffer;
}

interface FavoriteOffer {
    id: string;
    title: string;
    company: string;
    location: string;
    contract_type: string;
}

// Constantes

const CONTRACT_TYPES = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];
const LEVELS = ['Junior', 'Confirmé', 'Senior', 'Lead'];
const SKILL_SUGGESTIONS = ['React', 'Vue', 'Angular', 'Node.js', 'TypeScript', 'Python', 'C', 'Java', 'PostgreSQL', 'Docker', 'JavaScript', 'Next.js', 'SWIFT', 'Kotlin', 'Express', 'Vite', 'Bcrypt', 'CORS'];

// Composant principal

export default function Comparateur() {
    const [offerId1, setOfferId1] = useState('');
    const [offerId2, setOfferId2] = useState('');
    const [ideal, setIdeal] = useState<IdealOffer>({
        title: '',
        location: '',
        contract_type: '',
        level: '',
        skills: [],
        description: '',
        salary_min: '',
        salary_max: '',
    });
    const [skillInput, setSkillInput] = useState('');
    const [result, setResult] = useState<CompareResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idealOpen, setIdealOpen] = useState(false);
    const [favorites, setFavorites] = useState<FavoriteOffer[]>([]);
    const [loadingFavs, setLoadingFavs] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'offer1' | 'offer2' | null>(null);

    useEffect(() => {
        api.get('/favorites')
            .then(res => {
                const mapped = res.data.map((row: any) => ({
                    id: String(row.id),
                    title: row.title,
                    company: row.company,
                    location: row.location,
                    contract_type: row.contract_type,
                }));
                setFavorites(mapped);
            })
            .catch(() => setError('Impossible de charger vos favoris.'))
            .finally(() => setLoadingFavs(false));
    }, []);

    // Handlers

    const addSkill = (skill: string) => {
        const s = skill.trim();
        if (s && !ideal.skills.includes(s)) {
            setIdeal(prev => ({ ...prev, skills: [...prev.skills, s] }));
        }
        setSkillInput('');
    };

    const removeSkill = (skill: string) => {
        setIdeal(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleCompare = async () => {
        if (!offerId1.trim() || !offerId2.trim()) {
            setError('Veuillez sélectionner deux offres dans vos favoris.');
            return;
        }
        setError('');
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/ai/compare', {
                offer_id_1: offerId1.trim(),
                offer_id_2: offerId2.trim(),
                ideal_offer: ideal,
            });
            setResult(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? 'Erreur lors de la comparaison.');
        } finally {
            setLoading(false);
        }
    };

    const openPicker = (target: 'offer1' | 'offer2') => {
        setPickerTarget(target);
        setPickerOpen(true);
    };

    const selectFavorite = (id: string) => {
        if (pickerTarget === 'offer1') setOfferId1(id);
        if (pickerTarget === 'offer2') setOfferId2(id);
        setPickerOpen(false);
        setPickerTarget(null);
    };

    const getFavoriteLabel = (id: string) => {
        const fav = favorites.find(f => f.id === id);
        if (!fav) return 'Sélectionner une offre';
        return `${fav.title} — ${fav.company}`;
    };

    // Render

    return (
        <div className={styles.page}>

            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.logo}>
                        <span className={styles.logoMark}>JA</span>
                        <span className={styles.logoText}>Job Aggregator</span>
                    </div>
                    <div className={styles.headerActions}>
                        <ThemeToggleButton className={styles.iconButton} />
                        <BurgerMenu />
                    </div>
                </div>
            </header>

            <main className={styles.main}>

                {/* ── Hero ── */}
                <section className={styles.hero}>
                    <h1 className={styles.heroTitle}>
                        Notre IA compare <em>vos offres</em> favorites
                    </h1>
                </section>

                {/* ── Offre idéale ── */}
                <div className={styles.idealSection}>
                    <button
                        className={styles.idealToggle}
                        onClick={() => setIdealOpen(o => !o)}
                    >
                        <span>Définir mon offre idéale</span>
                        <svg
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                            width="18" height="18"
                            style={{ transform: idealOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {idealOpen && (
                        <div className={styles.idealForm}>
                            <p className={styles.idealHint}>
                                Plus vous remplissez ces champs, plus la comparaison sera précise.
                                Tous les champs sont optionnels.
                            </p>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Poste recherché</label>
                                    <input
                                        className={styles.formInput}
                                        placeholder="ex: Développeur Full Stack"
                                        value={ideal.title}
                                        onChange={e => setIdeal(p => ({ ...p, title: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Localisation</label>
                                    <input
                                        className={styles.formInput}
                                        placeholder="ex: Paris"
                                        value={ideal.location}
                                        onChange={e => setIdeal(p => ({ ...p, location: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Type de contrat</label>
                                    <div className={styles.pills}>
                                        {CONTRACT_TYPES.map(c => (
                                            <button
                                                key={c}
                                                className={`${styles.pill} ${ideal.contract_type === c ? styles.pillActive : ''}`}
                                                onClick={() => setIdeal(p => ({ ...p, contract_type: p.contract_type === c ? '' : c }))}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Niveau</label>
                                    <div className={styles.pills}>
                                        {LEVELS.map(l => (
                                            <button
                                                key={l}
                                                className={`${styles.pill} ${ideal.level === l ? styles.pillActive : ''}`}
                                                onClick={() => setIdeal(p => ({ ...p, level: p.level === l ? '' : l }))}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Salaire min (k€)</label>
                                    <input
                                        className={styles.formInput}
                                        placeholder="ex: 35"
                                        value={ideal.salary_min}
                                        onChange={e => setIdeal(p => ({ ...p, salary_min: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Salaire max (k€)</label>
                                    <input
                                        className={styles.formInput}
                                        placeholder="ex: 50"
                                        value={ideal.salary_max}
                                        onChange={e => setIdeal(p => ({ ...p, salary_max: e.target.value }))}
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.formLabel}>Compétences</label>
                                    <div className={styles.skillsWrap}>
                                        {ideal.skills.map(s => (
                                            <span key={s} className={styles.skillTag}>
                                                {s}
                                                <button className={styles.skillRemove} onClick={() => removeSkill(s)}>×</button>
                                            </span>
                                        ))}
                                        <input
                                            className={styles.skillInput}
                                            placeholder="Ajouter une compétence…"
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); } }}
                                        />
                                    </div>
                                    <div className={styles.skillSuggestions}>
                                        {SKILL_SUGGESTIONS.filter(s => !ideal.skills.includes(s)).map(s => (
                                            <button key={s} className={styles.skillSuggestion} onClick={() => addSkill(s)}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Sélection des favoris ── */}
                <div className={styles.slots}>
                    <div className={styles.slot}>
                        <span className={styles.slotNumber}>1.</span>
                        <label className={styles.slotLabel}>Offre favorite</label>
                        <button
                            type="button"
                            className={styles.slotPicker}
                            onClick={() => openPicker('offer1')}
                            disabled={loadingFavs}
                        >
                            {loadingFavs ? 'Chargement…' : getFavoriteLabel(offerId1)}
                        </button>
                    </div>
                    <div className={styles.slot}>
                        <span className={styles.slotNumber}>2.</span>
                        <label className={styles.slotLabel}>Offre favorite</label>
                        <button
                            type="button"
                            className={styles.slotPicker}
                            onClick={() => openPicker('offer2')}
                            disabled={loadingFavs}
                        >
                            {loadingFavs ? 'Chargement…' : getFavoriteLabel(offerId2)}
                        </button>
                    </div>
                </div>

                {!loadingFavs && favorites.length === 0 && (
                    <p className={styles.errorMsg}>Vous n'avez pas encore de favoris.</p>
                )}

                {/* ── Bouton comparer ── */}
                {error && <p className={styles.errorMsg}>{error}</p>}
                <div className={styles.compareRow}>
                    <button className={styles.compareBtn} onClick={handleCompare} disabled={loading}>
                        {loading ? 'Analyse en cours…' : 'Comparer'}
                    </button>
                </div>

                {/* ── Résultat ── */}
                {result && <CompareResultView result={result} />}

                {pickerOpen && (
                    <div className={styles.pickerOverlay} onClick={() => setPickerOpen(false)}>
                        <div className={styles.pickerModal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.pickerHeader}>
                                <h3 className={styles.pickerTitle}>Choisir une offre favorite</h3>
                                <button className={styles.pickerClose} onClick={() => setPickerOpen(false)} aria-label="Fermer">✕</button>
                            </div>
                            <div className={styles.pickerList}>
                                {favorites.length === 0 ? (
                                    <p className={styles.emptyPicker}>Aucun favori trouvé.</p>
                                ) : (
                                    favorites.map(f => (
                                        <button
                                            key={f.id}
                                            className={styles.pickerItem}
                                            onClick={() => selectFavorite(f.id)}
                                        >
                                            <div className={styles.pickerItemTitle}>{f.title}</div>
                                            <div className={styles.pickerItemMeta}> {f.company} · {f.contract_type || 'Non indiqué'} · {f.location || 'Non indiqué'}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

// ── Composant résultat ────────────────────────────────────────────────────────

function CompareResultView({ result }: { result: CompareResult }) {
    const { winner, offer1, offer2, offer1_data, offer2_data, ideal_offer } = result;
    const totalSkills = ideal_offer.skills?.length ?? 0;
    const formatMatched = (skills: string[] | undefined) => {
        if (!totalSkills) return 'Non indiqué';
        const matched = skills ?? [];
        return matched.length
            ? `${matched.join(', ')} (${matched.length}/${totalSkills})`
            : `Aucune (0/${totalSkills})`;
    };

    return (
        <div className={styles.resultWrap}>

            {/* Banner winner */}
            <div className={styles.winnerBanner}>
                <span className={styles.winnerLabel}>Meilleure correspondance</span>
                <span className={styles.winnerTitle}>
                    {winner === 'offer1' ? offer1_data.title : offer2_data.title}
                </span>
                <span className={styles.winnerCompany}>
                    {winner === 'offer1' ? offer1_data.company : offer2_data.company}
                </span>
            </div>

            {/* Tableau */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thCriteria}>Critère</th>
                            <th className={`${styles.thOffer} ${winner === 'offer1' ? styles.thWinner : ''}`}>
                                {winner === 'offer1' && <span className={styles.crown}></span>}
                                <span className={styles.offerTitleShort}>{offer1_data.title}</span>
                                <span className={styles.offerCompany}>{offer1_data.company}</span>
                            </th>
                            <th className={`${styles.thOffer} ${winner === 'offer2' ? styles.thWinner : ''}`}>
                                {winner === 'offer2' && <span className={styles.crown}></span>}
                                <span className={styles.offerTitleShort}>{offer2_data.title}</span>
                                <span className={styles.offerCompany}>{offer2_data.company}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>

                        {/* Score */}
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Score de correspondance</td>
                            <td className={styles.tdValue}>
                                <ScoreBar score={offer1.match_score} isWinner={winner === 'offer1'} />
                            </td>
                            <td className={styles.tdValue}>
                                <ScoreBar score={offer2.match_score} isWinner={winner === 'offer2'} />
                            </td>
                        </tr>

                        {/* Infos brutes */}
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Localisation</td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{offer1_data.location || 'Non indiqué'}</span></td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{offer2_data.location || 'Non indiqué'}</span></td>
                        </tr>
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Contrat</td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{offer1_data.contract_type || 'Non indiqué'}</span></td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{offer2_data.contract_type || 'Non indiqué'}</span></td>
                        </tr>
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Niveau</td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{offer1_data.level || 'Non indiqué'}</span></td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{offer2_data.level || 'Non indiqué'}</span></td>
                        </tr>
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Compétences recherchées</td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{formatMatched(offer1.matched_skills)}</span></td>
                            <td className={styles.tdValue}><span className={styles.dataVal}>{formatMatched(offer2.matched_skills)}</span></td>
                        </tr>
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Salaire</td>
                            <td className={styles.tdValue}>
                                <span className={styles.dataVal}>
                                    {offer1_data.salary_min && offer1_data.salary_max
                                        ? `${offer1_data.salary_min}k – ${offer1_data.salary_max}k €`
                                        : 'Non indiqué'}
                                </span>
                            </td>
                            <td className={styles.tdValue}>
                                <span className={styles.dataVal}>
                                    {offer2_data.salary_min && offer2_data.salary_max
                                        ? `${offer2_data.salary_min}k – ${offer2_data.salary_max}k €`
                                        : 'Non indiqué'}
                                </span>
                            </td>
                        </tr>

                        {/* Points forts */}
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Points forts</td>
                            <td className={styles.tdValue}>
                                <ul className={styles.prosList}>
                                    {offer1.pros.map((p, i) => <li key={i} className={styles.pro}>{p}</li>)}
                                    {offer1.pros.length === 0 && <li className={styles.empty}>Non indiqué</li>}
                                </ul>
                            </td>
                            <td className={styles.tdValue}>
                                <ul className={styles.prosList}>
                                    {offer2.pros.map((p, i) => <li key={i} className={styles.pro}>{p}</li>)}
                                    {offer2.pros.length === 0 && <li className={styles.empty}>Non indiqué</li>}
                                </ul>
                            </td>
                        </tr>

                        {/* Points faibles */}
                        <tr className={styles.tr}>
                            <td className={styles.tdLabel}>Points faibles</td>
                            <td className={styles.tdValue}>
                                <ul className={styles.consList}>
                                    {offer1.cons.map((c, i) => <li key={i} className={styles.con}>{c}</li>)}
                                    {offer1.cons.length === 0 && <li className={styles.empty}>Non indiqué</li>}
                                </ul>
                            </td>
                            <td className={styles.tdValue}>
                                <ul className={styles.consList}>
                                    {offer2.cons.map((c, i) => <li key={i} className={styles.con}>{c}</li>)}
                                    {offer2.cons.length === 0 && <li className={styles.empty}>Non indiqué</li>}
                                </ul>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Barre de score ────────────────────────────────────────────────────────────

function ScoreBar({ score, isWinner }: { score: number; isWinner: boolean }) {
    return (
        <div className={styles.scoreWrap}>
            <span className={`${styles.scoreNum} ${isWinner ? styles.scoreNumWinner : ''}`}>{score}%</span>
            <div className={styles.scoreTrack}>
                <div
                    className={`${styles.scoreFill} ${isWinner ? styles.scoreFillWinner : ''}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}