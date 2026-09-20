const BASE_URL = "http://localhost:5001/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// GET TASKS
export const getTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      ...authHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Failed to fetch tasks");
    error.status = response.status;
    throw error;
  }

  return data;
};

// CREATE TASK
export const createTask = async (task) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(task),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Failed to create task");
    error.status = response.status;
    throw error;
  }

  return data;
};

// UPDATE TASK
export const updateTask = async (id, task) => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(task),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Failed to update task");
    error.status = response.status;
    throw error;
  }

  return data;
};

// DELETE TASK
export const deleteTask = async (id) => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Failed to delete task");
    error.status = response.status;
    throw error;
  }

  return data;
};

// LOGIN
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem("token", data.token);

  return data;
};

// REGISTER
export const registerUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
};

// CURRENT USER
export const getCurrentUser = async () => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      ...authHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Authentication failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

// LOGOUT
export const logoutUser = () => {
  localStorage.removeItem("token");
};