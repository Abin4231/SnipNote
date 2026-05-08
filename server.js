require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Note = require("./models/Note");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* DATABASE CONNECTION */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* =========================
   CREATE NOTE
========================= */
app.post("/notes", async (req, res) => {
  try {

    const { title, text } = req.body;

    if (!title || !text) {
      return res.status(400).json({
        message: "Title and text are required",
      });
    }

    const note = new Note({
      title,
      text,
    });

    const savedNote = await note.save();

    res.status(201).json(savedNote);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   GET ALL NOTES
========================= */
app.get("/notes", async (req, res) => {
  try {

    const notes = await Note.find().sort({ _id: -1 });

    res.json(notes);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   UPDATE NOTE
========================= */
app.put("/notes/:id", async (req, res) => {
  try {

    const { title, text } = req.body;

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        text,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json(updatedNote);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   DELETE NOTE
========================= */
app.delete("/notes/:id", async (req, res) => {
  try {

    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    if (!deletedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      message: "Note deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});