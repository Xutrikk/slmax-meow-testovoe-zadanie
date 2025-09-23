import { getTasksByStatus, moveTask, getAllTasks } from '../store.js';

// Рендеринг канбан-доски
export function renderBoard() {
    const mainContent = document.getElementById('main-content');
    const tasks = getAllTasks();
    
    const boardHTML = `
        <div class="kanban-board">
            <div class="column" data-status="todo">
                <h2>To Do</h2>
                <div class="task-list" id="todo-list">
                    ${renderTaskList('todo')}
                </div>
                <button class="add-task-btn" aria-label="Добавить задачу в колонку To Do">+ Добавить задачу</button>
            </div>
            
            <div class="column" data-status="inProgress">
                <h2>In Progress</h2>
                <div class="task-list" id="inprogress-list">
                    ${renderTaskList('inProgress')}
                </div>
                <button class="add-task-btn" aria-label="Добавить задачу в колонку In Progress">+ Добавить задачу</button>
            </div>
            
            <div class="column" data-status="done">
                <h2>Done</h2>
                <div class="task-list" id="done-list">
                    ${renderTaskList('done')}
                </div>
                <button class="add-task-btn" aria-label="Добавить задачу в колонку Done">+ Добавить задачу</button>
            </div>
        </div>
        
        ${tasks.length === 0 ? '<p class="empty-state">Нет задач для отображения</p>' : ''}
    `;
    
    mainContent.innerHTML = boardHTML;
    
    // Инициализация Drag & Drop
    initDragAndDrop();
    
    // Обработчики кнопок добавления задач
    initAddTaskButtons();
}

// Рендеринг списка задач для колонки
function renderTaskList(status) {
    const tasks = getTasksByStatus(status);
    
    if (tasks.length === 0) {
        return '<div class="empty-column">Нет задач</div>';
    }
    
    return tasks.map(task => `
        <div class="task-card" 
             data-task-id="${task.id}" 
             draggable="true"
             tabindex="0"
             role="button"
             aria-label="Задача: ${task.title}. Статус: ${getStatusText(status)}">
            <h3 class="task-title">${escapeHTML(task.title)}</h3>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <small>Создана: ${formatDate(task.createdAt)}</small>
                ${task.updatedAt ? `<small>Обновлена: ${formatDate(task.updatedAt)}</small>` : ''}
            </div>
        </div>
    `).join('');
}

// Инициализация Drag & Drop
function initDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.column');
    
    let draggedTask = null;
    
    // События для карточек задач
    taskCards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedTask = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.taskId);
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedTask = null;
        });
        
        // Активация по клавиатуре
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const taskId = parseInt(card.dataset.taskId);
                window.showTaskModal(getTaskById(taskId));
            }
        });

        // ✅ Открытие модалки по двойному клику
        card.addEventListener('dblclick', () => {
            const taskId = parseInt(card.dataset.taskId);
            window.showTaskModal(getTaskById(taskId));
        });
    });
    
    // События для колонок
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            column.classList.add('drag-over');
        });
        
        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            if (draggedTask) {
                const taskId = parseInt(draggedTask.dataset.taskId);
                const newStatus = column.dataset.status;
                
                moveTask(taskId, newStatus);
                renderBoard();
            }
        });
    });
}


// Инициализация кнопок добавления задач
function initAddTaskButtons() {
    document.querySelectorAll('.add-task-btn').forEach(button => {
        button.addEventListener('click', () => {
            const status = button.closest('.column').dataset.status;
            window.showTaskModal({ status });
        });
    });
}

// Вспомогательные функции
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusText(status) {
    const statusMap = {
        'todo': 'To Do',
        'inProgress': 'In Progress',
        'done': 'Done'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU');
}

// Импорт функции для получения задачи по ID
import { getTaskById } from '../store.js';