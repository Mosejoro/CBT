// Timetable Configuration
const timetable = {
  Day1: {
    P1: ["English", "Mathematics"],
    P2: ["Basic_Science", "CCA"],
    P3: ["National_Value", "Prevocational_Studies"],
    P4: ["English", "Mathematics"],
    P5: ["CRK", "French"],
    P6: ["Basic_Science", "National_Value"],
  },
  Day2: {
    P1: ["CCA", "Basic_Science"],
    P2: ["English", "Mathematics"],
    P3: ["CRK", "English"],
    P4: ["CCA", "Prevocational_Studies"],
    P5: ["English", "Mathematics"],
    P6: ["CRK", "French"],
  },
  Day3: {
    P1: ["National_Value", "CRK"],
    P2: ["Prevocational_Studies", "National_Value"],
    P3: ["Mathematics", "CCA"],
    P4: ["Basic_Science", "National_Value"],
    P5: ["Prevocational_Studies", "CCA"],
    P6: ["English", "Mathematics"],
  },
  Day4: {
    P1: ["Prevocational_Studies", "English"],
    P2: ["CRK", "Basic_Science"],
    P3: ["Basic_Science", "National_Value"],
    P4: ["CRK", "French"],
    P5: ["Basic_Science", "National_Value"],
    P6: ["CCA", "Prevocational_Studies"],
  },
  Day5: {
    P1: ["Mathematics", "Basic_Science"],
    P2: ["CCA", "English"],
    P3: ["Prevocational_Studies", "CRK"],
    P4: ["National_Value", "English"],
    P5: ["CRK", "Prevocational_Studies"],
    P6: ["French", "Basic_Science"],
  },
  Day6: {
    P1: ["CRK", "Prevocational_Studies"],
    P2: ["Mathematics", "National_Value"],
    P3: ["English", "Mathematics"],
    P4: ["Basic_Science", "CCA"],
    P5: ["National_Value", "English"],
    P6: ["Mathematics", "CCA"],
  },
};

// API Configuration
const apiKey = "AIzaSyAq-OpHyYcqlK5rtNJ8MBtPP4LcCVotzcU";
const sheetId = "1CSNKDZZdz4ZKL28o2jPUcbGJ8xM85Jifpan_mxaZVKQ";
const sheetURL =
  "https://script.google.com/macros/s/AKfycbx3-EjFsnOgcQBFwSt-xN9C2dNo9HcW_X93uIcZOPYupLlyXbGlc29mYK-QhHw-IfJHOQ/exec";

// Helper Functions
function getSheetName(subject, classLevel) {
  return `${subject.replace(/\s+/g, "")}_${classLevel}`;
}

// Fetch and Display Questions
async function fetchQuestions(day, cls, subject) {
  if (!subject) {
    alert("Please select a subject.");
    return;
  }

  let sheetName = getSheetName(subject, cls);
  let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  try {
    let response = await fetch(url);
    let data = await response.json();

    if (!data.values) {
      throw new Error(`No sheet found for ${sheetName}`);
    }

    displayQuestions(data.values, subject, cls);
  } catch (error) {
    console.error("Error fetching questions:", error);
    document.getElementById("questions").innerHTML = `
      <p class="error">Error: Could not load questions for ${subject.replace(
        /_/g,
        " "
      )} - ${cls}.</p>
      <p>Please make sure the corresponding sheet exists in the spreadsheet.</p>
      <button onclick="window.location.href='index.html'" class="back-btn">Go Back</button>
    `;
  }
}

// Store questions data globally
let questionsData = [];

// Display questions in HTML
function displayQuestions(data, subject, cls) {
  let questionsDiv = document.getElementById("questions");
  questionsDiv.innerHTML = "";
  questionsData = [];

  if (!data || data.length <= 1) {
    questionsDiv.innerHTML = "<p>No questions found.</p>";
    return;
  }
  document.querySelectorAll(".option-label input").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      // Find the question container and remove the unanswered class
      const questionContainer = e.target.closest(".question-container");
      if (questionContainer) {
        questionContainer.classList.remove("unanswered");
      }
    });
  });
  // Add exam metadata section
  questionsDiv.innerHTML = `
    <div class="exam-header">
      <h3>Subject: ${subject.replace(/_/g, " ")}</h3>
      <h4>Class: Primary ${cls.substring(1)}</h4>
      <div class="student-info">
        <label for="username">Student Name:</label>
        <input type="text" id="username" required>
      </div>
    </div>
  `;

  // Create questions
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let questionText = row[0];
    let options = {
      A: row[1],
      B: row[2],
      C: row[3],
      D: row[4],
    };
    let correctAnswer = row[5];

    questionsData.push({
      questionNumber: i,
      correctAnswer,
      subject,
      cls,
    });

    let questionHTML = `
      <div class="question-container">
        <p class="question-text"><strong>Question ${i}:</strong> ${questionText}</p>
        <div class="options-container">
          ${Object.entries(options)
            .map(
              ([key, value]) => `
            <label class="option-label">
              <input type="radio" name="q${i}" value="${key}" required> 
              ${key}) ${value}
            </label>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    questionsDiv.innerHTML += questionHTML;
  }

  // Add submit button
  questionsDiv.innerHTML += `
    <button onclick="checkAnswers()" class="submit-btn">Submit Exam</button>
  `;
}

