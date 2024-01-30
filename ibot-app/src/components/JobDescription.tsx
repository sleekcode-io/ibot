import React, { useState } from "react";
import axios from "axios";
import "../styles/JobDescriptionForm.css";
import "../App.css";
import { JobFormProps } from "./Interfaces";

const JobForm: React.FC<JobFormProps> = ({
  sessionId,
  mode,
  showJobWindow,
  errorMessage,
  onClose,
}) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleJobDescriptionSubmit = async (e: React.FormEvent) => {
    console.log("handleJobDescriptionSubmit");
    // e.preventDefault();
    // Validate form fields if needed
    if (sessionId < 0) {
      setStatusMessage(
        "No session open. Please reload web browser to start a new session."
      );
      return; // there is no session open, do nothing...
    }
    setStatusMessage("Submitting job data... ");
    // Send job data to bot
    let botResponse = null;
    try {
      botResponse = await axios.post("http://localhost:5205/job-data", {
        id: sessionId,
        mode: mode,
        jobData: jobTitle + ", " + jobDescription,
      });
      // Clear the form after submission
      setJobTitle("");
      setJobDescription("");
      setStatusMessage("Job description submitted successfully.");
    } catch (e: unknown) {
      let error = "";
      if (typeof e === "string") {
        error = e.toUpperCase();
      } else if (e instanceof Error) {
        error = e.message;
      }
      console.error("handleUserResponse error: " + error);
      setStatusMessage("Job description submission failed: " + error);
    }
    // Clear status message after 5 seconds
    setTimeout(() => {
      setStatusMessage("");
    }, 10000);
  };

  const showJobForm = () => {
    return (
      <div
        className="display-container"
        style={{
          backgroundColor: "#96419c",
        }}
      >
        <div className="display-vertical">
          <div
            className="error-message"
            style={{
              backgroundColor: errorMessage !== "" ? "orange" : "#8deba6",
              visibility:
                errorMessage !== "" || statusMessage !== ""
                  ? "visible"
                  : "hidden",
            }}
          >
            {errorMessage !== "" && errorMessage}
            {statusMessage !== "" && statusMessage}
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#fff",
              marginLeft: "1vw",
              marginBottom: "2vh",
            }}
          >
            Please give details of the job you are interviewing for here. Then,
            choose how you want to conduct the interview afterward.
          </div>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            placeholder="Enter Job Title"
            style={{
              marginBottom: "1vh",
            }}
          />
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            placeholder="Enter Job Description"
            style={{
              height: "50vh",
              marginBottom: "2vh",
            }}
          />
          <div className="display-horizontal">
            <button
              className="jobbutton"
              onClick={onClose}
              style={{
                backgroundColor: "#fff",
                marginRight: "2vw",
              }}
            >
              Close
            </button>
            <button
              className="jobbutton"
              onClick={handleJobDescriptionSubmit}
              style={{
                backgroundColor:
                  jobTitle !== "" && jobDescription !== "" ? "#fff" : "#d8d8d8",
                cursor:
                  jobTitle !== "" && jobDescription !== ""
                    ? "pointer"
                    : "not-allowed",
              }}
              type="submit"
            >
              {mode === "submission" ? "Submit" : "Send"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return <div>{showJobWindow && showJobForm()}</div>;
};

export default JobForm;
