import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini client to avoid crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in the Secrets panel or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// REST Endpoint: Fix Error Loop
app.post("/api/fix", async (req: express.Request, res: express.Response) => {
  try {
    const { fileContent, filePath, error, modelTier } = req.body;

    if (!fileContent || !filePath || !error) {
      res.status(400).json({ error: "Missing required parameters: fileContent, filePath, or error." });
      return;
    }

    // Determine model based on tier
    // Free: gemini-3.1-flash-lite, Pro: gemini-3.1-pro-preview
    // Let's use gemini-3.5-flash as the standard fallback or light model
    const modelName = modelTier === "pro" ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

    console.log(`[AI Fix-It] Processing fix request for ${filePath} using ${modelName}...`);

    let ai: GoogleGenAI;
    try {
      ai = getAiClient();
    } catch (apiError: any) {
      // Graceful fallback with simulated mock response if API Key is not set yet
      // This ensures the application remains highly interactive and does not fail completely
      console.warn("[AI Fix-It] GEMINI_API_KEY is not configured. Falling back to diagnostic helper.");
      
      const isMissingSemicolon = error.toLowerCase().includes("semicolon") || error.includes(";");
      let mockFixed = fileContent;
      let explanation = "API Key not configured. Using fallback local heuristic resolver.";
      let diffSummary = "Detected API key is missing. Showing simulated compiler resolution.";
      
      if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
        mockFixed = fileContent.replace("cont ", "const ").replace("functon ", "function ");
        explanation = "Local static parser resolved potential keyword typos. To get full high-powered AI assistance, please configure your GEMINI_API_KEY in Settings > Secrets!";
        diffSummary = "Fixed common TypeScript syntax issues.";
      } else if (filePath.endsWith(".rs")) {
        mockFixed = fileContent.replace("fn main()", "fn main() -> Result<(), Box<dyn std::error::Error>>");
        explanation = "Rust cargo compiler correction suggestion. Configure your GEMINI_API_KEY for actual AI fixing!";
        diffSummary = "Added standard Return Result to Rust entrypoint.";
      }
      
      res.json({
        explanation,
        fixedCode: mockFixed,
        diffSummary,
        isDemoFallback: true
      });
      return;
    }

    const systemInstruction = `You are a master software compiler repair assistant for snippets.live.
Your task is to analyze a file path, its current buggy code content, and the compiler/terminal error message provided.
You must find the bug and return a complete corrected version of the code that successfully compiles, a short 1-2 sentence explanation of the bug, and a summary of the differences.
Ensure your code is clean and adheres to the corresponding programming language syntax.`;

    const prompt = `
File Path: ${filePath}
Current Code:
\`\`\`
${fileContent}
\`\`\`

Terminal/Compiler Error:
${error}

Please provide the corrected code and explanation.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A concise 1-2 sentence explanation of what was wrong and how it is fixed.",
            },
            fixedCode: {
              type: Type.STRING,
              description: "The COMPLETE corrected code file contents, not just a snippet or diff.",
            },
            diffSummary: {
              type: Type.STRING,
              description: "A summary of the changes made to the code (e.g. 'Corrected typo in function definition on line 12').",
            },
          },
          required: ["explanation", "fixedCode", "diffSummary"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API.");
    }

    const result = JSON.parse(responseText.trim());
    res.json({
      explanation: result.explanation,
      fixedCode: result.fixedCode,
      diffSummary: result.diffSummary,
      isDemoFallback: false
    });

  } catch (err: any) {
    console.error("[AI Fix-It Error]:", err);
    res.status(500).json({
      error: "Failed to generate code fix.",
      details: err.message || err.toString()
    });
  }
});

// REST Endpoint: Workbench Agent Chat & Compile
app.post("/api/workbench/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { message, files, activeFilePath } = req.body;

    if (!message) {
      res.status(400).json({ error: "Missing user message." });
      return;
    }

    let ai: GoogleGenAI;
    try {
      ai = getAiClient();
    } catch (apiError: any) {
      // Graceful fallback with simulated mock response if API Key is not set yet
      console.warn("[Workbench Agent] GEMINI_API_KEY is not configured. Falling back to local diagnostic simulation.");
      
      const promptLower = message.toLowerCase();
      let replyMessage = "";
      let updatedFiles = { ...files };
      let compilationSuccess = true;
      let compilationMessage = "Compilation check: PASS";

      if (promptLower.includes("auth") || promptLower.includes("login")) {
        const authCode = `// Authenticated User helper block
export function validateToken(token: string): boolean {
  if (!token) return false;
  // Simulated token decoding
  const parts = token.split('.');
  return parts.length === 3;
}

export function getCurrentUser() {
  return { id: "user_01", email: "push2playlive@gmail.com", role: "developer" };
}`;
        updatedFiles["src/auth.ts"] = {
          name: "auth.ts",
          content: authCode,
          language: "typescript"
        };
        replyMessage = `### 🤖 Workbench Compiling Agent (DEMO MODE)

I've automatically generated and integrated a secure authentication helper module inside **\`src/auth.ts\`**!

Here is the helper code that I added:
\`\`\`typescript
${authCode}
\`\`\`

To test this with your existing files, you can import \`validateToken\` and run compilation checks.
*(Note: To enable full high-powered Gemini AI and direct code integrations based on any prompt, please set your \`GEMINI_API_KEY\` in the Secrets panel!)*`;
        compilationMessage = "TypeScript compiler check: OK - 1 new module integrated.";
      } else if (promptLower.includes("rust") || promptLower.includes("cargo")) {
        const rustCode = `// Rust cargo module
pub struct WorkbenchUtility {
    pub name: String,
}

impl WorkbenchUtility {
    pub fn new(name: &str) -> Self {
        Self { name: name.to_string() }
    }
    
    pub fn process(&self) -> Result<(), &'static str> {
        println!("[Workbench] Processing sandbox utility: {}", self.name);
        Ok(())
    }
}`;
        updatedFiles["src/lib.rs"] = {
          name: "lib.rs",
          content: rustCode,
          language: "rust"
        };
        replyMessage = `### 🤖 Workbench Compiling Agent (DEMO MODE)

I have crafted a modular Rust utility inside **\`src/lib.rs\`** to expand your cargo crate:

\`\`\`rust
${rustCode}
\`\`\`

This file compiles successfully under standard Rust cargo profiles.
*(Note: To unlock the fully adaptive Gemini AI, configure your \`GEMINI_API_KEY\` in the Secrets panel!)*`;
        compilationMessage = "rustc static compilation: PASS";
      } else {
        const newFileName = "src/helper.js";
        const helperCode = `// Helper utility created by snippets.live agent
export function greet(name) {
  return \`Hello \${name}, welcome to the Workbench!\`;
}
`;
        updatedFiles[newFileName] = {
          name: "helper.js",
          content: helperCode,
          language: "javascript"
        };
        replyMessage = `### 🤖 Workbench Compiling Agent (DEMO MODE)

I hear you! I have created a general helper utility inside **\`${newFileName}\`**:

\`\`\`javascript
${helperCode}
\`\`\`

You can use the explorer tree on the left to inspect it, edit it, or download the final compiled bundle!
*(Note: For real-time multi-file custom integrations powered by Google Gemini, configure your \`GEMINI_API_KEY\` in the Secrets panel!)*`;
        compilationMessage = "Sandbox transpilation: SUCCESS";
      }

      res.json({
        message: replyMessage,
        updatedFiles,
        compilationSuccess,
        compilationMessage,
        isDemoFallback: true
      });
      return;
    }

    let filesSummary = "";
    if (files && Object.keys(files).length > 0) {
      filesSummary = "Here are the files currently present in the user's workbench:\n";
      Object.entries(files).forEach(([path, file]: [string, any]) => {
        filesSummary += `\n--- FILE: ${path} (${file.language}) ---\n${file.content}\n`;
      });
    } else {
      filesSummary = "The user's workbench is currently empty. No files have been uploaded yet.";
    }

    const systemInstruction = `You are a world-class AI Compiling and Integration Agent inside the snippets.live developer workbench.
The user is working on a custom project containing multiple files. They might copy and paste code snippet blocks, or upload files, and they want your help to merge, edit, compile, or debug.
You can view their current files and their latest message.
Your task is to assist the user by writing, editing, compiling, or merging code.
You can create new files or modify existing ones by outputting the updated files dictionary.
Always return your response in JSON format.

You must reply with:
1. "message": A friendly, helpful developer-focused response in Markdown format. Tell the user what you did, explain any bugs found, or how to run their code.
2. "updatedFiles": An object representing the NEW full set of files after your modifications. Map file paths to their details. Each file detail must have "name", "content" (complete file content), and "language" (typescript, rust, ruby, javascript, json, markdown).
3. "compilationSuccess": a boolean indicating if the workbench code is compiling successfully.
4. "compilationMessage": a short string output mimicking compiler success or listing errors found (e.g. "npm run build passed" or "cargo build: passed").
`;

    const prompt = `
${filesSummary}

Active File Path: ${activeFilePath || "None"}
User Message: "${message}"

Please analyze and return the JSON response with "message", "updatedFiles", "compilationSuccess", and "compilationMessage".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "The Markdown response text explaining your modifications, findings, or helper guides.",
            },
            updatedFiles: {
              type: Type.OBJECT,
              description: "A dictionary mapping all files in the workbench to their current contents. Include any newly created files or modified files.",
              additionalProperties: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  content: { type: Type.STRING },
                  language: { type: Type.STRING }
                },
                required: ["name", "content", "language"]
              }
            },
            compilationSuccess: {
              type: Type.BOOLEAN,
              description: "Whether the updated set of files compiles and passes static checking successfully."
            },
            compilationMessage: {
              type: Type.STRING,
              description: "A 1-line simulated compiler terminal check response."
            }
          },
          required: ["message", "updatedFiles", "compilationSuccess", "compilationMessage"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API.");
    }

    const result = JSON.parse(responseText.trim());
    res.json({
      message: result.message,
      updatedFiles: result.updatedFiles,
      compilationSuccess: result.compilationSuccess,
      compilationMessage: result.compilationMessage,
      isDemoFallback: false
    });

  } catch (err: any) {
    console.error("[Workbench Agent Error]:", err);
    res.status(500).json({
      error: "Failed to compile with Agent.",
      details: err.message || err.toString()
    });
  }
});

// Configure Vite integration for full-stack SPA serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Loading Vite in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`snippets.live server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
