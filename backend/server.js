require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Task = require("./models/Task");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const validateTask = require("./middleware/validateTask");
const cache = require("./cache/cache");

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

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

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

    cache.del("all_tasks");

    res.status(201).json(task);
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
      return res.status(404).json({ error: "Task not found" });
    }

    cache.del("all_tasks");

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});