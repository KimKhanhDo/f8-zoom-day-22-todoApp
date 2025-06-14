const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $('.add-btn');
const cancelBtn = $('.cancel-btn');
const closeBtn = $('.modal-close-btn');
const taskModal = $('#addTaskModal');

const todoForm = $('.todo-app-form');
const todoList = $('#todo-list');
const searchInput = $('.search-input');
const tabList = $('.tab-list');
const tabActive = $('.tab-active');
const tabCompleted = $('.tab-completed');
const tabAll = $('.tab-all');

let editIndex = null;
// Get data
let todoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
initialiseTodoApp();

function initialiseTodoApp() {
    renderTasks(todoTasks);

    [addBtn, closeBtn, cancelBtn].forEach((btn) => {
        btn.addEventListener('click', handleModalActions);
    });

    todoForm.addEventListener('submit', addNewTask);
    todoList.addEventListener('click', handleTaskActions);
    tabList.addEventListener('click', handleTabActions);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('input', handleSearchInput);
}

function handleSearchFocus() {
    setActiveTab(tabAll);
    renderTasks(todoTasks);
}

function handleSearchInput(e) {
    const input = e.target.value.trim().toLowerCase();

    const result = input
        ? todoTasks.filter(
              (todo) =>
                  todo.title.trim().toLowerCase().includes(input) ||
                  todo.description.trim().toLowerCase().includes(input)
          )
        : todoTasks;
    renderTasks(result);
}

function handleTabActions(e) {
    const isActiveTab = e.target.closest('.tab-active');
    const isCompletedTab = e.target.closest('.tab-completed');
    const isAllTab = e.target.closest('.tab-all');

    if (isActiveTab) {
        setActiveTab(tabActive);
        renderTasks(todoTasks.filter((task) => !task.isCompleted));
    }

    if (isCompletedTab) {
        setActiveTab(tabCompleted);
        renderTasks(todoTasks.filter((task) => task.isCompleted));
    }

    if (isAllTab) {
        setActiveTab(tabAll);
        renderTasks(todoTasks);
    }
}

function handleTaskActions(e) {
    const editAction = e.target.closest('.edit-btn');
    const completeAction = e.target.closest('.complete-btn');
    const deleteAction = e.target.closest('.delete-btn');

    const taskItem = e.target.closest('.task-card');
    if (!taskItem) return;

    const taskIndex = +taskItem.dataset.index;
    const task = todoTasks[taskIndex];
    editIndex = taskIndex;

    if (editAction) {
        taskModal.classList.toggle('show');

        const modalTitle = taskModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.dataset.originalText = modalTitle.textContent;
            modalTitle.textContent = 'Edit Task';
        }

        const submitBtn = taskModal.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.dataset.originalText = submitBtn.textContent;
            submitBtn.textContent = 'Save Task';
        }

        // get new data from the form
        fillEditForm(task);
    }

    if (completeAction) {
        task.isCompleted = !task.isCompleted;
        updateTasksAndRender(todoTasks);
        return;
    }

    if (deleteAction) {
        if (confirm(`Are you sure you want to delete ${task.title}`)) {
            todoTasks.splice(taskIndex, 1);
            updateTasksAndRender(todoTasks);
            return;
        }
    }
}

function updateTasksAndRender(tasks) {
    saveTasks();
    renderTasks(tasks);
}

function fillEditForm(task) {
    for (const key in task) {
        const value = task[key];
        const inputSection = todoForm.querySelector(`[name=${key}]`);
        if (inputSection) {
            inputSection.value = value;
        }
    }
}

function addNewTask(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(todoForm));

    // Edit task mode
    if (editIndex !== null) {
        if (isDuplicateTask(formData, editIndex)) {
            return alert("Title can't be the same.");
        }

        formData.title = formData.title.trim();
        // Preserve completed status of edited task because it's not in the form
        formData.isCompleted = todoTasks[editIndex].isCompleted;
        todoTasks[editIndex] = formData;
    } else {
        // Add new task mode
        if (isDuplicateTask(formData)) {
            return alert(
                'Title already exists in the list. Please enter a new title.'
            );
        }

        formData.title = formData.title.trim();
        formData.isCompleted = false;
        todoTasks.unshift(formData);
    }

    updateTasksAndRender(todoTasks);
    toggleModal();
}

