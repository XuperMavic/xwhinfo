/**
 * 按钮点击复制功能脚本 - 改进版
 * 使用事件委托技术实现所有具有.button类的按钮点击后复制其文本内容
 */

// 立即执行函数，避免全局变量污染
(function() {
    'use strict';
    
    // 按钮选择器
    const BUTTON_SELECTOR = '.button';
    
    // 初始化函数
    function init() {
        console.log('按钮复制功能初始化...');
        
        // 使用事件委托技术，监听文档根元素的点击事件
        document.addEventListener('click', handleDocumentClick, false);
        
        // 为所有现有按钮添加复制提示样式
        applyButtonStyles();
        
        // 处理动态加载的内容
        setupMutationObserver();
        
        console.log('按钮复制功能初始化完成');
    }
    
    /**
     * 处理文档点击事件
     * @param {MouseEvent} event - 点击事件对象
     */
    function handleDocumentClick(event) {
        // 检查点击目标是否为按钮或包含在按钮内
        const button = event.target.closest(BUTTON_SELECTOR);
        
        if (button) {
            // 检查按钮是否正在显示反馈文本（"已复制"或"复制失败"）
            if (button.dataset.isShowingFeedback === 'true') {
                console.log('按钮正在显示反馈文本，跳过复制操作');
                return;
            }
            
            // 获取按钮文本内容
            const textToCopy = button.textContent.trim();
            
            // 如果文本不为空，则复制
            if (textToCopy) {
                // 尝试复制，但不阻止事件冒泡，避免影响其他功能
                copyToClipboard(textToCopy, button);
            }
        }
    }
    
    /**
     * 应用按钮样式
     */
    function applyButtonStyles() {
        const buttons = document.querySelectorAll(BUTTON_SELECTOR);
        
        buttons.forEach(button => {
            // 存储原始样式，避免覆盖已有样式
            if (!button.dataset.hasCopyStyles) {
                // 设置固定高度和布局样式
                button.style.height = '30px';        // 设置按钮固定高度为36像素
                button.style.minHeight = '30px';     // 确保最小高度为36像素
                button.style.maxHeight = '30px';     // 限制最大高度为36像素
                button.style.lineHeight = '16px';    // 设置行高小于按钮高度，使文字位置提高
                button.style.boxSizing = 'border-box'; // 确保padding和border不会增加按钮总高度
                button.style.display = 'inline-block'; // 设置为内联块元素，允许设置宽高
                button.style.whiteSpace = 'nowrap';   // 防止文本换行
                button.style.overflow = 'hidden';     // 隐藏超出部分的内容
                button.style.textOverflow = 'ellipsis'; // 文本超出时显示省略号
                
                // 设置交互样式
                button.style.cursor = button.style.cursor || 'pointer';
                button.style.userSelect = button.style.userSelect || 'none';
                
                button.dataset.hasCopyStyles = 'true';
                
                // 存储原始文本，避免复制反馈文本
                if (!button.dataset.originalText) {
                    button.dataset.originalText = button.textContent.trim();
                }
            }
        });
    }
    
    /**
     * 设置DOM变化观察器，处理动态加载的按钮
     */
    function setupMutationObserver() {
        // 创建观察器实例
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // 检查是否有新节点添加
                if (mutation.addedNodes.length > 0) {
                    // 延迟应用样式，确保新节点已完全加载
                    setTimeout(() => {
                        applyButtonStyles();
                    }, 0);
                }
            });
        });
        
        // 配置观察器
        const config = {
            childList: true,
            subtree: true
        };
        
        // 开始观察文档变化
        observer.observe(document.body, config);
    }
    
    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @param {HTMLElement} button - 触发复制的按钮元素
     */
    function copyToClipboard(text, button) {
        // 保存原始按钮状态
        const originalText = button.dataset.originalText || button.textContent;
        
        // 标记按钮正在显示反馈文本
        button.dataset.isShowingFeedback = 'true';
        
        // 创建样式对象保存原始样式
        const originalStyles = {
            backgroundColor: button.style.backgroundColor || '',
            color: button.style.color || '',
            fontWeight: button.style.fontWeight || '',
            height: button.style.height || '',
            minHeight: button.style.minHeight || '',
            maxHeight: button.style.maxHeight || '',
            lineHeight: button.style.lineHeight || '',
            whiteSpace: button.style.whiteSpace || '',
            overflow: button.style.overflow || '',
            textOverflow: button.style.textOverflow || ''
        };
        
        // 先使用现代 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    console.log('使用 Clipboard API 复制成功:', text);
                    showFeedback(button, '已 复 制', originalText, originalStyles, true);
                })
                .catch(err => {
                    console.warn('Clipboard API 复制失败，尝试降级方法:', err);
                    fallbackCopyMethod(text, button, originalText, originalStyles);
                });
        } else {
            // 降级使用传统方法
            console.log('使用传统方法复制文本');
            fallbackCopyMethod(text, button, originalText, originalStyles);
        }
    }
    
    /**
     * 降级复制方法
     * @param {string} text - 要复制的文本
     * @param {HTMLElement} button - 按钮元素
     * @param {string} originalText - 原始文本
     * @param {Object} originalStyles - 原始样式对象
     */
    function fallbackCopyMethod(text, button, originalText, originalStyles) {
        try {
            // 创建临时文本区域
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // 设置样式使其不可见
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            
            // 添加到文档
            document.body.appendChild(textArea);
            
            // 选中并复制
            textArea.focus();
            textArea.select();
            
            // 执行复制命令
            const successful = document.execCommand('copy');
            
            // 移除临时元素
            document.body.removeChild(textArea);
            
            if (successful) {
                console.log('传统方法复制成功:', text);
                showFeedback(button, '已 复 制', originalText, originalStyles, true);
            } else {
                console.error('传统方法复制失败');
                showFeedback(button, '复制失败', originalText, originalStyles, false);
            }
        } catch (err) {
            console.error('复制过程中发生错误:', err);
            showFeedback(button, '复制失败', originalText, originalStyles, false);
        }
    }
    
    /**
     * 显示操作反馈
     * @param {HTMLElement} button - 按钮元素
     * @param {string} message - 反馈消息
     * @param {string} originalText - 原始文本
     * @param {Object} originalStyles - 原始样式对象
     * @param {boolean} isSuccess - 是否成功
     */
    function showFeedback(button, message, originalText, originalStyles, isSuccess) {
        // 取消之前可能存在的恢复定时器
        if (button._feedbackTimer) {
            clearTimeout(button._feedbackTimer);
        }
        
        // 保存按钮高度以保持一致性
        const originalHeight = button.offsetHeight;
        
        // 设置固定高度和样式
        button.style.height = originalHeight + 'px';        // 设置按钮高度为保存的原始高度
        button.style.minHeight = originalHeight + 'px';     // 确保最小高度与原始高度一致
        button.style.maxHeight = originalHeight + 'px';     // 限制最大高度与原始高度一致
        // 将lineHeight设置为略小于按钮高度，使文字上移
        button.style.lineHeight = (originalHeight * 0.4) + 'px'; // 设置行高为按钮高度的40%，使反馈文本位置进一步提高
        button.style.boxSizing = 'border-box';              // 确保padding和border不会增加按钮总高度
        button.style.display = 'inline-block';              // 设置为内联块元素，允许设置宽高
        button.style.whiteSpace = 'nowrap';                 // 防止文本换行
        button.style.overflow = 'hidden';                   // 隐藏超出部分的内容
        button.style.textOverflow = 'ellipsis';             // 文本超出时显示省略号
        
        // 设置反馈文本和样式
        button.textContent = message;
        button.style.backgroundColor = isSuccess ? 'hsl(120, 92%, 58%)' : '#ff4d4d';
        button.style.color = 'white';
        button.style.fontWeight = 'bold';
        
        // 2秒后恢复原始状态
        button._feedbackTimer = setTimeout(() => {
            try {
                // 恢复原始文本
                button.textContent = originalText;
                
                // 恢复原始样式
                Object.keys(originalStyles).forEach(styleKey => {
                    button.style[styleKey] = originalStyles[styleKey];
                });
                
                // 清除反馈标记
                delete button.dataset.isShowingFeedback;
                
                // 清除定时器引用
                delete button._feedbackTimer;
            } catch (err) {
                console.error('恢复按钮样式失败:', err);
                // 即使出错也清除反馈标记
                delete button.dataset.isShowingFeedback;
                delete button._feedbackTimer;
            }
        }, 2000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // 如果DOM已经加载完成，立即初始化
        setTimeout(init, 0);
    }
})();