import React, { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

type Phase = "appear" | "shake" | "flash" | "open";

export function PokeballReveal({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("appear");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase("shake"), 400));
    timers.push(setTimeout(() => setPhase("flash"), 1600));
    timers.push(setTimeout(() => setPhase("open"), 2000));
    timers.push(setTimeout(() => onComplete(), 2800));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{
        background:
          phase === "flash"
            ? "rgba(255,255,255,0.95)"
            : "rgba(0,0,0,0.85)",
        transition: "background 0.2s ease",
        backdropFilter: "blur(6px)",
      }}
    >
      <style>{`
        @keyframes pb-appear {
          0%   { opacity: 0; transform: scale(0.1) rotate(-90deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes pb-shake {
          0%   { transform: rotate(0deg)    scale(1); }
          10%  { transform: rotate(-15deg)  scale(1.05); }
          20%  { transform: rotate(15deg)   scale(1.05); }
          30%  { transform: rotate(-10deg)  scale(1.05); }
          40%  { transform: rotate(10deg)   scale(1.05); }
          50%  { transform: rotate(-8deg)   scale(1); }
          60%  { transform: rotate(8deg)    scale(1); }
          70%  { transform: rotate(-4deg)   scale(1); }
          80%  { transform: rotate(4deg)    scale(1); }
          90%  { transform: rotate(-2deg)   scale(1.02); }
          100% { transform: rotate(0deg)    scale(1); }
        }
        @keyframes pb-flash {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes pb-top-open {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-140vh); }
        }
        @keyframes pb-bottom-open {
          0%   { transform: translateY(0); }
          100% { transform: translateY(140vh); }
        }
        @keyframes pb-glow {
          0%   { box-shadow: 0 0 0px rgba(255,255,255,0); }
          50%  { box-shadow: 0 0 80px 40px rgba(255,255,255,0.8); }
          100% { box-shadow: 0 0 0px rgba(255,255,255,0); }
        }
      `}</style>

      {/* Pokéball container */}
      {phase !== "open" && (
        <div
          style={{
            width: 160,
            height: 160,
            position: "relative",
            animation:
              phase === "appear"
                ? "pb-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : phase === "shake"
                  ? "pb-shake 1.1s ease-in-out forwards, pb-glow 0.4s ease-in-out 0.9s forwards"
                  : phase === "flash"
                    ? "pb-flash 0.4s ease-out forwards"
                    : "none",
          }}
        >
          {/* Top half — red */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "50%",
              borderRadius: "80px 80px 0 0",
              background: "linear-gradient(135deg, #ff4b4b 0%, #cc0000 60%, #990000 100%)",
              overflow: "hidden",
            }}
          >
            {/* Shine */}
            <div
              style={{
                position: "absolute",
                top: "12%",
                left: "18%",
                width: "30%",
                height: "20%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                transform: "rotate(-30deg)",
              }}
            />
          </div>

          {/* Bottom half — white */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "50%",
              borderRadius: "0 0 80px 80px",
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
            }}
          />

          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "6px solid #1a1a1a",
              pointerEvents: "none",
            }}
          />

          {/* Center band */}
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 7px)",
              left: 0,
              width: "100%",
              height: 14,
              background: "#1a1a1a",
              zIndex: 10,
            }}
          />

          {/* Center button outer ring */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#1a1a1a",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }}
          />

          {/* Center button inner */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: phase === "flash" ? "#ffffff" : "#f0f0f0",
              border: "3px solid #666",
              transform: "translate(-50%, -50%)",
              zIndex: 30,
              transition: "background 0.1s",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}

      {/* Open phase — split halves fly off */}
      {phase === "open" && (
        <>
          {/* Top half flying up */}
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 80px)",
              left: "50%",
              width: 160,
              height: 80,
              marginLeft: -80,
              borderRadius: "80px 80px 0 0",
              background: "linear-gradient(135deg, #ff4b4b 0%, #cc0000 60%, #990000 100%)",
              border: "6px solid #1a1a1a",
              borderBottom: "none",
              animation: "pb-top-open 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              zIndex: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "18%",
                width: "30%",
                height: "35%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                transform: "rotate(-30deg)",
              }}
            />
          </div>

          {/* Bottom half flying down */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 160,
              height: 80,
              marginLeft: -80,
              borderRadius: "0 0 80px 80px",
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
              border: "6px solid #1a1a1a",
              borderTop: "none",
              animation: "pb-bottom-open 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              zIndex: 10,
            }}
          />

          {/* Center band stays briefly */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 160,
              height: 14,
              marginLeft: -80,
              marginTop: -7,
              background: "#1a1a1a",
              animation: "pb-flash 0.3s ease-out forwards",
              zIndex: 5,
            }}
          />

          {/* Light burst from center */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              transform: "translate(-50%, -50%)",
              animation: "pb-flash 0.6s ease-out forwards",
              boxShadow: "0 0 80px 60px rgba(255,255,255,0.9)",
              zIndex: 5,
            }}
          />
        </>
      )}
    </div>
  );
}
