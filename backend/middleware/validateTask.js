const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required",
    });
  }

  if (typeof title !== "string") {
    return res.status(400).json({
      error: "Task title must be a string",
    });
  }

  next();
};

module.exports = validateTask;