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
const modalOverlay = $('.modal-overlay');
const modalContent = taskModal.querySelector('.modal');

let editIndex = null;

// Get data
let todoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
initialiseTodoApp();

function initialiseTodoApp() {
    renderTasks(todoTasks);

    [addBtn, closeBtn, cancelBtn, modalOverlay].forEach((btn) => {
        btn.addEventListener('click', handleModalActions);
    });

    // Stop propagation -> Avoid close form when user click on overlay
    modalContent.addEventListener('click', (e) => e.stopPropagation());

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
        editTask(task);
        return;
    }

    if (completeAction) {
        completeTask(task);
        return;
    }

    if (deleteAction) {
        showAlertModal(
            `Are you sure you want to delete "${task.title}"?`,
            () => {
                deleteTask(taskIndex);
            }
        );
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
    let isEditMode = editIndex !== null;

    if (isEditMode) {
        if (isDuplicateTask(formData, editIndex)) {
            showAlertModal("Title can't be the same.");
            return;
        }

        formData.title = formData.title.trim();
        formData.isCompleted = todoTasks[editIndex].isCompleted; //Preserve completed status of edited task
        todoTasks[editIndex] = formData;
    } else {
        if (isDuplicateTask(formData)) {
            showAlertModal(
                'Title already exists in the list. Please enter a new title.'
            );
            return;
        }

        formData.title = formData.title.trim();
        formData.isCompleted = false;
        todoTasks.unshift(formData);
    }

    updateTasksAndRender(todoTasks);
    toggleModal();

    if (isEditMode) {
        showToast('Task updated successfully!', 'updated');
    } else {
        showToast('Task added successfully!', 'success');
    }
}

function editTask(task) {
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

    fillEditForm(task); // get new data & fill in the form
}

function deleteTask(taskIndex) {
    todoTasks.splice(taskIndex, 1);
    updateTasksAndRender(todoTasks);
    showToast('Task deleted successfully!', 'deleted');
}

function completeTask(task) {
    task.isCompleted = !task.isCompleted;
    updateTasksAndRender(todoTasks);
    showToast('Task updated successfully!', 'updated');
}

function generateTaskHTML(todo, index) {
    return `  <div class="task-card  ${escapeHTML(todo.cardColor)} ${
        todo.isCompleted ? 'completed' : ''
    }" data-index='${index}'>
                    <div class="task-header">
                        <div class="task-meta">
                          <span class="task-category">
                        ${escapeHTML(capitaliseFirstLetter(todo.category))}
                        </span> -
                        <span class="task-priority">    
                        ${escapeHTML(
                            capitaliseFirstLetter(todo.priority)
                        )} Priority
                        </span>

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

                    <h3 class="task-title" >${escapeHTML(todo.title)}</h3>

                    <p class="task-description" >
                       ${escapeHTML(todo.description)}
                    </p>

                    <div class="task-time-row">
                        <div class="task-time">${escapeHTML(
                            convertTime(todo.startTime)
                        )} - ${escapeHTML(convertTime(todo.endTime))} </div>
                        <div class="task-due-date">Due: ${escapeHTML(
                            formatDate(todo.dueDate)
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
    if (e.currentTarget === addBtn) {
        resetModal();
        title.focus();
        return;
    }

    if (
        e.currentTarget === closeBtn ||
        e.currentTarget === cancelBtn ||
        (e.currentTarget === modalOverlay && e.target === modalOverlay)
    ) {
        const isEditMode = editIndex !== null;

        const message = isEditMode
            ? 'Are you sure you want to close the form?'
            : 'Closing the form will reset all entered data. Are you sure?';

        showAlertModal(message, () => {
            resetModal();
            resetModalHeaderAndButton();
        });
    }
}

function resetModal() {
    // Always reset form & editIndex = null whenever add new task or close modal
    todoForm.reset();
    toggleModal();
    editIndex = null;
}

function resetModalHeaderAndButton() {
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

function toggleModal() {
    taskModal.classList.toggle('show');
}

function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toastContainer = $('#toast-container');
    const icons = {
        success: 'fa-solid fa-circle-check',
        updated: 'fa-solid fa-bullhorn',
        deleted: 'fa-solid fa-circle-exclamation',
    };
    const icon = icons[type];

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.animation = `slideIn 0.3s ease-out, fadeOut 0.6s ease-in 3.4s forwards`;

    toast.innerHTML = ` <span class="toast-icon">
    <i class="${icon}"></i>
    </span>
    <div class="toast-message">${message}</div>
    <button class="toast-close">&times;</button>`;

    // Auto dismiss
    const autoDismissId = setTimeout(() => {
        toast.remove();
    }, 4000);

    // Close on click
    toast.querySelector('.toast-close').onclick = () => {
        toast.remove();
        clearTimeout(autoDismissId);
    };

    toastContainer.appendChild(toast);
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

function showAlertModal(message, confirmHandler = null) {
    const modal = $('#alertModal');
    const msg = modal.querySelector('.alert-message');
    const cancelBtn = $('#alertCancel');
    const confirmBtn = $('#alertConfirm');

    // Show message of the modal
    msg.textContent = message;
    modal.classList.add('show');

    // Logic HERE decide to display Cancel or not
    if (confirmHandler) {
        cancelBtn.style.display = 'inline-block'; // ✅ display Cancel
        confirmBtn.textContent = 'Yes'; // Change text of confirmBtn to YES
    } else {
        cancelBtn.style.display = 'none'; // ❌ hide Cancel if don't need confirm
        confirmBtn.textContent = 'OK'; // Change text of confirmBtn to OK
    }

    // Close modal when click Cancel
    cancelBtn.onclick = () => {
        modal.classList.remove('show');
    };

    // When click OK / Yes -> confirmHandler will execute logic inside
    confirmBtn.onclick = () => {
        modal.classList.remove('show');
        if (confirmHandler && typeof confirmHandler === 'function') {
            confirmHandler();
        }
    };
}
