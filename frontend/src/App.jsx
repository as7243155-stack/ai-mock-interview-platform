import { useState } from "react";

function App() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [level, setLevel] = useState("Fresher");

  const generateQuestions = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
  `http://127.0.0.1:8000/questions?role=${encodeURIComponent(role)}&level=${encodeURIComponent(level)}`
);

      const data = await response.json();

      setQuestions(data.questions);
      setAnswers({});
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({
      ...answers,
      [index]: value,
    });
  };

  const submitInterview = async () => {
    setEvaluating(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            questions,
            answers,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      setResult(data);
    } catch (error) {
      console.error("Submit Error:", error);
    }

    setEvaluating(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
    <h1>AI Mock Interview Platform</h1>

<input
  type="text"
  placeholder="Enter Job Role"
  value={role}
  onChange={(e) => {
    setRole(e.target.value);
    setQuestions([]);
    setAnswers({});
    setResult(null);
  }}
/>

<br />
<br />

<select
  value={level}
  onChange={(e) => setLevel(e.target.value)}
>
  <option value="Fresher">Fresher</option>
  <option value="Mid-Level">Mid-Level</option>
  <option value="Senior">Senior</option>
</select>

<br />
<br />

      <button
        onClick={generateQuestions}
        disabled={loading || !role}
      >
        {loading
          ? "Generating Questions..."
          : "Generate Questions"}
      </button>

      <p>Selected Role: {role}</p>
      <p>Experience Level: {level}</p>

      {loading && (
        <p>Generating AI interview questions...</p>
      )}

      {questions.length > 0 && (
        <>
          <h2>Interview Questions</h2>

          {questions.map((question, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
              }}
            >
              <p>
                <strong>Q{index + 1}:</strong>{" "}
                {question}
              </p>

              <textarea
                rows="4"
                cols="60"
                placeholder="Type your answer here..."
                value={answers[index] || ""}
                onChange={(e) =>
                  handleAnswerChange(
                    index,
                    e.target.value
                  )
                }
              />
            </div>
          ))}

          <button
            onClick={submitInterview}
            disabled={evaluating}
          >
            {evaluating
              ? "Analyzing Interview..."
              : "Submit Interview"}
          </button>

          {evaluating && (
            <div style={{ marginTop: "15px" }}>
              <p>
                ✅ Interview submitted successfully
              </p>

              <p>
                🤖 Generating your evaluation...
              </p>
            </div>
          )}
        </>
      )}

      {result && (
        <div style={{ marginTop: "40px" }}>
          <h2>Interview Result</h2>
          <div
  style={{
    border: "1px solid gray",
    padding: "20px",
    marginBottom: "20px",
  }}
>
  <h3>Interview Summary</h3>

  <p>{result.summary}</p>
</div>

          <h2>
            Overall Score:{" "}
            {result.overall_score}/100
          </h2>

          <hr />

          <h3>Category Scores</h3>

          <p>
            Technical Knowledge:{" "}
            {result.technical_score}/100
          </p>

          <p>
            Communication Skills:{" "}
            {result.communication_score}/100
          </p>

          <p>
            Problem Solving:{" "}
            {result.problem_solving_score}/100
          </p>

          <hr />

          <h3>Question-by-Question Feedback</h3>

          {(result.question_feedback || []).map(
            (item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid gray",
                  padding: "15px",
                  marginBottom: "20px",
                }}
              >
                <h4>
                  Question {index + 1}
                </h4>

                <p>{item.question}</p>

                <p>
                  <strong>Score:</strong>{" "}
                  {item.score}/10
                </p>

                <p>
                  <strong>Feedback:</strong>
                </p>

                <p>{item.feedback}</p>
              </div>
            )
          )}

          <hr />

          <h3>Strengths</h3>

          <ul style={{ textAlign: "left" }}>
            {(result.strengths || []).map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <h3>Weaknesses</h3>

          <ul style={{ textAlign: "left" }}>
            {(result.weaknesses || []).map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <h3>Suggestions</h3>

          <ul style={{ textAlign: "left" }}>
            {(result.suggestions || []).map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;