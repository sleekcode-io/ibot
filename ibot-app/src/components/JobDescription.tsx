import React, { useState } from "react";
import "../styles/JobDescriptionForm.css";
import "../App.css";

interface JobFormProps {
  showJobWindow: boolean;
  onSubmit: (data: { jobTitle: string; jobDescription: string }) => void;
  errorMessage: string;
}

const JobForm: React.FC<JobFormProps> = ({
  showJobWindow,
  onSubmit,
  errorMessage,
}) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleJobDescriptionSubmit = (e: React.FormEvent) => {
    console.log("handleJobDescriptionSubmit");
    // e.preventDefault();
    // Validate form fields if needed

    // Call the onSubmit callback with the entered values
    onSubmit({ jobTitle, jobDescription });

    // Clear the form after submission
    setJobTitle("");
    setJobDescription("");
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
            Submit
          </button>
        </div>
      </div>
    );
  };

  return <div>{showJobWindow && showJobForm()}</div>;
};

export default JobForm;