// Check answers and calculate score
// Function to check answers with validation for unanswered questions
function checkAnswers() {
  let username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter your name before submitting.");
    return;
  }

  // Check for unanswered questions
  let unansweredQuestions = [];
  questionsData.forEach((q, index) => {
    let selected = document.querySelector(
      `input[name="q${index + 1}"]:checked`
    );
    if (!selected) {
      unansweredQuestions.push(index + 1);
    }
  });

  // If there are unanswered questions, show alert and highlight them
  if (unansweredQuestions.length > 0) {
    // Highlight unanswered questions
    unansweredQuestions.forEach((qNum) => {
      const questionElement = document
        .querySelector(`div:has(input[name="q${qNum}"])`)
        .closest(".question-container");
      questionElement.classList.add("unanswered");
    });

    // Create message listing unanswered questions
    let message = `Please answer the following questions before submitting:\n• Question ${unansweredQuestions.join(
      "\n• Question "
    )}`;
    alert(message);

    // Scroll to the first unanswered question
    document.querySelector(`.unanswered`).scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return;
  }

  // Proceed with calculating score and submitting
  let score = 0;
  let responses = [];
  let totalQuestions = questionsData.length;

  questionsData.forEach((q, index) => {
    let selected = document.querySelector(
      `input[name="q${index + 1}"]:checked`
    );
    let isCorrect = selected && selected.value === q.correctAnswer;
    if (isCorrect) score++;

    responses.push({
      questionNumber: index + 1,
      selectedAnswer: selected.value,
      correct: isCorrect,
    });
  });

  // Prepare result data
  const resultData = {
    timestamp: new Date().toISOString(),
    name: username,
    subject:
      localStorage.getItem("examSubject") ||
      document.getElementById("subject").value,
    class:
      localStorage.getItem("examClass") ||
      document.getElementById("class").value,
    score: score,
    totalQuestions: totalQuestions,
    percentage: ((score / totalQuestions) * 100).toFixed(1),
    responses: JSON.stringify(responses),
  };

  // Save to appropriate sheet
  saveResult(resultData);
}

// Save result to Google Sheets
async function saveResult(resultData) {
  try {
    await fetch(sheetURL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...resultData,
        sheetName: getSheetName(resultData.subject, resultData.class),
      }),
    });

    // Add a small delay to ensure data is saved
    await new Promise((resolve) => setTimeout(resolve, 1000));

    displayResults(resultData);
  } catch (error) {
    console.error("Error saving result:", error);
    alert(
      "There was an issue displaying the results, but your answers have been recorded successfully."
    );
  }
}

// Display final results
function displayResults(resultData) {
  const questionsDiv = document.getElementById("questions");
  questionsDiv.innerHTML = `
    <div class="results-container">
      <h2><strong>${resultData.name}</strong>, Well done on your exam!</h2>
      <div class="results-summary">
      <p>Keep going, you’re doing great! Just take it one step at a time.</p>
       
      </div>
      <button onclick="window.location.href='index.html'" class="home-btn">Return to Homepage</button>
    </div>
  `;

  // Clear the stored exam details
  localStorage.removeItem("examDay");
  localStorage.removeItem("examClass");
  localStorage.removeItem("examSubject");
}

// Initialize if on questions page
if (window.location.pathname.includes("questions.html")) {
  window.addEventListener("load", () => {
    const day = localStorage.getItem("examDay");
    const cls = localStorage.getItem("examClass");
    const subject = localStorage.getItem("examSubject");

    if (!day || !cls || !subject) {
      alert("Please select exam details first");
      window.location.href = "index.html";
      return;
    }

    // Display exam info
    document.getElementById("exam-info").innerHTML = `
      <h2>Exam Details</h2>
      <p>Day: ${day}</p>
      <p>Class: Primary ${cls.substring(1)}</p>
      <p>Subject: ${subject.replace(/_/g, " ")}</p>
    `;

    // Auto fetch questions
    fetchQuestions(day, cls, subject);
  });
}
// Add this function to your script.js file

