
import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Sidebar from "./Sidebar";
import "../stylesheets/CodingProfile.css";
import GitHubCalendar from "react-calendar-heatmap";
// import GitHubCalendar from "react-github-calendar";
import "react-calendar-heatmap/dist/styles.css";
import LeetCodeCalendar from "leetcode-calendar";
import "../App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const CodingProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [codechefHandle, setCodechefHandle] = useState(
    localStorage.getItem("codechefHandle") || ""
  );
  const [codechefData, setCodechefData] = useState(
    JSON.parse(localStorage.getItem("codechefData")) || null
  );
  const [githubUsername, setGithubUsername] = useState(
    localStorage.getItem("githubUsername") || ""
  );
  const [submittedUsername, setSubmittedUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [codeforcesHandle, setCodeforcesHandle] = useState(
    localStorage.getItem("codeforcesHandle") || ""
  );
  const [codeforcesData, setCodeforcesData] = useState(
    JSON.parse(localStorage.getItem("codeforcesData")) || null
  );
  const [leetcodeUsername, setLeetCodeUsername] = useState(
    localStorage.getItem("leetcodeUsername") || ""
  );
  const [submittedLeetCodeUsername, setSubmittedLeetCodeUsername] =
    useState("");
  const [leetcodeVisible, setLeetCodeVisible] = useState(
    Boolean(localStorage.getItem("leetcodeUsername"))
  );
  const [error, setError] = useState("");

  // Save to local storage whenever state changes
  useEffect(() => {
    if (codechefHandle) {
      localStorage.setItem("codechefHandle", codechefHandle);
      localStorage.setItem("codechefData", JSON.stringify(codechefData));
    } else {
      localStorage.removeItem("codechefHandle");
      localStorage.removeItem("codechefData");
    }
  }, [codechefHandle, codechefData]);

  useEffect(() => {
    if (codeforcesHandle) {
      localStorage.setItem("codeforcesHandle", codeforcesHandle);
      localStorage.setItem("codeforcesData", JSON.stringify(codeforcesData));
    } else {
      localStorage.removeItem("codeforcesHandle");
      localStorage.removeItem("codeforcesData");
    }
  }, [codeforcesHandle, codeforcesData]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch CodeChef data
  const fetchCodechefData = async () => {
    try {
      const response = await fetch(
        `https://codechef-api.vercel.app/handle/${codechefHandle}`
      );
      const data = await response.json();
      if (data.success) {
        setCodechefData(data);
        setError("");
      } else {
        setError(`CodeChef: ${data.message}`);
      }
    } catch (err) {
      setError("Error fetching CodeChef data.");
    }
  };

  const handleCodechefSubmit = (e) => {
    e.preventDefault();
    if (codechefHandle.trim()) fetchCodechefData();
    else setError("Please enter a valid CodeChef handle.");
  };

  const fetchCodeforcesData = async () => {
    try {
      const response = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesHandle}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        setCodeforcesData(data.result[0]);
        setError("");
      } else {
        setError(`Codeforces: ${data.comment}`);
      }
    } catch (err) {
      setError("Error fetching Codeforces data.");
    }
  };

  const handleCodeforcesSubmit = (e) => {
    e.preventDefault();
    if (codeforcesHandle.trim()) fetchCodeforcesData();
    else setError("Please enter a valid Codeforces handle.");
  };

  //   github

  useEffect(() => {
    if (!submittedUsername) return; // Don't fetch data if no username is submitted

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${submittedUsername}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data. Please check the username.");
        }

        const result = await response.json();
        setData(result); // Store the fetched data
      } catch (err) {
        setError(err.message); // Display error message if fetch fails
      } finally {
        setLoading(false); // Set loading to false after fetching is done
      }
    };

    fetchData(); // Trigger data fetch
  }, [submittedUsername]);

  if (loading) return <p>Loading...</p>; // Display loading message
  if (error) return <p className="error-message">{error}</p>; // Display error message

  const handleSubmit = (e) => {
    e.preventDefault();
    if (githubUsername.trim()) {
      setSubmittedUsername(githubUsername.trim().toLowerCase());
      setError(null);
    } else {
      setError("Please Enter a valid GitHub username");
    }
  };

  const handleReset = () => {
    setGithubUsername("");
    setSubmittedUsername("");
    setError(null);
  };

  const resetCodeforcesHandle = () => {
    setCodeforcesHandle("");
    setCodeforcesData(null);
    localStorage.removeItem("codeforcesHandle");
    localStorage.removeItem("codeforcesData");
  };

  const resetCodechefHandle = () => {
    setCodechefHandle("");
    setCodechefData(null);
    localStorage.removeItem("codechefHandle");
    localStorage.removeItem("codechefData");
  };

  const commitData = (data?.contributions || []).map((contribution) => ({
    date: contribution.date,
    count: contribution.count,
  }));

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // LeetCode

  const exampleTheme = {
    light: [
      "rgb(235, 235, 235)",
      "rgba(76, 175, 80, 0.44)",
      "rgba(76, 175, 80, 0.6)",
      "rgba(67, 160, 71, 0.76)",
      "rgba(67, 160, 71, 0.92)",
    ],
    dark: [
      "rgb(235, 235, 235)",
      "rgba(76, 175, 80, 0.44)",
      "rgba(76, 175, 80, 0.6)",
      "rgba(67, 160, 71, 0.76)",
      "rgba(67, 160, 71, 0.92)",
    ],
  };

  const LeetCodehandleSubmit = (e) => {
    e.preventDefault();
    if (leetcodeUsername.trim() === "") {
      setError("Please enter a valid LeetCode username");
      return;
    }
    setError(null);
    setSubmittedLeetCodeUsername(leetcodeUsername.trim());
    setLeetCodeVisible(true);
    localStorage.setItem("leetcodeUsername", leetcodeUsername.trim());
  };

  const LeetCodehandleReset = () => {
    setLeetCodeUsername("");
    setSubmittedLeetCodeUsername("");
    setError(null);
    setLeetCodeVisible(false);
    localStorage.removeItem("leetcodeUsername");
  };

  return (
    <div className="profile-container">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <h1>Your Coding Profile</h1>

        <div className="platform-block">
          {!codeforcesData ? (
            <form onSubmit={handleCodeforcesSubmit} className="codeforces-form">
              <input
                type="text"
                placeholder="Enter Codeforces Handle"
                value={codeforcesHandle}
                onChange={(e) => setCodeforcesHandle(e.target.value)}
                className="fetch-user-input"
              />
              <button type="submit" className="fetch-user-button">
                Fetch Data
              </button>
            </form>
          ) : (
            <button className="reset-button" onClick={resetCodeforcesHandle}>
              De-link Codeforces
            </button>
          )}
          {codeforcesData && (
            <div className="dashboard">
              <div className="info-section">
                <div className="profile-image-info">
                  <img
                    src={codeforcesData.avatar || ""}
                    alt="User Avatar"
                    className="profile-img"
                  />
                  <div className="user-details">
                    <p>
                      <strong>Handle:</strong> {codeforcesData.handle}
                    </p>
                    <p>
                      <strong>Rating:</strong> {codeforcesData.rating || "N/A"}
                    </p>
                    <p>
                      <strong>Max Rating:</strong>{" "}
                      {codeforcesData.maxRating || "N/A"}
                    </p>
                    <p>
                      <strong>Rank:</strong> {codeforcesData.rank || "N/A"}
                    </p>
                    <p>
                      <strong>Max Rank:</strong>{" "}
                      {codeforcesData.maxRank || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="platform-block">
          {!codechefData ? (
            <form onSubmit={handleCodechefSubmit} className="codechef-form">
              <input
                type="text"
                placeholder="Enter CodeChef Handle"
                value={codechefHandle}
                onChange={(e) => setCodechefHandle(e.target.value)}
                className="fetch-user-input"
              />
              <button type="submit" className="fetch-user-button">
                Fetch Data
              </button>
            </form>
          ) : (
            <button className="reset-button" onClick={resetCodechefHandle}>
              De-link CodeChef
            </button>
          )}
          {codechefData && (
            <div className="dashboard">
              <div className="info-and-performance">
                <div className="info-section">
                  <div className="profile-image-info">
                    <img
                      src={codechefData.profile || ""}
                      alt="User Profile"
                      className="profile-img"
                    />
                    <div className="user-details">
                      <p>
                        <strong>Name:</strong> {codechefData.name || "N/A"}
                      </p>
                      <p>
                        <strong>Stars:</strong> {codechefData.stars || "N/A"}
                      </p>
                      <p>
                        <strong>Country:</strong>{" "}
                        {codechefData.countryName || "N/A"}
                      </p>
                      <img
                        src={codechefData.countryFlag || ""}
                        alt="Country Flag"
                        className="country-flag"
                      />
                    </div>
                  </div>
                </div>
                <div className="chart-section">
                  <Doughnut
                    data={{
                      labels: ["Highest Rating", "Current Rating"],
                      datasets: [
                        {
                          label: "CodeChef Stats",
                          data: [
                            codechefData.highestRating || 0,
                            codechefData.currentRating || 0,
                          ],
                          backgroundColor: ["#FF6384", "#36A2EB"],
                          hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                        },
                      ],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GitHub Contributions Section */}
        <div>
          {!submittedUsername ? (
            <form onSubmit={handleSubmit} className="github-form">
              <input
                type="text"
                placeholder="Enter GitHub Username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="fetch-user-input"
              />
              <button type="submit" className="fetch-user-button">
                Fetch Data
              </button>
            </form>
          ) : (
            <button
              style={{ marginTop: "10%" }}
              className="reset-button"
              onClick={handleReset}
            >
              De-link GitHub
            </button>
          )}
          {submittedUsername && (
            <div>
              <h3 style={{ textAlign: "center" }}>
                {submittedUsername.toUpperCase()}'s GitHub Contributions
              </h3>
              <GitHubCalendar
                startDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                }
                endDate={new Date()}
                values={commitData}
                classForValue={(value) =>
                  value
                    ? `color-scale-${Math.min(value.count, 4)}`
                    : "color-scale-0"
                }
                tooltipDataAttrs={(value) => ({
                  "data-tip": `${value.date || "No Date"}: ${
                    value.count || 0
                  } commits`,
                })}
              />
            </div>
          )}
        </div>
        {/* LeetCode */}
        <div className="platform-block-leetcode">
          {!leetcodeVisible ? (
            <form onSubmit={LeetCodehandleSubmit} className="github-form">
              <input
                type="text"
                placeholder="Enter Leetcode username"
                value={leetcodeUsername}
                onChange={(e) => setLeetCodeUsername(e.target.value)}
                className="fetch-user-input"
              />
              <button type="submit" className="fetch-user-button">
                Fetch Data
              </button>
            </form>
          ) : (
            <button
              style={{ marginTop: "10%" }}
              className="reset-button"
              onClick={LeetCodehandleReset}
            >
              De-link Leetcode
            </button>
          )}
          {error}
          {submittedLeetCodeUsername && (
            <div>
              <h3 style={{textAlign:"center"}}>{submittedLeetCodeUsername.toUpperCase()}'s LeetCode Calendar</h3>
              <LeetCodeCalendar
                username={submittedLeetCodeUsername}
                blockSize={15}
                blockMargin={5}
                fontSize={16}
                theme={exampleTheme}
                style={{ maxWidth: "800px", margin: "10px" }}
              />
            </div>
          )}
        </div>
        {/* <p className="coming-soon">
          🚀 Coming Soon! Stay Tuned for More Features! 🚀  
        </p> */}
      </div>
    </div>
  );
};

export default CodingProfile;
