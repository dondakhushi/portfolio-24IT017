import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
  logoutUser();
  navigate("/Login");
};

  // Fetch tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      if (err.status === 401) {
      localStorage.removeItem("token");
      navigate("/Login");
      return;
    }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newTask = await createTask({
        title,
        description,
      });

      setTasks((prev) => [newTask, ...prev]);

      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update task
  const handleToggle = async (task) => {
    try {
      setError("");

      const updatedTask = await updateTask(task._id, {
        completed: !task.completed,
      });

      setTasks((prev) =>
        prev.map((item) =>
          item._id === updatedTask._id
            ? updatedTask
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTask(id);

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="task-container">
        <h1>Task Management</h1>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-container">
      <h1>Task Management</h1>

      <p>
        Create, update and delete tasks using
        React, Node.js, Express and MongoDB.
      </p>

      {error && (
        <div className="task-error">
          {error}
        </div>
      )}

      {/* Create Task Form */}
      <form
        className="task-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div
              className="task-card"
              key={task._id}
            >
              <div>
                <h3
                  className={
                    task.completed
                      ? "completed-task"
                      : ""
                  }
                >
                  {task.title}
                </h3>

                <p>{task.description}</p>

                <small>
                  Status:{" "}
                  {task.completed
                    ? "Completed"
                    : "Pending"}
                </small>
              </div>

              <div className="task-actions">
                <button
                  onClick={() => handleToggle(task)}
                >
                  {task.completed
                    ? "Mark Pending"
                    : "Complete"}
                </button>

                <button
                  onClick={() =>
                    handleDelete(task._id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  <button onClick={handleLogout}>
  Logout
</button>
}

export default Tasks;