import { useState, useRef, useEffect } from 'react';
import styles from './FilterPanel.module.css';

export interface Filters {
  contractTypes: string[];
  remote: string[];
  salaryMin: number | null;
}

interface FilterPanelProps {
  onFiltersChange: (filters: Filters) => void;
}

const CONTRACT_OPTIONS = [
  { value: 'permanent', label: 'CDI' },
  { value: 'internship', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
  // { value: 'freelance', label: 'Freelance' },
];

const REMOTE_OPTIONS = [
  { value: 'remote', label: 'Full remote' },  
  { value: 'hybrid', label: 'Hybride' },
  { value: 'onsite', label: 'Présentiel' },
];

const SALARY_OPTIONS = [
  { value: 30, label: '30k+' },
  { value: 40, label: '40k+' },
  { value: 50, label: '50k+' },
  { value: 60, label: '60k+' },
];

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [remote, setRemote] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeCount = contractTypes.length + remote.length + (salaryMin ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleContract = (value: string) => {
    const updated = contractTypes.includes(value)
      ? contractTypes.filter((v) => v !== value)
      : [...contractTypes, value];
    setContractTypes(updated);
    onFiltersChange({ contractTypes: updated, remote, salaryMin });
  };

  const toggleRemote = (value: string) => {
    const updated = remote.includes(value)
      ? remote.filter((v) => v !== value)
      : [...remote, value];
    setRemote(updated);
    onFiltersChange({ contractTypes, remote: updated, salaryMin });
  };

  const selectSalary = (value: number) => {
    const updated = salaryMin === value ? null : value;
    setSalaryMin(updated);
    onFiltersChange({ contractTypes, remote, salaryMin: updated });
  };

  const reset = () => {
    setContractTypes([]);
    setRemote([]);
    setSalaryMin(null);
    onFiltersChange({ contractTypes: [], remote: [], salaryMin: null });
  };

  return (
    <div className={styles.wrapper} ref={panelRef}>
      <button
        className={`${styles.trigger} ${open ? styles.triggerActive : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Filtres"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Filtres</span>
            {activeCount > 0 && (
              <button className={styles.resetBtn} onClick={reset}>
                Réinitialiser
              </button>
            )}
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Type de contrat</p>
            <div className={styles.options}>
              {CONTRACT_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={contractTypes.includes(opt.value)}
                    onChange={() => toggleContract(opt.value)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionLabel}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Télétravail</p>
            <div className={styles.options}>
              {REMOTE_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={remote.includes(opt.value)}
                    onChange={() => toggleRemote(opt.value)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionLabel}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Salaire minimum</p>
            <div className={styles.options}>
              {SALARY_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.option}>
                  <input
                    type="radio"
                    name="salary"
                    checked={salaryMin === opt.value}
                    onChange={() => selectSalary(opt.value)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionLabel}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}