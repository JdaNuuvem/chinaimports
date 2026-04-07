"use client";

import { useState } from "react";

interface Question {
  id: string;
  question: string;
  answer?: string;
  author: string;
  date: string;
}

interface ProductQAProps {
  productId: string;
}

export default function ProductQA({ productId }: ProductQAProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to the backend
    const newQ: Question = {
      id: `qa_${Date.now()}`,
      question,
      author: name,
      date: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    setName("");
    setQuestion("");
    setShowForm(false);
    setSubmitted(true);
    // Reset submitted after 3s
    setTimeout(() => setSubmitted(false), 3000);

    // POST to backend (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/products/${productId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, question }),
    }).catch(() => {});
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Perguntas sobre o produto</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "8px 16px", fontSize: 13, fontWeight: 600,
            border: "1px solid var(--primary-color, #1e2d7d)", borderRadius: 6,
            background: showForm ? "var(--primary-color, #1e2d7d)" : "#fff",
            color: showForm ? "#fff" : "var(--primary-color, #1e2d7d)",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancelar" : "Fazer uma pergunta"}
        </button>
      </div>

      {submitted && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#16a34a" }}>
          Sua pergunta foi enviada! Responderemos em breve.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f9fafb", borderRadius: 8, padding: 16, marginBottom: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Seu nome</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e1e3e5", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Sua pergunta</label>
            <textarea
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e1e3e5", borderRadius: 6, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            className="button button--primary"
            style={{ padding: "10px 20px", fontSize: 13 }}
          >
            Enviar pergunta
          </button>
        </form>
      )}

      {questions.length === 0 && !showForm && (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>
          Nenhuma pergunta ainda. Seja o primeiro a perguntar!
        </p>
      )}

      {questions.map((q) => (
        <div key={q.id} style={{ padding: "16px 0", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{q.author}</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {new Date(q.date).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <p style={{ fontSize: 14, margin: "0 0 8px", fontWeight: 600 }}>P: {q.question}</p>
          {q.answer && (
            <p style={{ fontSize: 14, margin: 0, color: "#16a34a" }}>R: {q.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
