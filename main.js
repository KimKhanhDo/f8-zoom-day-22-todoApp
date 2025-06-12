const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $('.add-btn');
const cancelBtn = $('.cancel-btn');
const taskModal = $('#addTaskModal');
const closeBtn = $('.modal-close-btn');

const todoForm = $('.todo-app-form');
const todoList = $('#todo-list');

// Sample data
let todoTasks = [
    {
        title: 'Make a report for client',
        description: 'Prepare the checklist needed for report document',
        category: 'Work',
        priority: 'High',
        startTime: '10:30 AM',
        endTime: '00:00 AM',
        dueDate: '12-06-2025',
        cardColor: 'yellow',
        isCompleted: true,
    },
    {
        title: 'Buy groceries',
        description: 'Buy food for a week',
        category: 'Personal',
        priority: 'High',
        startTime: '10:30 AM',
        endTime: '00:00 AM',
        dueDate: '12-06-2025',
        cardColor: 'purple',
        isCompleted: false,
    },
];

[addBtn, closeBtn, cancelBtn].forEach((btn) => {
    btn.addEventListener('click', handleModalToggle);
});

renderTasks();

// Form submission
todoForm.addEventListener('submit', addTask);

function handleModalToggle(e) {
    toggleModal();
    if (e.currentTarget === addBtn) {
        title.focus();
    }
}

function generateTaskHTML(todo) {
    return `  <li class="task-card  ${todo.cardColor} ${
        todo.isCompleted ? 'completed' : ''
    }">
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
                                <div class="dropdown-item">
                                    <i
                                        class="fa-solid fa-pen-to-square fa-icon"
                                    ></i>
                                    Edit
                                </div>
                                <div class="dropdown-item complete">
                                    <i class="fa-solid fa-check fa-icon"></i>
                                    ${
                                        todo.isCompleted
                                            ? 'Mark as Active'
                                            : 'Mark as Complete'
                                    }
                                </div>
                                <div class="dropdown-item delete">
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
                </li>`;
}

function renderTasks() {
    todoList.innerHTML = todoTasks.map(generateTaskHTML).join('');
}

function addTask(e) {
    e.preventDefault();

    const newTask = Object.fromEntries(new FormData(todoForm));
    newTask.isCompleted = false;

    todoTasks.unshift(newTask);
    todoForm.reset();
    toggleModal();
    renderTasks();
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
