// Безопасный парсер легкой разметки
export function parseMarkdown(text) {
    if (!text) return '';
    
    // Экранирование HTML-тегов
    const escaped = escapeHTML(text);
    
    // Преобразование разметки в безопасный HTML
    return escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br/>');
}

// Экранирование HTML
export function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Санитизация HTML (дополнительная защита)
export function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Удаление скриптов и опасных элементов
    const scripts = temp.querySelectorAll('script, style, object, embed, applet');
    scripts.forEach(el => el.remove());
    
    // Удаление опасных атрибутов
    const elements = temp.querySelectorAll('*');
    elements.forEach(el => {
        const attrs = el.attributes;
        for (let i = attrs.length - 1; i >= 0; i--) {
            const attr = attrs[i];
            if (attr.name.startsWith('on') || 
                attr.name === 'src' || 
                attr.name === 'href' && attr.value.startsWith('javascript:')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    
    return temp.innerHTML;
}