function setActiveTab(tab) {
    $$('.tab-button').forEach((btn) => btn.classList.remove('active'));
    tab.classList.add('active');
}

function isDuplicateTask(newTask, taskIndex = -1) {
    return todoTasks.some(
        (todo, index) =>
            todo.title.trim().toLowerCase() ===
                newTask.title.trim().toLowerCase() && taskIndex !== index
    );
}

function handleModalActions(e) {
    // Always reset form first
    todoForm.reset();
    toggleModal();
    // Always reset editIndex when close modal
    editIndex = null;

    if (e.currentTarget === addBtn) {
        title.focus();
    }

    if (e.currentTarget === closeBtn || e.currentTarget === cancelBtn) {
        const modalTitle = taskModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent =
                modalTitle.dataset.originalText || modalTitle.textContent;
            delete modalTitle.dataset.originalText;
        }

        const submitBtn = taskModal.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.textContent =
                submitBtn.dataset.originalText || submitBtn.textContent;
            delete submitBtn.dataset.originalText;
        }

        const modal = taskModal.querySelector('.modal');
        if (modal) {
            setTimeout(() => {
                modal.scrollTop = 0;
            }, 200);
        }
    }
}

function generateTaskHTML(todo, index) {
    return `  <div class="task-card  ${todo.cardColor} ${
        todo.isCompleted ? 'completed' : ''
    }" data-index='${index}'>
                    <div class="task-header">
                        <div class="task-meta">
                            <span class="task-category" >${capitaliseFirstLetter(
                                todo.category
                            )}</span> -
                            <span class="task-priority" >${capitaliseFirstLetter(
                                todo.priority
                            )} Priority</span>
                        </div>
                        <button class="task-menu">
                            <i class="fa-solid fa-ellipsis fa-icon"></i>
                            <div class="dropdown-menu">
                                <div class="dropdown-item edit-btn">
                                    <i
                                        class="fa-solid fa-pen-to-square fa-icon"
                                    ></i>
                                    Edit
                                </div>
                                <div class="dropdown-item complete-btn">
                                    <i class="fa-solid fa-check fa-icon"></i>
                                    ${
                                        todo.isCompleted
                                            ? 'Mark as Active'
                                            : 'Mark as Complete'
                                    }
                                </div>
                                <div class="dropdown-item delete-btn">
                                    <i class="fa-solid fa-trash fa-icon"></i>
                                    Delete
                                </div>
                            </div>
                        </button>
                    </div>

                    <h3 class="task-title" >${todo.title}</h3>

                    <p class="task-description" >
                       ${todo.description}
                    </p>

                    <div class="task-time-row">
                        <div class="task-time">${convertTime(
                            todo.startTime
                        )} - ${convertTime(todo.endTime)} </div>
                        <div class="task-due-date">Due: ${formatDate(
                            todo.dueDate
                        )}</div>
                    </div>
                </div>`;
}

function renderTasks(tasksToRender) {
    if (!tasksToRender.length) {
        todoList.innerHTML = `
            <div class="empty-tasks">
                <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dd.png" alt="Empty" class="empty-illustration">
                <p class="empty-text">No results found</p>
              
            </div>
        `;
        return;
    }

    todoList.innerHTML = tasksToRender.map(generateTaskHTML).join('');
}

function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(todoTasks));
}

function toggleModal() {
    taskModal.classList.toggle('show');
}

function convertTime(timeStr) {
    const timeFrame = timeStr.split(':');
    const hour = parseInt(timeFrame[0], 10);
    const minutes = timeFrame[1];
    return `${hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function capitaliseFirstLetter(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function formatDate(date) {
    if (!date) return '';
    return date.split('-').reverse().join('-');
}
