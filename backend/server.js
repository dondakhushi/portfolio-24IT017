require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Task = require("./models/Task");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const validateTask = require("./middleware/validateTask");
const cache = require("./cache/cache");

const taskEvents = require("./events");
require("./listeners");

const app = express();

let cacheHits = 0;
let cacheMisses = 0;

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error.message);
//   });

// Root
app.get("/", (req, res) => {
  res.json({
    message: "Task Management API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// =====================================================
// PROTECTED TASK ROUTES
// =====================================================

// GET all tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const cachedTasks = cache.get("all_tasks");

    if (cachedTasks) {
      cacheHits++;
      console.log("CACHE HIT: all_tasks");
      return res.json(cachedTasks);
    }

    cacheMisses++;
    console.log("CACHE MISS: all_tasks");

    const tasks = await Task.find().sort({ createdAt: -1 });

    cache.set("all_tasks", tasks);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/tasks-uncached", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// CACHE STATISTICS
app.get("/api/cache/stats", authMiddleware, (req, res) => {
  res.json({
    cacheHits,
    cacheMisses,
    totalRequests: cacheHits + cacheMisses,
  });
});

// GET single task
app.get("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// CREATE task
app.post("/api/tasks", authMiddleware, validateTask, async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title.trim(),
      description: req.body.description || "",
      completed: false,
    });

    // Invalidate Practical 9 cache
    cache.del("all_tasks");

    // Prepare event data
    const taskData = {
      ...task.toObject(),
      assignedUser: req.user.email,
    };

    // Record API response timestamp
    console.log(
      `[API] Response sent at ${new Date().toISOString()}`
    );

    // Send response immediately
    res.status(201).json(task);

    // Trigger background event processing
    taskEvents.emit("task-created", taskData);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
// UPDATE task
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    cache.del("all_tasks");

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// DELETE task
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Invalidate Practical 9 cache
    cache.del("all_tasks");

    // Send API response
    res.json({
      message: "Task deleted successfully",
    });

    // Trigger delete event
    taskEvents.emit("task-deleted", {
      ...task.toObject(),
      assignedUser: req.user.email,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// AI task description generation
const OpenAI = require("openai");

const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing-key",
  timeout: 15000,
  maxRetries: 0,
});

const aiRequestTimes = new Map();

app.post("/api/ai/generate-description", async (req, res) => {
  const { title } = req.body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      description: "",
      fallback: true,
      message: "Please enter a task title first.",
    });
  }

  const cleanTitle = title.trim().slice(0, 200);
  const now = Date.now();
  const lastRequest = aiRequestTimes.get(cleanTitle);

  if (lastRequest && now - lastRequest < 60_000) {
    return res.status(429).json({
      description: "",
      fallback: true,
      message: "Please wait one minute before generating another description for this task.",
    });
  }

  // Apply the limit before calling the external service.
  aiRequestTimes.set(cleanTitle, now);

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const completion = await aiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Write a clear, concise task description in 1 to 3 sentences. Do not include private or sensitive information.",
        },
        {
          role: "user",
          content: `Create a task description for this title: ${cleanTitle}`,
        },
      ],
    });

    const description =
      completion.choices?.[0]?.message?.content?.trim();

    if (!description) {
      throw new Error("The AI returned an empty description");
    }

    return res.json({
      description,
      fallback: false,
    });
  } catch (error) {
    console.error("AI description generation failed:", error.message);

    return res.status(200).json({
      description: `Complete the task "${cleanTitle}" by identifying the required steps, carrying out the work, and checking the result.`,
      fallback: true,
      message:
        "AI suggestions are temporarily unavailable. You can edit this suggested description or write your own.",
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Internal server error",
  });
});


if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
      process.exitCode = 1;
    });
}

module.exports = app;