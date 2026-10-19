"use client";

import { FC, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, X, Copy, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./scratch-card-modal.module.scss";

export const ScratchCardModal: FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isScratchTriggered = searchParams.get("scratch") === "true";
  const promoCode = searchParams.get("code") || "DIRECT20";
  const rewardText = searchParams.get("reward") || "Flat 20% OFF Your Order";

  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (isScratchTriggered) {
      setIsOpen(true);
    }
  }, [isScratchTriggered]);

  // Initialize Canvas Foil
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = 320);
    const height = (canvas.height = 170);

    // Golden / Holographic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#d97706");
    gradient.addColorStop(0.3, "#fef08a");
    gradient.addColorStop(0.6, "#f59e0b");
    gradient.addColorStop(1, "#b45309");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative sparkles / text overlay on foil
    ctx.fillStyle = "#78350f";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ SCRATCH HERE TO UNLOCK ✨", width / 2, height / 2 - 8);

    ctx.font = "12px sans-serif";
    ctx.fillText("Swipe finger or cursor to reveal secret reward", width / 2, height / 2 + 16);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Delay slightly for modal layout mount
      const t = setTimeout(initCanvas, 100);
      return () => clearTimeout(t);
    }
  }, [isOpen, initCanvas]);

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
          transparentPixels++;
        }
      }

      const percentage = (transparentPixels / (pixels.length / 4)) * 100;
      if (percentage > 38 && !isRevealed) {
        setIsRevealed(true);
      }
    } catch {
      // fallback
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCopyAndApply = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }

    // Dismiss modal and clean search params
    setTimeout(() => {
      setIsOpen(false);
      router.replace("/");
    }, 800);
  };

  const handleClose = () => {
    setIsOpen(false);
    router.replace("/");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button
          type="button"
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className={styles.headerBadge}>
          <Sparkles size={14} />
          <span>Surprise Promo Unlocked</span>
        </div>

        <h3 className={styles.title}>Scratch &amp; Win Direct Deal!</h3>
        <p className={styles.subtitle}>
          You scanned our exclusive promotional flyer. Scratch below to reveal your secret order coupon!
        </p>

        {/* Scratch Area */}
        <div className={styles.scratchAreaWrapper}>
          <div className={styles.rewardUnderlay}>
            <span className={styles.rewardHeadline}>Secret Patron Reward</span>
            <span className={styles.rewardValue}>{rewardText}</span>
            <div className={styles.codeBox}>
              <span>{promoCode}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className={`${styles.scratchCanvas} ${isRevealed ? styles.canvasRevealed : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        <div className={styles.hintText}>
          {isRevealed ? (
            <span>🎉 Coupon unlocked! Apply below at checkout.</span>
          ) : (
            <span>👆 Swipe across the card above to reveal your deal</span>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="default"
            size="lg"
            className={styles.applyButton}
            onClick={isRevealed ? handleCopyAndApply : () => setIsRevealed(true)}
          >
            {isRevealed ? (
              copied ? (
                <>
                  <Check size={18} />
                  <span>Code Copied! Starting Order...</span>
                </>
              ) : (
                <>
                  <Gift size={18} />
                  <span>Apply &quot;{promoCode}&quot; to Order</span>
                </>
              )
            ) : (
              <>
                <Copy size={16} />
                <span>Reveal &amp; Copy Coupon</span>
              </>
            )}
          </Button>

          <button type="button" onClick={handleClose} className={styles.skipButton}>
            Skip &amp; explore menu without coupon
          </button>
        </div>
      </div>
    </div>
  );
};
