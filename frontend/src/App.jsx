import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Signup from "./components/Signup";
import Login from "./components/Login";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

function App() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [level, setLevel] = useState("Fresher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState("login");
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
  checkSession();
}, []);

const checkSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    setPage("dashboard");
  } else {
    setPage("login");
  }

  setCheckingSession(false);
};
  const signUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("SIGNUP DATA:", data);
  console.log("SIGNUP ERROR:", error);

  if (!error) {
    alert("Signup successful!");
  }
};

  
  
  const testConnection = async () => {
  const {
    data,
    error,
  } = await supabase.auth.getSession();

  console.log("DATA:", data);
  console.log("ERROR:", error);
};

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

      const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from("interviews")
            .insert([
              {
                user_id: user.id,
                role: role,
                score: data.overall_score,
                summary: data.summary,
              },
            ]);

          if (error) {
            console.log("Save Error:", error);
          } else {
            console.log("Interview saved successfully");
          }
        }

        setResult(data);
  
      } catch (error) {
      console.error("Submit Error:", error);
    }

    setEvaluating(false);
  };
  if (checkingSession) {
  return <h2>Loading...</h2>;
 }
  if (page === "login") {
  return <Login setPage={setPage} />;
  }
  if (page === "dashboard") {
  return <Dashboard setPage={setPage} />;
  }
  if (page === "history") {
  return (
    <>
      <button
        onClick={() => setPage("interview")}
        style={{ margin: "20px" }}
      >
        Back To Interview
      </button>

      <History />
    </>
  );
}

return (
    <div style={{ padding: "20px", textAlign: "center" }}>
    <h1>AI Mock Interview Platform</h1>
    <br />
    <button
      onClick={() => setPage("history")}
      style={{
        marginBottom: "20px",
      }}
    >
      View Interview History
    </button>
  <br />
  <br />
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
            <div style={{ marginTop: "20px" }}>
              <h3>🤖 Analyzing Interview...</h3>

              <p>📖 Reviewing your answers...</p>
              <p>📊 Calculating skill scores...</p>
              <p>📝 Generating personalized feedback...</p>

              <p>Please wait a few moments.</p>
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
           Overall Score: {result.overall_score}/100
          </h2>

          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: "20px auto",
              backgroundColor: "#333",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid gray",
              position: "relative",
              height: "25px",
            }}
          >
            <div
              style={{
                width: `${result.overall_score}%`,
                height: "100%",
                backgroundColor: "#4CAF50",
                transition: "width 0.5s ease",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {result.overall_score}%
            </div>
          </div>

       <h3>Skill Breakdown</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "15px",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      {result.skill_breakdown &&
        Object.entries(result.skill_breakdown).map(
          ([skill, score], index) => (
            <div
              key={index}
              style={{
                border: "1px solid gray",
                borderRadius: "10px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <h4>{skill}</h4>

              <div
                style={{
                  width: "100%",
                  backgroundColor: "#333",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    width: `${result.overall_score}%`,
                    minWidth: "40px",
                    height: "25px",
                    backgroundColor: "#4CAF50",
                    transition: "width 0.5s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {result.overall_score}%
                </div>
              </div>

              <p
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                }}
              >
                {score}/100
              </p>
            </div>
          )
        )}
    </div>

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