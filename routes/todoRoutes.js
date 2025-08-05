import express from "express"
import { addTodo, AiSuggetions, deleteTodo, getCompletedTodos, getIncompleteTodos, getTodoById, getTodos, markTodoAsCompleted, markTodoAsIncomplete, sortTodos, sortTodosByDueDate, todoPagination, updateDueDate, updateTodo } from "../controller/todoController.js"

const todoRoutes = express.Router()


todoRoutes.post("/Todo",addTodo).put("/Todo/:id",updateTodo).get("/Todo",getTodos).delete("/Todo/:id",deleteTodo).get("/Todo/:id",getTodoById).put("/mark-complete",markTodoAsCompleted).put("mark-incomplete",markTodoAsIncomplete).put("/Todo/dueDate/:id",updateDueDate).get("/Todo/pagination",todoPagination) 
.get("get-completed",getCompletedTodos).get("get-incompleted",getIncompleteTodos).post("/AiSuggetions",AiSuggetions).get("todos/sort/priority",sortTodos).get("todos/sort/dueDate",sortTodosByDueDate)
// Export the router

export default todoRoutes

