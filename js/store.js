import { parseMarkdown } from './utils/sanitize.js';

// Состояние приложения
let state = {
    tasks: [],
    searchQuery: '',
    descriptionFilter: false,
    history: [],
    historyIndex: -1
};

// Загрузка начальных данных
async function loadInitialData() {
    try {
        const response = await fetch('./seed.json');
        if (!response.ok) throw new Error('Не удалось загрузить seed данные');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки seed данных:', error);
        return { tasks: [] };
    }
}

// Сохранение состояния в localStorage
function saveState() {
    try {
        localStorage.setItem('kanban-state', JSON.stringify({
            tasks: state.tasks,
            history: state.history,
            historyIndex: state.historyIndex
        }));
    } catch (error) {
        console.error('Ошибка сохранения состояния:', error);
    }
}

// Загрузка состояния из localStorage
function loadState() {
    try {
        const saved = localStorage.getItem('kanban-state');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...state,
                tasks: parsed.tasks || [],
                history: parsed.history || [],
                historyIndex: parsed.historyIndex ?? -1
            };
        }
    } catch (error) {
        console.error('Ошибка загрузки состояния:', error);
    }
    return null;
}

// Сохранение состояния в историю
function saveToHistory(action, previousState) {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({
        action,
        previousState,
        timestamp: Date.now()
    });
    state.historyIndex = state.history.length - 1;
    
    // Ограничение размера истории
    if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
    }
}

// Инициализация хранилища
export async function initStore() {
    const savedState = loadState();
    
    if (savedState && savedState.tasks.length > 0) {
        state = savedState;
    } else {
        const initialData = await loadInitialData();
        state.tasks = initialData.tasks.map(task => ({
            ...task,
            description: task.description ? parseMarkdown(task.description) : ''
        }));
        saveState();
    }
}

// Геттеры
export function getAllTasks() {
    let filteredTasks = state.tasks;
    
    // Применение поискового запроса
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(query)
        );
    }
    
    // Фильтр по наличию описания
    if (state.descriptionFilter) {
        filteredTasks = filteredTasks.filter(task => 
            task.description && task.description.trim() !== ''
        );
    }
    
    return filteredTasks;
}

export function getTaskById(id) {
    return state.tasks.find(task => task.id === id);
}

export function getTasksByStatus(status) {
    return getAllTasks().filter(task => task.status === status);
}

// Действия с задачами
export function addTask(taskData) {
    const newTask = {
        id: Date.now(), // Простой ID на основе времени
        title: taskData.title.trim(),
        description: taskData.description ? parseMarkdown(taskData.description.trim()) : '',
        status: taskData.status || 'todo', // ✅ статус из кнопки, по умолчанию todo
        createdAt: new Date().toISOString()
    };
    
    const previousState = [...state.tasks];
    state.tasks.push(newTask);
    saveToHistory('add', previousState);
    saveState();
    
    return newTask;
}

export function updateTask(id, updates) {
    const taskIndex = state.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;
    
    const previousState = [...state.tasks];
    const updatedTask = {
        ...state.tasks[taskIndex],
        title: updates.title.trim(),
        description: updates.description ? parseMarkdown(updates.description.trim()) : '',
        updatedAt: new Date().toISOString()
    };
    
    state.tasks[taskIndex] = updatedTask;
    saveToHistory('update', previousState);
    saveState();
    
    return updatedTask;
}

export function moveTask(id, newStatus) {
    const taskIndex = state.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;
    
    const previousState = [...state.tasks];
    const movedTask = {
        ...state.tasks[taskIndex],
        status: newStatus,
        updatedAt: new Date().toISOString()
    };
    
    state.tasks[taskIndex] = movedTask;
    saveToHistory('move', previousState);
    saveState();
    
    return movedTask;
}

export function deleteTask(id) {
    const taskIndex = state.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;
    
    const previousState = [...state.tasks];
    state.tasks.splice(taskIndex, 1);
    saveToHistory('delete', previousState);
    saveState();
    
    return true;
}

// Поиск и фильтры
export function setSearchFilter(query, descriptionOnly = false) {
    state.searchQuery = query;
    state.descriptionFilter = descriptionOnly;
}

// Отмена последнего действия
export function undo() {
    if (state.historyIndex < 0) return false;
    
    const historyItem = state.history[state.historyIndex];
    state.tasks = historyItem.previousState;
    state.historyIndex--;
    saveState();
    
    return true;
}


// Получение статуса истории
export function getHistoryStatus() {
    return {
        canUndo: state.historyIndex >= 0,
        historySize: state.history.length,
        currentIndex: state.historyIndex
    };
}