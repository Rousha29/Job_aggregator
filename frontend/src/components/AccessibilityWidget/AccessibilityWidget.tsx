import { useState, useEffect } from 'react';
import styles from './AccessibilityWidget.module.css';

const DEFAULTS = {
    fontSize: 100,      
    fontFamily: 'default',
    letterSpacing: 0,   
};

type Settings = typeof DEFAULTS;

// Clé de sauvegarde dans le localStorage
const STORAGE_KEY = 'ja_accessibility';

interface AccessibilityWidgetProps {
    enabled: boolean;
}

export default function AccessibilityWidget({ enabled }: AccessibilityWidgetProps) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    });

    if (!enabled) {
        return null;
    }

    // Applique les settings sur le <html> à chaque changement
    useEffect(() => {
        const root = document.documentElement;

        // Appliquer directement le zoom de base au root pour que les unités rem suivent
        root.style.fontSize = `${settings.fontSize}%`;
        root.style.setProperty('--a11y-font-size', `${settings.fontSize}%`);
        root.style.setProperty('--a11y-letter-spacing', `${settings.letterSpacing}em`);

        // Police
        const fontMap: Record<string, string> = {
            default: 'system-ui, "Segoe UI", Roboto, sans-serif',
            dyslexic: '"OpenDyslexic", "Comic Sans MS", cursive',
            readable: '"Atkinson Hyperlegible", "Verdana", sans-serif',
            mono: '"Courier New", monospace',
        };
        const fontFamily = fontMap[settings.fontFamily];
        root.style.setProperty('--a11y-font-family', fontFamily);
        document.body.style.fontFamily = fontFamily;
        document.body.style.letterSpacing = `${settings.letterSpacing}em`;

        // Sauvegarde dans localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    }, [settings]);

    const update = (key: keyof Settings, value: Settings[keyof Settings]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const reset = () => {
        setSettings(DEFAULTS);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <>
            {/* Bouton flottant */}
            <button
                className={styles.trigger}
                onClick={() => setOpen((o) => !o)}
                aria-label="Ouvrir le panneau d'accessibilité"
                aria-expanded={open}
                title="Accessibilité"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8h.01M11 12h1v4h1" />
                </svg>
            </button>

            {/* Panneau */}
            {open && (
                <div
                    className={styles.panel}
                    role="dialog"
                    aria-label="Options d'accessibilité"
                    aria-modal="false"
                >
                    {/* Header */}
                    <div className={styles.panelHeader}>
                        <h2 className={styles.panelTitle}>Accessibilité</h2>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setOpen(false)}
                            aria-label="Fermer le panneau d'accessibilité"
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.sections}>

                        {/* Taille du texte */}
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Taille du texte</h3>
                            <div className={styles.fontSizeRow}>
                                <button
                                    className={styles.sizeBtn}
                                    onClick={() => update('fontSize', Math.max(80, settings.fontSize - 10))}
                                    aria-label="Réduire la taille du texte"
                                    disabled={settings.fontSize <= 80}
                                >
                                    A−
                                </button>
                                <span className={styles.sizeValue}>{settings.fontSize}%</span>
                                <button
                                    className={styles.sizeBtn}
                                    onClick={() => update('fontSize', Math.min(200, settings.fontSize + 10))}
                                    aria-label="Augmenter la taille du texte"
                                    disabled={settings.fontSize >= 200}
                                >
                                    A+
                                </button>
                            </div>
                        </section>

                        {/* Police */}
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Police</h3>
                            <div className={styles.fontGrid}>
                                {[
                                    { key: 'default', label: 'Par défaut', preview: 'Aa' },
                                    { key: 'dyslexic', label: 'Dyslexique', preview: 'Aa' },
                                    { key: 'readable', label: 'Lisibilité', preview: 'Aa' },
                                    { key: 'mono', label: 'Monospace', preview: 'Aa' },
                                ].map(({ key, label, preview }) => (
                                    <button
                                        key={key}
                                        className={`${styles.fontBtn} ${settings.fontFamily === key ? styles.fontBtnActive : ''}`}
                                        onClick={() => update('fontFamily', key)}
                                        aria-pressed={settings.fontFamily === key}
                                        aria-label={`Police ${label}`}
                                        style={{
                                            fontFamily:
                                                key === 'dyslexic' ? '"OpenDyslexic", cursive' :
                                                    key === 'readable' ? 'Verdana' :
                                                        key === 'mono' ? 'monospace' :
                                                            'inherit'
                                        }}
                                    >
                                        <span className={styles.fontPreview}>{preview}</span>
                                        <span className={styles.fontLabel}>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Espacement des lettres */}
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Espacement des lettres</h3>
                            <div className={styles.sliderRow}>
                                <span className={styles.sliderLabel}>Compact</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="0.2"
                                    step="0.05"
                                    value={settings.letterSpacing}
                                    onChange={(e) => update('letterSpacing', parseFloat(e.target.value))}
                                    className={styles.slider}
                                    aria-label="Espacement des lettres"
                                    aria-valuemin={0}
                                    aria-valuemax={0.2}
                                    aria-valuenow={settings.letterSpacing}
                                />
                                <span className={styles.sliderLabel}>Aéré</span>
                            </div>
                        </section>

                    </div>

                    {/* Reset */}
                    <button className={styles.resetBtn} onClick={reset}>
                        Réinitialiser les paramètres
                    </button>

                </div>
            )}
        </>
    );
}