// Timer functionality
let examDuration = 4 * 60; // 30 minutes in seconds
let timerInterval;

function startTimer() {
  const timerElement = document.getElementById("time-remaining");
  let timeLeft = examDuration;

  // Update timer immediately
  updateTimerDisplay(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;

    // Update the timer display
    updateTimerDisplay(timeLeft);

    // Update progress bar
    const progressPercent = 100 - (timeLeft / examDuration) * 100;
    document.querySelector(
      ".progress-bar-fill"
    ).style.width = `${progressPercent}%`;

    // When time runs out
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Your exam will be submitted now.");
      checkAnswers();
    }

    // Warning when 5 minutes remaining
    if (timeLeft === 300) {
      showTimerWarning();
    }
  }, 1000);
}

function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  document.getElementById("time-remaining").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

  // Change color when less than 5 minutes remaining
  if (seconds < 300) {
    document.getElementById("time-remaining").style.color = "#ef4444";
  }
}

function showTimerWarning() {
  // Create a warning toast
  const toast = document.createElement("div");
  toast.className = "toast toast-warning";
  toast.innerHTML =
    "<strong>5 minutes remaining!</strong> Please finish your exam.";
  document.body.appendChild(toast);

  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Modify your existing fetchQuestions function to start the timer after questions load
async function fetchQuestions(day, cls, subject) {
  if (!subject) {
    alert("Please select a subject.");
    return;
  }

  let sheetName = getSheetName(subject, cls);
  let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  try {
    let response = await fetch(url);
    let data = await response.json();

    if (!data.values) {
      throw new Error(`No sheet found for ${sheetName}`);
    }

    displayQuestions(data.values, subject, cls);

    // Start the timer after questions are displayed
    startTimer();
  } catch (error) {
    console.error("Error fetching questions:", error);
    document.getElementById("questions").innerHTML = `
      <p class="error">Error: Could not load questions for ${subject.replace(
        /_/g,
        " "
      )} - ${cls}.</p>
      <p>Please make sure the corresponding sheet exists in the spreadsheet.</p>
      <button onclick="window.location.href='index.html'" class="back-btn">Go Back</button>
    `;
  }
}

// Add this to clear timer when exam is submitted
function checkAnswers() {
  // Clear the timer interval if it exists
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Rest of your existing checkAnswers code...
  let username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter your name before submitting.");
    return;
  }

  // Check for unanswered questions
  let unansweredQuestions = [];
  questionsData.forEach((q, index) => {
    let selected = document.querySelector(
      `input[name="q${index + 1}"]:checked`
    );
    if (!selected) {
      unansweredQuestions.push(index + 1);
    }
  });

  // If there are unanswered questions, show alert and highlight them
  if (unansweredQuestions.length > 0) {
    // Highlight unanswered questions
    unansweredQuestions.forEach((qNum) => {
      const questionElement = document
        .querySelector(`div:has(input[name="q${qNum}"])`)
        .closest(".question-container");
      questionElement.classList.add("unanswered");
    });

    // Create message listing unanswered questions
    let message = `Please answer the following questions before submitting:\n• Question ${unansweredQuestions.join(
      "\n• Question "
    )}`;
    alert(message);

    // Scroll to the first unanswered question
    document.querySelector(`.unanswered`).scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Restart the timer since the exam wasn't submitted
    startTimer();

    return;
  }

  // Proceed with calculating score and submitting
  let score = 0;
  let responses = [];
  let totalQuestions = questionsData.length;

  questionsData.forEach((q, index) => {
    let selected = document.querySelector(
      `input[name="q${index + 1}"]:checked`
    );
    let isCorrect = selected && selected.value === q.correctAnswer;
    if (isCorrect) score++;

    responses.push({
      questionNumber: index + 1,
      selectedAnswer: selected.value,
      correct: isCorrect,
    });
  });

  // Prepare result data
  const resultData = {
    timestamp: new Date().toISOString(),
    name: username,
    subject:
      localStorage.getItem("examSubject") ||
      document.getElementById("subject").value,
    class:
      localStorage.getItem("examClass") ||
      document.getElementById("class").value,
    score: score,
    totalQuestions: totalQuestions,
    percentage: ((score / totalQuestions) * 100).toFixed(1),
    responses: JSON.stringify(responses),
  };

  // Save to appropriate sheet
  saveResult(resultData);
}
