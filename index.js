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
await db();

const app = express();

// app.use(crossOriginIsolated)
app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use("/api/products", productsRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/rating", ratingRouter);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(env.PORT, () => {
  console.log(`The server is running at the port ${env.PORT}`);
});
