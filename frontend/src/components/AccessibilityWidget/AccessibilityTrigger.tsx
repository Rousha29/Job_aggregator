import useUIStore from '../../store/uiStore';
import AccessibilityWidget from './AccessibilityWidget';
import styles from './AccessibilityWidget.module.css';

interface AccessibilityTriggerProps {
  className?: string;
}

export default function AccessibilityTrigger({ className }: AccessibilityTriggerProps) {
  const { toggleAccessibility, isAccessibilityOpen } = useUIStore();

  return (
    <div style={{ position: 'relative' }} data-a11y-ignore>
      <button
        className={`${styles.headerTrigger} ${className || ''}`}
        onClick={toggleAccessibility}
        aria-label="Accessibilité"
        aria-expanded={isAccessibilityOpen}
        title="Accessibilité"
        data-a11y-ignore
      >
        <svg data-a11y-ignore viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle data-a11y-ignore cx="12" cy="12" r="10" />
          <path data-a11y-ignore d="M12 8h.01M11 12h1v4h1" />
        </svg>
      </button>
      <AccessibilityWidget />
    </div>
  );
}
