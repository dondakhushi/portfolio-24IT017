const taskEvents = require("./events");

// task-created listener
taskEvents.on("task-created", (task) => {
  try {
    console.log(
      `[Notification] Task "${task.title}" event received at ${new Date().toISOString()}`
    );

    // Simulate slow background notification processing
    setTimeout(() => {
      try {
        console.log(
          `[Notification] Task "${task.title}" notification completed at ${new Date().toISOString()}`
        );

        console.log(
          `[Notification] Assigned user: ${task.assignedUser}`
        );
      } catch (error) {
        taskEvents.emit("error", error);
      }
    }, 2000);
  } catch (error) {
    taskEvents.emit("error", error);
  }
});

// task-deleted listener
taskEvents.on("task-deleted", (task) => {
  console.log(
    `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()}`
  );
});

// error listener
taskEvents.on("error", (error) => {
  console.error(
    `[Event Error] ${new Date().toISOString()} - ${error.message}`
  );
});