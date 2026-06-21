/**
 * TaskFlow Application JavaScript Logic
 * 
 * Modular implementation for managing tasks, state preservation,
 * user interactions, and theme preferences.
 */

// ==========================================================================
// 1. Application State & DOM Selectors
// ==========================================================================
let tasks = [];
let activeFilter = 'all';
let searchFilterQuery = '';
let editingId = null;

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const validationError = document.getElementById('validation-error');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');

// Stats Elements
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const progressPercentEl = document.getElementById('progress-percent');
const progressBarFill = document.getElementById('progress-bar-fill');

// Actions Elements
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const filterTabs = document.querySelectorAll('.filter-tab');
const themeToggle = document.getElementById('theme-toggle');

// Modal Elements
const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalTitleIcon = document.getElementById('modal-title-icon');

// ==========================================================================
// 2. Core Initializer & Event Bindings
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();
  
  // Load tasks from local storage
  loadTasks();
  
  // Render the initial interface
  render();

  // Bind Form Submission
  todoForm.addEventListener('submit', handleFormSubmit);

  // Auto-hide validation error on typing
  todoInput.addEventListener('input', () => {
    if (todoInput.value.trim().length > 0) {
      validationError.classList.remove('visible');
    }
  });

  // Bind Search Input
  searchInput.addEventListener('input', (e) => {
    searchTasks(e.target.value);
  });

  // Bind Search Clear Button
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTasks('');
    searchInput.focus();
  });

  // Bind Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle CSS class active status
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filterValue = tab.getAttribute('data-filter');
      filterTasks(filterValue);
    });
  });

  // Bind Clear All Button
  clearAllBtn.addEventListener('click', handleClearAll);

  // Bind Theme Switcher
  themeToggle.addEventListener('click', toggleTheme);
});

// ==========================================================================
// 3. Custom Confirmation Modal Handler (Promise-based UI Component)
// ==========================================================================
function showConfirmModal(title, message, confirmText = 'Delete', isDanger = true) {
  return new Promise((resolve) => {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalConfirmBtn.textContent = confirmText;

    // Apply color-scheme accents
    if (isDanger) {
      modalConfirmBtn.className = 'modal-btn confirm-btn danger';
      modalTitleIcon.className = 'modal-icon danger';
      modalTitleIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    } else {
      modalConfirmBtn.className = 'modal-btn confirm-btn accent';
      modalTitleIcon.className = 'modal-icon warning';
      modalTitleIcon.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
    }

    // Display modal
    customModal.classList.remove('hidden');
    customModal.classList.add('flex-show');
    customModal.setAttribute('aria-hidden', 'false');

    // Setup temporary listeners
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      modalConfirmBtn.removeEventListener('click', handleConfirm);
      modalCancelBtn.removeEventListener('click', handleCancel);
      customModal.classList.add('hidden');
      customModal.classList.remove('flex-show');
      customModal.setAttribute('aria-hidden', 'true');
    };

    modalConfirmBtn.addEventListener('click', handleConfirm);
    modalCancelBtn.addEventListener('click', handleCancel);
  });
}

// ==========================================================================
// 4. Task Operations (Required Modular API Functions)
// ==========================================================================

/**
 * Handles validation and formatting to push a new task to the array
 */
function addTask(text) {
  const cleanText = text.trim();
  if (cleanText.length === 0) {
    validationError.classList.add('visible');
    return false;
  }

  validationError.classList.remove('visible');

  const newTask = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    text: cleanText,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks();
  render();
  
  // Clear the input
  todoInput.value = '';
  todoInput.focus();
  return true;
}

/**
 * Updates task data by id, validates empty changes
 */
function editTask(id, newText) {
  const cleanText = newText.trim();
  if (cleanText.length === 0) {
    // Treat saving an empty text as request to cancel or warn
    editingId = null;
    render();
    return;
  }

  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, text: cleanText };
    }
    return task;
  });

  editingId = null;
  saveTasks();
  render();
}

/**
 * Requests confirmation, animates removal, updates state
 */
async function deleteTask(id) {
  const confirmed = await showConfirmModal(
    'Delete Task',
    'Are you sure you want to delete this task? This action cannot be undone.'
  );

  if (!confirmed) return;

  const itemElement = todoList.querySelector(`[data-id="${id}"]`);
  if (itemElement) {
    itemElement.classList.add('deleting');
    // Wait for slide-out animation to complete
    itemElement.addEventListener('animationend', () => {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      render();
    }, { once: true });
  } else {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
  }
}

/**
 * Toggles a task completion state and triggers updates
 */
function toggleComplete(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  render();
}

/**
 * Saves JSON serialized task representation to browser local storage
 */
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

/**
 * Loads tasks list from browser local storage, handles error recovery
 */
function loadTasks() {
  try {
    const rawTasks = localStorage.getItem('taskflow_tasks');
    tasks = rawTasks ? JSON.parse(rawTasks) : [];
  } catch (error) {
    console.error('Error reading tasks from LocalStorage, resetting data.', error);
    tasks = [];
  }
}

/**
 * Updates stats dashboard elements and completion progress bar
 */
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Set values
  totalCountEl.textContent = total;
  pendingCountEl.textContent = pending;
  completedCountEl.textContent = completed;
  progressPercentEl.textContent = `${percent}%`;
  
  // Animate progress bar fill width
  progressBarFill.style.width = `${percent}%`;
}

/**
 * Changes active filter parameter and renders output list
 */
