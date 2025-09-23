// Роутер для SPA
class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.onRouteChange = null;
        
        // Обработчик изменения URL
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });
        
        // Обработчик загрузки страницы
        window.addEventListener('load', () => {
            this.handleRouteChange();
        });
    }
    
    // Добавление маршрута
    addRoute(path, name) {
        this.routes.push({
            path,
            name,
            regex: this.pathToRegex(path)
        });
    }
    
    // Преобразование пути в регулярное выражение
    pathToRegex(path) {
        const pattern = path.replace(/:(\w+)/g, '(?<$1>[^/]+)');
        return new RegExp(`^${pattern}$`);
    }
    
    // Разбор текущего URL
    parseCurrentUrl() {
        const hash = window.location.hash.slice(1) || '/board';
        return this.matchRoute(hash);
    }
    
    // Сопоставление URL с маршрутом
    matchRoute(url) {
        for (const route of this.routes) {
            const match = url.match(route.regex);
            if (match) {
                return {
                    name: route.name,
                    params: match.groups || {},
                    path: url
                };
            }
        }
        
        return {
            name: 'not-found',
            params: {},
            path: url
        };
    }
    
    // Обработчик изменения маршрута
    handleRouteChange() {
        const newRoute = this.parseCurrentUrl();
        
        if (this.currentRoute && 
            this.currentRoute.name === newRoute.name && 
            JSON.stringify(this.currentRoute.params) === JSON.stringify(newRoute.params)) {
            return; // Маршрут не изменился
        }
        
        this.currentRoute = newRoute;
        
        if (this.onRouteChange) {
            this.onRouteChange(newRoute);
        }
    }
    
    // Навигация к маршруту
    navigateTo(path) {
        window.location.hash = path;
    }
    
    // Назад в истории
    back() {
        window.history.back();
    }
}

// Создание и настройка роутера
export function initRouter(config) {
    const router = new Router();
    
    // Добавление маршрутов
    router.addRoute('/board', 'board');
    router.addRoute('/task/:id', 'task');
    
    // Установка обработчика изменения маршрута
    if (config.onRouteChange) {
        router.onRouteChange = config.onRouteChange;
    }
    
    return router;
}