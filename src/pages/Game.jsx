import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";

const tasks = [
  "Rør ved noget gult",
  "Find iemand met zwarte schoenen",
  "Rør ved en plante",
  "Raak iemand aan die een trui draagt",
  "Giv en lærer et high five",
  "Spring 10 gange",
  "Sta op een stoel",
  "Få et hårbånd",
  "Vind iemand met autosleutels",
  "Rør ved en mand, der er mindre end dig",
  "Raak iemand met een paardenstaart aan",
  "Rør ved en person med briller",
  "Vind een pen",
  "Rør ved et vindue",
  "Find iemand der er født i samme måned som dig",
  "Raak iets met vloeistof erin aan",
];

const PHASES = {
  NAME_1: "NAME_1",
  NAME_2: "NAME_2",
  RULES: "RULES",
  KEYS: "KEYS",
  COUNTDOWN: "COUNTDOWN",
  GAME: "GAME",
  FINISHED: "FINISHED",
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function RulesIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="6"
        y="5"
        width="24"
        height="26"
        rx="3"
        stroke="#1a1a1a"
        strokeWidth="2.4"
      />
      <line
        x1="11"
        y1="13"
        x2="25"
        y2="13"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="18"
        x2="25"
        y2="18"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="23"
        x2="20"
        y2="23"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="11" r="4" stroke="#1a1a1a" strokeWidth="2.4" />
      <circle cx="9" cy="14" r="3" stroke="#1a1a1a" strokeWidth="2.4" />
      <circle cx="27" cy="14" r="3" stroke="#1a1a1a" strokeWidth="2.4" />
      <path
        d="M11 28C11 23.5817 14.5817 20 19 20C23.4183 20 27 23.5817 27 28"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M2 28C2 24.6863 4.68629 22 8 22"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M28 22C31.3137 22 34 24.6863 34 28"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckSearchIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15" cy="15" r="9" stroke="#1a1a1a" strokeWidth="2.4" />
      <path
        d="M11.5 15.2L14.2 17.9L18.8 13.3"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 22L30 30"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const quickRules = [
  {
    icon: <RulesIcon />,
    text: "Work together to finish tasks fast.",
  },
  {
    icon: <PeopleIcon />,
    text: "4–6 players; mixed Danish and Dutch students.",
  },
  {
    icon: (
      <span className="flag-icons">
        <span className="flag-icon">🇩🇰</span>
        <span className="flag-icon">🇳🇱</span>
      </span>
    ),
    text: "Tasks appear in Danish or Dutch.",
  },
  {
    icon: <CheckSearchIcon />,
    text: "All players must complete the task before the next one.",
  },
];

