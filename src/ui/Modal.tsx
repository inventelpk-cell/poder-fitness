import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="modal-back" onClick={onClose}>
      <div className="modal stack" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <h2 className="screen-title">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
