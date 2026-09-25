import path from "path";
import express from "express";
import { app } from "./server";

const PORT = Number(process.env.PORT || 3000);
const distDir = path.resolve(process.cwd(), "dist");

app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.method !== "GET" || !String(req.headers.accept || "").includes("text/html")) {
    return next();
  }
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Zeus Node host running on http://0.0.0.0:${PORT}`);
  console.log(`Serving Vite production build from ${distDir}`);
});