function filterTasks(filterValue) {
  activeFilter = filterValue;
  render();
}

/**
 * Filters tasks matching search query
 */
function searchTasks(query) {
  searchFilterQuery = query.toLowerCase().trim();
  
  // Show/Hide search clear utility
  if (searchFilterQuery.length > 0) {
    document.querySelector('.search-box').classList.add('has-text');
  } else {
    document.querySelector('.search-box').classList.remove('has-text');
  }
  
  render();
}

// ==========================================================================
// 5. Domestic Helper & Event Router Functions
// ==========================================================================

/**
 * Wrapper for adding tasks through the form element submit
 */
function handleFormSubmit(e) {
  e.preventDefault();
  addTask(todoInput.value);
}

/**
 * Clear all tasks sequence
 */
async function handleClearAll() {
  if (tasks.length === 0) return;

  const confirmed = await showConfirmModal(
    'Clear All Tasks',
    'Are you sure you want to clear all tasks from your workspace? This action is permanent.',
    'Clear All',
    true
  );

  if (!confirmed) return;

  tasks = [];
  saveTasks();
  render();
}

/**
 * Helper to translate raw ISO timestamps to beautiful localized date time stamps
 */
function formatTaskDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  
  // Output format: e.g., "Jun 21, 2026, 11:20 AM"
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==========================================================================
// 6. UI Theme Manager (Light / Dark Mode Router)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('taskflow_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem('taskflow_theme', targetTheme);
}

// ==========================================================================
// 7. Core DOM Renderer (Visual Paint Loop)
// ==========================================================================
function render() {
  // Clear the list node
  todoList.innerHTML = '';

  // Apply filters
  let filteredTasks = tasks;

  // 1. Status Filter
  if (activeFilter === 'pending') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  } else if (activeFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  }

  // 2. Search query filter
  if (searchFilterQuery.length > 0) {
    filteredTasks = filteredTasks.filter(t => t.text.toLowerCase().includes(searchFilterQuery));
  }

  // Show or hide empty state illustration
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'flex';
    
    // Adjust empty state helper message if we are searching vs empty workspace
    const h3 = emptyState.querySelector('h3');
    const p = emptyState.querySelector('p');
    
    if (searchFilterQuery.length > 0) {
      h3.textContent = 'No matching tasks';
      p.textContent = 'Try adjusting your search query or clear the filter.';
    } else if (activeFilter === 'pending') {
      h3.textContent = 'No pending tasks';
      p.textContent = 'Great job! You have completed all scheduled tasks.';
    } else if (activeFilter === 'completed') {
      h3.textContent = 'No completed tasks';
      p.textContent = 'Finish a task and check it off to list it here!';
    } else {
      h3.textContent = 'Your workspace is clear';
      p.textContent = 'Add your first task above to start planning your day!';
    }
  } else {
    emptyState.style.display = 'none';
  }

  // Paint task items
  filteredTasks.forEach(task => {
    const isEditing = editingId === task.id;
    
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    if (isEditing) {
      li.innerHTML = `
        <div class="todo-content-wrap">
          <input type="text" class="todo-edit-input" value="${escapeHTML(task.text)}" id="edit-input-${task.id}" maxlength="100">
        </div>
        <div class="todo-actions">
          <button class="action-btn save-btn" aria-label="Save Changes" title="Save Changes">
            <i class="fa-solid fa-check"></i>
          </button>
          <button class="action-btn cancel-edit-btn" aria-label="Cancel Editing" title="Cancel Editing">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;

      // Programmatic listeners for edit state buttons
      const editInput = li.querySelector('.todo-edit-input');
      const saveBtn = li.querySelector('.save-btn');
      const cancelBtn = li.querySelector('.cancel-edit-btn');

      // Focus editing input immediately
      setTimeout(() => editInput.focus(), 0);

      // Save handlers
      const triggerSave = () => editTask(task.id, editInput.value);
      saveBtn.addEventListener('click', triggerSave);
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') triggerSave();
        if (e.key === 'Escape') {
          editingId = null;
          render();
        }
      });

      cancelBtn.addEventListener('click', () => {
        editingId = null;
        render();
      });

    } else {
      li.innerHTML = `
        <div class="todo-content-wrap">
          <label class="checkbox-container">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle Complete">
            <span class="checkmark"></span>
          </label>
          <div class="todo-meta-text">
            <span class="todo-text">${escapeHTML(task.text)}</span>
            <span class="todo-date">
              <i class="fa-regular fa-clock"></i>
              <span>${formatTaskDate(task.createdAt)}</span>
            </span>
          </div>
        </div>
        <div class="todo-actions">
          <button class="action-btn edit-btn" aria-label="Edit Task" title="Edit Task">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="action-btn delete-btn" aria-label="Delete Task" title="Delete Task">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      // Programmatic listeners for standard state buttons
      const checkbox = li.querySelector('.task-checkbox');
      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');

      checkbox.addEventListener('change', () => toggleComplete(task.id));
      
      // Complete tasks cannot be edited, toggle disabled/active styling
      if (task.completed) {
        editBtn.style.opacity = '0.3';
        editBtn.style.pointerEvents = 'none';
      } else {
        editBtn.addEventListener('click', () => {
          editingId = task.id;
          render();
        });
      }

      deleteBtn.addEventListener('click', () => deleteTask(task.id));
    }

    todoList.appendChild(li);
  });

  // Keep Stats Counter up-to-date
  updateStats();
}

/**
 * Escapes characters for HTML strings to prevent XSS vulnerability injections
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
