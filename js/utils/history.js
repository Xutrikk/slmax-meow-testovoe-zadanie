// Упрощенная история действий (альтернативная реализация)
export class ActionHistory {
    constructor(maxSize = 50) {
        this.maxSize = maxSize;
        this.actions = [];
        this.currentIndex = -1;
    }
    
    // Добавление действия в историю
    push(action, state) {
        // Удаляем все действия после текущего индекса
        this.actions = this.actions.slice(0, this.currentIndex + 1);
        
        this.actions.push({
            action,
            state: JSON.parse(JSON.stringify(state)), // Глубокая копия
            timestamp: Date.now()
        });
        
        // Ограничение размера истории
        if (this.actions.length > this.maxSize) {
            this.actions.shift();
        }
        
        this.currentIndex = this.actions.length - 1;
    }
    
    // Отмена последнего действия
    undo() {
        if (this.currentIndex < 0) return null;
        
        const action = this.actions[this.currentIndex];
        this.currentIndex--;
        
        return action.state;
    }
    
    // Повтор действия
    redo() {
        if (this.currentIndex >= this.actions.length - 1) return null;
        
        this.currentIndex++;
        return this.actions[this.currentIndex].state;
    }
    
    // Проверка возможности отмены
    canUndo() {
        return this.currentIndex >= 0;
    }
    
    // Проверка возможности повтора
    canRedo() {
        return this.currentIndex < this.actions.length - 1;
    }
    
    // Очистка истории
    clear() {
        this.actions = [];
        this.currentIndex = -1;
    }
}