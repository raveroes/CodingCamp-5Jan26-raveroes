// Todo List Application
class TodoApp {
    constructor() {
        this.todos = [];
        this.filteredTodos = [];
        this.currentFilter = 'all';
        this.initializeElements();
        this.attachEventListeners();
        this.loadTodos();
        this.renderTodos();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.dateInput = document.getElementById('dateInput');
        this.addButton = document.getElementById('addButton');
        this.filterButton = document.getElementById('filterButton');
        this.deleteAllButton = document.getElementById('deleteAllButton');
        this.todoTableBody = document.getElementById('todoTableBody');
        this.filterModal = document.getElementById('filterModal');
        this.closeModal = document.querySelector('.close');
        this.applyFilterButton = document.getElementById('applyFilterButton');
    }

    attachEventListeners() {
        this.addButton.addEventListener('click', () => this.addTodo());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.filterButton.addEventListener('click', () => this.openFilterModal());
        this.deleteAllButton.addEventListener('click', () => this.deleteAllTodos());
        this.closeModal.addEventListener('click', () => this.closeFilterModal());
        this.applyFilterButton.addEventListener('click', () => this.applyFilter());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.filterModal) {
                this.closeFilterModal();
            }
        });
    }

    validateInput() {
        const task = this.taskInput.value.trim();
        const date = this.dateInput.value;
        
        // Remove previous error states
        this.taskInput.classList.remove('input-error');
        this.dateInput.classList.remove('input-error');
        
        let isValid = true;
        
        // Validate task input
        if (!task) {
            this.taskInput.classList.add('input-error');
            this.showError(this.taskInput, 'Task cannot be empty');
            isValid = false;
        } else if (task.length > 200) {
            this.taskInput.classList.add('input-error');
            this.showError(this.taskInput, 'Task must be less than 200 characters');
            isValid = false;
        }
        
        // Validate date input
        if (!date) {
            this.dateInput.classList.add('input-error');
            this.showError(this.dateInput, 'Date is required');
            isValid = false;
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.dateInput.classList.add('input-error');
                this.showError(this.dateInput, 'Date cannot be in the past');
                isValid = false;
            }
        }
        
        return isValid;
    }

    showError(input, message) {
        // Remove existing error message
        let errorMsg = input.parentElement.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            input.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
        errorMsg.classList.add('show');
        
        // Remove error after 3 seconds
        setTimeout(() => {
            errorMsg.classList.remove('show');
            input.classList.remove('input-error');
        }, 3000);
    }

    addTodo() {
        if (!this.validateInput()) {
            return;
        }
        
        const task = this.taskInput.value.trim();
        const date = this.dateInput.value;
        
        const todo = {
            id: Date.now(),
            task: task,
            dueDate: date,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.saveTodos();
        this.clearInputs();
        this.renderTodos();
    }

    clearInputs() {
        this.taskInput.value = '';
        this.dateInput.value = '';
        this.taskInput.classList.remove('input-error');
        this.dateInput.classList.remove('input-error');
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodos();
        }
    }

    deleteAllTodos() {
        if (this.todos.length === 0) {
            alert('No tasks to delete');
            return;
        }
        
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.todos = [];
            this.saveTodos();
            this.renderTodos();
        }
    }

    toggleStatus(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.status = todo.status === 'pending' ? 'completed' : 'pending';
            this.saveTodos();
            this.renderTodos();
        }
    }

    getStatus(dueDate, status) {
        if (status === 'completed') {
            return 'completed';
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        if (due < today) {
            return 'overdue';
        }
        
        return 'pending';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    filterTodos() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (this.currentFilter) {
            case 'pending':
                this.filteredTodos = this.todos.filter(todo => {
                    const status = this.getStatus(todo.dueDate, todo.status);
                    return status === 'pending';
                });
                break;
            case 'completed':
                this.filteredTodos = this.todos.filter(todo => todo.status === 'completed');
                break;
            case 'overdue':
                this.filteredTodos = this.todos.filter(todo => {
                    const status = this.getStatus(todo.dueDate, todo.status);
                    return status === 'overdue';
                });
                break;
            default:
                this.filteredTodos = [...this.todos];
        }
    }

    openFilterModal() {
        this.filterModal.classList.add('show');
        // Set the current filter radio button
        const radioButtons = document.querySelectorAll('input[name="filter"]');
        radioButtons.forEach(radio => {
            if (radio.value === this.currentFilter) {
                radio.checked = true;
            }
        });
    }

    closeFilterModal() {
        this.filterModal.classList.remove('show');
    }

    applyFilter() {
        const selectedFilter = document.querySelector('input[name="filter"]:checked');
        if (selectedFilter) {
            this.currentFilter = selectedFilter.value;
            this.closeFilterModal();
            this.renderTodos();
        }
    }

    renderTodos() {
        // Update status for all todos based on due date
        this.todos.forEach(todo => {
            const actualStatus = this.getStatus(todo.dueDate, todo.status);
            if (todo.status !== 'completed') {
                // Only update if not completed (completed status should persist)
                if (actualStatus === 'overdue' && todo.status === 'pending') {
                    // Keep as pending but will display as overdue
                }
            }
        });
        
        this.filterTodos();
        
        this.todoTableBody.innerHTML = '';
        
        if (this.filteredTodos.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-state';
            emptyRow.innerHTML = '<td colspan="4">No task found</td>';
            this.todoTableBody.appendChild(emptyRow);
            return;
        }
        
        // Sort todos: overdue first, then by due date
        const sortedTodos = [...this.filteredTodos].sort((a, b) => {
            const statusA = this.getStatus(a.dueDate, a.status);
            const statusB = this.getStatus(b.dueDate, b.status);
            
            // Overdue items first
            if (statusA === 'overdue' && statusB !== 'overdue') return -1;
            if (statusA !== 'overdue' && statusB === 'overdue') return 1;
            
            // Then by due date
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        sortedTodos.forEach(todo => {
            const row = document.createElement('tr');
            const status = this.getStatus(todo.dueDate, todo.status);
            const statusClass = `status-${status}`;
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);
            
            row.innerHTML = `
                <td>${this.escapeHtml(todo.task)}</td>
                <td>${this.formatDate(todo.dueDate)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="action-buttons-cell">
                    <button class="action-btn complete-btn" onclick="app.toggleStatus(${todo.id})">
                        ${todo.status === 'completed' ? 'Undo' : 'Complete'}
                    </button>
                    <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})">
                        Delete
                    </button>
                </td>
            `;
            
            this.todoTableBody.appendChild(row);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('currentFilter', this.currentFilter);
    }

    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        const savedFilter = localStorage.getItem('currentFilter');
        
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        }
        
        if (savedFilter) {
            this.currentFilter = savedFilter;
        }
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});

