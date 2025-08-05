import mongoose from "mongoose";
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,   
        required: true,
        trim: true,
        maxlength: 500
    },
    completed: {
        type: Boolean,
        default: false
    },

    priority: {
        type: String,
        enum: ["low","medium","high"],
        default: "medium"
    },
    dueDate: {
        type: Date,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
       
    },
    // Add createdAt field to track when the todo was created
    createdAt: {
        type: Date,
        default: Date.now   
    }

});
const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
