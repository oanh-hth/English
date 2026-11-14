// Exercise 6.2: A REST API for tasks. Read curriculum/part-6/b-rest-api.md first.
// Uses parseTask from exercise 1.4.
import { Router } from "express";
import type { TaskRepo } from "@app/server/src/repos";

/**
 * Mounted at /api/tasks:
 * - GET    /       -> 200 Task[]
 * - GET    /:id    -> 200 Task | 404 { error: "Task not found" }
 * - POST   /       -> validate with parseTask: 400 { error } when invalid; 409 { error: "Task already exists" }
 *                     when the id is taken; else save and 201 Task (the parsed task)
 * - PUT    /:id    -> 400 { error: "id in body must match the URL" } when body.id differs; 400 when invalid;
 *                     404 when missing; else save and 200 Task
 * - DELETE /:id    -> 204 (no body) | 404 { error: "Task not found" }
 * Express 4 does not catch errors from async handlers: wrap them (or use try/catch + next(err)).
 */
export function tasksRouter(repo: TaskRepo): Router {
  // TODO 6.2
  return Router();
}
