import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

function History() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  async function fetchInterviews() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setInterviews(data);
    }
  }

  return (
    <div>
      <h1>Interview History</h1>

      {interviews.length === 0 ? (
        <p>No interviews found.</p>
      ) : (
        interviews.map((interview) => (
          <div
            key={interview.id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              margin: "10px",
              borderRadius: "10px",
            }}
          >
            <h3>{interview.role}</h3>
            <p>Score: {interview.score}/100</p>
            <p>{interview.summary}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default History;