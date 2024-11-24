package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

// Todo represents a single to-do item
type Todo struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// In-memory storage for todos
var (
	todoList []Todo
	mu       sync.Mutex
)

func main() {
	http.HandleFunc("/", ToDoListHandler)

	fmt.Println("Server is running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func ToDoListHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		// Handle preflight requests
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case http.MethodGet:
		// Return the list of todos
		mu.Lock()
		defer mu.Unlock()
		json.NewEncoder(w).Encode(todoList)

	case http.MethodPost:
		// Add a new todo to the list
		var newTodo Todo
		if err := json.NewDecoder(r.Body).Decode(&newTodo); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Validate input
		if newTodo.Title == "" || newTodo.Description == "" {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		// Add to the list
		mu.Lock()
		todoList = append(todoList, newTodo)
		mu.Unlock()

		// Respond with the created todo
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(newTodo)

		case http.MethodDelete:
		// Clear the todo list
		mu.Lock()
		todoList = []Todo{}
		mu.Unlock()

		// Respond with success
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "All todos cleared"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
