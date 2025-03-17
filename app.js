// Initialize tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';
let filteredStatus = 'all';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    updateStats();
    setTheme(currentTheme);
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Add task button
    document.querySelector('.btn-add').addEventListener('click', addTask);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterTasks(e.target.dataset.filter);
        });
    });
    
    // Search field
    document.getElementById('search').addEventListener('input', (e) => {
        searchTasks(e.target.value);
    });
    
    // Enter key in task input
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

// Add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDate = document.getElementById('dueDate');
    const priority = document.getElementById('priority');
    const category = document.getElementById('category');
    const location = document.getElementById('location').value;

    if (!taskInput.value.trim()) {
        taskInput.classList.add('error');
        setTimeout(() => taskInput.classList.remove('error'), 1000);
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskInput.value.trim(),
        dueDate: dueDate.value,
        priority: priority.value,
        category: category.value,
        location: location,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();
    updateStats();
    clearInputs();
}

// Render tasks based on current filter
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    // Get filtered tasks
    let tasksToRender = tasks;
    
    if (filteredStatus === 'completed') {
        tasksToRender = tasks.filter(task => task.completed);
    } else if (filteredStatus === 'active') {
        tasksToRender = tasks.filter(task => !task.completed);
    }
    
    // Check if there's a search query
    const searchQuery = document.getElementById('search').value.toLowerCase();
    if (searchQuery) {
        tasksToRender = tasksToRender.filter(task => 
            task.text.toLowerCase().includes(searchQuery) ||
            task.category.toLowerCase().includes(searchQuery) ||
            (task.location && task.location.toLowerCase().includes(searchQuery))
        );
    }

    // Render each task
    tasksToRender.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.innerHTML = `
            <div class="checkbox ${task.completed ? 'checked' : ''}" 
                 data-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-header">
                    <span class="task-text">${task.text}</span>
                </div>
                <div class="task-meta">
                    <span class="priority-tag ${task.priority}">${task.priority}</span>
                    <span class="category">${task.category}</span>
                    ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ''}
                    ${task.location ? `<span class="location">📍 ${task.location}</span>` : ''}
                </div>
            </div>
            <button class="delete-btn" data-id="${task.id}">×</button>
        `;
        
        // Add event listeners for checkbox and delete button
        taskList.appendChild(taskItem);
        
        // Add event listeners after appending to DOM
        taskItem.querySelector('.checkbox').addEventListener('click', () => {
            toggleComplete(task.id);
        });
        
        taskItem.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id);
        });
    });
    
    // Show empty state if no tasks
    if (tasksToRender.length === 0) {
        taskList.innerHTML = `
            <li class="task-item empty-state">
                <div class="task-content">
                    <p>No tasks to display</p>
                </div>
            </li>
        `;
    }
}

// Toggle task completion status
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
        updateStats();
    }
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToLocalStorage();
    renderTasks();
    updateStats();
}

// Filter tasks by status
function filterTasks(filter) {
    filteredStatus = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTasks();
}

// Search tasks
function searchTasks() {
    renderTasks();
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

// Set theme
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

// Save tasks to localStorage
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Clear input fields
function clearInputs() {
    document.getElementById('taskInput').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('location').value = '';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Update task statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    document.getElementById('totalTasks').textContent = `${total} tasks`;
    document.getElementById('completionRate').textContent = `${Math.round(progress)}% complete`;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
}