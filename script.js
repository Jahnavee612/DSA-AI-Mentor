const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

const welcome = document.getElementById("welcome");

const codeEditor = document.getElementById("codeEditor");
const analyzeCodeButton =
    document.getElementById("analyzeCodeButton");
const codeInput = document.getElementById("codeInput");
const clearCodeButton = document.getElementById("clearCodeButton");

let selectedMode = "learn";


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const question = userInput.value.trim();

    if (question === "") {
        return;
    }

    if (welcome) {
        welcome.style.display = "none";
    }

    addMessage(question, "user");

    userInput.value = "";

    const loadingMessage = addMessage("Thinking...", "ai");

    try {

        const response = await fetch("http://localhost:5000/api/ask", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                mode: selectedMode
            })

        });

        const data = await response.json();

        loadingMessage.remove();

        if (response.ok) {

            addMessage(data.answer, "ai");

        } else {

            addMessage(
                "Sorry, something went wrong.",
                "ai"
            );

        }

    } catch (error) {

        console.error(error);

        loadingMessage.remove();

        addMessage(
            "Could not connect to the AI server. Make sure DSA.js is running.",
            "ai"
        );
    }
}

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatAIResponse(text) {

    const parts = text.split("```");

    let html = "";

    parts.forEach((part, index) => {

        const safeText = escapeHTML(part);

        // Code block
        if (index % 2 === 1) {

            const lines = safeText.split("\n");

            // Remove language name
            if (
                lines[0].trim().toLowerCase() === "java" ||
                lines[0].trim().toLowerCase() === "javascript" ||
                lines[0].trim().toLowerCase() === "js"
            ) {
                lines.shift();
            }

            html += `
                <pre><code>${lines.join("\n")}</code></pre>
            `;

        } else {

            let formatted = safeText;

            // Headings
            formatted = formatted.replace(
                /^### (.*)$/gm,
                "<h3>$1</h3>"
            );

            formatted = formatted.replace(
                /^## (.*)$/gm,
                "<h2>$1</h2>"
            );

            formatted = formatted.replace(
                /^# (.*)$/gm,
                "<h1>$1</h1>"
            );

            // Bold
            formatted = formatted.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );

            // Italic
            formatted = formatted.replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            );

            // Horizontal line
            formatted = formatted.replace(
                /^---$/gm,
                "<hr>"
            );

            // Line breaks
            formatted = formatted.replace(/\n/g, "<br>");

            html += `<div>${formatted}</div>`;
        }
    });

    return html;
}

// ===============================
// ADD MESSAGE
// ===============================

function addMessage(text, sender) {

    const message = document.createElement("div");

    message.classList.add("message");

    if (sender === "user") {
        message.classList.add("user-message");
    }

    const avatar = document.createElement("div");

    avatar.classList.add("message-avatar");

    avatar.textContent =
        sender === "user" ? "👤" : "✦";

    const content = document.createElement("div");

    content.classList.add("message-content");

    if (sender === "ai") {
        content.innerHTML = formatAIResponse(text);
    } else {
        content.textContent = text;
    }

    message.appendChild(avatar);
    message.appendChild(content);

    chatArea.appendChild(message);

    chatArea.scrollTop = chatArea.scrollHeight;

    return message;
}


// ===============================
// SEND BUTTON
// ===============================

sendButton.addEventListener("click", sendMessage);


// ===============================
// ENTER KEY
// ===============================

userInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }

});


// ===============================
// MODE SELECTOR
// ===============================

const modeButtons = document.querySelectorAll(".mode");

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        modeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedMode = button.dataset.mode;

        console.log("Selected mode:", selectedMode);


        // Show code editor only in Debug mode
        if (selectedMode === "debug") {

            codeEditor.style.display = "block";

        } else {

            codeEditor.style.display = "none";

        }

    });

});

clearCodeButton.addEventListener("click", () => {

    codeInput.value = "";

});

analyzeCodeButton.addEventListener("click", async () => {

    const code = codeInput.value.trim();

    if (code === "") {
        alert("Please paste your Java code first.");
        return;
    }

    if (welcome) {
        welcome.style.display = "none";
    }

    addMessage("🐛 Please analyze my code.", "user");

    const loadingMessage = addMessage(
        "Analyzing your code...",
        "ai"
    );

    try {

        const response = await fetch(
            "http://localhost:5000/api/ask",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: "Please debug and analyze this Java code.",
                    mode: "debug",
                    code: code
                })
            }
        );

        const data = await response.json();

        loadingMessage.remove();

        if (response.ok) {

            // Hide code editor after analysis
            codeEditor.style.display = "none";

            addMessage(data.answer, "ai");

        } else {
            addMessage(
                "Sorry, something went wrong.",
                "ai"
            );
        }

    } catch (error) {

        console.error(error);

        loadingMessage.remove();

        addMessage(
            "Could not connect to the AI server.",
            "ai"
        );
    }
});