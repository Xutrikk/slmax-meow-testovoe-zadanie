import { parseMarkdown } from '../utils/sanitize.js';

export function initModal(config) {
    const modalOverlay = document.getElementById('modal-overlay');
    if (!modalOverlay) {
        console.error('modal-overlay element not found');
        return { show: () => {}, hide: () => {} };
    }

    const modal = modalOverlay.querySelector('.modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const previewElement = document.getElementById('description-preview');
    
    if (!modal || !closeBtn || !cancelBtn || !deleteBtn || !form || !titleInput || !descriptionInput || !previewElement) {
        console.error('One or more modal elements not found');
        return { show: () => {}, hide: () => {} };
    }
    
    let currentTask = null;
    let previousActiveElement = null;
    let removeTrapFocus = null;
    
    function showModal(task = null) {
        console.log('Showing modal with task:', task);
        currentTask = task;
        previousActiveElement = document.activeElement;
        
        // Заполнение формы
        titleInput.value = task?.title || '';
        descriptionInput.value = task ? getRawDescription(task.description) : '';
        deleteBtn.style.display = task ? 'block' : 'none';
        document.getElementById('modal-title').textContent = task ? 'Редактирование задачи' : 'Новая задача';
        
        updatePreview();
        
        modalOverlay.hidden = false;
        modalOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            titleInput.focus();
        }, 100);
        
        if (removeTrapFocus) {
            removeTrapFocus();
        }
        removeTrapFocus = trapFocus(modal);
    }
    
    function hideModal() {
        console.log('Hiding modal');
        modalOverlay.hidden = true;
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
        
        if (removeTrapFocus) {
            removeTrapFocus();
            removeTrapFocus = null;
        }
        
        if (previousActiveElement) {
            console.log('Restoring focus to:', previousActiveElement);
            previousActiveElement.focus();
        }
    }
    
    function updatePreview() {
        previewElement.innerHTML = descriptionInput.value ? 
            parseMarkdown(descriptionInput.value) : 
            '<em>Введите текст для предпросмотра...</em>';
    }
    
    function getRawDescription(html) {
        if (!html) return '';
        return html
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '_$1_')
            .replace(/<code>(.*?)<\/code>/g, '`$1`')
            .replace(/<br\/?>/g, '\n')
            .replace(/<\/?[^>]+(>|$)/g, '');
    }
    
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) {
            console.warn('No focusable elements found in modal');
            return () => {};
        }
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        function handleTabKey(e) {
            if (e.key === 'Tab') {
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
        }
        
        element.addEventListener('keydown', handleTabKey);
        return () => element.removeEventListener('keydown', handleTabKey);
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submitted');
        const title = titleInput.value.trim();
        if (!title) {
            console.log('Title is empty, showing alert');
            alert('Название задачи обязательно');
            titleInput.focus();
            return;
        }
        
        const taskData = {
            title,
            description: descriptionInput.value.trim(),
            status: currentTask ? currentTask.status : 'todo'
        };
        
        console.log('Saving task:', taskData, 'Original task:', currentTask);
        if (config?.onSave) {
            config.onSave(taskData, currentTask);
        } else {
            console.error('config.onSave is not defined');
        }
        
        hideModal();
    }
    
    function handleDelete() {
        if (currentTask && confirm('Вы уверены, что хотите удалить эту задачу?')) {
            console.log('Deleting task:', currentTask.id);
            if (config?.onDelete) {
                config.onDelete(currentTask.id);
            } else {
                console.error('config.onDelete is not defined');
            }
            hideModal();
        }
    }
    
    function handleEscape(e) {
        if (e.key === 'Escape') {
            console.log('Escape key pressed');
            hideModal();
        }
    }
    
    function handleOverlayClick(e) {
        if (e.target === modalOverlay) {
            console.log('Overlay clicked');
            hideModal();
        }
    }
    
    // Очистка обработчиков
    form.removeEventListener('submit', handleFormSubmit);
    closeBtn.removeEventListener('click', hideModal);
    cancelBtn.removeEventListener('click', hideModal);
    deleteBtn.removeEventListener('click', handleDelete);
    modalOverlay.removeEventListener('keydown', handleEscape);
    modalOverlay.removeEventListener('click', handleOverlayClick);
    descriptionInput.removeEventListener('input', updatePreview);
    modalOverlay.removeEventListener('showModal', showModal);
    modalOverlay.removeEventListener('hideModal', hideModal);
    
    // Назначение обработчиков
    form.addEventListener('submit', handleFormSubmit);
    closeBtn.addEventListener('click', () => {
        console.log('Close button clicked');
        hideModal();
    });
    cancelBtn.addEventListener('click', () => {
        console.log('Cancel button clicked');
        hideModal();
    });
    deleteBtn.addEventListener('click', handleDelete);
    modalOverlay.addEventListener('keydown', handleEscape);
    modalOverlay.addEventListener('click', handleOverlayClick);
    descriptionInput.addEventListener('input', updatePreview);
    
    modalOverlay.showModal = showModal;
    modalOverlay.hideModal = hideModal;
    
    modalOverlay.addEventListener('showModal', (e) => {
        console.log('Custom showModal event triggered');
        showModal(e.detail?.task);
    });
    modalOverlay.addEventListener('hideModal', () => {
        console.log('Custom hideModal event triggered');
        hideModal();
    });
    
    return {
        show: showModal,
        hide: hideModal
    };
}