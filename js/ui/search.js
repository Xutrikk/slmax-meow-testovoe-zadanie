import { debounce } from '../utils/debounce.js';

// Инициализация поиска
export function initSearch(config) {
    const searchInput = document.getElementById('search-input');
    const filterToggle = document.getElementById('filter-toggle');
    
    let currentQuery = '';
    let currentFilter = false;
    
    // Обработчик поиска с дебаунсом
    const debouncedSearch = debounce((query, filter) => {
        if (config.onSearch) {
            config.onSearch(query, filter);
        }
    }, 300);
    
    // Обработчик ввода в поле поиска
    function handleSearchInput(e) {
        currentQuery = e.target.value.trim();
        debouncedSearch(currentQuery, currentFilter);
    }
    
    // Обработчик переключения фильтра
    function handleFilterToggle() {
        currentFilter = !currentFilter;
        filterToggle.setAttribute('aria-pressed', currentFilter.toString());
        filterToggle.textContent = currentFilter ? 
            'Все задачи' : 
            'Только с описанием';
        
        debouncedSearch(currentQuery, currentFilter);
    }
    
    // Назначение обработчиков
    searchInput.addEventListener('input', handleSearchInput);
    filterToggle.addEventListener('click', handleFilterToggle);
    
    // Очистка поиска
    function clearSearch() {
        searchInput.value = '';
        currentQuery = '';
        currentFilter = false;
        filterToggle.setAttribute('aria-pressed', 'false');
        filterToggle.textContent = 'Только с описанием';
        
        if (config.onSearch) {
            config.onSearch('', false);
        }
    }
    
    return {
        clear: clearSearch,
        getState: () => ({ query: currentQuery, filter: currentFilter })
    };
}