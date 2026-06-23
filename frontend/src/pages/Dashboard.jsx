import { useEffect, useState } from "react";
import { supabase } from "../supabase";


function Dashboard({ setPage }) {
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [recentInterviews, setRecentInterviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      return;
    }

    setTotalInterviews(data.length);
    setRecentInterviews(
     data.slice(-5).reverse()
    );

    if (data.length > 0) {
      const scores = data.map((item) => item.score);

      const avg =
        scores.reduce((a, b) => a + b, 0) /
        scores.length;

      const best = Math.max(...scores);

      setAverageScore(avg.toFixed(1));
      setBestScore(best);
    }
  };
    const logout = async () => {
    await supabase.auth.signOut();
    setPage("login");
    };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1>Dashboard</h1>

      <h3>Welcome Back</h3>

      <div
        style={{
          border: "1px solid gray",
          padding: "20px",
          margin: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Total Interviews</h2>
        <p>{totalInterviews}</p>
      </div>

      <div
        style={{
          border: "1px solid gray",
          padding: "20px",
          margin: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Average Score</h2>
        <p>{averageScore}</p>
      </div>

      <div
        style={{
          border: "1px solid gray",
          padding: "20px",
          margin: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Best Score</h2>
        <p>{bestScore}</p>
      </div>

      <div
        style={{
          border: "1px solid gray",
          padding: "20px",
          margin: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Recent Interviews</h2>

        {recentInterviews.length === 0 ? (
          <p>No interviews yet</p>
        ) : (
          recentInterviews.map((interview) => (
            <div
              key={interview.id}
              style={{
                marginBottom: "15px",
              }}
            >
              <strong>{interview.role}</strong>

              <p>
                Score: {interview.score}
              </p>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => setPage("interview")}
          style={{ margin: "10px" }}
        >
          Start Interview
        </button>

        <button
          onClick={() => setPage("history")}
          style={{ margin: "10px" }}
        >
          View History
        </button>
        <button
          onClick={logout}
          style={{ margin: "10px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;