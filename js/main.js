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
                if (route.name === 'board') {
                    renderBoard();
                } else if (route.name === 'task') {
                    const task = getTaskById(parseInt(route.params.id));
                    if (task) {
                        window.showTaskModal(task);
                    } else {
                        window.history.replaceState(null, '', '#/board');
                        renderBoard();
                    }
                }
            }
        });
        
        // Инициализация модального окна
        initModal({
            onSave: (taskData, originalTask) => {
                if (originalTask) {
                    updateTask(originalTask.id, taskData);
                } else {
                    addTask(taskData);
                }
                renderBoard();
            },
            onDelete: (taskId) => {
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
            const modal = document.getElementById('modal-overlay');
            const event = new CustomEvent('showModal', { detail: { task } });
            modal.dispatchEvent(event);
        };
        
        window.hideTaskModal = () => {
            const modal = document.getElementById('modal-overlay');
            const event = new CustomEvent('hideModal');
            modal.dispatchEvent(event);
        };
        
        // Обработчик отмены действий
        document.getElementById('undo-btn').addEventListener('click', () => {
            undo();
            renderBoard();
        });
        
        // Глобальное сочетание клавиш для отмены
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
                renderBoard();
            }
        });
        
        // Первоначальный рендеринг доски
        renderBoard();
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        alert('Произошла ошибка при загрузке приложения');
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);