import express from "express";
import cors from "cors";
import router from "./routes/userRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import ratingRouter from "./routes/ratingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { db } from "./config/db.js";
import { env } from "./env.js";
import cartRoutes from "./routes/cartRoutes.js";
import feedbackRouter from "./routes/feedbackRoute.js";
await db();

const app = express();

// app.use(crossOriginIsolated)
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use("/api", router);
app.use("/api/products", productsRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/rating", ratingRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/feedback", feedbackRouter);

app.get("/health", (req, res) => {
  res.status(200).json({success: true, status: "OK", message: "API is running..."});
});

app.listen(env.PORT, () => {
  console.log(`The server is running at the port ${env.PORT}`);
});
