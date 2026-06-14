import { useState } from "react";

function App() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/questions?role=${role}`
      );

      const data = await response.json();

      setQuestions(data.questions);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>AI Mock Interview Platform</h1>

      <input
        type="text"
        placeholder="Enter Job Role"
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
          setQuestions([]);
        }}
      />

      <br />
      <br />

      <button
        onClick={generateQuestions}
        disabled={!role}
      >
        Generate Questions
      </button>

      <p>Selected Role: {role}</p>

      {loading && <p>Generating Questions...</p>}

      <h2>Interview Questions</h2>

      <div>
        {questions.map((question, index) => (
          <p key={index}>
            {index + 1}. {question}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;