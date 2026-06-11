"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { OPTIONS_MAP, DIET_OPTIONS, ALLERGY_OPTIONS, GOAL_OPTIONS, CUISINE_OPTIONS } from "@/lib/question";

// ─── Particle dot ─────────────────────────────────────────────────────────────
function Particle({ style }) {
  return <span style={{ position:"fixed", borderRadius:"50%", pointerEvents:"none", ...style }} />;
}

// ─── Option card ──────────────────────────────────────────────────────────────
function OptionCard({ type, name, value, label, selected, onChange }) {
  const active = type === "checkbox" ? selected.includes(value) : selected === value;

  return (
    <label style={{
      position:"relative",
      display:"flex", alignItems:"center", minHeight: "clamp(30px, 4vw, 35px)",
      gap:3, padding:"  8px",
      borderRadius:"1rem", cursor:"pointer", userSelect:"none",
      transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s, border-color 0.2s, background 0.2s",
      transform: active ? "translateY(-3px)" : "translateY(0)",
      background: active
        ? "linear-gradient(145deg, rgba(74,222,128,0.20) 0%, rgba(22,163,74,0.11) 100%)"
        : "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
      border: active ? "1px solid rgba(74,222,128,0.60)" : "1px solid rgba(255,255,255,0.10)",
      boxShadow: active
        ? "0 0 0 3px rgba(74,222,128,0.10), 0 8px 24px rgba(74,222,128,0.20)"
        : "0 2px 10px rgba(0,0,0,0.30)",
      backdropFilter:"blur(14px) saturate(150%)",
      WebkitBackdropFilter:"blur(14px) saturate(150%)",
      overflow:"hidden",
    }}>
      {active && (
        <span style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          backgroundSize:"200% 100%",
          animation:"shimmer 2.2s linear infinite",
        }} />
      )}
      {active && (
        <span style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          width:"60%", height:1, borderRadius:9999,
          background:"linear-gradient(90deg, transparent, rgba(74,222,128,0.8), transparent)",
        }} />
      )}

      <input type={type} name={name} value={value} checked={active}
        onChange={onChange} style={{ display:"none" }} />

      {/* Custom Checkbox UI */}
      <div style={{
        width: 14, height: 14, borderRadius: 6,
        border: active ? "2px solid #4ade80" : "2px solid rgba(255,255,255,0.2)",
        background: active ? "#4ade80" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.25s ease",
        flexShrink: 0, scale: active ? "1" : "0.9"
      }}>
        {active && (
          <span style={{ 
            color: "#000", fontSize: 11, fontWeight: 900,
            animation: "dotPop 0.2s ease-out"
          }}>✓</span>
        )}
      </div>

      <span style={{
         fontSize:"clamp(10.5px, 2.5vw, 14px)", fontWeight:700,
        textAlign:"left", lineHeight:1.3, letterSpacing:"0.02em",
        textTransform:"capitalize",
        color: active ? "#fff" : "rgba(255,255,255,1)",
        transition:"color 0.2s",
      }}>
        {label.replace(/-/g," ")}
      </span>
    </label>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function Section({ step, title, subtitle, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{
          width:14, height:14, borderRadius:8, flexShrink:0,
          background:"linear-gradient(135deg,#16a34a,#4ade80)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, fontWeight:900, color:"#000",
         
          boxShadow:"0 3px 10px rgba(74,222,128,0.35)",
        }}>{step}</span>
        <div>
          <p style={{ fontWeight:800, fontSize:"clamp(10px, 2vw, 15px)", color:"#fff", lineHeight:1.1, letterSpacing:"0.01em" }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontSize:"clamp(8px, 2vw, 10px)", color:"rgba(255,255,255,0.30)", marginTop:2, letterSpacing:"0.03em" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Preferences() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // State for form inputs
  const [diet,      setDiet]      = useState("");
  const [allergies, setAllergies] = useState([]);
  const [goals,     setGoals]     = useState([]);
  const [cuisine,   setCuisine]   = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState({ show: false, message: "", type: "success" });

  const getAuthHeaders = useCallback(async (extra = {}) => {
    const token = await getToken();
    return {
      ...extra,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
      return;
    }

    if (!isLoaded || !isSignedIn) return;

    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/me', {
          signal: controller.signal,
          credentials: 'include',
          headers: await getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Unable to fetch profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [isLoaded, isSignedIn, router, getAuthHeaders]);

  useEffect(() => {
    if (!profile) return;

    // If profile is already complete, redirect to home
    if (profile?.profileComplete === true) {
      router.push("/");
      return;
    }

    if (!profile?.questionnaire) return;
    const q = profile.questionnaire;
    const getAns = (id) => q.find(p => p.questionId === id)?.answer;

    setDiet(getAns("dietType")?.[0] || "");
    setAllergies(getAns("allergies") || []);
    setGoals(getAns("healthGoals") || getAns("weightGoal") || []);
    setCuisine(getAns("cuisine") || []);
  }, [profile, router]);

  const toggle = (setter) => (e) => {
    const v = e.target.value;
    setter(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  };

  // Auto-hide toast logic
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Use OPTIONS_MAP as the primary source for consistency with other components
  const allergyList = OPTIONS_MAP?.allergies || ALLERGY_OPTIONS || [];
  const dietOpts = DIET_OPTIONS || OPTIONS_MAP?.dietType || [];
  const goalOpts = GOAL_OPTIONS || OPTIONS_MAP?.healthGoals || [];
  const cuisineOpts = CUISINE_OPTIONS || OPTIONS_MAP?.cuisine || [];

  const handleSave = async () => {
    if (!diet || !user?.id) return; // Ensure diet is selected and user ID exists

    setSaving(true);

    const preferencesData = [
      { questionId: "dietType", answer: [diet] },
      { questionId: "allergies", answer: allergies },
      { questionId: "healthGoals", answer: goals },
      { questionId: "cuisine", answer: cuisine },
      // Add other preference types here if needed
    ].filter(pref => pref.answer.length > 0); // Only send preferences that have answers

    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        credentials: 'include',
        headers: await getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        // Send profileComplete: true to indicate completion of the onboarding flow
        body: JSON.stringify({
          answers: preferencesData,
          profileComplete: true, // Explicitly mark profile as complete
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // The API should update profileComplete to true based on this action
        setToast({ show: true, message: "Preferences saved successfully! ✅", type: "success" });
        setTimeout(() => router.push("/"), 1500); // Redirect after short delay so they see success
      } else {
        setToast({ show: true, message: data.message || "Failed to save preferences.", type: "error" });
      }
    } catch (error) {
      setToast({ show: true, message: "A connection error occurred. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        credentials: 'include',
        headers: await getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          answers: [{ questionId: 'preferenceSkipped', answer: ['true'] }],
          profileComplete: false, // User skipped, so profile is not complete
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ show: true, message: 'Preferences skipped for now. You can update them anytime.', type: 'success' });
        // Redirect after short delay so user sees the message
        setTimeout(() => router.push('/'), 1500);
      } else {
        setToast({ show: true, message: data.message || 'Unable to skip preferences.', type: 'error' });
      }
    } catch (error) {
      setToast({ show: true, message: 'A connection error occurred. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const particles = [
    { width:6,  height:6,  top:"10%", left:"6%",  background:"rgba(251,146,60,0.55)",  animation:"floatA 7s ease-in-out infinite",       filter:"blur(1px)"   },
    { width:10, height:10, top:"75%", left:"5%",  background:"rgba(74,222,128,0.40)",  animation:"floatB 9s ease-in-out infinite 1s",    filter:"blur(1.5px)" },
    { width:5,  height:5,  top:"22%", left:"92%", background:"rgba(251,191,36,0.55)",  animation:"floatA 6s ease-in-out infinite 0.5s",  filter:"blur(1px)"   },
    { width:8,  height:8,  top:"82%", left:"90%", background:"rgba(248,113,113,0.40)", animation:"floatB 8s ease-in-out infinite 2s",    filter:"blur(1px)"   },
    { width:4,  height:4,  top:"50%", left:"2%",  background:"rgba(167,243,208,0.6)",  animation:"floatC 11s ease-in-out infinite 3s",   filter:"blur(0.5px)" },
    { width:7,  height:7,  top:"18%", left:"52%", background:"rgba(253,186,116,0.30)", animation:"floatC 13s ease-in-out infinite 1.5s", filter:"blur(2px)"   },
    { width:3,  height:3,  top:"62%", left:"72%", background:"rgba(110,231,183,0.70)", animation:"floatA 5s ease-in-out infinite 4s",    filter:"blur(0.5px)" },
  ];

  const canSave = diet !== "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,900&family=Syne:wght@700;800;900&family=Noto+Color+Emoji&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes floatA {
          0%,100%{ transform:translateY(0) translateX(0); }
          33%    { transform:translateY(-18px) translateX(8px); }
          66%    { transform:translateY(10px) translateX(-6px); }
        }
        @keyframes floatB {
          0%,100%{ transform:translateY(0) scale(1); }
          50%    { transform:translateY(-22px) scale(1.15); }
        }
        @keyframes floatC {
          0%,100%{ transform:translateY(0) translateX(0) rotate(0deg); }
          25%    { transform:translateY(-12px) translateX(10px) rotate(90deg); }
          75%    { transform:translateY(15px) translateX(-8px) rotate(-60deg); }
        }
        @keyframes cardIn {
          from{ opacity:0; transform:translateY(30px) scale(0.97); }
          to  { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%  { background-position:-200% 0; }
          100%{ background-position:200% 0; }
        }
        @keyframes dotPop {
          0%  { transform:scale(0); opacity:0; }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes spinBtn { to{ transform:rotate(360deg); } }
        @keyframes shimmerBtn {
          0%  { background-position:-200% 0; }
          100%{ background-position:200% 0; }
        }

        .pref-card-in { animation: cardIn 0.65s cubic-bezier(0.22,1,0.36,1) both; }

        .save-btn {
          padding:13px; border-radius:16px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-weight:800; font-size:13px;
          letter-spacing:0.06em; color:#000;
          background:linear-gradient(90deg,#22c55e 0%,#4ade80 40%,#bbf7d0 55%,#4ade80 70%,#16a34a 100%);
          background-size:200% 100%;
          box-shadow:0 8px 28px rgba(34,197,94,0.35),0 2px 8px rgba(0,0,0,0.4);
          transition:transform 0.2s, box-shadow 0.2s;
          animation: shimmerBtn 2.8s linear infinite;
        }
        .save-btn:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 12px 36px rgba(34,197,94,0.45); }
        .save-btn:active{ transform:scale(0.97); }
        .save-btn:disabled{
          opacity:0.35; cursor:not-allowed; animation:none;
          background:#14532d; color:rgba(255,255,255,0.60);
        }

        .skip-btn {
          flex: 1; padding: 13px 0; font-size: 12px; font-weight: 700;
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.55);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.02em;
          cursor: pointer;
        }
        .skip-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .skip-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .skip-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* ── Root container ── */}
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        isolation: "isolate",
        overflowX: "hidden",
        padding: "0 12px",
      }}>

        {/* ── Toast Notification ── */}
        {toast.show && (
          <div style={{
            position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, pointerEvents: "none", animation: "cardIn 0.4s ease-out"
          }}>
            <div style={{
              padding: "12px 24px", borderRadius: "1.2rem", backdropFilter: "blur(20px)",
              background: toast.type === "success" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
              border: `1px solid ${toast.type === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)", color: "#fff", fontWeight: 700, fontSize: 14,
              display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap"
            }}>
              <span>{toast.type === "success" ? "✨" : "⚠️"}</span>
              {toast.message}
            </div>
          </div>
        )}

        {/* <div style={{
          position:"fixed", inset:0, zIndex:0,
          backgroundImage:"url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize:"cover",
          backgroundPosition:"center center",
          opacity:0.9,
          transform:"scale(1.05)",
        }} /> */}

        {/* Layer 1 – Cinematic Background Video */}
        {/* <video
          autoPlay={true}
          muted={true}
          loop={true}
          playsInline={true}
          preload="auto"
          src="/assets/img/video-bg-04.mp4"
          style={{
            position: "fixed", inset: 0, zIndex: 0,
            width: "100%", height: "100%", objectFit: "cover",
            opacity: 0.8, transform: "scale(1.05)",
            filter: "brightness(0.8) saturate(1.2)"
          }}
        /> */}

        {/* Layer 2 – blur and soft color overlay */}
        <div style={{
          position:"fixed", inset:0, zIndex:1,
          background:"rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(0px)",
        }} />

        {/* Layer 3 – colour blooms */}
        <div style={{
          position:"fixed", inset:0, zIndex:2, pointerEvents:"none",
          background:`
            radial-gradient(ellipse 55% 48% at 0% 100%, rgba(234,88,12,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 42% at 100% 0%,  rgba(22,163,74,0.16) 0%, transparent 60%)
          `,
        }} />

        {/* Layer 4 – particles */}
        {particles.map((p, i) => <Particle key={i} style={{ zIndex:3, ...p }} />)}

        {/* ── Glass card ── */}
        <div
          className="pref-card-in"
          style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: "min(95vw, 680px)",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: "2rem",
            padding: "clamp(20px, 4vw, 32px)",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.10)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {/* card top glow strip */}
          <div style={{
            position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
            width:"55%", height:1, borderRadius:9999,
            background:"linear-gradient(90deg,transparent,rgba(74,222,128,0.70),transparent)",
          }} />

          {/* ── Header ── */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontWeight: 900, fontSize: "clamp(22px, 4vw, 28px)",
              color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em",
              marginBottom: 6,
            }}>
              Your Kitchen,{" "}
              <span style={{
                backgroundImage: "linear-gradient(90deg,#4ade80,#bbf7d0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Your Rules.</span>
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>
              Personalise your experience — takes 30 seconds
            </p>
          </div>

          {!canSave && (
            <div style={{ 
              marginBottom: 20, padding: "10px 16px", borderRadius: "1rem",
              background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
              display: "flex", alignItems: "center", gap: 10, animation: "cardIn 0.4s ease-out"
            }}>
              <span style={{ fontSize: 14 }}>👋</span>
              <p style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, letterSpacing: "0.01em" }}>
                Pick a diet type (Step 1) to continue
              </p>
            </div>
          )}

          {/* ── Sections ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            <Section step="1" title="Diet Type" subtitle="Pick one that fits your lifestyle">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {dietOpts.map(o => (
                  <OptionCard key={o.value} type="radio" name="diet"
                    value={o.value} label={o.label}
                    selected={diet} onChange={e => setDiet(e.target.value)} />
                ))}
              </div>
            </Section>

            <Section step="2" title="Allergies & Restrictions" subtitle="Select any that apply to you">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                {allergyList.map(o => (
                  <OptionCard key={o.value} type="checkbox" name="allergies"
                    value={o.value} label={o.label}
                    selected={allergies} onChange={toggle(setAllergies)} />
                ))}
              </div>
            </Section>

            <Section step="3" title="Health Goals" subtitle="What are you working towards?">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {goalOpts.map(o => (
                  <OptionCard key={o.value} type="checkbox" name="goals"
                    value={o.value} label={o.label}
                    selected={goals} onChange={toggle(setGoals)} />
                ))}
              </div>
            </Section>

            <Section step="4" title="Favourite Cuisines" subtitle="We'll prioritise these for you">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                {cuisineOpts.map(o => (
                  <OptionCard key={o.value} type="checkbox" name="cuisine"
                    value={o.value} label={o.label}
                    selected={cuisine} onChange={toggle(setCuisine)} />
                ))}
              </div>
            </Section>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                {/* Save — primary, takes more space */}
                <button
                  className="save-btn"
                  disabled={!canSave || saving}
                  onClick={handleSave}
                  style={{ flex: 2, padding: "13px 0", fontSize: 13 }}
                >
                  {saving ? (
                    <span style={{
                      display: "inline-block", width: 15, height: 15,
                      border: "2.5px solid rgba(0,0,0,0.35)", borderTopColor: "#000",
                      borderRadius: "50%", animation: "spinBtn 0.7s linear infinite",
                    }} />
                  ) : "Save My Preferences →"}
                </button>

                {/* Skip — secondary, smaller */}
                <button
                  type="button" className="skip-btn"
                  disabled={saving} onClick={handleSkip}
                >
                  Skip for now
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}