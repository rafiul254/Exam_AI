import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notesAPI } from "../services/api.js";
import toast from "react-hot-toast";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", violetLight: "#a78bfa", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const Badge = ({ children, color }) => (
    <span style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 10, fontWeight: 700, background: `${color}20`,
        color, border: `1px solid ${color}35`, textTransform: "uppercase",
    }}>{children}</span>
);

// ── Flashcard Component ───────────────────────────────────────
function FlashcardView({ cards, color }) {
    const [idx, setIdx]       = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [scores, setScores] = useState({});

    if (!cards?.length) return (
        <div style={{ textAlign: "center", color: P.muted, padding: 60 }}>
            No flashcards available
        </div>
    );

    const handleAnswer = (val) => {
        setScores({ ...scores, [idx]: val });
        if (idx < cards.length - 1) {
            setIdx(i => i + 1);
            setFlipped(false);
        }
    };

    const correct = Object.values(scores).filter(v => v >= 3).length;

    return (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
            {/* Progress */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                {cards.map((_, i) => (
                    <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4, transition: "all 0.3s",
                        background: scores[i] >= 3 ? P.emerald
                            : scores[i] ? P.rose
                                : i === idx ? color || P.violet
                                    : P.border,
                        boxShadow: i === idx ? `0 0 8px ${color || P.violet}` : "none",
                    }} />
                ))}
            </div>

            {/* Stats row */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                marginBottom: 16, fontSize: 12, color: P.muted,
            }}>
                <span>Card {idx + 1} of {cards.length}</span>
                <span style={{ color: P.emerald }}>✓ {correct} correct</span>
            </div>

            {/* Card */}
            <div onClick={() => setFlipped(!flipped)} style={{
                background: flipped
                    ? `linear-gradient(135deg, ${color || P.violet}20, ${P.card})`
                    : P.card,
                border: `1px solid ${flipped ? (color || P.violet) + "60" : P.border}`,
                borderRadius: 20, padding: "44px 32px", textAlign: "center",
                minHeight: 220, cursor: "pointer",
                boxShadow: flipped ? `0 0 40px ${color || P.violet}25` : "none",
                transition: "all 0.35s",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
            }}>
                <div style={{
                    fontSize: 10, color: P.muted, letterSpacing: 3,
                    textTransform: "uppercase", marginBottom: 20,
                }}>
                    {flipped ? "✨ Answer" : "💭 Question"} • tap to flip
                </div>
                <div style={{
                    fontSize: 18, fontWeight: flipped ? 600 : 700,
                    lineHeight: 1.6, color: flipped ? (color || P.violet) : P.text,
                }}>
                    {flipped ? cards[idx].answer : cards[idx].question}
                </div>
                {cards[idx].difficulty && (
                    <div style={{ marginTop: 16 }}>
                        <Badge color={
                            cards[idx].difficulty === "hard" ? P.rose
                                : cards[idx].difficulty === "medium" ? P.amber
                                    : P.emerald
                        }>{cards[idx].difficulty}</Badge>
                    </div>
                )}
            </div>

            {/* Answer buttons */}
            {flipped ? (
                <div className="animate-in" style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    {[
                        { label: "😕 Hard",  color: P.rose,    val: 1 },
                        { label: "🤔 Okay",  color: P.amber,   val: 3 },
                        { label: "😊 Easy",  color: P.emerald, val: 5 },
                    ].map(b => (
                        <button key={b.val} onClick={() => handleAnswer(b.val)}
                                style={{
                                    flex: 1, padding: "11px", borderRadius: 10,
                                    border: `1px solid ${b.color}40`,
                                    background: `${b.color}15`, color: b.color,
                                    cursor: "pointer", fontSize: 13, fontWeight: 700,
                                    transition: "all 0.2s",
                                }}>{b.label}</button>
                    ))}
                </div>
            ) : (
                <button onClick={() => setFlipped(true)}
                        style={{
                            width: "100%", marginTop: 16, padding: "12px", borderRadius: 12,
                            border: "none", background: color || P.violet,
                            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 15,
                            boxShadow: `0 4px 20px ${color || P.violet}40`,
                        }}>
                    Reveal Answer
                </button>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button disabled={idx === 0}
                        onClick={() => { setIdx(i => i - 1); setFlipped(false); }}
                        style={{
                            flex: 1, padding: "9px", borderRadius: 10,
                            border: `1px solid ${P.border}`, background: "transparent",
                            color: idx === 0 ? P.border : P.muted, cursor: idx === 0 ? "not-allowed" : "pointer",
                        }}>← Prev</button>
                <button disabled={idx === cards.length - 1}
                        onClick={() => { setIdx(i => i + 1); setFlipped(false); }}
                        style={{
                            flex: 1, padding: "9px", borderRadius: 10,
                            border: `1px solid ${P.border}`, background: "transparent",
                            color: idx === cards.length - 1 ? P.border : P.muted,
                            cursor: idx === cards.length - 1 ? "not-allowed" : "pointer",
                        }}>Next →</button>
            </div>
        </div>
    );
}

