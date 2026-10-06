import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { usePoder } from '../state/store'
import { Modal } from '../ui/Modal'

export function DataScreen() {
  const poder = usePoder()
  const navigate = useNavigate()
  const [phrase, setPhrase] = useState('')
  const [pending, setPending] = useState<unknown>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <section className="stack">
      <h1 className="screen-title">Datos</h1>
      <p>La copia se queda en este navegador. Exporta el JSON antes de cambiar de aparato.</p>
      <button className="btn primary" type="button" onClick={() => { void poder.exportJson() }}>Exportar</button>
      <button className="btn ghost" type="button" onClick={() => fileRef.current?.click()}>Importar</button>
      <input
        ref={fileRef}
        className="sr"
        type="file"
        accept="application/json"
        aria-label="Archivo de copia"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          void file.text().then((text) => {
            try {
              setPending(JSON.parse(text) as unknown)
              setError('')
            } catch {
              setError('Este archivo no es una copia de Poder Fitness')
            }
          })
        }}
      />
      {error ? <p role="alert">{error}</p> : null}
      <label htmlFor="borrar">Escribe BORRAR para vaciar este navegador
        <input id="borrar" className="field" value={phrase} onChange={(event) => setPhrase(event.target.value)} />
      </label>
      <button className="btn danger" type="button" disabled={phrase !== 'BORRAR'} onClick={() => { void poder.wipe() }}>Borrar</button>
      {pending ? (
        <Modal title="Importar" onClose={() => setPending(null)}>
          <p>Esto sustituye lo que hay en este navegador</p>
          <div className="split">
            <button className="btn ghost" type="button" onClick={() => setPending(null)}>Cancelar</button>
            <button className="btn primary" type="button" onClick={() => {
              void poder.importJson(pending).then((ok) => {
                if (ok) navigate('/')
                else setError('Este archivo no es una copia de Poder Fitness')
                setPending(null)
              })
            }}>Sustituir</button>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
