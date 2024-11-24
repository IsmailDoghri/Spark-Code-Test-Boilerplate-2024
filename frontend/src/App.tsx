import React, { useEffect, useState } from 'react';
import './App.css';
import Todo, { TodoType } from './Todo';

function App() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Initially fetch todo
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const todos = await fetch('http://localhost:8080/');
        if (todos.status !== 200) {
          console.log('Error fetching data');
          return;
        }

        const data = await todos.json();
        setTodos(data || []);
      } catch (e) {
        console.log('Could not connect to server. Ensure it is running. ' + e);
      }
    }

    fetchTodos()
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title || !description) {
          alert('Both title and description are required');
          return;
      }

      try {
          const form = await fetch('http://localhost:8080/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({title, description}),
          });

          if (form.status === 200) {
              const newTodo = await form.json();
              setTodos((prevTodos) => [...prevTodos, newTodo]);
              setTitle('');
              setDescription('');
          }
      } catch (e) {
          console.log('Error adding todo: ' + e);
      }
  };

  // Clear todos handler
  const handleClearTodos = async () => {
  try {
    const response = await fetch('http://localhost:8080/', {
      method: 'DELETE',
    });

    if (response.status === 200) {
      setTodos([]); // Reset the todos state
    }
  } catch (e) {
    console.error('Error clearing todos:', e);
  }
};

  return (
    <div className="app">
      <header className="app-header">
        <h1>TODO</h1>
      </header>

      <h2>Add a Todo</h2>
      <form onSubmit={handleSubmit}>
        <input
            placeholder="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus={true}
        />
        <input
            placeholder="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />
        <div className="button-group">
          <button type="submit">Add Todo</button>
          <button type="button" onClick={handleClearTodos}>Clear List</button>
        </div>
      </form>

       <div className="todo-list">
        {todos.map((todo, index) =>
          <Todo
            key={`${todo.title}-${index}`}
            title={todo.title}
            description={todo.description}
          />
        )}
      </div>
    </div>
  );
}

export default App;
