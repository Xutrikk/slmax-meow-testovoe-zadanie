import { parseMarkdown } from '../utils/sanitize.js';

// Инициализация модального окна
export function initModal(config) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modal = modalOverlay.querySelector('.modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const previewElement = document.getElementById('description-preview');
    
    let currentTask = null;
    let previousActiveElement = null;
    
    // Показать модальное окно
    function showModal(task = null) {
        currentTask = task;
        previousActiveElement = document.activeElement;
        
        // Заполнение формы
        if (task) {
            titleInput.value = task.title;
            descriptionInput.value = getRawDescription(task.description);
            deleteBtn.style.display = 'block';
            document.getElementById('modal-title').textContent = 'Редактирование задачи';
        } else {
            titleInput.value = '';
            descriptionInput.value = '';
            deleteBtn.style.display = 'none';
            document.getElementById('modal-title').textContent = 'Новая задача';
        }
        
        updatePreview();
        
        // Показать модальное окно
        modalOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Фокус на первом поле ввода
        setTimeout(() => {
            titleInput.focus();
        }, 100);
        
        // Ловушка фокуса
        trapFocus(modal);
    }
    
    // Скрыть модальное окно
    function hideModal() {
        modalOverlay.hidden = true;
        document.body.style.overflow = '';
        
        // Вернуть фокус на предыдущий элемент
        if (previousActiveElement) {
            previousActiveElement.focus();
        }
    }
    
    // Обновление предпросмотра разметки
    function updatePreview() {
        previewElement.innerHTML = descriptionInput.value ? 
            parseMarkdown(descriptionInput.value) : 
            '<em>Введите текст для предпросмотра...</em>';
    }
    
    // Получение сырого описания (обратное преобразование)
    function getRawDescription(html) {
        if (!html) return '';
        
        // Простое обратное преобразование (для демонстрации)
        return html
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '_$1_')
            .replace(/<code>(.*?)<\/code>/g, '`$1`')
            .replace(/<br\/?>/g, '\n')
            .replace(/<\/?[^>]+(>|$)/g, '');
    }
    
    // Ловушка фокуса в модальном окне
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        function handleTabKey(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        
        element.addEventListener('keydown', handleTabKey);
        
        // Очистка обработчика при закрытии модалки
        return () => element.removeEventListener('keydown', handleTabKey);
    }
    
    // Обработчики событий
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        if (!title) {
            alert('Название задачи обязательно');
            titleInput.focus();
            return;
        }
        
        const taskData = {
            title,
            description: descriptionInput.value.trim(),
            status: currentTask ? currentTask.status : 'todo'
        };
        
        if (config.onSave) {
            config.onSave(taskData, currentTask);
        }
        
        hideModal();
    }
    
    function handleDelete() {
        if (currentTask && confirm('Вы уверены, что хотите удалить эту задачу?')) {
            if (config.onDelete) {
                config.onDelete(currentTask.id);
            }
            hideModal();
        }
    }
    
    function handleEscape(e) {
        if (e.key === 'Escape') {
            hideModal();
        }
    }
    
    function handleOverlayClick(e) {
        if (e.target === modalOverlay) {
            hideModal();
        }
    }
    
    // Назначение обработчиков
    form.addEventListener('submit', handleFormSubmit);
    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    deleteBtn.addEventListener('click', handleDelete);
    modalOverlay.addEventListener('keydown', handleEscape);
    modalOverlay.addEventListener('click', handleOverlayClick);
    
    // Обновление предпросмотра при вводе
    descriptionInput.addEventListener('input', updatePreview);
    
    // Публичные методы
    modalOverlay.showModal = showModal;
    modalOverlay.hideModal = hideModal;
    
    // Обработчик кастомных событий
    modalOverlay.addEventListener('showModal', (e) => {
        showModal(e.detail.task);
    });
    
    modalOverlay.addEventListener('hideModal', () => {
        hideModal();
    });
    
    return {
        show: showModal,
        hide: hideModal
    };
}