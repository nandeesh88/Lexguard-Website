import { useState, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RISK_CONFIG = {
  HIGH:   { color: "#c0392b", bg: "#c0392b12", label: "HIGH RISK",   icon: "▲", dot: "#c0392b" },
  MEDIUM: { color: "#d35400", bg: "#d3540012", label: "MED RISK",    icon: "◆", dot: "#d35400" },
  LOW:    { color: "#27ae60", bg: "#27ae6012", label: "LOW RISK",    icon: "●", dot: "#27ae60" },
};

const REC_CONFIG = {
  REJECT:    { color: "#c0392b", bg: "#c0392b18", label: "REJECT",    glyph: "✕" },
  NEGOTIATE: { color: "#d35400", bg: "#d3540018", label: "NEGOTIATE", glyph: "⇌" },
  ACCEPT:    { color: "#27ae60", bg: "#27ae6018", label: "ACCEPT",    glyph: "✓" },
};

const AGENT_STEPS = [
  { icon: "§", name: "Extractor",  desc: "Parsing clauses…",           color: "#8b7355" },
  { icon: "⚔", name: "Attacker",   desc: "Hunting hidden risks…",      color: "#c0392b" },
  { icon: "⛊", name: "Defender",   desc: "Building defence…",          color: "#27ae60" },
  { icon: "⌖", name: "Ambiguity",  desc: "Flagging vague language…",   color: "#8e44ad" },
  { icon: "⚖", name: "Judge",      desc: "Rendering verdict…",         color: "#c9a84c" },
];

export default function App() {
  const [screen, setScreen]         = useState("home");
  const [clauses, setClauses]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [activeClause, setActive]   = useState(null);
  const [inputMode, setInputMode]   = useState("file");
  const [pastedText, setPasted]     = useState("");
  const [error, setError]           = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [activeTab, setTab]         = useState("debate"); // debate | ambiguity | benchmark | scenario
  const fileRef = useRef();

  const analyze = async (formData, isText = false) => {
    setScreen("analyzing");
    setError("");
    try {
      const endpoint = isText ? `${API_BASE}/analyze-text` : `${API_BASE}/analyze`;
      const opts = isText
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: pastedText }) }
        : { method: "POST", body: formData };
      const res = await fetch(endpoint, opts);
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Analysis failed"); }
      const data = await res.json();
      setClauses(data.clauses || []);
      setSummary(data);
      setActive(null);
      setTab("debate");
      setScreen("results");
    } catch (e) { setError(e.message); setScreen("home"); }
  };

  const handleFile = (file) => {
    if (!file) return;
    const fd = new FormData(); fd.append("file", file); analyze(fd);
  };

  const overallCfg = summary ? RISK_CONFIG[summary.overall_risk_level] || RISK_CONFIG.MEDIUM : null;
  const ac = activeClause !== null ? clauses[activeClause] : null;

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.logo} onClick={() => setScreen("home")}>
          <span style={S.logoMark}>⚖</span>
          <div>
            <div style={S.logoName}>LEXGUARD</div>
            <div style={S.logoSub}>Adversarial Contract Intelligence</div>
          </div>
        </div>
        <div style={S.headerRight}>
          <span style={S.agentPill}>5 AI Agents</span>
          <span style={S.versionPill}>v2.0</span>
        </div>
      </header>

      {/* ══ HOME ══ */}
      {screen === "home" && (
        <main style={S.homeMain}>
          <div style={S.homeGrid}>

            {/* Left: Hero */}
            <div style={S.heroCol}>
              <div style={S.stamp}>LEGAL INTELLIGENCE</div>
              <h1 style={S.heroTitle}>
                Don't sign what<br/>
                <em style={S.heroItalic}>you don't understand.</em>
              </h1>
              <p style={S.heroPara}>
                Upload any contract, offer letter, NDA, or Terms of Service.
                Five adversarial AI agents dissect every clause — and tell you
                exactly what to reject, negotiate, or accept.
              </p>
              <div style={S.featureList}>
                {[
                  ["§", "Extracts all clauses automatically"],
                  ["⚔", "Attacks exploitative language"],
                  ["⛊", "Defends each clause fairly"],
                  ["⌖", "Flags ambiguity & vague terms"],
                  ["⚖", "Benchmark + scenario verdict"],
                ].map(([ic, txt]) => (
                  <div key={txt} style={S.featureRow}>
                    <span style={S.featureIcon}>{ic}</span>
                    <span style={S.featureTxt}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Upload */}
            <div style={S.uploadCol}>
              <div style={S.uploadCard}>
                <div style={S.uploadCardTitle}>ANALYZE A DOCUMENT</div>

                {/* Toggle */}
                <div style={S.toggleRow}>
                  {["file", "text"].map(m => (
                    <button
                      key={m}
                      style={inputMode === m ? S.toggleOn : S.toggleOff}
                      onClick={() => setInputMode(m)}
                    >
                      {m === "file" ? "📄 Upload File" : "📝 Paste Text"}
                    </button>
                  ))}
                </div>

                {inputMode === "file" ? (
                  <div
                    style={{ ...S.dropzone, ...(dragOver ? S.dropActive : {}) }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current.click()}
                  >
                    <div style={S.dropIconWrap}>
                      <span style={S.dropIcon}>📑</span>
                    </div>
                    <div style={S.dropTitle}>Drop document here</div>
                    <div style={S.dropFormats}>PDF · DOCX · TXT</div>
                    <div style={S.dropClick}>or click to browse</div>
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={e => handleFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div style={S.textWrap}>
                    <textarea
                      style={S.textarea}
                      placeholder="Paste contract text, offer letter, NDA, or ToS clause here…"
                      value={pastedText}
                      onChange={e => setPasted(e.target.value)}
                      rows={9}
                    />
                    <button
                      style={{ ...S.analyzeBtn, opacity: pastedText.length < 50 ? 0.5 : 1 }}
                      onClick={() => analyze(null, true)}
                      disabled={pastedText.length < 50}
                    >
                      Analyze Contract →
                    </button>
                  </div>
                )}
                {error && <div style={S.error}>⚠ {error}</div>}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ══ ANALYZING ══ */}
      {screen === "analyzing" && (
        <main style={S.centerMain}>
          <div style={S.loadingCard}>
            <div style={S.gavel}>⚖</div>
            <h2 style={S.loadingTitle}>Agents are deliberating…</h2>
            <p style={S.loadingSub}>This takes 20–40 seconds depending on document length</p>
            <div style={S.agentTrack}>
              {AGENT_STEPS.map((a, i) => (
                <div key={a.name} className="agent-step" style={{ animationDelay: `${i * 1.1}s`, ...S.agentStep }}>
                  <div style={{ ...S.agentStepIcon, color: a.color, borderColor: a.color + "44" }}>{a.icon}</div>
                  <div>
                    <div style={S.agentStepName}>{a.name}</div>
                    <div style={S.agentStepDesc}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ══ RESULTS ══ */}
      {screen === "results" && summary && (
        <main style={S.resultsMain}>

          {/* Summary Bar */}
          <div style={{ ...S.summaryBar, borderLeftColor: overallCfg.color }}>
            <div style={S.summaryLeft}>
              <div style={S.summaryFile}>{summary.document_name}</div>
              <div style={{ ...S.summaryRiskLabel, color: overallCfg.color }}>
                {overallCfg.icon} {summary.overall_risk_level} RISK — {summary.overall_risk_score}/100
              </div>
            </div>
            <div style={S.summaryStats}>
              {[
                { n: summary.total_clauses,   l: "Clauses",    c: "#8b7355" },
                { n: summary.high_risk_count,  l: "High Risk",  c: "#c0392b" },
                { n: summary.reject_count,     l: "Reject",     c: "#c0392b" },
                { n: summary.ambiguous_count,  l: "Ambiguous",  c: "#8e44ad" },
              ].map(({ n, l, c }) => (
                <div key={l} style={S.statBox}>
                  <div style={{ ...S.statNum, color: c }}>{n}</div>
                  <div style={S.statLabel}>{l}</div>
                </div>
              ))}
            </div>
            <button style={S.newDocBtn} onClick={() => setScreen("home")}>← New Document</button>
          </div>

          {/* Main Layout */}
          <div style={S.resultsLayout}>

            {/* Clause list */}
            <div style={S.sidebar}>
              <div style={S.sidebarTitle}>CLAUSES ({clauses.length})</div>
              {clauses.map((c, i) => {
                const cfg = RISK_CONFIG[c.risk_level] || RISK_CONFIG.MEDIUM;
                const rcfg = REC_CONFIG[c.recommendation] || REC_CONFIG.NEGOTIATE;
                const amb = c.ambiguity?.ambiguity_score || 0;
                return (
                  <div
                    key={i}
                    style={{
                      ...S.clauseCard,
                      ...(activeClause === i ? { ...S.clauseCardActive, borderColor: cfg.color } : {}),
                    }}
                    onClick={() => { setActive(i); setTab("debate"); }}
                  >
                    <div style={S.clauseCardTop}>
                      <span style={{ ...S.riskDot, background: cfg.dot }} />
                      <span style={S.clauseCardRisk}>{cfg.label}</span>
                      <span style={{ ...S.recTag, color: rcfg.color, borderColor: rcfg.color + "66" }}>{rcfg.glyph} {rcfg.label}</span>
                    </div>
                    <div style={S.clauseCardTitle}>{c.title}</div>
                    <div style={S.clauseCardMeta}>
                      Score {c.risk_score}/100
                      {amb > 40 && <span style={S.ambBadge}>⌖ Ambiguous</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div style={S.detailPanel}>
              {ac === null ? (
                <div style={S.emptyState}>
                  <div style={S.emptyGlyph}>⚖</div>
                  <div style={S.emptyText}>Select a clause to see the full analysis</div>
                </div>
              ) : (() => {
                const cfg  = RISK_CONFIG[ac.risk_level]  || RISK_CONFIG.MEDIUM;
                const rcfg = REC_CONFIG[ac.recommendation] || REC_CONFIG.NEGOTIATE;
                const amb  = ac.ambiguity || {};
                return (
                  <div>
                    {/* Clause Header */}
                    <div style={S.detailHeader}>
                      <div style={S.detailTitleWrap}>
                        <div style={S.detailTitle}>{ac.title}</div>
                        <div style={{ ...S.detailRec, color: rcfg.color, background: rcfg.bg }}>
                          {rcfg.glyph} {ac.recommendation}
                        </div>
                      </div>
                      <div style={{ ...S.bigScore, color: cfg.color }}>{ac.risk_score}</div>
                    </div>

                    {/* Original text */}
                    <div style={S.originalBox}>
                      <div style={S.originalLabel}>§ ORIGINAL CLAUSE</div>
                      <div style={S.originalText}>{ac.text}</div>
                    </div>

                    {/* Tabs */}
                    <div style={S.tabRow}>
                      {[
                        { id: "debate",    label: "⚔ Debate" },
                        { id: "ambiguity", label: "⌖ Ambiguity" },
                        { id: "benchmark", label: "⊞ Benchmark" },
                        { id: "scenario",  label: "⚡ Scenario" },
                      ].map(t => (
                        <button
                          key={t.id}
                          style={{ ...S.tab, ...(activeTab === t.id ? S.tabActive : {}) }}
                          onClick={() => setTab(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* TAB: DEBATE */}
                    {activeTab === "debate" && (
                      <div style={S.debateWrap}>
                        {/* Attacker */}
                        <div style={S.attackRow}>
                          <div style={S.attackAvatar}>⚔</div>
                          <div style={S.attackContent}>
                            <div style={S.bubbleRole}>ATTACKER · Consumer Rights Lawyer</div>
                            <div style={S.attackBubble}>{ac.attack}</div>
                          </div>
                        </div>
                        {/* Defender */}
                        <div style={S.defenseRow}>
                          <div style={S.defenseContent}>
                            <div style={{ ...S.bubbleRole, textAlign: "right" }}>DEFENDER · Corporate Lawyer</div>
                            <div style={S.defenseBubble}>{ac.defense}</div>
                          </div>
                          <div style={S.defenseAvatar}>⛊</div>
                        </div>
                        {/* Verdict */}
                        <div style={{ ...S.verdictBox, borderColor: cfg.color, background: cfg.bg }}>
                          <div style={S.verdictHeader}>
                            <span style={S.verdictLabel}>⚖ JUDGE'S VERDICT</span>
                            <span style={{ ...S.verdictRec, color: rcfg.color }}>{rcfg.glyph} {ac.recommendation}</span>
                          </div>
                          <div style={S.verdictText}>{ac.verdict}</div>
                        </div>
                      </div>
                    )}

                    {/* TAB: AMBIGUITY */}
                    {activeTab === "ambiguity" && (
                      <div style={S.tabContent}>
                        <div style={S.ambScoreRow}>
                          <div style={{ ...S.ambScore, color: amb.ambiguity_score > 60 ? "#8e44ad" : amb.ambiguity_score > 30 ? "#d35400" : "#27ae60" }}>
                            {amb.ambiguity_score ?? "—"}
                          </div>
                          <div style={S.ambScoreLabel}>Ambiguity Score / 100</div>
                        </div>
                        {amb.plain_warning && (
                          <div style={S.ambWarning}>
                            <span style={S.ambWarningIcon}>⌖</span>
                            {amb.plain_warning}
                          </div>
                        )}
                        {amb.vague_terms?.length > 0 && (
                          <div style={S.ambSection}>
                            <div style={S.ambSectionTitle}>VAGUE TERMS FOUND</div>
                            <div style={S.vagueList}>
                              {amb.vague_terms.map((t, i) => (
                                <span key={i} style={S.vagueTag}>"{t}"</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {amb.has_contradiction && (
                          <div style={S.contradictionBox}>
                            <div style={S.ambSectionTitle}>⚠ CONTRADICTION DETECTED</div>
                            <div style={S.contradictionText}>{amb.contradiction_note}</div>
                          </div>
                        )}
                        {!amb.plain_warning && !amb.vague_terms?.length && !amb.has_contradiction && (
                          <div style={S.allClearBox}>✓ This clause is clearly written with no ambiguous language detected.</div>
                        )}
                      </div>
                    )}

                    {/* TAB: BENCHMARK */}
                    {activeTab === "benchmark" && (
                      <div style={S.tabContent}>
                        <div style={S.benchmarkIcon}>⊞</div>
                        <div style={S.benchmarkTitle}>Industry Comparison</div>
                        <div style={S.benchmarkText}>{ac.benchmark || "No benchmark data available for this clause."}</div>
                        <div style={S.benchmarkNote}>
                          Based on common legal standards across employment contracts, SaaS agreements, and consumer ToS documents.
                        </div>
                      </div>
                    )}

                    {/* TAB: SCENARIO */}
                    {activeTab === "scenario" && (
                      <div style={S.tabContent}>
                        <div style={S.scenarioIcon}>⚡</div>
                        <div style={S.scenarioTitle}>If You Sign This…</div>
                        <div style={S.scenarioText}>{ac.scenario || "No scenario simulation available for this clause."}</div>
                        <div style={{ ...S.verdictBox, borderColor: cfg.color, background: cfg.bg, marginTop: 20 }}>
                          <div style={S.verdictHeader}>
                            <span style={S.verdictLabel}>OUR RECOMMENDATION</span>
                            <span style={{ ...S.verdictRec, color: rcfg.color }}>{rcfg.glyph} {ac.recommendation}</span>
                          </div>
                          <div style={S.verdictText}>{ac.verdict}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────

const S = {
  root: {
    minHeight: "100vh",
    background: "#f5f0e8",
    color: "#2c2416",
    fontFamily: "'Crimson Pro', 'Georgia', serif",
  },

  // Header
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 40px", borderBottom: "2px solid #2c2416",
    background: "#2c2416", position: "sticky", top: 0, zIndex: 100,
  },
  logo: { display: "flex", alignItems: "center", gap: 14, cursor: "pointer" },
  logoMark: { fontSize: 32, color: "#c9a84c" },
  logoName: { fontSize: 22, fontWeight: 700, letterSpacing: 4, color: "#f5f0e8", fontFamily: "'Syne', sans-serif" },
  logoSub: { fontSize: 10, color: "#8b7355", letterSpacing: 2, fontFamily: "monospace" },
  headerRight: { display: "flex", gap: 8, alignItems: "center" },
  agentPill: { background: "#c9a84c22", border: "1px solid #c9a84c66", color: "#c9a84c", borderRadius: 20, padding: "4px 12px", fontSize: 11, letterSpacing: 1, fontFamily: "monospace" },
  versionPill: { background: "#ffffff15", border: "1px solid #ffffff30", color: "#8b7355", borderRadius: 20, padding: "4px 10px", fontSize: 10, fontFamily: "monospace" },

  // Home
  homeMain: { maxWidth: 1200, margin: "0 auto", padding: "60px 32px" },
  homeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" },
  heroCol: {},
  stamp: {
    display: "inline-block", border: "2px solid #8b7355", color: "#8b7355",
    fontSize: 10, letterSpacing: 4, padding: "4px 12px", marginBottom: 24,
    fontFamily: "monospace", transform: "rotate(-1deg)",
  },
  heroTitle: { fontSize: "clamp(36px,4vw,54px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20, fontStyle: "normal" },
  heroItalic: { fontStyle: "italic", color: "#8b2500" },
  heroPara: { fontSize: 17, lineHeight: 1.8, color: "#5a4a35", marginBottom: 32, maxWidth: 460 },
  featureList: { display: "flex", flexDirection: "column", gap: 10 },
  featureRow: { display: "flex", alignItems: "center", gap: 14 },
  featureIcon: { width: 28, height: 28, background: "#2c2416", color: "#c9a84c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, textAlign: "center", lineHeight: "28px" },
  featureTxt: { fontSize: 15, color: "#3a2e1e" },

  // Upload card
  uploadCol: {},
  uploadCard: { background: "#fff", border: "1px solid #d4c9b0", borderRadius: 4, padding: "32px", boxShadow: "4px 4px 0 #d4c9b0" },
  uploadCardTitle: { fontSize: 10, letterSpacing: 3, color: "#8b7355", fontFamily: "monospace", marginBottom: 20, borderBottom: "1px solid #e8e0d0", paddingBottom: 12 },
  toggleRow: { display: "flex", gap: 0, marginBottom: 20, border: "1px solid #d4c9b0", borderRadius: 4, overflow: "hidden" },
  toggleOn: { flex: 1, padding: "10px", background: "#2c2416", color: "#f5f0e8", border: "none", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14, fontWeight: 600 },
  toggleOff: { flex: 1, padding: "10px", background: "transparent", color: "#8b7355", border: "none", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14 },
  dropzone: { border: "2px dashed #d4c9b0", borderRadius: 4, padding: "40px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#faf8f4" },
  dropActive: { borderColor: "#8b2500", background: "#8b250008" },
  dropIconWrap: { marginBottom: 12 },
  dropIcon: { fontSize: 40 },
  dropTitle: { fontSize: 18, fontWeight: 600, marginBottom: 6 },
  dropFormats: { fontSize: 12, color: "#8b7355", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 },
  dropClick: { fontSize: 12, color: "#b0a090" },
  textWrap: { display: "flex", flexDirection: "column", gap: 12 },
  textarea: { background: "#faf8f4", border: "1px solid #d4c9b0", borderRadius: 4, padding: "14px", color: "#2c2416", fontSize: 14, fontFamily: "monospace", resize: "vertical", outline: "none", lineHeight: 1.6 },
  analyzeBtn: { padding: "14px", background: "#8b2500", border: "none", borderRadius: 4, color: "#f5f0e8", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", letterSpacing: 1 },
  error: { marginTop: 16, color: "#c0392b", background: "#c0392b10", border: "1px solid #c0392b40", borderRadius: 4, padding: "10px 14px", fontSize: 13, fontFamily: "monospace" },

  // Analyzing
  centerMain: { maxWidth: 600, margin: "80px auto", padding: "0 24px" },
  loadingCard: { background: "#fff", border: "1px solid #d4c9b0", borderRadius: 4, padding: "48px 40px", textAlign: "center", boxShadow: "4px 4px 0 #d4c9b0" },
  gavel: { fontSize: 56, marginBottom: 20, display: "block", animation: "swing 1.5s ease infinite" },
  loadingTitle: { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  loadingSub: { fontSize: 14, color: "#8b7355", marginBottom: 36, fontFamily: "monospace" },
  agentTrack: { display: "flex", flexDirection: "column", gap: 14, textAlign: "left" },
  agentStep: { display: "flex", alignItems: "center", gap: 14, opacity: 0 },
  agentStepIcon: { width: 36, height: 36, border: "1px solid", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  agentStepName: { fontSize: 14, fontWeight: 700 },
  agentStepDesc: { fontSize: 12, color: "#8b7355", fontFamily: "monospace" },

  // Results
  resultsMain: { maxWidth: 1400, margin: "0 auto", padding: "20px 24px" },
  summaryBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#fff", border: "1px solid #d4c9b0", borderLeft: "5px solid",
    borderRadius: 4, padding: "18px 24px", marginBottom: 20, flexWrap: "wrap", gap: 16,
    boxShadow: "2px 2px 0 #d4c9b0",
  },
  summaryLeft: {},
  summaryFile: { fontSize: 11, color: "#8b7355", fontFamily: "monospace", marginBottom: 4 },
  summaryRiskLabel: { fontSize: 22, fontWeight: 700, letterSpacing: 1 },
  summaryStats: { display: "flex", gap: 24 },
  statBox: { textAlign: "center" },
  statNum: { fontSize: 28, fontWeight: 700, display: "block" },
  statLabel: { fontSize: 10, color: "#8b7355", letterSpacing: 1, fontFamily: "monospace" },
  newDocBtn: { padding: "10px 18px", background: "transparent", border: "1px solid #d4c9b0", borderRadius: 4, color: "#8b7355", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14 },

  resultsLayout: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 },

  // Sidebar
  sidebar: { display: "flex", flexDirection: "column", gap: 6 },
  sidebarTitle: { fontSize: 9, letterSpacing: 3, color: "#8b7355", fontFamily: "monospace", padding: "0 4px 8px", borderBottom: "1px solid #e0d8cc" },
  clauseCard: { background: "#fff", border: "1px solid #e0d8cc", borderRadius: 4, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", borderLeft: "3px solid transparent" },
  clauseCardActive: { borderLeft: "3px solid", background: "#faf8f4" },
  clauseCardTop: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 },
  riskDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  clauseCardRisk: { fontSize: 9, letterSpacing: 1, color: "#8b7355", fontFamily: "monospace", flex: 1 },
  recTag: { fontSize: 9, border: "1px solid", borderRadius: 2, padding: "1px 5px", fontFamily: "monospace", letterSpacing: 1 },
  clauseCardTitle: { fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 },
  clauseCardMeta: { fontSize: 10, color: "#b0a090", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8 },
  ambBadge: { background: "#8e44ad18", color: "#8e44ad", border: "1px solid #8e44ad44", borderRadius: 2, padding: "0px 4px", fontSize: 9 },

  // Detail panel
  detailPanel: { background: "#fff", border: "1px solid #d4c9b0", borderRadius: 4, padding: "28px 32px", boxShadow: "2px 2px 0 #d4c9b0" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16, color: "#c0b49a" },
  emptyGlyph: { fontSize: 56 },
  emptyText: { fontSize: 16, fontStyle: "italic" },

  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  detailTitleWrap: { flex: 1 },
  detailTitle: { fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 },
  detailRec: { display: "inline-block", fontSize: 12, fontWeight: 700, fontFamily: "monospace", letterSpacing: 2, padding: "4px 12px", borderRadius: 2 },
  bigScore: { fontSize: 64, fontWeight: 700, lineHeight: 1, fontFamily: "'Syne', sans-serif", marginLeft: 20, flexShrink: 0 },

  originalBox: { background: "#faf8f4", border: "1px solid #e0d8cc", borderRadius: 4, padding: "14px 18px", marginBottom: 20 },
  originalLabel: { fontSize: 9, letterSpacing: 3, color: "#8b7355", fontFamily: "monospace", marginBottom: 8 },
  originalText: { fontSize: 13, color: "#5a4a35", lineHeight: 1.7, fontFamily: "monospace" },

  // Tabs
  tabRow: { display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e0d8cc" },
  tab: { padding: "10px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8b7355", borderBottom: "2px solid transparent", marginBottom: "-2px", transition: "all 0.15s" },
  tabActive: { color: "#2c2416", borderBottomColor: "#2c2416", fontWeight: 700 },
  tabContent: { animation: "fadeUp 0.3s ease" },

  // Debate
  debateWrap: { display: "flex", flexDirection: "column", gap: 16 },
  attackRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  attackAvatar: { width: 38, height: 38, background: "#c0392b15", border: "1px solid #c0392b44", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, color: "#c0392b" },
  attackContent: { flex: 1 },
  bubbleRole: { fontSize: 9, letterSpacing: 2, color: "#8b7355", fontFamily: "monospace", marginBottom: 6 },
  attackBubble: { background: "#fff5f5", border: "1px solid #c0392b33", borderRadius: "0 10px 10px 10px", padding: "14px 18px", fontSize: 14, lineHeight: 1.7, color: "#5a1010" },
  defenseRow: { display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "flex-end" },
  defenseContent: { flex: 1, textAlign: "right" },
  defenseAvatar: { width: 38, height: 38, background: "#27ae6015", border: "1px solid #27ae6044", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, color: "#27ae60" },
  defenseBubble: { background: "#f0fff4", border: "1px solid #27ae6033", borderRadius: "10px 0 10px 10px", padding: "14px 18px", fontSize: 14, lineHeight: 1.7, color: "#0f4020", display: "inline-block", textAlign: "left" },
  verdictBox: { border: "1px solid", borderRadius: 4, padding: "18px 22px" },
  verdictHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  verdictLabel: { fontSize: 9, letterSpacing: 3, color: "#8b7355", fontFamily: "monospace" },
  verdictRec: { fontSize: 12, fontWeight: 700, fontFamily: "monospace", letterSpacing: 2 },
  verdictText: { fontSize: 15, lineHeight: 1.7 },

  // Ambiguity tab
  ambScoreRow: { display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 },
  ambScore: { fontSize: 64, fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1 },
  ambScoreLabel: { fontSize: 13, color: "#8b7355", fontFamily: "monospace" },
  ambWarning: { display: "flex", gap: 10, background: "#8e44ad10", border: "1px solid #8e44ad44", borderRadius: 4, padding: "12px 16px", fontSize: 14, lineHeight: 1.6, marginBottom: 16, color: "#4a1a6e" },
  ambWarningIcon: { fontSize: 18, flexShrink: 0 },
  ambSection: { marginBottom: 16 },
  ambSectionTitle: { fontSize: 9, letterSpacing: 3, color: "#8b7355", fontFamily: "monospace", marginBottom: 10 },
  vagueList: { display: "flex", flexWrap: "wrap", gap: 8 },
  vagueTag: { background: "#8e44ad15", border: "1px solid #8e44ad55", color: "#6b1fa0", borderRadius: 2, padding: "4px 10px", fontSize: 13, fontFamily: "monospace" },
  contradictionBox: { background: "#c0392b10", border: "1px solid #c0392b44", borderRadius: 4, padding: "14px 18px" },
  contradictionText: { fontSize: 14, lineHeight: 1.6, color: "#5a0f0f", marginTop: 8 },
  allClearBox: { background: "#27ae6010", border: "1px solid #27ae6044", borderRadius: 4, padding: "14px 18px", fontSize: 14, color: "#0f4020" },

  // Benchmark tab
  benchmarkIcon: { fontSize: 40, marginBottom: 12, color: "#8b7355" },
  benchmarkTitle: { fontSize: 18, fontWeight: 700, marginBottom: 14 },
  benchmarkText: { fontSize: 15, lineHeight: 1.8, color: "#3a2e1e", background: "#faf8f4", border: "1px solid #e0d8cc", borderRadius: 4, padding: "16px 20px", marginBottom: 14 },
  benchmarkNote: { fontSize: 12, color: "#b0a090", fontFamily: "monospace", lineHeight: 1.6 },

  // Scenario tab
  scenarioIcon: { fontSize: 40, marginBottom: 12, color: "#8b2500" },
  scenarioTitle: { fontSize: 18, fontWeight: 700, marginBottom: 14 },
  scenarioText: { fontSize: 15, lineHeight: 1.8, color: "#3a2e1e", background: "#fff8f5", border: "1px solid #d4c9b0", borderLeft: "4px solid #8b2500", borderRadius: 4, padding: "16px 20px", marginBottom: 0 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Syne:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f0e8; }
  
  @keyframes swing {
    0%, 100% { transform: rotate(-10deg); }
    50%       { transform: rotate(10deg);  }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .agent-step { animation: fadeUp 0.5s ease both; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f5f0e8; }
  ::-webkit-scrollbar-thumb { background: #d4c9b0; border-radius: 3px; }

  textarea:focus { border-color: #8b7355 !important; box-shadow: 0 0 0 2px #8b735530; }
  
  @media (max-width: 900px) {
    .home-grid { grid-template-columns: 1fr !important; }
    .results-layout { grid-template-columns: 1fr !important; }
  }
`;
