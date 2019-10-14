const express = require("express");

const server = express();

const projects = [];
let requestCounter = 0;

server.use(express.json());

function countRequests(req, res, next) {
  requestCounter++;
  console.log("requests counter: ", requestCounter);

  return next();
}

function findProjectOrFail(req, res, next) {
  const { id } = req.params;
  const project = projects.find(project => project.id == id);

  if (!project)
    return res.status(404).json({ message: `Project ${id} not found.` });

  req.project = project;

  return next();
}

server.use(countRequests);

server.post("/projects", (req, res) => {
  const { id, title } = req.body;
  projects.push({ id, title, tasks: [] });

  return res.json(projects);
});

server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.put("/projects/:id", findProjectOrFail, (req, res) => {
  const project = req.project;

  const { title } = req.body;
  Object.assign(project, { title });

  return res.json(project);
});

server.delete("/projects/:id", findProjectOrFail, (req, res) => {
  const index = projects.indexOf(req.project);

  projects.splice(index, 1);

  return res.status(204).send();
});

server.post("/projects/:id/tasks", findProjectOrFail, (req, response) => {
  const project = req.project;
  const { title: task } = req.body;

  project.tasks = project.tasks || [];
  if (!task)
    return response.status(400).json({ message: "Field title is required." });
  project.tasks.push(task);

  return response.json(project);
});

server.listen(3000);