// ── Quiz Component ────────────────────────────────────────────
function QuizView({ quiz, color }) {
    const [idx, setIdx]     = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [done, setDone]   = useState(false);

    if (!quiz?.length) return (
        <div style={{ textAlign: "center", color: P.muted, padding: 60 }}>
            No quiz available
        </div>
    );

    const handleAnswer = (i) => {
        if (selected !== null) return;
        setSelected(i);
        if (i === quiz[idx].correct) setScore(s => s + 1);
    };

    const next = () => {
        if (idx + 1 >= quiz.length) { setDone(true); return; }
        setIdx(i => i + 1);
        setSelected(null);
    };

    if (done) return (
        <div style={{
            maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 40,
        }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Quiz Done!</h2>
            <div style={{
                fontSize: 44, fontWeight: 900, color: color || P.violet, marginBottom: 8,
            }}>{score}/{quiz.length}</div>
            <p style={{ color: P.muted, marginBottom: 28 }}>
                {Math.round(score / quiz.length * 100)}% correct
            </p>
            <button onClick={() => { setIdx(0); setSelected(null); setScore(0); setDone(false); }}
                    style={{
                        padding: "12px 28px", borderRadius: 12, border: "none",
                        background: color || P.violet, color: "#fff",
                        cursor: "pointer", fontWeight: 700, fontSize: 15,
                    }}>Try Again</button>
        </div>
    );

    return (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
                color: P.muted, fontSize: 12, marginBottom: 20 }}>
                <span>Question {idx + 1} of {quiz.length}</span>
                <span style={{ color: P.emerald }}>Score: {score}</span>
            </div>

            <div style={{
                background: P.card, border: `1px solid ${P.border}`,
                borderRadius: 20, padding: 28, marginBottom: 14,
            }}>
                <h3 style={{
                    fontSize: 17, fontWeight: 700, lineHeight: 1.5, marginBottom: 24,
                }}>{quiz[idx].question}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {quiz[idx].options?.map((opt, i) => {
                        const isCorrect  = i === quiz[idx].correct;
                        const isSelected = i === selected;
                        let bg = P.surface, borderColor = P.border, textColor = P.text;
                        if (selected !== null) {
                            if (isCorrect)       { bg = `${P.emerald}20`; borderColor = P.emerald; textColor = P.emerald; }
                            else if (isSelected) { bg = `${P.rose}20`;    borderColor = P.rose;    textColor = P.rose; }
                        }
                        return (
                            <button key={i} onClick={() => handleAnswer(i)}
                                    style={{
                                        padding: "12px 16px", borderRadius: 12,
                                        border: `1px solid ${borderColor}`,
                                        background: bg, color: textColor,
                                        cursor: selected === null ? "pointer" : "default",
                                        textAlign: "left", fontSize: 14, fontWeight: 500,
                                        transition: "all 0.2s",
                                    }}>
                <span style={{ fontWeight: 700, marginRight: 8 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selected !== null && (
                <div className="animate-in">
                    <div style={{
                        background: P.surface, borderRadius: 12, padding: 14,
                        fontSize: 13, color: P.muted, lineHeight: 1.6, marginBottom: 12,
                        border: `1px solid ${P.border}`,
                    }}>
                        💡 {quiz[idx].explanation}
                    </div>
                    <button onClick={next}
                            style={{
                                width: "100%", padding: "12px", borderRadius: 12, border: "none",
                                background: color || P.violet, color: "#fff",
                                cursor: "pointer", fontWeight: 700, fontSize: 15,
                            }}>
                        {idx + 1 >= quiz.length ? "Finish 🏆" : "Next Question →"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main NoteDetail ───────────────────────────────────────────
export default function NoteDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [note, setNote]         = useState(null);
    const [tab, setTab]           = useState("summary");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer]     = useState("");
    const [asking, setAsking]     = useState(false);

    useEffect(() => {
        notesAPI.getOne(id).then(r => setNote(r.data))
            .catch(() => { toast.error("Note not found"); navigate("/notes"); });
    }, [id]);

    const handleAsk = async () => {
        if (!question.trim()) return;
        setAsking(true);
        try {
            const r = await notesAPI.ask(id, question);
            setAnswer(r.data.answer);
        } catch {
            toast.error("Failed to get answer");
        } finally {
            setAsking(false);
        }
    };

    if (!note) return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "60vh", color: P.muted,
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontSize: 32, animation: "spin 1s linear infinite",
                    display: "inline-block", marginBottom: 12,
                }}>✦</div>
                <div>Loading note...</div>
            </div>
        </div>
    );

    const tabs = ["summary", "flashcards", "quiz", "ask AI"];

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center",
                gap: 14, marginBottom: 28,
            }}>
                <button onClick={() => navigate("/notes")}
                        style={{
                            padding: "8px 14px", borderRadius: 10,
                            border: `1px solid ${P.border}`, background: "transparent",
                            color: P.muted, cursor: "pointer", fontSize: 13,
                        }}>← Back</button>
                <span style={{ fontSize: 34 }}>{note.icon}</span>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
                        {note.title}
                    </h1>
                    <Badge color={note.color || P.violet}>{note.subject}</Badge>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{
                        fontSize: 22, fontWeight: 900,
                        color: note.color || P.violet,
                    }}>{note.masteryLevel || 0}%</div>
                    <div style={{ fontSize: 10, color: P.muted }}>mastered</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex", gap: 6, marginBottom: 24,
                borderBottom: `1px solid ${P.border}`, paddingBottom: 12,
            }}>
                {tabs.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                            style={{
                                padding: "8px 18px", borderRadius: 10, border: "none",
                                cursor: "pointer", fontSize: 13, fontWeight: 600,
                                textTransform: "capitalize", transition: "all 0.2s",
                                background: tab === t ? `${note.color || P.violet}20` : "transparent",
                                color: tab === t ? note.color || P.violet : P.muted,
                                borderBottom: tab === t ? `2px solid ${note.color || P.violet}` : "2px solid transparent",
                            }}>{t}</button>
                ))}
            </div>

            {/* Summary Tab */}
            {tab === "summary" && (
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
                }}>
                    {/* Summary + Simplified */}
                    <div style={{
                        display: "flex", flexDirection: "column", gap: 16,
                    }}>
                        <div style={{
                            background: P.card, border: `1px solid ${P.border}`,
                            borderRadius: 18, padding: 22,
                        }}>
                            <div style={{
                                color: note.color || P.violet, fontWeight: 700,
                                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                                marginBottom: 12,
                            }}>📝 Summary</div>
                            <p style={{ lineHeight: 1.8, fontSize: 14 }}>{note.summary}</p>
                        </div>
                        <div style={{
                            background: P.card, border: `1px solid ${P.border}`,
                            borderRadius: 18, padding: 22,
                        }}>
                            <div style={{
                                color: P.cyan, fontWeight: 700, fontSize: 11,
                                letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
                            }}>💡 Simple Explanation</div>
                            <p style={{
                                lineHeight: 1.8, fontSize: 14, color: P.muted,
                            }}>{note.simplifiedExplanation}</p>
                        </div>
                    </div>

                    {/* Key Points */}
                    <div>
                        <div style={{
                            background: P.card, border: `1px solid ${P.border}`,
                            borderRadius: 18, padding: 22, marginBottom: 16,
                        }}>
                            <div style={{
                                color: note.color || P.violet, fontWeight: 700,
                                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                                marginBottom: 16,
                            }}>⚡ Key Points</div>
                            {note.keyPoints?.map((pt, i) => (
                                <div key={i} style={{
                                    display: "flex", gap: 12, marginBottom: 12,
                                    alignItems: "flex-start",
                                }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                                        background: `${note.color || P.violet}20`,
                                        border: `1px solid ${note.color || P.violet}40`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11, color: note.color || P.violet, fontWeight: 700,
                                    }}>{i + 1}</div>
                                    <span style={{ fontSize: 13, lineHeight: 1.6 }}>{pt}</span>
                                </div>
                            ))}
                        </div>

                        {/* Tags */}
                        {note.tags?.length > 0 && (
                            <div style={{
                                background: P.card, border: `1px solid ${P.border}`,
                                borderRadius: 18, padding: 20,
                            }}>
                                <div style={{
                                    color: P.muted, fontWeight: 700, fontSize: 11,
                                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
                                }}>🏷️ Tags</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {note.tags.map(tag => (
                                        <span key={tag} style={{
                                            padding: "4px 12px", borderRadius: 20, fontSize: 11,
                                            background: P.surface, color: P.muted,
                                            border: `1px solid ${P.border}`,
                                        }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{
                        gridColumn: "1 / -1", display: "flex", gap: 12,
                    }}>
                        <button className="btn-hover" onClick={() => setTab("flashcards")}
                                style={{
                                    padding: "11px 22px", borderRadius: 12, border: "none",
                                    background: note.color || P.violet, color: "#fff",
                                    cursor: "pointer", fontWeight: 700,
                                    boxShadow: `0 4px 16px ${note.color || P.violet}40`,
                                }}>
                            🃏 Start Flashcards
                        </button>
                        <button className="btn-hover" onClick={() => setTab("quiz")}
                                style={{
                                    padding: "11px 22px", borderRadius: 12,
                                    border: `1px solid ${P.border}`, background: P.card,
                                    color: P.text, cursor: "pointer", fontWeight: 700,
                                }}>
                            🎯 Take Quiz
                        </button>
                        <button className="btn-hover" onClick={() => setTab("ask AI")}
                                style={{
                                    padding: "11px 22px", borderRadius: 12,
                                    border: `1px solid ${P.cyan}40`, background: `${P.cyan}15`,
                                    color: P.cyan, cursor: "pointer", fontWeight: 700,
                                }}>
                            🤖 Ask AI
                        </button>
                    </div>
                </div>
            )}

            {/* Flashcards Tab */}
            {tab === "flashcards" && (
                <FlashcardView cards={note.flashcards} color={note.color} />
            )}

            {/* Quiz Tab */}
            {tab === "quiz" && (
                <QuizView quiz={note.quiz} color={note.color} />
            )}

            {/* Ask AI Tab */}
            {tab === "ask AI" && (
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    <div style={{
                        background: P.card, border: `1px solid ${P.border}`,
                        borderRadius: 20, padding: 28,
                    }}>
                        <div style={{
                            color: note.color || P.violet, fontWeight: 700,
                            fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
                            marginBottom: 18,
                        }}>🤖 Ask anything about {note.title}</div>

                        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                            <input
                                placeholder="e.g. What is the most important concept?"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAsk()}
                                style={{
                                    flex: 1, padding: "11px 14px", borderRadius: 12,
                                    fontSize: 14, background: P.surface,
                                    border: `1px solid ${P.border}`,
                                    color: P.text, outline: "none",
                                }}
                            />
                            <button className="btn-hover" onClick={handleAsk} disabled={asking}
                                    style={{
                                        padding: "11px 22px", borderRadius: 12, border: "none",
                                        background: note.color || P.violet, color: "#fff",
                                        cursor: "pointer", fontWeight: 700,
                                        opacity: asking ? 0.7 : 1,
                                    }}>
                                {asking ? "..." : "Ask"}
                            </button>
                        </div>

                        {/* Suggested questions */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{
                                fontSize: 11, color: P.muted, marginBottom: 8,
                            }}>Suggested:</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {[
                                    "Explain in simple terms",
                                    "What are the key formulas?",
                                    "Give me an example",
                                    "How to remember this?",
                                ].map(q => (
                                    <button key={q} onClick={() => setQuestion(q)}
                                            style={{
                                                padding: "5px 12px", borderRadius: 8,
                                                border: `1px solid ${P.border}`, background: P.surface,
                                                color: P.muted, cursor: "pointer", fontSize: 11,
                                                transition: "all 0.2s",
                                            }}>{q}</button>
                                ))}
                            </div>
                        </div>

                        {answer && (
                            <div className="animate-in" style={{
                                background: P.surface, borderRadius: 14, padding: 18,
                                border: `1px solid ${note.color || P.violet}30`,
                            }}>
                                <div style={{
                                    fontSize: 11, color: note.color || P.violet,
                                    fontWeight: 700, marginBottom: 10,
                                    textTransform: "uppercase", letterSpacing: 1,
                                }}>AI Answer</div>
                                <p style={{ lineHeight: 1.8, fontSize: 14 }}>{answer}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
