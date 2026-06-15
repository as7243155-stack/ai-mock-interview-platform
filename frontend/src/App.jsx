import { useState } from "react";

function App() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/questions?role=${role}`
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

  const submitInterview = () => {
    console.log("Questions:", questions);
    console.log("Answers:", answers);

    alert("Interview Submitted!");
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
          setAnswers({});
        }}
      />

      <br />
      <br />

    <button
     onClick={generateQuestions}
     disabled={loading || !role}
   >
     {loading ? "Generating..." : "Generate Questions"}
   </button> 

      <p>Selected Role: {role}</p>

      {loading && <p>Generating Questions...</p>}

      <h2>Interview Questions</h2>

      <div>
        {questions.map((question, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <p>
              {index + 1}. {question}
            </p>

            <textarea
              rows="4"
              cols="60"
              placeholder="Type your answer here..."
              value={answers[index] || ""}
              onChange={(e) =>
                handleAnswerChange(index, e.target.value)
              }
            />
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <button onClick={submitInterview}>
          Submit Interview
        </button>
      )}
    </div>
  );
}

export default App;