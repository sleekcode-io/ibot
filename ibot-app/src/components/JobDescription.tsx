import React, { useState } from "react";
import axios from "axios";
import "../styles/JobDescriptionForm.css";
import "../App.css";

interface JobFormProps {
  sessionId: number;
  mode: string;
  showJobWindow: boolean;
  errorMessage: string;
  onClose: () => void;
}

const JobForm: React.FC<JobFormProps> = ({
  sessionId,
  mode,
  showJobWindow,
  errorMessage,
  onClose,
}) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleJobDescriptionSubmit = async (e: React.FormEvent) => {
    console.log("handleJobDescriptionSubmit");
    // e.preventDefault();
    // Validate form fields if needed
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    }
    // Send job data to bot
    let botResponse = null;
    try {
      botResponse = await axios.post("http://localhost:5205/job-data", {
        id: sessionId,
        mode: mode,
        content: jobTitle + ", " + jobDescription,
      });
      // Clear the form after submission
      setJobTitle("");
      setJobDescription("");
    } catch (e: unknown) {
      let error = "";
      if (typeof e === "string") {
        error = e.toUpperCase();
      } else if (e instanceof Error) {
        error = e.message;
      }
      console.error("handleUserResponse error: " + error);
      // let msg =
      //   error + ". Check your connection and/or reload browser to restart. ";
      //setErrorMessage(msg);
    }
  };

  const showJobForm = () => {
    return (
      <div
        className="job-form-container"
        style={{
          backgroundColor: "#96419c",
        }}
      >
        <div className="display-vertical">
          <div
            className="error-message"
            style={{
              visibility: errorMessage !== "" ? "visible" : "hidden",
            }}
          >
            {errorMessage !== "" && errorMessage}
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
