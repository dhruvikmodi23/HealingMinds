const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const path = require("path")
const http = require("http")
const { Server } = require("socket.io"); // Correct import
// const { initializeSocket } = require("./socket")
// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const counselorRoutes = require("./routes/counselor.routes")
const appointmentRoutes = require("./routes/appointment.routes")
const assessmentRoutes = require("./routes/assessment.routes")
const paymentRoutes = require("./routes/payment.routes")
const adminRoutes = require("./routes/admin.routes")
const chatRoutes = require("./routes/chat.routes")
const webhookRoutes = require("./routes/webhook.routes")
const errorHandler = require("./middleware/errorHandler")

// Initialize Express app
const app = express()
const server = http.createServer(app)

// initializeSocket(server)

// Update CORS configuration at the top of your server.js
const io = new Server(server, {
  cors: {
    origin: "*", // Update for production security
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
)

// Middleware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(errorHandler)
app.use(cookieParser())

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/counselors", counselorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/assessments", assessmentRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/webhooks", webhookRoutes)
app.use("/api/video", require("./routes/video.routes"))

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: err.message || "Something went wrong on the server",
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  })
})


//app.use("/api/notifications", require("./routes/notifications"));

//video call

let rooms = {}; // Store rooms and users

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send_message", (data) => {
    socket.to(data.appointmentId).emit("receive_message", data);
  });

  // Update the join-room handler
socket.on("join-room", ({ roomId, userId, role }) => {
  if (!rooms[roomId]) {
    rooms[roomId] = { counselor: null, user: null };
  }

  // Assign socket to correct role
  if (role === "Counselor") {
    rooms[roomId].counselor = socket.id;
  } else if (role === "User") {
    rooms[roomId].user = socket.id;
  } else {
    socket.emit("room-full");
    return;
  }

  socket.join(roomId);
  io.to(roomId).emit("user-joined", { userId, role });

  // When both participants are present, let them know to start call setup
  if (rooms[roomId].counselor && rooms[roomId].user) {
    io.to(roomId).emit("start-call");
  }
});

  socket.on("offer", ({ offer, roomId }) => {
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ answer, roomId }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("candidate", { candidate });
  });

  socket.on("leave-room", ({ roomId }) => {
    if (rooms[roomId]) {
      if (rooms[roomId].counselor === socket.id) rooms[roomId].counselor = null;
      if (rooms[roomId].user === socket.id) rooms[roomId].user = null;
      if (!rooms[roomId].counselor && !rooms[roomId].user) delete rooms[roomId];
    }
    io.to(roomId).emit("user-left");
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")

    // Start server
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

