import React, { useEffect, useId, useRef, useState } from "react";
import "./effects.css";
import "./TransformationScreen.css";
import { rankEmblemSrc, rankLabel, rankUsesMythAura, resolveRank } from "./ranks";

export type TransformationScreenProps = {
  rankName: string;
  rankTitle: string;
  fromRank: string;
  toRank: string;
  onContinue?: () => void;
};

const FALLBACK_HEX = "64,12 109,38 109,90 64,116 19,90 19,38";

function FallbackEmblem() {
  return (
    <svg className="pf-tx__fallback" viewBox="0 0 128 128" aria-hidden="true">
      <polygon points={FALLBACK_HEX} fill="#090b10" stroke="currentColor" strokeWidth="4" />
      <polygon points="64,34 40,78 52,78 64,58 76,78 88,78" fill="currentColor" />
    </svg>
  );
}

export function TransformationScreen({
  rankName,
  rankTitle,
  fromRank,
  toRank,
  onContinue,
}: TransformationScreenProps) {
  const titleId = useId();
  const descId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [emblemFailed, setEmblemFailed] = useState(false);
  const destination = resolveRank(toRank);
  const myth = destination ? rankUsesMythAura(destination.id) : false;
  const fromName = rankLabel(fromRank);
  const toName = rankLabel(toRank);
  const style = {
    "--pf-tx-accent": destination?.accent ?? "var(--pf-color-orange)",
    "--pf-tx-accent-2": destination?.secondary ?? "var(--pf-color-blue)",
  } as React.CSSProperties;

  useEffect(() => {
    setEmblemFailed(false);
  }, [toRank]);

  useEffect(() => {
    if (onContinue) {
      buttonRef.current?.focus();
    }
  }, [onContinue]);

  return (
    <section
      className={myth ? "pf-tx pf-tx--myth" : "pf-tx"}
      style={style}
      role={onContinue ? "dialog" : "status"}
      aria-modal={onContinue ? true : undefined}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="pf-tx__bg" aria-hidden="true">
        <div className="pf-tx__grid pf-layer-grid" />
        <div className={myth ? "pf-tx__aura pf-layer-aura pf-layer-aura-myth" : "pf-tx__aura pf-layer-aura"} />
        <div className="pf-tx__speed pf-layer-speed" />
        <div className="pf-tx__vignette pf-layer-vignette" />
        <div className="pf-tx__frame pf-layer-impact" />
      </div>
      <div className="pf-tx__content">
        <p className="pf-kicker">Arco desbloqueado</p>
        <div className="pf-tx__stage">
          <div className="pf-tx__ring" />
          <img className="pf-tx__from" src={rankEmblemSrc(fromRank)} alt="" />
          {emblemFailed ? (
            <FallbackEmblem />
          ) : (
            <img
              key={toRank}
              className="pf-tx__emblem"
              src={rankEmblemSrc(toRank)}
              alt=""
              onError={() => setEmblemFailed(true)}
            />
          )}
          <div className="pf-tx__flash" />
        </div>
        <h1 id={titleId} className="pf-tx__name">
          {rankName}
        </h1>
        <p id={descId} className="pf-tx__title">
          {rankTitle}
        </p>
        <p className="pf-tx__bridge" aria-label={`De ${fromName} a ${toName}`}>
          <span aria-hidden="true">{fromName}</span>
          <span className="pf-tx__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M4 12 H16 M11 6 L18 12 L11 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span aria-hidden="true">{toName}</span>
        </p>
        {onContinue ? (
          <button ref={buttonRef} type="button" className="pf-tx__continue" onClick={onContinue}>
            Continuar
          </button>
        ) : null}
      </div>
    </section>
  );
}
