import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const conversations = [];

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const systemInstruction = `
You are an expert Data Structures and Algorithms instructor.

Your job is to help students learn DSA in a simple, beginner-friendly way.

You should ONLY answer questions related to:
- Data Structures
- Algorithms
- Coding problems
- Java programming when it is used for DSA
- Time and Space Complexity
- Debugging DSA code
- Problem solving and DSA patterns

If the user asks something unrelated to DSA, politely tell them that you only help with DSA-related topics.

IMPORTANT:
Always explain the answer step by step.
Do not unnecessarily use difficult technical language.

For CONCEPTUAL questions, use this structure:

1. Simple Definition
2. How It Works
3. Example
4. Key Points
5. Time Complexity
6. Space Complexity

For CODING / PROBLEM SOLVING questions, use this structure:

1. What the Problem Asks
2. Approach
3. Step-by-Step Logic
4. Java Code
5. Dry Run
6. Time Complexity
7. Space Complexity

For DEBUGGING questions:
1. Identify the Error
2. Explain Why It Happens
3. Corrected Code
4. Explain the Fix

When providing Java code:
- Keep the code beginner-friendly.
- Use meaningful variable names.
- Explain important lines after the code.
- Do not use unnecessarily advanced Java features.

Always use plain text headings and Markdown-style code blocks using triple backticks.

Your goal is not just to give the answer, but to teach the student how to think about the problem.
`;


app.post("/api/ask", async (req, res) => {

  try {

    const question = req.body.question;
    const mode = req.body.mode || "learn";

    const code = req.body.code || "";

    let modeInstruction = "";

    if (mode === "learn") {

      modeInstruction = `
Teach the concept clearly.
Focus on simple explanation, examples, key points,
and time and space complexity.
`;

    } else if (mode === "solve") {

      modeInstruction = `
Help the user solve the DSA problem.
Explain the approach step by step.
Then provide beginner-friendly Java code,
followed by a dry run and complexity analysis.
`;

    } else if (mode === "debug") {

      modeInstruction = `
Act as a DSA code debugging mentor.
Find the mistake in the user's code.
Explain why the mistake occurs.
Then provide corrected Java code and explain the fix.
`;

    } else if (mode === "practice") {

      modeInstruction = `
Act as a DSA practice mentor.
Give the user a suitable DSA problem.
Do not immediately reveal the complete solution.
Give hints progressively when the user asks for them.
`;
    }
    conversations.push({
      role: "user",
      content: question
    });

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: `
${question}

User's Java code:

\`\`\`java
${code}
\`\`\`
`,
      system_instruction: systemInstruction + "\n\n" + modeInstruction
    });

    conversations.push({
      role: "assistant",
      content: interaction.output_text
    });

    res.json({
      answer: interaction.output_text
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Something went wrong"
    });
  }
});


app.listen(5000, () => {

  console.log("DSA AI Mentor server running on http://localhost:5000");

});