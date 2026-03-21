import React, { useCallback, useRef, useState } from "react";
import "./Guide.css";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/actionButton";

const slides = [
  {
    title: "Core Rules",
    rules: [
      {
        icon: (
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4"
              y="6"
              width="28"
              height="24"
              rx="2"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <line
              x1="9"
              y1="13"
              x2="27"
              y2="13"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="9"
              y1="18"
              x2="27"
              y2="18"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="9"
              y1="23"
              x2="20"
              y2="23"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
        text: "Work together to finish tasks fast.",
      },
      {
        icon: (
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="18" cy="12" r="4" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="9" cy="14" r="3" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="27" cy="14" r="3" stroke="#1a1a1a" strokeWidth="2" />
            <path
              d="M2 28c0-4 3-6 7-6"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M27 22c4 0 7 2 7 6"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 28c0-4.4 3.6-8 8-8s8 3.6 8 8"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
        text: "4–6 players; mixed Danish and Dutch students.",
      },
      {
        icon: (
          <span className="guide-flags">
            <span className="guide-flag">🇩🇰</span>
            <span className="guide-flag">🇳🇱</span>
          </span>
        ),
        text: "Tasks appear in Danish or Dutch.",
      },
      {
        icon: (
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="10" stroke="#1a1a1a" strokeWidth="2" />
            <path
              d="M12 16l3 3 5-5"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 24l6 6"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
        text: "All players must complete the task before the next one.",
      },
    ],
  },
  {
    title: "How to Play",
    rules: [
      {
        icon: <span style={{ fontSize: 32 }}>🗣️</span>,
        text: "Players must communicate clearly to understand each task.",
      },
      {
        icon: <span style={{ fontSize: 32 }}>🤝</span>,
        text: "If a task is unclear, teammates should help explain or translate it.",
      },
      {
        icon: <span style={{ fontSize: 32 }}>⏱️</span>,
        text: "Time is important – complete tasks as quickly as possible.",
      },
      {
        icon: <span style={{ fontSize: 32 }}>✋</span>,
        text: "Each task requires active participation from everyone in the group.",
      },
    ],
  },
  {
    title: "Ready?",
    rules: [
      {
        icon: <span style={{ fontSize: 32 }}>🚫</span>,
        text: "No player can move on without contributing to the task.",
      },
      {
        icon: <span style={{ fontSize: 32 }}>🏅</span>,
        text: "Teamwork and cooperation are key to success.",
      },
      {
        icon: <span style={{ fontSize: 32 }}>❌</span>,
        text: "Mistakes are allowed, but the group must correct them together.",
      },
      {
        icon: <span style={{ fontSize: 32 }}>🏆</span>,
        text: "The goal is to finish all tasks faster than other groups.",
      },
    ],
  },
];

function Guide() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("next");
  const [animating, setAnimating] = useState(false);
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
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }, [getAudioContext]);

  const playStartSound = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 600, delay: 0 },
      { freq: 760, delay: 0.1 },
      { freq: 980, delay: 0.2 },
    ];

    notes.forEach(({ freq, delay }) => {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    });
  }, [getAudioContext]);

  const goTo = async (index, dir) => {
    if (animating) return;

    await playClickSound();
    setDirection(dir);
    setAnimating(true);

    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const handleNext = async () => {
    if (current < slides.length - 1) {
      goTo(current + 1, "next");
    } else {
      await playStartSound();
      setTimeout(() => navigate("/game"), 260);
    }
  };

  const handleBack = async () => {
    if (current > 0) {
      goTo(current - 1, "back");
    } else {
      await playClickSound();
      setTimeout(() => navigate("/"), 90);
    }
  };

  const slide = slides[current];

  return (
    <div className="guide-page">
      <main className="guide-box">
        <div
          className={`guide-slide ${
            animating ? `slide-out-${direction}` : "slide-in"
          }`}
        >
          <h1 className="guide-title">{slide.title}</h1>

          <ul className="guide-rules">
            {slide.rules.map((rule, i) => (
              <li key={i} className="guide-rule">
                <span className="guide-icon">{rule.icon}</span>
                <span className="guide-text">{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="guide-footer">
          <div className="guide-buttons">
            <ActionButton
              text="Back"
              variant="light"
              icon={<span className="chevron"></span>}
              onClick={handleBack}
            />
            <ActionButton
              text={current === slides.length - 1 ? "Start Game" : "Next"}
              variant="dark"
              icon={<span className="chevron">›</span>}
              onClick={handleNext}
            />
          </div>

          <p className="guide-progress">
            Progress {current + 1}/{slides.length}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Guide;
