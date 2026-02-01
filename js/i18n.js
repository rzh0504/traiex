/**
 * Internationalization (i18n) for traiex Extension
 */

// Translation dictionaries
const translations = {
    'zh-CN': {
        // Page title
        page_title: 'traiex 设置',
        
        // Section headers
        display: '显示',
        search: '搜索',
        appearance: '外观',
        dock_settings: 'Dock 设置',
        bookmark_categories: '书签分类',
        
        // Language setting
        language: '界面语言',
        language_desc: '选择界面和时间显示的语言',
        
        // Display settings
        show_datetime: '显示时间日期',
        show_datetime_desc: '在页面顶部显示当前时间和日期',
        show_dock: '显示 Dock',
        show_dock_desc: '显示快捷链接图标栏',
        show_bookmarks: '显示书签',
        show_bookmarks_desc: '显示书签链接列表',
        
        // Search settings
        search_engine: '默认搜索引擎',
        search_engine_desc: '选择用于搜索的引擎',
        link_target: '链接打开方式',
        link_target_desc: '选择点击链接时的打开方式',
        new_tab: '新标签页',
        current_tab: '当前标签页',
        
        // Appearance settings
        theme: '主题模式',
        theme_desc: '选择页面的颜色主题',
        theme_auto: '跟随系统',
        theme_light: '浅色模式',
        theme_dark: '深色模式',
        light_bg_color: '浅色模式背景色',
        light_bg_color_desc: '选择浅色模式下的背景颜色',
        custom: '自定义:',
        search_border_radius: '搜索框圆角',
        search_border_radius_desc: '调整搜索框的圆角大小',
        bookmarks_font_weight: '书签字体粗细',
        bookmarks_font_weight_desc: '调整书签链接的字体粗细',
        font_regular: '常规',
        font_medium: '中等',
        font_bold: '粗体',
        
        // Dock settings
        show_dock_labels: '显示图标标签',
        show_dock_labels_desc: '在 Dock 图标下方显示站点名称',
        manage_dock: '管理 Dock 站点',
        manage_dock_desc: '添加或删除 Dock 上的快捷方式。拖拽可调整顺序。',
        available_presets: '可用预设',
        all_presets_added: '所有预设已添加',
        
        // Actions
        save_settings: '保存设置',
        reset_defaults: '恢复默认',
        export_settings: '导出设置',
        import_settings: '导入设置',
        
        // Toast messages
        settings_saved: '设置已保存',
        settings_reset: '已恢复默认设置',
        export_success: '设置导出成功',
        import_success: '设置导入成功',
        import_error: '导入失败：无效的设置文件',
        
        // Bookmark management
        add_category: '添加分类',
        delete_category: '删除分类',
        category_name: '分类名称',
        add_bookmark: '添加书签',
        bookmark_name: '书签名称',
        bookmark_url: '书签网址',
        delete_confirm: '确定要删除吗？',
        delete_category_confirm: '确定要删除此分类吗？其中的书签也会被删除。',
        category_limit_min: '至少需要2个分类',
        category_limit_max: '最多只能有4个分类',
        new_category: '新分类',
        
        // Color presets
        color_lavender: '淡紫蓝 (默认)',
        color_mint: '薄荷绿',
        color_cream: '奶油黄',
        color_cherry: '樱花粉',
        color_sky: '天空蓝',
        color_purple: '淡紫色',
        color_silver: '银灰色',
        color_white: '纯白色',
        
        // Search history
        save_search_history: '保存搜索历史',
        save_search_history_desc: '在本地保存搜索历史记录',
        max_search_history: '历史记录数量',
        max_search_history_desc: '最多保存的搜索历史条数',
        search_history_cleared: '搜索历史已清除',
        clear_search_history: '清除搜索历史',
        clear_search_history_desc: '删除所有已保存的搜索历史',
        clear: '清除',
        
        // Data management
        data_management: '数据管理',
        import_export: '导入/导出设置',
        import_export_desc: '备份或恢复您的所有设置和书签',
        export: '导出',
        import: '导入'
    },
    
    'en': {
        // Page title
        page_title: 'traiex Settings',
        
        // Section headers
        display: 'Display',
        search: 'Search',
        appearance: 'Appearance',
        dock_settings: 'Dock Settings',
        bookmark_categories: 'Bookmark Categories',
        
        // Language setting
        language: 'Language',
        language_desc: 'Choose language for interface and time display',
        
        // Display settings
        show_datetime: 'Show Date & Time',
        show_datetime_desc: 'Display current time and date at the top',
        show_dock: 'Show Dock',
        show_dock_desc: 'Display quick access icon bar',
        show_bookmarks: 'Show Bookmarks',
        show_bookmarks_desc: 'Display bookmark links list',
        
        // Search settings
        search_engine: 'Default Search Engine',
        search_engine_desc: 'Choose your preferred search engine',
        link_target: 'Link Behavior',
        link_target_desc: 'Choose how to open links',
        new_tab: 'New Tab',
        current_tab: 'Current Tab',
        
        // Appearance settings
        theme: 'Theme',
        theme_desc: 'Choose the color theme',
        theme_auto: 'Follow System',
        theme_light: 'Light Mode',
        theme_dark: 'Dark Mode',
        light_bg_color: 'Light Mode Background',
        light_bg_color_desc: 'Choose background color for light mode',
        custom: 'Custom:',
        search_border_radius: 'Search Box Corners',
        search_border_radius_desc: 'Adjust search box border radius',
        bookmarks_font_weight: 'Bookmark Font Weight',
        bookmarks_font_weight_desc: 'Adjust bookmark link font weight',
        font_regular: 'Regular',
        font_medium: 'Medium',
        font_bold: 'Bold',
        
        // Dock settings
        show_dock_labels: 'Show Icon Labels',
        show_dock_labels_desc: 'Show site names below Dock icons',
        manage_dock: 'Manage Dock Sites',
        manage_dock_desc: 'Add or remove shortcuts. Drag to reorder.',
        available_presets: 'Available Presets',
        all_presets_added: 'All presets added',
        
        // Actions
        save_settings: 'Save Settings',
        reset_defaults: 'Reset to Defaults',
        export_settings: 'Export Settings',
        import_settings: 'Import Settings',
        
        // Toast messages
        settings_saved: 'Settings saved',
        settings_reset: 'Settings reset to defaults',
        export_success: 'Settings exported successfully',
        import_success: 'Settings imported successfully',
        import_error: 'Import failed: Invalid settings file',
        
        // Bookmark management
        add_category: 'Add Category',
        delete_category: 'Delete Category',
        category_name: 'Category Name',
        add_bookmark: 'Add Bookmark',
        bookmark_name: 'Bookmark Name',
        bookmark_url: 'Bookmark URL',
        delete_confirm: 'Are you sure you want to delete?',
        delete_category_confirm: 'Are you sure you want to delete this category? All bookmarks in it will be removed.',
        category_limit_min: 'Minimum 2 categories required',
        category_limit_max: 'Maximum 4 categories allowed',
        new_category: 'New Category',
        
        // Color presets
        color_lavender: 'Lavender (Default)',
        color_mint: 'Mint Green',
        color_cream: 'Cream Yellow',
        color_cherry: 'Cherry Blossom',
        color_sky: 'Sky Blue',
        color_purple: 'Light Purple',
        color_silver: 'Silver Gray',
        color_white: 'Pure White',
        
        // Search history
        save_search_history: 'Save Search History',
        save_search_history_desc: 'Save search history locally',
        max_search_history: 'History Count',
        max_search_history_desc: 'Maximum search history items to save',
        search_history_cleared: 'Search history cleared',
        clear_search_history: 'Clear Search History',
        clear_search_history_desc: 'Delete all saved search history',
        clear: 'Clear',
        
        // Data management
        data_management: 'Data Management',
        import_export: 'Import/Export Settings',
        import_export_desc: 'Backup or restore all your settings and bookmarks',
        export: 'Export',
        import: 'Import'
    }
};

// Current language (default to Chinese)
let currentLanguage = 'zh-CN';

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function t(key) {
    const lang = translations[currentLanguage] || translations['zh-CN'];
    return lang[key] || translations['zh-CN'][key] || key;
}

/**
 * Set current language and update page
 * @param {string} lang - Language code ('zh-CN' or 'en')
 */
function setLanguage(lang) {
    currentLanguage = lang;
    updatePageLanguage();
}

/**
 * Update all translatable elements on the page
 */
function updatePageLanguage() {
    // Update page title
    document.title = t('page_title');
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Update all elements with data-i18n-title attribute (for tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    
    // Update select options with data-i18n-option attributes
    document.querySelectorAll('select').forEach(select => {
        select.querySelectorAll('option[data-i18n]').forEach(opt => {
            const key = opt.getAttribute('data-i18n');
            opt.textContent = t(key);
        });
    });
}

/**
 * Initialize i18n with saved language preference
 * @param {string} savedLanguage - Previously saved language
 */
function initI18n(savedLanguage) {
    currentLanguage = savedLanguage || 'zh-CN';
    updatePageLanguage();
}
