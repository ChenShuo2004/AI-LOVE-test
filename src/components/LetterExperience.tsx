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
const WRITE_INTERVAL_MS = 1250;

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
  const [visibleCount, setVisibleCount] = useState(0);
  const [showCloseAction, setShowCloseAction] = useState(false);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);
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
    setVisibleCount(0);
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
      setVisibleCount(1);
      requestAnimationFrame(() => {
        paperRef.current?.scrollTo({ top: 0, behavior: "auto" });
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
    setVisibleCount(0);
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

    const nodes = paragraphRefs.current.filter(Boolean) as HTMLParagraphElement[];
    if (!nodes.length) return;

    const revealFromScroll = () => {
      const root = paperRef.current;
      if (!root || root.scrollTop < 24) return;
      const rootRect = root.getBoundingClientRect();
      let farthest = 0;
      nodes.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const visible =
          rect.top < rootRect.bottom - rootRect.height * 0.08 &&
          rect.bottom > rootRect.top + 40;
        if (visible) farthest = Math.max(farthest, index + 1);
      });
      if (farthest > 0) {
        setVisibleCount((current) => Math.max(current, farthest));
      }
    };

    const root = paperRef.current;
    root?.addEventListener("scroll", revealFromScroll, { passive: true });
    return () => root?.removeEventListener("scroll", revealFromScroll);
  }, [stage, bodyParagraphs.length]);

  useEffect(() => {
    if (stage !== "reading") return;
    if (visibleCount >= bodyParagraphs.length) return;

    const timer = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + 1, bodyParagraphs.length));
    }, WRITE_INTERVAL_MS);
    timersRef.current.push(timer);
    return () => window.clearTimeout(timer);
  }, [stage, visibleCount, bodyParagraphs.length]);

  useEffect(() => {
    if (stage !== "reading") return;
    if (visibleCount < bodyParagraphs.length) return;

    const timer = window.setTimeout(() => setShowCloseAction(true), 700);
    timersRef.current.push(timer);
    return () => window.clearTimeout(timer);
  }, [stage, visibleCount, bodyParagraphs.length]);

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
          <div className="lex-paper-scene" ref={paperRef}>
            <article className="lex-paper">
              <header className="lex-paper-header">
                <p>{title}</p>
              </header>

              <div className="lex-paper-body">
                {bodyParagraphs.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 24)}`}
                    ref={(node) => {
                      paragraphRefs.current[index] = node;
                    }}
                    data-index={index}
                    className={index === 0 ? "lex-highlight" : undefined}
                    data-visible={
                      stage === "reading" && index < visibleCount
                        ? "true"
                        : stage === "opening" && index === 0
                          ? "true"
                          : "false"
                    }
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
            </article>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
