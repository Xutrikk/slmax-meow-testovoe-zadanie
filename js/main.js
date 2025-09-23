import { initStore, addTask, updateTask, moveTask, deleteTask, undo, getTaskById, getAllTasks, setSearchFilter } from './store.js';
import { initRouter } from './router.js';
import { renderBoard } from './ui/board.js';
import { initModal } from './ui/modal.js';
import { initSearch } from './ui/search.js';

// Инициализация приложения
async function initApp() {
    try {
        // Инициализация хранилища
        await initStore();
        
        // Инициализация роутера
        initRouter({
            onRouteChange: (route) => {
                console.log('Route changed to:', route);
                if (route.name === 'board') {
                    renderBoard();
                } else if (route.name === 'task') {
                    const task = getTaskById(parseInt(route.params.id));
                    if (task) {
                        window.showTaskModal(task);
                    } else {
                        console.warn('Task not found, redirecting to board');
                        window.history.replaceState(null, '', '#/board');
                        renderBoard();
                    }
                }
            }
        });
        
        // Инициализация модального окна
        initModal({
            onSave: (taskData, originalTask) => {
                console.log('Saving task:', taskData, 'Original task:', originalTask);
                if (originalTask?.id) {
                    updateTask(originalTask.id, taskData);
                } else {
                    addTask(taskData);
                }
                renderBoard();
            },
            onDelete: (taskId) => {
                console.log('Deleting task ID:', taskId);
                deleteTask(taskId);
                renderBoard();
            }
        });
        
        // Инициализация поиска
        initSearch({
            onSearch: (query, filter) => {
                setSearchFilter(query, filter);
                renderBoard();
            }
        });
        
        // Глобальные функции для модального окна
        window.showTaskModal = (task = null) => {
            console.log('Calling showTaskModal with task:', task);
            const modal = document.getElementById('modal-overlay');
            if (!modal) {
                console.error('modal-overlay not found');
                return;
            }
            const event = new CustomEvent('showModal', { detail: { task } });
            modal.dispatchEvent(event);
        };
        
        window.hideTaskModal = () => {
            console.log('Calling hideTaskModal');
            const modal = document.getElementById('modal-overlay');
            if (!modal) {
                console.error('modal-overlay not found');
                return;
            }
            const event = new CustomEvent('hideModal');
            modal.dispatchEvent(event);
        };
        
        // Обработчик отмены действий
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                undo();
                renderBoard();
            });
        }
        
        // Глобальное сочетание клавиш для отмены
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
                renderBoard();
            }
        });
        
        // Проверяем текущий маршрут, чтобы избежать автоматического открытия модального окна
        if (window.location.hash.startsWith('#/task/')) {
            const taskId = parseInt(window.location.hash.split('/')[2]);
            const task = getTaskById(taskId);
            if (task) {
                window.showTaskModal(task);
            } else {
                window.history.replaceState(null, '', '#/board');
                renderBoard();
            }
        } else {
            renderBoard();
        }
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        alert('Произошла ошибка при загрузке приложения');
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);