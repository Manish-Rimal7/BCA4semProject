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
import credential from "./middleware/tokenChecker.js";
import { getMe } from "./controller/userAuth.js";
await db();

const app = express();

app.use(
  cors({
    origin: "*",
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
app.get("/api/profile", credential, getMe);
app.get("/getme", credential, getMe);
app.get("/getMe", credential, getMe);

app.listen(env.PORT, () => {
  console.log(`The server is running at the port ${env.PORT}`);
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, status: "OK", message: "API is running..." });
});

// // if (Number(env.PORT) !== 4050) {
// //   try {
// //     const backupServer = app.listen(4050, () => {
// //       console.log("The server is also listening at port 4050");
// //     });
//     backupServer.on("error", () => { });
//   } catch (e) { }
// }
