const express = require("express");
const authRoutes = require("./routes/authRoutes");
const preferenceRoutes = require('./routes/preferenceRoutes');
const newsRoutes = require('./routes/newsRoutes');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);    
app.use('/api/preferences', preferenceRoutes);
app.use('/api/news',newsRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
