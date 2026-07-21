import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./LetterExperience.css";

type LetterStage = "envelope" | "opening" | "reading" | "closing";

type LetterExperienceProps = {
  open: boolean;
  title: string;
  highlight: string;
  paragraphs: string[];
  openEnvelopeLabel: string;
  closeLetterLabel: string;
  onClose: () => void;
};

const OPENING_MS = 1100;
const CLOSING_MS = 1000;

export default function LetterExperience({
  open,
  title,
  highlight,
  paragraphs,
  openEnvelopeLabel,
  closeLetterLabel,
  onClose,
}: LetterExperienceProps) {
  const [stage, setStage] = useState<LetterStage>("envelope");
  const [showCloseAction, setShowCloseAction] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const onCloseRef = useRef(onClose);
  const stageRef = useRef(stage);

  onCloseRef.current = onClose;
  stageRef.current = stage;

  const bodyParagraphs = [highlight, ...paragraphs].filter(Boolean);

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function resetLocalState() {
    clearTimers();
    setStage("envelope");
    setShowCloseAction(false);
  }

  function finishClose() {
    resetLocalState();
    onCloseRef.current();
  }

  function beginOpen() {
    if (stageRef.current !== "envelope") return;
    setStage("opening");
    const timer = window.setTimeout(() => {
      setStage("reading");
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      });
    }, OPENING_MS);
    timersRef.current.push(timer);
  }

  function beginClose() {
    if (stageRef.current !== "reading" && stageRef.current !== "opening") return;
    setShowCloseAction(false);
    setStage("closing");
    const timer = window.setTimeout(() => finishClose(), CLOSING_MS);
    timersRef.current.push(timer);
  }

  useEffect(() => {
    if (!open) {
      resetLocalState();
      return;
    }

    setStage("envelope");
    setShowCloseAction(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const current = stageRef.current;
      if (current === "reading") {
        beginClose();
        return;
      }
      if (current === "envelope") {
        finishClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (stage !== "reading") return;

    const timer = window.setTimeout(() => setShowCloseAction(true), 900);
    timersRef.current.push(timer);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => () => clearTimers(), []);

  if (!open) return null;

  return createPortal(
    <div
      className={`letter-experience is-${stage}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="letter-experience-backdrop"
        type="button"
        aria-label={closeLetterLabel}
        onClick={() => {
          if (stage === "envelope") finishClose();
          else if (stage === "reading") beginClose();
        }}
      />

      <div className="letter-experience-center">
        {(stage === "envelope" || stage === "opening" || stage === "closing") && (
          <div className="lex-envelope-scene">
            <div className="lex-envelope" data-stage={stage}>
              <div className="lex-envelope-shadow" />
              <div className="lex-envelope-back" />
              <div className="lex-mini-paper" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="lex-envelope-pocket" />
              <div className="lex-envelope-flap" />
            </div>

            {stage === "envelope" && (
              <div className="lex-envelope-copy">
                <p className="lex-envelope-title">{title}</p>
                <button className="lex-open-button" type="button" onClick={beginOpen}>
                  {openEnvelopeLabel}
                </button>
              </div>
            )}
          </div>
        )}

        {(stage === "opening" || stage === "reading" || stage === "closing") && (
          <div className="lex-paper-scene">
            <article className="lex-paper">
              <header className="lex-paper-header">
                <p>{title}</p>
              </header>

              <div className="lex-paper-scroll" ref={scrollRef}>
                <div className="lex-paper-body">
                  {bodyParagraphs.map((paragraph, index) => (
                    <p
                      key={`${index}-${paragraph.slice(0, 24)}`}
                      className={index === 0 ? "lex-highlight" : undefined}
                      style={{ animationDelay: `${Math.min(index, 6) * 90}ms` }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <footer className={`lex-paper-footer${showCloseAction ? " is-visible" : ""}`}>
                  <button className="lex-close-button" type="button" onClick={beginClose}>
                    {closeLetterLabel}
                  </button>
                </footer>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
