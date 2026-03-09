import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    question:   { type: String, required: true },
    answer:     { type: String, required: true },
    difficulty: { type: String, enum: ["easy","medium","hard"], default: "medium" },
});

const quizSchema = new mongoose.Schema({
    question:    { type: String, required: true },
    options:     [String],
    correct:     { type: Number, default: 0 },
    explanation: { type: String, default: "" },
});

const diagramSchema = new mongoose.Schema({
    diagramType: { type: String, default: "flowchart" },
    title:       { type: String, default: "" },
    data:        { type: mongoose.Schema.Types.Mixed, default: {} },
});

const chartSchema = new mongoose.Schema({
    chartType: { type: String, default: "bar" },
    title:     { type: String, default: "" },
    data:      { type: mongoose.Schema.Types.Mixed, default: {} },
});

const noteSchema = new mongoose.Schema({
    user:                  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:                 { type: String, required: true },
    subject:               { type: String, default: "General" },
    icon:                  { type: String, default: "📝" },
    color:                 { type: String, default: "#7c3aed" },
    status:                { type: String, enum: ["processing","ready","error"], default: "processing" },
    summary:               { type: String, default: "" },
    keyPoints:             [String],
    simplifiedExplanation: { type: String, default: "" },
    flashcards:            [flashcardSchema],
    quiz:                  [quizSchema],
    diagrams:              [diagramSchema],
    charts:                [chartSchema],
    tags:                  [String],
    masteryLevel:          { type: Number, default: 0 },
    processingError:       { type: String, default: null },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name:               { type: String, required: true },
    email:              { type: String, required: true, unique: true },
    password:           { type: String, required: true },
    googleId:           { type: String },
    plan:               { type: String, enum: ["free","pro"], default: "free" },
    studyStreak:        { type: Number, default: 0 },
    notesCount:         { type: Number, default: 0 },
    resetToken:         { type: String },
    resetTokenExpires:  { type: Number },
}, { timestamps: true });

const revisionSessionSchema = new mongoose.Schema({
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    mode:   { type: String, default: "flashcard" },
    score:  { type: Number, default: 0 },
    total:  { type: Number, default: 0 },
}, { timestamps: true });

const Note            = mongoose.model("Note",            noteSchema);
const User            = mongoose.model("User",            userSchema);
const RevisionSession = mongoose.model("RevisionSession", revisionSessionSchema);

export { Note, User, RevisionSession };
export default Note;