export default function Game() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASES.NAME_1);
  const [group1, setGroup1] = useState("");
  const [group2, setGroup2] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [taskList, setTaskList] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [points1, setPoints1] = useState(0);
  const [points2, setPoints2] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [group1Done, setGroup1Done] = useState(false);
  const [group2Done, setGroup2Done] = useState(false);
  const [lastPoints1, setLastPoints1] = useState(null);
  const [lastPoints2, setLastPoints2] = useState(null);

  const timerRef = useRef(null);
  const taskStartRef = useRef(null);
  const time1Ref = useRef(null);
  const time2Ref = useRef(null);
  const audioContextRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (phase === PHASES.NAME_1 || phase === PHASES.NAME_2) {
      const timeout = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [phase]);

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

  const playTone = useCallback(
    async ({
      frequency = 440,
      duration = 0.15,
      type = "sine",
      volume = 0.04,
      delay = 0,
      fadeOut = 0.02,
    }) => {
      const ctx = await getAudioContext();
      if (!ctx) return;

      const startTime = ctx.currentTime + delay;
      const endTime = startTime + duration;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        Math.max(startTime + 0.02, endTime - fadeOut),
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(endTime);
    },
    [getAudioContext],
  );

  const playTypingSound = useCallback(() => {
    playTone({
      frequency: 520,
      duration: 0.045,
      type: "square",
      volume: 0.018,
      fadeOut: 0.012,
    });
  }, [playTone]);

  const playDeleteSound = useCallback(() => {
    playTone({
      frequency: 320,
      duration: 0.05,
      type: "triangle",
      volume: 0.018,
      fadeOut: 0.015,
    });
  }, [playTone]);

  const playSubmitNameSound = useCallback(() => {
    playTone({
      frequency: 700,
      duration: 0.08,
      type: "triangle",
      volume: 0.04,
      delay: 0,
    });
    playTone({
      frequency: 920,
      duration: 0.12,
      type: "triangle",
      volume: 0.045,
      delay: 0.08,
    });
  }, [playTone]);

  const playCountdownTick = useCallback(
    (number) => {
      const freqMap = {
        3: 520,
        2: 600,
        1: 680,
      };

      playTone({
        frequency: freqMap[number] || 560,
        duration: 0.12,
        type: "triangle",
        volume: 0.05,
      });
    },
    [playTone],
  );

  const playGoSound = useCallback(() => {
    playTone({
      frequency: 740,
      duration: 0.12,
      type: "square",
      volume: 0.05,
      delay: 0,
    });
    playTone({
      frequency: 980,
      duration: 0.2,
      type: "square",
      volume: 0.06,
      delay: 0.12,
    });
  }, [playTone]);

  const playGroupDoneSound = useCallback(
    (team) => {
      if (team === 1) {
        playTone({
          frequency: 660,
          duration: 0.14,
          type: "triangle",
          volume: 0.05,
        });
      } else {
        playTone({
          frequency: 820,
          duration: 0.14,
          type: "triangle",
          volume: 0.05,
        });
      }
    },
    [playTone],
  );

  const playRoundCompleteSound = useCallback(() => {
    playTone({
      frequency: 784,
      duration: 0.1,
      type: "sine",
      volume: 0.045,
      delay: 0,
    });
    playTone({
      frequency: 988,
      duration: 0.12,
      type: "sine",
      volume: 0.045,
      delay: 0.09,
    });
    playTone({
      frequency: 1174,
      duration: 0.16,
      type: "sine",
      volume: 0.05,
      delay: 0.18,
    });
  }, [playTone]);

  const playVictorySound = useCallback(() => {
    playTone({
      frequency: 523.25,
      duration: 0.12,
      type: "triangle",
      volume: 0.05,
      delay: 0,
    });
    playTone({
      frequency: 659.25,
      duration: 0.12,
      type: "triangle",
      volume: 0.05,
      delay: 0.12,
    });
    playTone({
      frequency: 783.99,
      duration: 0.16,
      type: "triangle",
      volume: 0.055,
      delay: 0.24,
    });
    playTone({
      frequency: 1046.5,
      duration: 0.28,
      type: "triangle",
      volume: 0.06,
      delay: 0.4,
    });
  }, [playTone]);

  const calculatePoints = useCallback((seconds) => {
    const safeSeconds = Math.max(0, seconds || 0);

    if (safeSeconds <= 2) return 1200;
    if (safeSeconds <= 3) return 1050;
    if (safeSeconds <= 4) return 900;
    if (safeSeconds <= 5) return 780;

    const rawPoints = 780 * Math.exp(-0.17 * (safeSeconds - 5)) + 40;
    return Math.max(40, Math.round(rawPoints));
  }, []);

  const submitGroupName = useCallback(
    (targetPhaseSetter) => {
      if (!inputVal.trim()) return;

      playSubmitNameSound();

      if (targetPhaseSetter === 1) {
        setGroup1(inputVal.trim());
        setInputVal("");
        setTimeout(() => setPhase(PHASES.NAME_2), 120);
      } else {
        setGroup2(inputVal.trim());
        setInputVal("");
        setTimeout(() => setPhase(PHASES.RULES), 120);
      }
    },
    [inputVal, playSubmitNameSound],
  );

  const handleNameBack = useCallback(
    (target) => {
      if (target === "home") {
        setInputVal("");
        navigate("/");
      }

      if (target === "group1") {
        setInputVal(group1);
        setPhase(PHASES.NAME_1);
      }
    },
    [group1, navigate],
  );

  const handleNameKeyDown = useCallback(
    (e, targetGroup) => {
      const isPrintableKey =
        e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

      if (e.key === "Enter") {
        e.preventDefault();
        if (inputVal.trim()) {
          submitGroupName(targetGroup);
        }
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        playDeleteSound();
        return;
      }

      if (e.key === " ") {
        playTypingSound();
        return;
      }

      if (isPrintableKey) {
        playTypingSound();
      }
    },
    [inputVal, playTypingSound, playDeleteSound, submitGroupName],
  );

  useEffect(() => {
    if (phase !== PHASES.COUNTDOWN) return;

    if (countdown === 0) {
      playGoSound();

      const timeout = setTimeout(() => {
        taskStartRef.current = Date.now();
        setPhase(PHASES.GAME);
      }, 400);

      return () => clearTimeout(timeout);
    }

    playCountdownTick(countdown);

    const timeout = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, countdown, playCountdownTick, playGoSound]);

  useEffect(() => {
    if (phase === PHASES.GAME) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASES.GAME) return;

    const handleKey = (e) => {
      const key = e.key.toLowerCase();

      if (key === "a" && !group1Done) {
        time1Ref.current = (Date.now() - taskStartRef.current) / 1000;
        setGroup1Done(true);
        playGroupDoneSound(1);
      }

      if (key === "l" && !group2Done) {
        time2Ref.current = (Date.now() - taskStartRef.current) / 1000;
        setGroup2Done(true);
        playGroupDoneSound(2);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, group1Done, group2Done, playGroupDoneSound]);

  useEffect(() => {
    if (!group1Done || !group2Done) return;

    playRoundCompleteSound();

    const p1 = calculatePoints(time1Ref.current);
    const p2 = calculatePoints(time2Ref.current);

    setLastPoints1(p1);
    setLastPoints2(p2);
    setPoints1((p) => p + p1);
    setPoints2((p) => p + p2);

    const timeout = setTimeout(() => {
      setLastPoints1(null);
      setLastPoints2(null);

      if (taskIndex + 1 >= taskList.length) {
        setPhase(PHASES.FINISHED);
      } else {
        setTaskIndex((i) => i + 1);
        setGroup1Done(false);
        setGroup2Done(false);
        taskStartRef.current = Date.now();
        time1Ref.current = null;
        time2Ref.current = null;
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [
    group1Done,
    group2Done,
    taskIndex,
    taskList.length,
    playRoundCompleteSound,
    calculatePoints,
  ]);

  useEffect(() => {
    if (phase === PHASES.FINISHED) {
      playVictorySound();
    }
  }, [phase, playVictorySound]);

  const startCountdown = async () => {
    await getAudioContext();

    setTaskList(shuffle(tasks));
    setPhase(PHASES.COUNTDOWN);
    setCountdown(3);
    setElapsed(0);
    setTaskIndex(0);
    setPoints1(0);
    setPoints2(0);
    setGroup1Done(false);
    setGroup2Done(false);
    setLastPoints1(null);
    setLastPoints2(null);
    time1Ref.current = null;
    time2Ref.current = null;
  };

  const endMatchNow = () => {
    clearInterval(timerRef.current);
    setLastPoints1(null);
    setLastPoints2(null);
    setPhase(PHASES.FINISHED);
  };

  const goToStartPage = () => {
    clearInterval(timerRef.current);
    navigate("/");
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (phase === PHASES.NAME_1) {
    return (
      <div className="game-page">
        <div className="game-box">
          <h1 className="game-title">Group 1</h1>
          <p className="game-sub">Enter your group name</p>

          <input
            ref={nameInputRef}
            className="game-input"
            placeholder="Group name..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => handleNameKeyDown(e, 1)}
            autoFocus
          />

          <div className="name-buttons">
            <button
              className="game-btn light"
              onClick={() => handleNameBack("home")}
            >
              Back
            </button>

            <button
              className="game-btn dark"
              disabled={!inputVal.trim()}
              onClick={() => submitGroupName(1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === PHASES.NAME_2) {
    return (
      <div className="game-page">
        <div className="game-box">
          <h1 className="game-title">Group 2</h1>
          <p className="game-sub">Enter your group name</p>

          <input
            ref={nameInputRef}
            className="game-input"
            placeholder="Group name..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => handleNameKeyDown(e, 2)}
            autoFocus
          />

          <div className="name-buttons">
            <button
              className="game-btn light"
              onClick={() => handleNameBack("group1")}
            >
              Back
            </button>

            <button
              className="game-btn dark"
              disabled={!inputVal.trim()}
              onClick={() => submitGroupName(2)}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === PHASES.RULES) {
    return (
      <div className="game-page">
        <div className="guide-box">
          <h1 className="guide-title">Core Rules</h1>

          <ul className="guide-rules">
            {quickRules.map((rule, index) => (
              <li key={index} className="guide-rule">
                <span className="guide-icon">{rule.icon}</span>
                <span className="guide-text">{rule.text}</span>
              </li>
            ))}
          </ul>

          <div className="guide-footer">
            <div className="guide-buttons">
              <button
                className="game-btn light"
                onClick={() => setPhase(PHASES.NAME_2)}
              >
                Back
              </button>

              <button
                className="game-btn dark"
                onClick={() => setPhase(PHASES.KEYS)}
              >
                Next <span className="chevron">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === PHASES.KEYS) {
    return (
      <div className="game-page">
        <div className="game-box">
          <h1 className="game-title">Your Keys</h1>
          <p className="game-sub">
            Press your key when your group has completed the task.
          </p>

          <div className="keys-display">
            <div className="key-block">
              <div className="big-key">A</div>
              <span className="key-label">{group1}</span>
            </div>

            <div className="key-divider">vs</div>

            <div className="key-block">
              <div className="big-key">L</div>
              <span className="key-label">{group2}</span>
            </div>
          </div>

          <button className="game-btn dark" onClick={startCountdown}>
            Let&apos;s Go ›
          </button>
        </div>
      </div>
    );
  }

  if (phase === PHASES.COUNTDOWN) {
    return (
      <div className="game-page">
        <div className="countdown-number">
          {countdown === 0 ? "GO!" : countdown}
        </div>
      </div>
    );
  }

  if (phase === PHASES.FINISHED) {
    const winner =
      points1 > points2 ? group1 : points2 > points1 ? group2 : null;

    return (
      <div className="game-page">
        <div className="game-box">
          <h1 className="game-title">🏆 Finished!</h1>
          <p className="game-sub">Total time: {formatTime(elapsed)}</p>

          {winner ? (
            <p className="winner-text">🎉 {winner} wins!</p>
          ) : (
            <p className="winner-text">🤝 It&apos;s a tie!</p>
          )}

          <div className="score-board">
            <div className={`score-card ${points1 > points2 ? "winner" : ""}`}>
              <span className="score-name">{group1}</span>
              <span className="score-pts">{points1} pts</span>
            </div>

            <div className={`score-card ${points2 > points1 ? "winner" : ""}`}>
              <span className="score-name">{group2}</span>
              <span className="score-pts">{points2} pts</span>
            </div>
          </div>

          <button className="game-btn dark" onClick={goToStartPage}>
            Back to Start
          </button>
        </div>
      </div>
    );
  }

  const task = taskList[taskIndex];

  return (
    <div className="game-page game-active">
      <div className="game-topbar">
        <div className="team-block">
          <span className="team-label">Team</span>
          <span className="team-name">{group1}</span>
          <span className="team-label">Points</span>
          <span className="team-pts">
            {points1}
            {lastPoints1 && <span className="pts-flash">+{lastPoints1}</span>}
          </span>
          <kbd className="key-hint">A</kbd>
        </div>

        <div className="game-timer">{formatTime(elapsed)}</div>

        <div className="team-block right">
          <span className="team-label">Team</span>
          <span className="team-name">{group2}</span>
          <span className="team-label">Points</span>
          <span className="team-pts">
            {points2}
            {lastPoints2 && <span className="pts-flash">+{lastPoints2}</span>}
          </span>
          <kbd className="key-hint">L</kbd>
        </div>
      </div>

      <div className="task-area">
        <p className="task-counter">
          Task {taskIndex + 1} / {taskList.length}
        </p>

        <h2 className="task-text">{task}</h2>

        <div className="done-indicators">
          <div className={`done-pill ${group1Done ? "done" : ""}`}>
            {group1}: {group1Done ? "✓ Done" : "Press A"}
          </div>

          <div className={`done-pill ${group2Done ? "done" : ""}`}>
            {group2}: {group2Done ? "✓ Done" : "Press L"}
          </div>
        </div>
      </div>

      <button className="end-match-btn" onClick={endMatchNow}>
        End Match
      </button>
    </div>
  );
}
