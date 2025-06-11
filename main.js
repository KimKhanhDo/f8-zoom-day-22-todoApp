const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $('.add-btn');
const cancelBtn = $('.cancel-btn');
const taskModal = $('#addTaskModal');
const closeBtn = $('.modal-close-btn');
const todoForm = $('.todo-app-form');
const todoList = $('#todo-list');
const title = $('#title');
const description = $('#description');
const category = $('#category');
const priority = $('#priority');
const startTime = $('#startTime');
const endTime = $('#endTime');
const dueDate = $('#dueDate');
const cardColor = $('#cardColor');

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
    return `  <li class="task-card ${renderCardColor(todo.cardColor)} ${
        todo.isCompleted ? 'completed' : ''
    }">
                    <div class="task-header">
                        <div class="task-meta">
                            <span class="task-category">${
                                todo.category
                            }</span> -
                            <span class="task-priority">${
                                todo.priority
                            } Priority</span>
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
                                    Mark as Complete
                                </div>
                                <div class="dropdown-item delete">
                                    <i class="fa-solid fa-trash fa-icon"></i>
                                    Delete
                                </div>
                            </div>
                        </button>
                    </div>

                    <h3 class="task-title">${todo.title}</h3>

                    <p class="task-description">
                       ${todo.description}
                    </p>

                    <div class="task-time-row">
                        <div class="task-time">${todo.startTime} - ${
        todo.endTime
    } </div>
                        <div class="task-due-date">Due: ${todo.dueDate}</div>
                    </div>
                </li>`;
}

function renderTasks() {
    todoList.innerHTML = todoTasks.map(generateTaskHTML).join('');
}

function addTask(e) {
    e.preventDefault();

    const formData = {
        title: title.value,
        description: description.value,
        category: category.value,
        priority: capitaliseFirstLetter(priority.value),
        startTime: convertTime(startTime.value),
        endTime: convertTime(endTime.value),
        dueDate: formatDate(dueDate.value),
        cardColor: cardColor.value,
        isCompleted: false,
    };

    todoTasks.unshift(formData);
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
    return date.split('-').reverse().join('-');
}

function renderCardColor(color) {
    return ['blue', 'purple', 'yellow', 'pink', 'green'].includes(color)
        ? color
        : '';
}
