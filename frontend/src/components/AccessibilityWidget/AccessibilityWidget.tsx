import { useState, useEffect } from 'react';
import styles from './AccessibilityWidget.module.css';
import useUIStore from '../../store/uiStore';

const DEFAULTS = {
    fontSize: 100,      
    fontFamily: 'default',
    letterSpacing: 0,   
};

type Settings = typeof DEFAULTS;

// Clé de sauvegarde dans le localStorage
const STORAGE_KEY = 'ja_accessibility';

export default function AccessibilityWidget() {
    const { isAccessibilityOpen, setAccessibilityOpen } = useUIStore();
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    });

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

    if (!isAccessibilityOpen) return null;

    return (
        <div
            className={styles.panel}
            role="dialog"
            aria-label="Options d'accessibilité"
            aria-modal="false"
            data-a11y-ignore
        >
            {/* Header */}
            <div className={styles.panelHeader} data-a11y-ignore>
                    <h2 className={styles.panelTitle} data-a11y-ignore>Accessibilité</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setAccessibilityOpen(false)}
                        aria-label="Fermer le panneau d'accessibilité"
                        data-a11y-ignore
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.sections} data-a11y-ignore>

                    {/* Taille du texte */}
                    <section className={styles.section} data-a11y-ignore>
                        <h3 className={styles.sectionTitle} data-a11y-ignore>Taille du texte</h3>
                        <div className={styles.fontSizeRow} data-a11y-ignore>
                            <button
                                className={styles.sizeBtn}
                                onClick={() => update('fontSize', Math.max(80, settings.fontSize - 10))}
                                aria-label="Réduire la taille du texte"
                                disabled={settings.fontSize <= 80}
                                data-a11y-ignore
                            >
                                A−
                            </button>
                            <span className={styles.sizeValue} data-a11y-ignore>{settings.fontSize}%</span>
                            <button
                                className={styles.sizeBtn}
                                onClick={() => update('fontSize', Math.min(200, settings.fontSize + 10))}
                                aria-label="Augmenter la taille du texte"
                                disabled={settings.fontSize >= 200}
                                data-a11y-ignore
                            >
                                A+
                            </button>
                        </div>
                    </section>

                    {/* Police */}
                    <section className={styles.section} data-a11y-ignore>
                        <h3 className={styles.sectionTitle} data-a11y-ignore>Police</h3>
                        <div className={styles.fontGrid} data-a11y-ignore>
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
                                    data-a11y-ignore
                                    style={{
                                        fontFamily:
                                            key === 'dyslexic' ? '"OpenDyslexic", cursive' :
                                                key === 'readable' ? 'Atkinson Hyperlegible, Verdana' :
                                                    key === 'mono' ? 'monospace' :
                                                        'inherit'
                                    }}
                                >
                                    <span className={styles.fontPreview} data-a11y-ignore style={{ fontFamily: 'inherit' }}>{preview}</span>
                                    <span className={styles.fontLabel} data-a11y-ignore style={{ fontFamily: 'inherit' }}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Espacement des lettres */}
                    <section className={styles.section} data-a11y-ignore>
                        <h3 className={styles.sectionTitle} data-a11y-ignore>Espacement des lettres</h3>
                        <div className={styles.sliderRow} data-a11y-ignore>
                            <span className={styles.sliderLabel} data-a11y-ignore>Compact</span>
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
                                data-a11y-ignore
                            />
                            <span className={styles.sliderLabel} data-a11y-ignore>Aéré</span>
                        </div>
                    </section>

                </div>

                {/* Reset */}
                <button className={styles.resetBtn} onClick={reset} data-a11y-ignore>
                    Réinitialiser les paramètres
                    </button>

                    </div>
                    );
                    }
