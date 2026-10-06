import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  labelledBy?: string;
  focusTitle?: boolean;
}

export function Dialog({ title, children, onClose, focusTitle = false }: DialogProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    if (focusTitle) titleRef.current?.focus();
    else {
      const first = root.querySelector<HTMLElement>('button, [href], input, select, textarea');
      (first ?? titleRef.current)?.focus();
    }
    function focusable(): HTMLElement[] {
      return [...root!.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
        (element) => !element.hasAttribute('disabled'),
      );
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [focusTitle, onClose]);

  return (
    <div className="backdrop">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={ref}>
        <h2 id="dialog-title" tabIndex={-1} ref={titleRef}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
