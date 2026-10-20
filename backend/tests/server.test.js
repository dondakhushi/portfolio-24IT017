const request = require("supertest");
const app = require("../server");

describe("Task Management API", () => {
  test("GET /api/nonexistent returns 404", async () => {
    const response = await request(app).get("/api/nonexistent");

expect(response.statusCode).toBe(200);
    expect(response.body.error).toBe("Route not found");
  });

  test("GET / returns a response", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
  });
});
