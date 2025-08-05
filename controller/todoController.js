import { main } from "../config/geminiAi.js";
import Todo from "../model/Todo.js";

export const addTodo = async (req, res) => {
  console.log("Received request to add todo");

  try {
    console.log("Request body:", req.body);

    const { title, description, priority, dueDate, tags } = req.body;
    if ([".low", "medium", "high"].indexOf(priority) === -1) {
      return res.status(400).json({ message: "Invalid priority value." });
    }

    const newVal = { title, description, priority, dueDate, tags };

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }
    // Check if title and description are not empty strings:
    if (title.trim().length === 0 || description.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Title and description must not be empty." });
    }
    //Check if title and description are strings:
    if (typeof title !== "string" || typeof description !== "string") {
      return res
        .status(400)
        .json({ message: "Title and description must be strings." });
    }
    //Title/description too long:
    if (title.length > 100 || description.length > 500) {
      return res
        .status(400)
        .json({ message: "Title or description is too long." });
    }
    //Duplicate todos:
    const existingTodo = await Todo.findOne({ title, description });
    if (existingTodo) {
      return res.status(400).json({
        message: "Todo with the same title and description already exists.",
      });
    }
    // Create a new Todo instance
    const newTodo = await new Todo(newVal);
    await newTodo.save();
    //Database errors:

    if (!newTodo) {
      return res.status(500).json({ message: "Failed to add todo." });
    }

    console.log("Todo added successfully:", newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error adding todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTodoById = async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json();
  } catch (error) {
    console.error("Error fetching todo by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTodo = async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  if ([".low", "medium", "high"].indexOf(priority) === -1) {
    return res.status(400).json({ message: "Invalid priority value." });
  }
  try {
    const todo = await Todo.findByIdAndUpdate(
      id,
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteTodo = async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    res.status(200).json("Todo deleted successfully");
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAllTodos = async (req, res) => {
  try {
    await Todo.deleteMany();
    res.status(200).json({ message: "All todos deleted successfully" });
  } catch (error) {
    console.error("Error deleting all todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markTodoAsCompleted = async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findByIdAndUpdate(
      id,
      { completed: true },
      { new: true }
    ).index("completed")
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error marking todo as completed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markTodoAsIncomplete = async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findByIdAndUpdate(
      id,
      { completed: false },
      { new: true }
    );
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error marking todo as incomplete:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCompletedTodos = async (req, res) => {
  try {
    const completedTodos = await Todo.find({ completed: true }).index("completed");
    if (!completedTodos || completedTodos.length === 0) {
      return res.status(404).json({ message: "No completed todos found." });
    } 
    res.status(200).json(completedTodos);
  } catch (error) {
    console.error("Error fetching completed todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getIncompleteTodos = async (req, res) => {
  try {
    const incompleteTodos = await Todo.find({ completed: false }).index("completed");
    if (!incompleteTodos || incompleteTodos.length === 0) {
      return res.status(404).json({ message: "No incomplete todos found." });
    }
    res.status(200).json(incompleteTodos);
  } catch (error) {
    console.error("Error fetching incomplete todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const AiSuggetions = async (req, res) => {
  const { title, description } = req.body;
  try {
    const prompt = `Suggest 1-3 short, actionable to-do items based on this: "${title}" - "${description}". Keep each suggestion under 15 words.`;
    const aiSuggestion = await main(prompt);
    //make edge case
    if (!aiSuggestion) {
      return res
        .status(400)
        .json({ message: "AI suggestion could not be generated." });
    }

    res.status(200).json({ suggestion: aiSuggestion });
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDueDate = async (req, res) => {
  const { id } = req.params;
  const { dueDate } = req.body;
  if (!dueDate) {
    return res.status(400).json({ message: "Due date is required." });
  }
  try {
    const todo = await Todo.findByIdAndUpdate(id, { dueDate }, { new: true });
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error updating todo due date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const searchFilter = async (req, res) => {
  const { query } = req.query;
   if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: "Search query is required and must be a string." });
  }
  try {
    const todos = await Todo.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).index("title description");
    if (!todos || todos.length === 0) {
      return res.status(404).json({ message: "No todos found matching the search criteria." });
    }
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error searching todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const filterByPriority = async (req, res) => {
  const { priority } = req.query;
  if (!priority || !["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({ message: "Priority is required and must be one of 'low', 'medium', or 'high'." });
  }
  try {
    const todos = await Todo.find({ priority }).index("priority");
    if (!todos || todos.length === 0) {
      return res.status(404).json({ message: `No todos found with priority ${priority}.` });
    }
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error filtering todos by priority:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const todoPagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const todos = await Todo.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totalTodos = await Todo.countDocuments();
    res.status(200).json({
      todos,
      totalPages: Math.ceil(totalTodos / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error with todo pagination:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const sortTodos = async (req, res) => {
  const { order = "asc", dueDate } = req.query; // Default to ascending order
  const sortOrder = order === "desc" ? -1 : 1; // Default to ascending order
  // Sort by priority, converting priority to a numeric value for sorting
  // Low = 1, Medium = 2, High = 3

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({ message: "Invalid sort order" });
  }

  try {
  
      order == "asc" ||
      order == "desc" ||
      order == null ||
      order == undefined
   
      // Check if order is valid

      const tasks = await Todo.aggregate([
        {
          $addFields: {
            // Add a new field to convert priority to a numeric value
            priorityValue: {
              // Convert priority to a numeric value for sorting
              $switch: {
                // Use $switch to map priority strings to numeric values
                branches: [
                  // Define branches for each priority level
                  { case: { $eq: ["$priority", "low"] }, then: 1 }, //
                  { case: { $eq: ["$priority", "medium"] }, then: 2 },
                  { case: { $eq: ["$priority", "high"] }, then: 3 },
                ],
                default: 2, // Default to medium if priority is not set
              },
            },
          },
        },
        {
          $sort: { priorityValue: sortOrder },
        },
      ]);
      if (!tasks) {
        return res.status(404).json({ message: "No tasks found" });
      }
    

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error sorting todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sortTodosByDueDate = async (req, res) => {
  const { order = "asc" } = req.query; // Default to ascending order
  const sortOrder = order === "desc" ? -1 : 1; // Determine sort order

  try {
    const todos = await Todo.find().sort({ dueDate: sortOrder });
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error sorting todos by due date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
