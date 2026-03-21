import React, { useCallback, useRef } from "react";
import "./Playground.css";
import ActionButton from "../components/actionButton";
import { useNavigate } from "react-router-dom";

function HelpIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.5 4.5H22.5C23.3284 4.5 24 5.17157 24 6V22C24 22.8284 23.3284 23.5 22.5 23.5H5.5C4.67157 23.5 4 22.8284 4 22V6C4 5.17157 4.67157 4.5 5.5 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M14 18.5V18.6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M11.8 10.8C11.8 9.1 13.1 8 14.9 8C16.5 8 17.8 9 17.8 10.5C17.8 12.1 16.7 12.8 15.7 13.4C14.8 13.9 14.3 14.4 14.3 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14 1.03418C6.84032 1.03418 1.03415 6.83652 1.03415 14C1.03415 21.1597 6.84032 26.9659 14 26.9659C21.1635 26.9659 26.9659 21.1597 26.9659 14C26.9661 6.83652 21.1641 1.03418 14.0006 1.03418H14ZM14 22.7921C9.1501 22.7921 5.2079 18.8497 5.2079 14C5.2079 9.15423 9.15032 5.20793 14 5.20793C18.8497 5.20793 22.7921 9.1544 22.7921 14C22.7921 18.8499 18.8497 22.7921 14 22.7921Z"
        fill="currentColor"
      />
      <path
        d="M18.019 15.2229L13.265 18.6449C12.27 19.3612 10.8818 18.65 10.8818 17.4241V10.5799C10.8818 9.35393 12.27 8.64277 13.265 9.35907L18.019 12.7811C18.853 13.3816 18.853 14.6227 18.019 15.223V15.2229Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Playground() {
  const navigate = useNavigate();
  const audioContextRef = useRef(null);

  const getAudioContext = useCallback(async () => {
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.error("Could not resume audio context:", err);
      }
    }

    return audioContextRef.current;
  }, []);

  const playClickSound = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }, [getAudioContext]);

  const handleNavigate = async (path) => {
    await playClickSound();
    setTimeout(() => navigate(path), 90);
  };

  return (
    <div className="start-page">
      <main className="start-page-box">
        <div className="header-section">
          <h1 className="title-section">Search Game</h1>
          <h2 className="undertitle-section">
            Work together. Translate. <br /> Complete tasks fast.
          </h2>
        </div>

        <div className="button-section">
          <ActionButton
            text="How to play"
            variant="light"
            icon={<HelpIcon />}
            onClick={() => handleNavigate("/guide")}
          />

          <ActionButton
            text="Start Game"
            variant="dark"
            icon={<PlayIcon />}
            onClick={() => handleNavigate("/game")}
          />
        </div>
      </main>
    </div>
  );
}

export default Playground;
