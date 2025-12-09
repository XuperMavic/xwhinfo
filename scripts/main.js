// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 初始化主题
    initTheme();
    
    // 初始化更多信息区域的所有板块
    initMoreInfoSections();
    
    // 初次渲染右侧面包屑（根据当前哈希或激活页面）
    const initialPageId = (window.location.hash ? window.location.hash.substring(1) : (document.querySelector('.page.active')?.id || 'home'));
    setTimeout(() => { updateBreadcrumb(initialPageId); }, 150);

    // 在基本信息页挂载统一导航（替换静态写法）
    try {
        const basicInfoNavMount = document.querySelector('#basic-info .nav-mount');
        if (basicInfoNavMount && !basicInfoNavMount.querySelector('.main-nav')) {
            basicInfoNavMount.innerHTML = renderMainNav('basic-info');
        }
    } catch (e) {}
});

// 全局变量定义
let isExplorationMode = false;
let currentPageId = 'home';
let breadcrumbObserver = null;

// 统一主导航渲染函数：避免多处重复定义
function renderMainNav(activeId) {
    const links = [
        { id: 'basic-info', text: '基本信息', red: false },
        { id: 'professional-experience', text: '专业履历', red: true },
        { id: 'skills', text: '技能介绍', red: false },
        { id: 'hobbies', text: '兴趣爱好', red: false },
        { id: 'contact', text: '联系', red: true },
    ];
    const linksHtml = links.map(({ id, text, red }) => {
        const classes = ['nav-link'];
        if (red) classes.push('red-bg-section');
        if (id === activeId) classes.push('active');
        return `<a href="#${id}" class="${classes.join(' ')}">${text}</a>`;
    }).join('\n            ');
    return `
        <nav class="main-nav">
            ${linksHtml}
            <!-- 主导航栏右端控件 -->
            <div class="nav-controls">
                <div class="control control-dock">
                    <input type="checkbox" id="dock-toggle">
                    <label for="dock-toggle" class="control-btn" title="左侧栏">
                        <span class="iconify dock-outline" data-icon="material-symbols:dock-to-right-outline"></span>
                        <span class="iconify dock-filled" data-icon="material-symbols:dock-to-right"></span>
                    </label>
                </div>
                <div class="control control-settings">
                    <input type="checkbox" id="settings-toggle">
                    <label for="settings-toggle" class="control-btn" title="设置">
                        <span class="iconify settings-regular" data-icon="fluent:settings-24-regular"></span>
                        <span class="iconify settings-filled" data-icon="fluent:settings-24-filled"></span>
                    </label>
                    <div class="settings-menu">
                        <label for="theme-expand" class="menu-item">主题</label>
                        <div id="announcement-btn" class="menu-item">公告</div>
                        <div class="menu-item" id="more-option">更多</div>
                    </div>
                    <input type="checkbox" id="theme-expand" class="submenu-toggle" hidden>
                    <div class="theme-submenu">
                        <button class="theme-btn" data-theme="dimmed">dimmed</button>
                        <button class="theme-btn" data-theme="blue">blue</button>
                        <button class="theme-btn" data-theme="red">red</button>
                        <button class="theme-btn" data-theme="sun">sun</button>
                        <button class="theme-btn" data-theme="rain">rain</button>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// 定义可探索内容的映射关系
let contentMap = {
    "纯血红水晶": 
        "<h3>纯血红水晶</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/纯血红水晶虾1.png' alt='纯血红水晶虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>水晶虾出现始于日本，1996年日本的铃木久康先生把原产于香港的彩虹钻石虾带回日本，经过6年漫长的培育和15代提纯，稳定了基因。使红色隐性基因得以保持，也就成了今天的水晶虾了。</p>" + 
        "<p>红白水晶虾由于其红色与白色像锦鲤的红白，因而广受喜爱。</p>",
    "酒红水晶": 
        "<h3>酒红水晶</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/酒红水晶虾1.png' alt='酒红水晶虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>酒红水晶虾是由台湾的水晶虾玩家从水晶虾的变异品种改良培育出来的，具体是谁第一次培育出的酒红虾依然无据可考。</p>" +
        "<p>不过将酒红水晶虾稳定培育至第七代（F7）的人就是方廷，第一只金虾也是在他的缸中所诞生。</p>",
    "黑金刚": 
        "<h3>黑金刚</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/黑金刚水晶虾1.png' alt='黑金刚水晶虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>黑白水晶虾是由台湾从业者培育而成，一般来说所谓的黑白水晶虾就是带有红白水晶虾 CRS 遗传因子的蜜蜂虾便是黑白虾。</p>" +
        "<p>黑金刚水晶虾是由台湾从业者育成，是由带金虾血统的一般黑白水晶虾繁殖变异所得，十分不易，在一代期，通常在数万只小虾中寻到一只。</p>" +
        "<p>蓝金刚水晶虾由台湾从业者育成。</p>",
    "红花虎": 
        "<h3>红花虎</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/红花虎水晶虾1.png' alt='红花虎水晶虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>红花虎水晶虾身体上有着鲜艳的红色和白色条纹，如同小虎纹一样，因此得名。</p>",
    "黑银河": 
        "<h3>黑银河</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/黑银河水晶虾1.png' alt='黑银河水晶虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>银河鱼骨虾融合了“金背型”和“斑马型”和星点型三大特征，“金背”和“斑马”形成近似鱼骨的有趣表现。</p>",
    "红姘头": 
        "<h3>红姘头</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/红姘头水晶虾1.png' alt='红姘头水晶虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>红姘头水晶虾是红水晶虾的变种，头部有特殊图案红色、白躯。</p>",
    "琉璃虾": 
        "<h3>琉璃虾</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/琉璃虾1.png' alt='琉璃虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>琉璃虾为台湾改良出的新品种观赏虾，头尾的亮红色对比富透明感的身段若隐若现，为水族界台湾之光添上一笔新气象。饲养上与樱花虾，极火虾雷同，琉璃虾可谓表现亮丽并容易饲养的虾种。</p>",
    "枪鼻虾": 
        "<h3>枪鼻虾</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/枪鼻虾1.png' alt='枪鼻虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>体长15-30mm，是一种小型的虾类。额角上缘基部1/2部或2/3处有13-17个齿；下缘有10-15个齿，比上缘的大，且排列较紧密。生活时体色透明，额角、触角和尾节常呈蓝褐色或棕红色。腹部的腹面呈淡蓝色或棕红色。</p>",
    "虎纹虾": 
        "<h3>虎纹虾</h3>" +
        "<div class='exploration-images'>" +
        "  <img src='images/虎纹虾1.png' alt='虎纹虾图片1' style='max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;'>" +
        "</div>" + 
        "<p>物种起源：虎纹虾分布在中国广东等地，主要有香港向外出口，子啊内地观赏虾玩家中的热度很高。虎纹虾对水质要求高，在喜欢偏酸性的软水，入缸之前要先测水质，特别是NO2的数值。</p>" +
        "<p>生活习性：虎纹虾比较娇贵，它们对生活环境的要求是很高的。喜欢在偏酸性软水溪流当中生活，水质要求酸碱值6.5左右，最佳水温22-26摄氏度之间。因为体型小，没有带攻击性与破坏性的鳌足，食性上属于混合食性。</p>" +
        "<p>物种特点：虎纹虾对水质要求很高，入虾前最好先测一下水质。特别是NO2指标。虎纹虾外表美丽，全身半透明，虾体身上带有黑色或深褐色的条纹，主食藻类及偶尔且少量喂食的蛋白质饲料。</p>"
};

// 页面初始化函数
function initPage() {
    // 使用事件委托为导航链接添加点击事件
    document.addEventListener('click', function(e) {
        const link = e.target.closest('.footer-link, .nav-link');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            
            // 对于需要密码访问的页面
            if (targetId === '#professional-experience') {
                // 检查是否已经验证过密码
                if (sessionStorage.getItem('professional-experience-verified')) {
                    navigateTo('professional-experience');
                    
                    // 添加已解锁状态到专业履历按钮
                    document.querySelectorAll('.nav-link.red-bg-section[href="#professional-experience"]').forEach(btn => {
                        btn.classList.add('unlocked');
                    });
                } else {
                    showPasswordModal('输入密码访问"专业履历"：', 'professional');
                }
            } else if (targetId === '#contact') {
                // 检查是否已经验证过密码
                if (sessionStorage.getItem('contact-verified')) {
                    navigateTo('contact');
                    
                    // 添加已解锁状态到联系按钮
                    document.querySelectorAll('.nav-link.red-bg-section[href="#contact"]').forEach(btn => {
                        btn.classList.add('unlocked');
                    });
                } else {
                    showPasswordModal('为防止过多骚扰，访问"联系"需要输入密码，请见谅。<br>相信如果你真的对我的经历感到好奇、或是与我有共同兴趣，一定能猜到我的密码<br>（提示——密码有多个，随便答对一个就行）', 'contact');
                }
            } else {
                navigateTo(targetId.substring(1));
            }
        }
    });
    
    // 初始化左侧边栏功能
    initLeftSidebar();

    // 事件委托：处理右上角控件的点击（保留设置按钮基本切换白/金色功能）
    document.addEventListener('click', function(e) {
        // 左侧栏开关按钮点击 -> 切换同容器内的checkbox
        const dockLabel = e.target.closest('.control.control-dock .control-btn');
        if (dockLabel) {
            e.preventDefault();
            const input = dockLabel.previousElementSibling;
            if (input && input.type === 'checkbox') {
                input.checked = !input.checked;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        // 设置开关按钮点击 -> 仅切换本地checkbox（用于图标与金色态），不触发菜单
        const settingsLabel = e.target.closest('.control.control-settings .control-btn');
        if (settingsLabel) {
            e.preventDefault();
            const input = settingsLabel.previousElementSibling;
            if (input && input.type === 'checkbox') {
                input.checked = !input.checked;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        // 主题展开菜单项点击 -> 切换同容器内的submenu-toggle（修复仅基本信息页有效的问题）
        const themeLabel = e.target.closest('.settings-menu .menu-item[for="theme-expand"]');
        if (themeLabel) {
            e.preventDefault();
            // 在当前设置控件容器内查找对应的复选框，兼容不同页面结构
            const settingsControl = themeLabel.closest('.control.control-settings');
            const toggle = settingsControl ? settingsControl.querySelector('.submenu-toggle') : null;
            if (toggle && toggle.type === 'checkbox') {
                toggle.checked = !toggle.checked;
                toggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        // 主题按钮点击处理
        const themeBtn = e.target.closest('.theme-btn');
        if (themeBtn) {
            e.preventDefault();
            const theme = themeBtn.getAttribute('data-theme');
            setTheme(theme);
            
            // 关闭主题下拉菜单
            document.querySelectorAll('.submenu-toggle').forEach(toggle => {
                if (toggle.checked) {
                    toggle.checked = false;
                }
            });
        }

        // 点击'更多'选项 -> 跳转到星空页面
            const moreOption = e.target.closest('#more-option');
            if (moreOption) {
                // 关闭设置菜单
                document.querySelectorAll('#settings-toggle').forEach(el => el.checked = false);
                // 跳转到星空页面
                window.location.href = 'more/galaxy.html';
                return;
            }
            
            // 点击文档其他位置 -> 收起设置及主题子菜单
            const clickedInsideSettings = e.target.closest('.control.control-settings');
            if (!clickedInsideSettings) {
            // 关闭所有设置菜单
            document.querySelectorAll('#settings-toggle').forEach(el => {
                if (el.checked) {
                    el.checked = false;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            // 同时关闭所有主题子菜单
            document.querySelectorAll('.submenu-toggle').forEach(toggle => {
                if (toggle.checked) {
                    toggle.checked = false;
                    toggle.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    });
}

// 设置主题函数
function setTheme(theme) {
    // 移除所有主题类（包含旧名spot以及新名sun）
        document.body.classList.remove('theme-dimmed', 'theme-blue', 'theme-red', 'theme-spot', 'theme-yellow', 'theme-sun', 'theme-rain');
    
    // 添加选中的主题类
    document.body.classList.add(`theme-${theme}`);
    
    // 保存主题到本地存储
    localStorage.setItem('theme', theme);

    // 通知主题变更（供数字雨等效果联动）
    try {
        window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
    } catch (err) {
        // 兼容性兜底：不影响其他功能
        console.warn('Theme change dispatch failed:', err);
    }
}

// 初始化主题函数
function initTheme() {
    // 从本地存储获取保存的主题，如果没有则使用默认主题（dimmed）
    const savedTheme = localStorage.getItem('theme') || 'rain';
    const normalizedTheme = (savedTheme === 'cyber' || savedTheme === 'spot' || savedTheme === 'yellow') ? 'sun' : savedTheme;
    setTheme(normalizedTheme);
}

// 初始化左侧边栏功能
function initLeftSidebar() {
    const sidebarTrigger = document.getElementById('left-sidebar-trigger');
    const leftSidebar = document.getElementById('left-sidebar');
    const resizableHandle = document.querySelector('.resizable-handle');
    const checkbox = document.getElementById('checkbox');
    let isSidebarActive = false;
    let isResizing = false;

    // 顶部右侧：左侧栏联动（事件委托，兼容动态页面）
    document.addEventListener('change', function(e) {
        const dockToggle = e.target.closest('#dock-toggle');
        if (dockToggle) {
            // 保持与侧边栏状态一致
            if (dockToggle.checked !== isSidebarActive) {
                toggleSidebar();
            }
        }
        // 设置开关变更：当关闭设置时，收起主题子菜单
        const settingsToggle = e.target.closest('#settings-toggle');
        if (settingsToggle && !settingsToggle.checked) {
            const settingsControl = settingsToggle.closest('.control.control-settings');
            const themeToggle = settingsControl ? settingsControl.querySelector('.submenu-toggle') : null;
            if (themeToggle && themeToggle.checked) {
                themeToggle.checked = false;
                themeToggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });
    
    // 侧边栏宽度调整功能
    if (resizableHandle && leftSidebar) {
        // 开始调整大小
        resizableHandle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            isResizing = true;
            document.body.style.cursor = 'col-resize';
        });
        
        // 调整大小过程
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            
            // 计算新的宽度（鼠标位置到左侧的距离）
            let newWidth = e.clientX;
            
            // 限制最小和最大宽度
            const minWidth = 200;
            const maxWidth = window.innerWidth * 0.5; // 最大宽度为窗口的50%
            
            if (newWidth < minWidth) newWidth = minWidth;
            if (newWidth > maxWidth) newWidth = maxWidth;
            
            // 应用新宽度
            leftSidebar.style.width = newWidth + 'px';
            leftSidebar.style.left = '0'; // 确保侧边栏是打开的
        });
        
        // 结束调整大小
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
            }
        });
    }
    
    // 鼠标移动监听 - 控制小箭头显示/隐藏
    document.addEventListener('mousemove', function(e) {
        // 只在非首页的页面显示侧边栏触发按钮
        const currentPage = document.querySelector('.page.active');
        const isHomePage = currentPage && currentPage.id === 'home';
        
        if (isHomePage) {
            sidebarTrigger.classList.remove('visible');
            return;
        }
        
        // 计算屏幕宽度的20%
        const screenWidth = window.innerWidth;
        const left20Percent = screenWidth * 0.2;
        
        // 当鼠标移动到网页左20%区域时显示触发按钮
        if (e.clientX <= left20Percent) {
            sidebarTrigger.classList.add('visible');
            // 确保按钮在DOM中存在并且样式正确应用
            if (sidebarTrigger) {
                console.log('侧边栏触发按钮已显示');
            }
        } else if (e.clientX > left20Percent && !isSidebarActive) {
            sidebarTrigger.classList.remove('visible');
        }
    });
    
    // 额外添加一个初始检查，确保非首页页面加载时侧边栏触发按钮可用
    setTimeout(() => {
        const currentPage = document.querySelector('.page.active');
        const isHomePage = currentPage && currentPage.id === 'home';
        
        // 首页完全隐藏左侧边栏
        if (isHomePage) {
            if (sidebarTrigger) {
                sidebarTrigger.style.display = 'none';
            }
            if (leftSidebar) {
                leftSidebar.style.display = 'none';
            }
            document.querySelectorAll('#dock-toggle').forEach(el => {
                el.checked = false;
            });
        } else if (sidebarTrigger) {
            // 非首页显示侧边栏触发按钮
            sidebarTrigger.style.display = 'block';
            leftSidebar.style.display = 'block';
            // 添加一个短暂的显示效果，让用户知道有侧边栏
            sidebarTrigger.classList.add('visible');
            setTimeout(() => {
                if (!isSidebarActive) {
                    sidebarTrigger.classList.remove('visible');
                }
            }, 2000);
        }
    }, 500);
    
    // 点击label切换侧边栏显示/隐藏
    const triggerLabel = document.querySelector('.trigger-label');
    if (triggerLabel) {
        triggerLabel.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止默认行为
            toggleSidebar();
        });
    }
    
    // 点击sidebarTrigger容器也能切换侧边栏显示/隐藏
    sidebarTrigger.addEventListener('click', function(e) {
        // 如果点击的不是triggerLabel，才执行切换
        if (!e.target.closest('.trigger-label')) {
            toggleSidebar();
        }
    });
    
    // 监听checkbox的change事件来切换探索模式
    checkbox.addEventListener('change', function() {
        toggleExplorationMode(checkbox.checked);
    });
    
    // 点击文档其他区域不再自动关闭侧边栏，只能通过收缩按钮关闭
    
    // 切换侧边栏显示/隐藏
    function toggleSidebar() {
        isSidebarActive = !isSidebarActive;
        
        if (isSidebarActive) {
            leftSidebar.classList.add('active');
            leftSidebar.style.left = '0'; // 确保侧边栏完全显示
            document.body.classList.add('sidebar-active');
            sidebarTrigger.classList.add('visible');
        } else {
            leftSidebar.classList.remove('active');
            leftSidebar.style.left = '-' + leftSidebar.offsetWidth + 'px'; // 使用当前宽度确保完全隐藏
            document.body.classList.remove('sidebar-active');
            sidebarTrigger.classList.remove('visible');
        }
        
        // 更新checkbox状态以触发箭头旋转动画
        const sidebarCheckbox = document.getElementById('sidebar-checkbox');
        if (sidebarCheckbox) {
            sidebarCheckbox.checked = isSidebarActive;
        }
        // 同步顶部右侧左侧栏开关图标
        document.querySelectorAll('#dock-toggle').forEach(el => {
            el.checked = isSidebarActive;
        });
    }
    
    // 添加收缩按钮事件监听器
    const collapseSidebarBtn = document.getElementById('collapse-sidebar-btn');
    if (collapseSidebarBtn) {
        collapseSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    // 切换探索模式 - 现在在全局作用域中定义
    window.toggleExplorationMode = function(activate) {
        const checkbox = document.getElementById('checkbox');
        const sidebarTrigger = document.getElementById('left-sidebar-trigger');
        
        // 如果提供了activate参数，则使用它来设置模式；否则切换当前模式
        if (typeof activate === 'boolean') {
            isExplorationMode = activate;
        } else {
            isExplorationMode = !isExplorationMode;
        }
        
        if (isExplorationMode) {
            // 确保checkbox被选中
            checkbox.checked = true;
            // 确保侧边栏是打开的
            if (!isSidebarActive) {
                toggleSidebar();
            }
            // 开始闪烁动画
            startBlinking();
            // 显示动画
            updateAnimationDisplay(true);
        } else {
            // 确保checkbox未被选中
            checkbox.checked = false;
            // 停止闪烁动画
            stopBlinking();
            // 隐藏动画
            updateAnimationDisplay(false);
        }
    };
    
    // 显示文本信息 - 现在在全局作用域中定义
    window.showTextInfo = function(targetText) {
        const sidebarInfo = document.getElementById('sidebar-info');
        const info = contentMap[targetText];
        if (info) {
            sidebarInfo.innerHTML = info;
            // 确保侧边栏是打开的
            if (!isSidebarActive) {
                toggleSidebar();
            }
        }
    };
} // 闭合initLeftSidebar函数

// 开始闪烁动画
function startBlinking() {
    // 遍历contentMap中的所有关键词，为页面中匹配的文本添加闪烁效果
    for (const keyword in contentMap) {
        findAndMarkFlickeringText(keyword);
    }
    
    // 为所有已有的.explore-target元素重新添加blinking类
    const existingTargets = document.querySelectorAll('.explore-target');
    existingTargets.forEach(element => {
        element.classList.add('blinking');
    });
    
    // 为所有带有.explore-target类的元素添加点击事件
    document.addEventListener('click', handleTargetClick);
    
    // 创建并显示全屏十字光标
    createFullScreenCrosshair();
}

// 停止闪烁动画
function stopBlinking() {
    // 移除所有闪烁元素的动画
    const blinkingElements = document.querySelectorAll('.explore-target');
    blinkingElements.forEach(element => {
        element.classList.remove('blinking');
        // 不删除元素，只是移除闪烁效果
    });
    
    // 移除点击事件监听器
    document.removeEventListener('click', handleTargetClick);
    
    // 移除全屏十字光标
    removeFullScreenCrosshair();
}

// 创建全屏十字光标
function createFullScreenCrosshair() {
    // 隐藏默认光标
    document.body.style.cursor = 'none';
    
    // 添加全局CSS规则覆盖所有元素的cursor样式
    const styleElement = document.createElement('style');
    styleElement.id = 'exploration-mode-cursor-override';
    styleElement.textContent = `
        * {
            cursor: none !important;
        }
        body,
        html,
        .explore-target,
        .info-item,
        button,
        a,
        input,
        textarea {
            cursor: none !important;
        }
    `;
    document.head.appendChild(styleElement);
    
    // 创建十字光标容器
    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'fullscreen-crosshair';
    cursorContainer.style.position = 'fixed';
    cursorContainer.style.top = '0';
    cursorContainer.style.left = '0';
    cursorContainer.style.width = '100%';
    cursorContainer.style.height = '100%';
    cursorContainer.style.pointerEvents = 'none';
    cursorContainer.style.zIndex = '10000';
    cursorContainer.style.userSelect = 'none';
    
    // 创建水平线
    const horizontalLine = document.createElement('div');
    horizontalLine.id = 'crosshair-horizontal';
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.width = '100%';
    horizontalLine.style.height = '1px';
    horizontalLine.style.background = 'rgba(255, 255, 255, 0.8)';
    horizontalLine.style.pointerEvents = 'none';
    horizontalLine.style.transform = 'translateY(50%)';
    horizontalLine.style.transition = 'opacity 0.3s ease';
    
    // 创建垂直线
    const verticalLine = document.createElement('div');
    verticalLine.id = 'crosshair-vertical';
    verticalLine.style.position = 'absolute';
    verticalLine.style.height = '100%';
    verticalLine.style.width = '1px';
    verticalLine.style.background = 'rgba(255, 255, 255, 0.8)';
    verticalLine.style.pointerEvents = 'none';
    verticalLine.style.transform = 'translateX(50%)';
    verticalLine.style.transition = 'opacity 0.3s ease';
    
    // 添加元素到DOM
    cursorContainer.appendChild(horizontalLine);
    cursorContainer.appendChild(verticalLine);
    document.body.appendChild(cursorContainer);
    
    // 鼠标移动事件处理
    const handleMouseMove = (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        // 更新十字线位置
        horizontalLine.style.top = `${y}px`;
        verticalLine.style.left = `${x}px`;
        
        // 检查鼠标是否悬停在目标元素上
        const targetElement = document.elementFromPoint(x, y);
        const isOverTarget = targetElement && (targetElement.classList.contains('explore-target') || targetElement.closest('.explore-target'));
        
        // 根据是否对准目标元素改变十字光标的样式
        if (isOverTarget) {
            // 十字光标变成金色，并且加粗
            horizontalLine.style.background = 'rgba(218, 165, 32, 1)';
            verticalLine.style.background = 'rgba(218, 165, 32, 1)';
            horizontalLine.style.height = '2px';
            verticalLine.style.width = '2px';
            horizontalLine.style.boxShadow = '0 0 8px rgba(218, 165, 32, 0.8)';
            verticalLine.style.boxShadow = '0 0 8px rgba(218, 165, 32, 0.8)';
            
            // 如果鼠标对准的是.explore-target元素，给它添加一个更强的高亮效果
            if (targetElement.classList.contains('explore-target')) {
                targetElement.classList.add('target-locked');
            } else {
                const parentTarget = targetElement.closest('.explore-target');
                if (parentTarget) {
                    parentTarget.classList.add('target-locked');
                }
            }
        } else {
            // 恢复默认样式
            horizontalLine.style.background = 'rgba(255, 255, 255, 0.8)';
            verticalLine.style.background = 'rgba(255, 255, 255, 0.8)';
            horizontalLine.style.height = '1px';
            verticalLine.style.width = '1px';
            horizontalLine.style.boxShadow = 'none';
            verticalLine.style.boxShadow = 'none';
            
            // 只移除锁定效果，保持闪烁动画的一致性
            document.querySelectorAll('.explore-target.target-locked').forEach(el => {
                el.classList.remove('target-locked');
            });
        }
    };
    
    // 添加鼠标移动事件
    document.addEventListener('mousemove', handleMouseMove);
    
    // 保存事件处理器以便后续移除
    document._crosshairMouseMoveHandler = handleMouseMove;
}

// 移除全屏十字光标
function removeFullScreenCrosshair() {
    // 恢复默认光标
    document.body.style.cursor = 'default';
    
    // 移除所有可能存在的全局CSS规则覆盖
    const styleElements = document.querySelectorAll('#exploration-mode-cursor-override');
    styleElements.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    
    // 移除鼠标移动事件监听器
    if (document._crosshairMouseMoveHandler) {
        document.removeEventListener('mousemove', document._crosshairMouseMoveHandler);
        delete document._crosshairMouseMoveHandler;
    }
    
    // 移除所有可能存在的十字光标元素
    const crosshairs = document.querySelectorAll('#fullscreen-crosshair');
    crosshairs.forEach(crosshair => {
        if (crosshair) {
            document.body.removeChild(crosshair);
        }
    });
    
    // 额外保险：直接设置所有元素的cursor为auto，确保默认鼠标可见
    document.querySelectorAll('*').forEach(element => {
        element.style.cursor = 'auto';
    });
}

// 处理目标元素的点击事件
function handleTargetClick(e) {
    if (e.target.classList.contains('explore-target')) {
        const targetText = e.target.getAttribute('data-target');
        showTextInfo(targetText);
        // 点击后退出探索模式
        toggleExplorationMode(false);
        
        // 移除所有目标元素的高亮样式
        // 找到所有带explore-target类的元素
        const allTargets = document.querySelectorAll('.explore-target');
        allTargets.forEach(span => {
            // 保存原始文本内容
            const originalText = span.textContent;
            // 创建文本节点
            const textNode = document.createTextNode(originalText);
            // 用文本节点替换span元素
            span.parentNode.replaceChild(textNode, span);
        });
    }
}

// 查找并标记闪烁文本 - 优化版，保持原始文本结构和顺序
function findAndMarkFlickeringText(targetText) {
    // 获取当前活动页面
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    
    // 直接递归处理DOM节点，避免innerHTML重写
    processTextNodes(activePage, targetText);
    
    function processTextNodes(node, text) {
        // 跳过已经被标记的节点
        if (node.classList && node.classList.contains('explore-target')) {
            return;
        }
        
        // 处理文本节点 - 保持原始文本顺序，避免文本位置改变
        if (node.nodeType === Node.TEXT_NODE) {
            const nodeText = node.textContent;
            if (nodeText.includes(text)) {
                // 记录原始节点在父节点中的位置
                const parent = node.parentNode;
                const originalPosition = Array.from(parent.childNodes).indexOf(node);
                
                // 移除原始文本节点
                parent.removeChild(node);
                
                // 临时存储新创建的节点
                const newNodes = [];
                
                // 查找目标文本在节点文本中的所有位置
                let startIndex = 0;
                while (true) {
                    const index = nodeText.indexOf(text, startIndex);
                    if (index === -1) break;
                    
                    // 添加目标文本前的普通文本
                    if (index > startIndex) {
                        newNodes.push(document.createTextNode(nodeText.substring(startIndex, index)));
                    }
                    
                    // 添加目标文本（带闪烁效果的span元素）
                    const span = document.createElement('span');
                    span.className = 'explore-target blinking';
                    span.setAttribute('data-target', text);
                    span.textContent = text;
                    newNodes.push(span);
                    
                    // 更新起始位置
                    startIndex = index + text.length;
                }
                
                // 添加最后一段普通文本
                if (startIndex < nodeText.length) {
                    newNodes.push(document.createTextNode(nodeText.substring(startIndex)));
                }
                
                // 按照原始位置插入所有新节点
                // 从后往前插入，以保持正确的顺序
                for (let i = newNodes.length - 1; i >= 0; i--) {
                    if (originalPosition < parent.childNodes.length) {
                        parent.insertBefore(newNodes[i], parent.childNodes[originalPosition]);
                    } else {
                        parent.appendChild(newNodes[i]);
                    }
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 递归处理子节点（使用slice创建副本，避免遍历过程中DOM变化导致的问题）
            const children = Array.from(node.childNodes).slice();
            children.forEach(child => processTextNodes(child, text));
        }
    }
}

// 更新显示内容
function updateAnimationDisplay(show) {
    const animationContainer = document.getElementById('animation-container');
    if (!animationContainer) return;
    
    if (show) {
        // 使用生成_紫动画
        const generatingHtml = createGeneratingPurpleAnimation();
        
        // 设置容器内容并显示
        animationContainer.innerHTML = generatingHtml;
        animationContainer.style.display = 'flex';
        animationContainer.style.justifyContent = 'center';
        animationContainer.style.alignItems = 'center';
    } else {
        // 隐藏容器
        animationContainer.style.display = 'none';
        animationContainer.innerHTML = '';
    }
}

// 页面导航函数
function navigateTo(pageId) {
    currentPageId = pageId;
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // 控制左侧边栏的显示状态
        const sidebarTrigger = document.getElementById('left-sidebar-trigger');
        const leftSidebar = document.getElementById('left-sidebar');
        
        // 首页隐藏左侧边栏，其他页面显示
        if (pageId === 'home') {
            if (sidebarTrigger) {
                sidebarTrigger.style.display = 'none';
            }
            if (leftSidebar) {
                leftSidebar.style.display = 'none';
            }
        } else {
            if (sidebarTrigger) {
                sidebarTrigger.style.display = 'block';
            }
            if (leftSidebar) {
                leftSidebar.style.display = 'block';
            }
        }
        
        // 如果是首次访问，动态加载页面内容
        if (pageId === 'professional-experience' && targetPage.innerHTML.trim() === '<!-- 内容将通过JavaScript动态加载 -->') {
            loadProfessionalExperience();
        } else if (pageId === 'skills' && targetPage.innerHTML.trim() === '<!-- 内容将通过JavaScript动态加载 -->') {
            loadSkills();
        } else if (pageId === 'hobbies' && targetPage.innerHTML.trim() === '<!-- 内容将通过JavaScript动态加载 -->') {
            loadHobbies();
        } else if (pageId === 'contact' && targetPage.innerHTML.trim() === '<!-- 内容将通过JavaScript动态加载 -->') {
            loadContact();
        } else if (pageId === 'basic-info') {
            // 初始化基本信息页面的更多信息区域
            initMoreInfoSections();
        }
        
        // 更新导航链接的活动状态
        updateActiveLinks(pageId);
        
        // 如果处于探索模式，为新页面的专有名词添加闪烁效果
        if (isExplorationMode) {
            // 先停止之前的闪烁动画和十字光标，防止重复创建导致bug
            stopBlinking();
            // 使用setTimeout延迟一小段时间，确保页面内容已完全加载
            setTimeout(() => {
                startBlinking();
            }, 100);
        }
        
        // 更新右侧面包屑导航
        setTimeout(() => { updateBreadcrumb(pageId); }, 100);

        // 同步右上角“左侧栏”开关图标到当前侧边栏状态（确保所有页面一致为金/白）
        setTimeout(() => {
            document.querySelectorAll('#dock-toggle').forEach(el => {
                el.checked = document.body.classList.contains('sidebar-active');
            });
        }, 0);

        // 新增：同步 URL 哈希，触发外部监听（如文字雨）
        try { if (window.location.hash !== '#' + pageId) window.location.hash = '#' + pageId; } catch (e) {}
    }
}

// 更新导航链接的活动状态
function updateActiveLinks(pageId) {
    // 更新所有导航链接
    document.querySelectorAll('.footer-link, .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + pageId) {
            link.classList.add('active');
        }
    });
    
    // 不再在离开锁定页面时移除unlocked类，这样已验证过的按钮始终显示开锁图标
    // 验证状态通过localStorage持久化，用户只需验证一次
    
    // 检查sessionStorage中的验证状态，如果已验证则添加unlocked类
    if (sessionStorage.getItem('professional-experience-verified')) {
        document.querySelectorAll('.nav-link.red-bg-section[href="#professional-experience"]').forEach(btn => {
            btn.classList.add('unlocked');
        });
    }
    
    if (sessionStorage.getItem('contact-verified')) {
        document.querySelectorAll('.nav-link.red-bg-section[href="#contact"]').forEach(btn => {
            btn.classList.add('unlocked');
        });
    }
}

// 面包屑导航：创建容器
function ensureBreadcrumbContainer() {
    let panel = document.getElementById('breadcrumb-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'breadcrumb-panel';
        panel.className = 'breadcrumb-nav';
        panel.innerHTML = `
            <div class="breadcrumb-header">页面导航</div>
            <div id="breadcrumb-list"></div>
        `;
        // 初次创建默认隐藏，避免首页闪现右侧导航
        panel.style.display = 'none';
        document.body.appendChild(panel);
    }
    // 确保指示线存在
    const listEl = panel.querySelector('#breadcrumb-list');
    if (listEl && !panel.querySelector('#breadcrumb-indicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'breadcrumb-indicator';
        listEl.appendChild(indicator);
    }
    return panel;
}

// 清理上一次的滚动观察器
function teardownBreadcrumbObserver() {
    if (breadcrumbObserver) {
        breadcrumbObserver.disconnect();
        breadcrumbObserver = null;
    }
}

// 面包屑导航：根据页面生成导航项
function updateBreadcrumb(pageId) {
    const panel = ensureBreadcrumbContainer();
    const list = panel.querySelector('#breadcrumb-list');
    if (!list) return;

    // 仅当目标页面为当前激活页时才显示右侧导航，防止首页初次加载误显
    const activePageId = document.querySelector('.page.active')?.id;
    if (!activePageId || activePageId !== pageId) {
        panel.style.display = 'none';
        teardownBreadcrumbObserver();
        return;
    }

    const items = [];

    const pushItem = (text, targetEl) => {
        if (!text || !targetEl) return;
        if (!targetEl.id) {
            targetEl.id = `crumb-${pageId}-${items.length + 1}`;
        }
        items.push({ text, targetEl });
    };

    // 各页面的标题采集规则
    if (pageId === 'basic-info') {
        const about = document.getElementById('aboutme-title');
        const spec = document.getElementById('speciality-title');
        const pref = document.getElementById('preference-title');
        const rec = document.getElementById('recommendation-title');
        pushItem(about?.textContent?.trim() || 'ABOUTME', about);
        pushItem(spec?.textContent?.trim() || 'MYSPECIALITY', spec);
        pushItem(pref?.textContent?.trim() || 'MYPREFERENCE', pref);
        pushItem(rec?.textContent?.trim() || 'MYRECOMMENDATION', rec);
    } else if (pageId === 'professional-experience') {
        document.querySelectorAll('#professional-experience .section-nav-btn').forEach(btn => {
            const text = btn.textContent.trim();
            const onclick = btn.getAttribute('onclick') || '';
            if (text === '全部' || onclick.includes("('all')")) return; // 跳过“全部”
            pushItem(text, btn);
        });
    } else if (pageId === 'skills') {
        document.querySelectorAll('#skills .section-nav-btn').forEach(btn => {
            const text = btn.textContent.trim();
            const onclick = btn.getAttribute('onclick') || '';
            if (text === '全部' || onclick.includes("('all')")) return; // 跳过“全部”
            pushItem(text, btn);
        });
    } else if (pageId === 'hobbies') {
        document.querySelectorAll('#hobbies .section-nav-btn').forEach(btn => {
            const text = btn.textContent.trim();
            const onclick = btn.getAttribute('onclick') || '';
            if (text === '全部' || onclick.includes("('all')")) return; // 跳过“全部”
            pushItem(text, btn);
        });
    } else if (pageId === 'contact') {
        document.querySelectorAll('#contact .notititle').forEach(h => {
            pushItem(h.textContent.trim(), h);
        });
    }

    // 渲染
    list.innerHTML = '';
    // 确保指示线容器存在（清空后需要重新添加）
    if (!panel.querySelector('#breadcrumb-indicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'breadcrumb-indicator';
        list.appendChild(indicator);
    }
    if (items.length === 0) {
        panel.style.display = 'none';
        teardownBreadcrumbObserver();
        return;
    }
    panel.style.display = 'block';

    const anchors = [];

    items.forEach(({ text, targetEl }, index) => {
        // 仅文字可点击：使用容器 + 文字span
        const item = document.createElement('div');
        item.className = 'breadcrumb-item';
        if (targetEl.classList.contains('active')) {
            item.classList.add('active');
        }
        const textEl = document.createElement('span');
        textEl.className = 'breadcrumb-text';
        textEl.textContent = text;
        item.appendChild(textEl);

        textEl.addEventListener('click', (e) => {
            e.preventDefault();
            // 切换当前所属高亮
            list.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            // 在“全部”页面点击右侧导航：不切换分类，仅在当前“全部”内容中滚动到该分类的第一个模块；其他页面仍按原逻辑
            if (targetEl.classList.contains('section-nav-btn')) {
                if (pageId === 'professional-experience' || pageId === 'skills' || pageId === 'hobbies') {
                    const onclick = targetEl.getAttribute('onclick') || '';
                    const match = onclick.match(/\('([^']+)'\)/);
                    const category = match ? match[1] : '';

                    setTimeout(() => {
                        let containerSelector = '';
                        let moduleSelector = '';
                        if (pageId === 'professional-experience') {
                            containerSelector = '#professional-experience-content';
                            moduleSelector = `${containerSelector} .experience-module[data-category="${category}"], ${containerSelector} .skill-module[data-category="${category}"]`;
                        } else if (pageId === 'skills') {
                            containerSelector = '#skills-content';
                            moduleSelector = `${containerSelector} .skill-module[data-category="${category}"]`;
                        } else if (pageId === 'hobbies') {
                            containerSelector = '#hobbies-content';
                            moduleSelector = `${containerSelector} .experience-module[data-category="${category}"]`;
                        }
                        const firstModule = moduleSelector ? document.querySelector(moduleSelector) : null;
                        if (firstModule) {
                            firstModule.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else if (containerSelector) {
                            const container = document.querySelector(containerSelector);
                            container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 50);
                } else {
                    targetEl.click();
                }
            } else {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        list.appendChild(item);
        anchors.push({ a: item, targetEl });
    });

    // 计算每个面包屑项对应的“内容模块”的文档纵向位置
    const computeContentTops = () => {
        const getFirstModuleTop = (cat) => {
            let containerSelector = '';
            let moduleSelector = '';
            if (pageId === 'professional-experience') {
                containerSelector = '#professional-experience-content';
                moduleSelector = `${containerSelector} .experience-module[data-category="${cat}"], ${containerSelector} .skill-module[data-category="${cat}"]`;
            } else if (pageId === 'skills') {
                containerSelector = '#skills-content';
                moduleSelector = `${containerSelector} .skill-module[data-category="${cat}"]`;
            } else if (pageId === 'hobbies') {
                containerSelector = '#hobbies-content';
                moduleSelector = `${containerSelector} .experience-module[data-category="${cat}"]`;
            }
            if (!moduleSelector) return null;
            const firstVisible = Array.from(document.querySelectorAll(moduleSelector))
                .find(el => el.offsetParent !== null);
            if (firstVisible) {
                const r = firstVisible.getBoundingClientRect();
                return r.top + window.scrollY;
            }
            const container = containerSelector ? document.querySelector(containerSelector) : null;
            if (container) {
                const r2 = container.getBoundingClientRect();
                return r2.top + window.scrollY;
            }
            return null;
        };
        return anchors.map(({ targetEl }) => {
            // 分类页面：按分类的第一个可见模块来取位置
            if (targetEl.classList.contains('section-nav-btn') &&
                (pageId === 'professional-experience' || pageId === 'skills' || pageId === 'hobbies')) {
                const onclick = targetEl.getAttribute('onclick') || '';
                const m = onclick.match(/\('([^']+)'\)/);
                const cat = m ? m[1] : '';
                const mt = cat ? getFirstModuleTop(cat) : null;
                if (mt != null) return mt;
            }
            // 其他页面或兜底：使用目标元素自身位置
            const rect = targetEl.getBoundingClientRect();
            return rect.top + window.scrollY;
        });
    };

    // 根据页面内容距离，动态计算右侧导航各项之间的间距（等比缩小映射）
    const applyBreadcrumbSpacing = () => {
        const itemsEls = Array.from(list.querySelectorAll('.breadcrumb-item'));
        if (itemsEls.length < 2) return;
        const tops = computeContentTops();
        const deltas = tops.slice(1).map((t, i) => Math.max(0, t - tops[i]));
        const totalDelta = deltas.reduce((a, b) => a + b, 0);
        // 可用空间估计：以右侧面板高度为基准，减去项目自身高度
        const panelEl = document.getElementById('breadcrumb-panel');
        const panelHeight = panelEl ? panelEl.clientHeight : window.innerHeight;
        const itemHeights = itemsEls.map(el => el.getBoundingClientRect().height);
        const sumItemHeights = itemHeights.reduce((a, b) => a + b, 0);
        const available = Math.max(0, panelHeight - sumItemHeights - 16);
        const scale = totalDelta > 0 ? Math.max(0.02, Math.min(0.24, available / totalDelta)) : 0.08;
        itemsEls.forEach((el, idx) => {
            const mb = idx < deltas.length ? Math.max(4, Math.round(deltas[idx] * scale)) : 0;
            el.style.marginBottom = mb + 'px';
        });
    };

    // 动态指示线：根据滚动在右侧导航中上下移动，同时同步高亮项
    const updateBreadcrumbIndicator = () => {
        const indicator = document.getElementById('breadcrumb-indicator');
        if (!indicator) return;
        const itemsEls = Array.from(list.querySelectorAll('.breadcrumb-item'));
        if (itemsEls.length === 0) return;
        const tops = computeContentTops();
        // 右侧中每一项顶部横线的垂直位置（相对#breadcrumb-list）
        const linePositions = itemsEls.map(el => el.offsetTop);
        const y = window.scrollY + 1; // 当前滚动位置（文档坐标）
        // 查找当前落在哪两个模块之间
        let i = 0;
        while (i + 1 < tops.length && y >= tops[i + 1]) i++;
        if (i >= tops.length - 1) {
            indicator.style.top = Math.round(linePositions[linePositions.length - 1]) + 'px';
            // 底部：高亮最后一项（如 MYRECOMMENDATION）
            list.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
            itemsEls[itemsEls.length - 1].classList.add('active');
            return;
        }
        if (y <= tops[0]) {
            indicator.style.top = Math.round(linePositions[0]) + 'px';
            // 顶部：高亮第一项（ABOUTME）
            list.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
            itemsEls[0].classList.add('active');
            return;
        }
        const startY = tops[i];
        const endY = tops[i + 1];
        const t = Math.max(0, Math.min(1, (y - startY) / Math.max(1, endY - startY)));
        const pos = linePositions[i] + (linePositions[i + 1] - linePositions[i]) * t;
        indicator.style.top = Math.round(pos) + 'px';
        // 中间：高亮当前区间起点项
        list.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
        itemsEls[i].classList.add('active');
    };

    // 初始化与监听
    applyBreadcrumbSpacing();
    setTimeout(applyBreadcrumbSpacing, 200);
    setTimeout(applyBreadcrumbSpacing, 800);
    window.addEventListener('resize', () => { applyBreadcrumbSpacing(); updateBreadcrumbIndicator(); });
    window.addEventListener('scroll', updateBreadcrumbIndicator, { passive: true });
    setTimeout(updateBreadcrumbIndicator, 0);
    setTimeout(updateBreadcrumbIndicator, 400);

    // 若没有任何项被标记active，则默认第一个
    if (!list.querySelector('.breadcrumb-item.active')) {
        const first = list.querySelector('.breadcrumb-item');
        if (first) first.classList.add('active');
    }

    // 监听滚动：按“视口占比最大”的规则高亮对应项
    teardownBreadcrumbObserver();

    // 工具：移除旧的滚动/缩放监听，避免重复绑定
    const removeViewportShareListeners = () => {
        if (panel._breadcrumbScrollHandler) {
            window.removeEventListener('scroll', panel._breadcrumbScrollHandler);
            panel._breadcrumbScrollHandler = null;
        }
        if (panel._breadcrumbResizeHandler) {
            window.removeEventListener('resize', panel._breadcrumbResizeHandler);
            panel._breadcrumbResizeHandler = null;
        }
    };

    if (pageId === 'basic-info') {
        removeViewportShareListeners();
        // 将标题映射到对应的“主要内容容器”集合，用于计算视口可见占比
        const titleIdToContainers = {
            'aboutme-title': [document.querySelector('.basic-info-container')],
            'speciality-title': [document.querySelector('.speciality-container')],
            'preference-title': [document.querySelector('.more-info-container')],
            // 新增：MYRECOMMENDATION 映射到其标题与内容栅格，确保当推荐内容占据视口主要区域时被高亮
            'recommendation-title': [
                document.getElementById('recommendation-title'),
                document.querySelector('.recommendation-grid')
            ]
        };
        const contentGroups = anchors.map(({ targetEl }) => {
            const id = targetEl.id;
            const containers = titleIdToContainers[id];
            if (Array.isArray(containers)) {
                return containers.filter(Boolean);
            }
            return containers ? [containers] : [targetEl];
        });
        const computeAndHighlight = () => {
            const vh = window.innerHeight;
            let bestIdx = -1;
            let bestValue = -1;
            contentGroups.forEach((group, idx) => {
                const sum = group.reduce((acc, el) => {
                    if (!el) return acc;
                    const r = el.getBoundingClientRect();
                    const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
                    return acc + visible;
                }, 0);
                if (sum > bestValue) { bestValue = sum; bestIdx = idx; }
            });
            if (bestIdx >= 0 && anchors[bestIdx]) {
                list.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
                anchors[bestIdx].a.classList.add('active');
            }
        };
        panel._breadcrumbScrollHandler = () => { computeAndHighlight(); };
        panel._breadcrumbResizeHandler = () => { computeAndHighlight(); applyBreadcrumbSpacing(); updateBreadcrumbIndicator(); };
        window.addEventListener('scroll', panel._breadcrumbScrollHandler, { passive: true });
        window.addEventListener('resize', panel._breadcrumbResizeHandler);
        // 首次计算
        computeAndHighlight();

    } else if (pageId === 'professional-experience' || pageId === 'skills' || pageId === 'hobbies') {
        // 根据按钮构建“类别 -> 面包屑锚点”的映射，跳过“全部”
        const categoryAnchorMap = new Map();
        anchors.forEach(({ a, targetEl }) => {
            if (!targetEl.classList.contains('section-nav-btn')) return;
            const onclick = targetEl.getAttribute('onclick') || '';
            const match = onclick.match(/\('([^']+)'\)/);
            const category = match ? match[1] : '';
            if (category && category !== 'all') {
                categoryAnchorMap.set(category, a);
            }
        });

        // 构建分类 -> 模块元素组 的映射
        const buildCategoryGroups = () => {
            const groups = new Map();
            let modulesSelector = '';
            let containerSelector = '';
            if (pageId === 'professional-experience') {
                containerSelector = '#professional-experience-content';
                modulesSelector = `${containerSelector} .experience-module, ${containerSelector} .skill-module`;
            } else if (pageId === 'skills') {
                containerSelector = '#skills-content';
                modulesSelector = `${containerSelector} .skill-module`;
            } else if (pageId === 'hobbies') {
                containerSelector = '#hobbies-content';
                modulesSelector = `${containerSelector} .experience-module`;
            }
            const modules = Array.from(document.querySelectorAll(modulesSelector))
                .filter(el => el.offsetParent !== null);
            modules.forEach(m => {
                const cat = m.dataset.category || '';
                if (!cat || !categoryAnchorMap.has(cat)) return;
                if (!groups.has(cat)) groups.set(cat, []);
                groups.get(cat).push(m);
            });
            return groups;
        };

        // 同步小按钮栏激活态到右侧，仅当“全部”激活时显示右侧导航
        const syncActive = () => {
            const activeBtn = document.querySelector(`#${pageId} .section-nav-btn.active`);
            if (!activeBtn) { panel.style.display = 'none'; removeViewportShareListeners(); return; }
            const onclick = activeBtn.getAttribute('onclick') || '';
            const match = onclick.match(/\('([^']+)'\)/);
            const activeCategory = match ? match[1] : '';

            if (activeCategory !== 'all') {
                panel.style.display = 'none';
                removeViewportShareListeners();
                return;
            }

            panel.style.display = 'block';
            // 仅在“全部”页面按“视口占比最大”规则高亮
            removeViewportShareListeners();
            const groupsMap = buildCategoryGroups();
            const computeAndHighlight = () => {
                const vh = window.innerHeight;
                let bestCat = null;
                let bestVal = -1;
                groupsMap.forEach((els, cat) => {
                    const sum = els.reduce((acc, el) => {
                        const r = el.getBoundingClientRect();
                        const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
                        return acc + visible;
                    }, 0);
                    if (sum > bestVal) { bestVal = sum; bestCat = cat; }
                });
                if (bestCat) {
                    const anchor = categoryAnchorMap.get(bestCat);
                    if (anchor) {
                        list.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
                        anchor.classList.add('active');
                    }
                }
            };
            panel._breadcrumbScrollHandler = () => { computeAndHighlight(); };
            panel._breadcrumbResizeHandler = () => { computeAndHighlight(); applyBreadcrumbSpacing(); updateBreadcrumbIndicator(); };
            window.addEventListener('scroll', panel._breadcrumbScrollHandler, { passive: true });
            window.addEventListener('resize', panel._breadcrumbResizeHandler);
            // 初次计算
            computeAndHighlight();

            // 同步更新指示线、间距
            applyBreadcrumbSpacing();
            setTimeout(applyBreadcrumbSpacing, 100);
            const indicator = document.getElementById('breadcrumb-indicator');
            if (indicator) {
                const evt = new Event('scroll');
                window.dispatchEvent(evt);
            }
        };

        // 初次同步
        syncActive();
        // 监听按钮点击变化（事件委托）
        document.querySelectorAll(`#${pageId} .section-nav-btn`).forEach(btn => {
            btn.addEventListener('click', syncActive, { once: false });
        });
    }
}

// 显示密码弹窗
function showPasswordModal(message, type) {
    const modal = document.getElementById('password-modal');
    const modalMessage = document.getElementById('modal-message');
    
    // 设置弹窗消息
    modalMessage.innerHTML = message;
    
    // 存储当前访问类型
    modal.setAttribute('data-type', type);
    
    // 显示弹窗
    modal.classList.add('active');
    
    // 清空输入框并聚焦
    const passwordInput = document.getElementById('password-input');
    passwordInput.value = '';
    passwordInput.focus();
}

// 隐藏密码弹窗
function hidePasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.classList.remove('active');
}

// 检查密码
function checkPassword() {
    const passwordInput = document.getElementById('password-input');
    const password = passwordInput.value.trim().toLowerCase().replace(/\s+/g, '');
    const modal = document.getElementById('password-modal');
    const type = modal.getAttribute('data-type');
    
    if (type === 'professional') {
        // 专业履历页面密码：Howard 或 Xiong Wenhao
        if (password === 'howard' || password === 'xiongwenhao') {
                modal.classList.remove('active');
                navigateTo('professional-experience');
                
                // 添加已解锁状态到专业履历按钮
                document.querySelectorAll('.nav-link.red-bg-section[href="#professional-experience"]').forEach(btn => {
                    btn.classList.add('unlocked');
                });
                
                // 保存验证状态到sessionStorage，仅在当前会话有效
                sessionStorage.setItem('professional-experience-verified', 'true');
        } else {
            alert('密码错误，请重试！');
        }
    } else if (type === 'contact') {
        // 联系页面密码：Howard、Xiong Wenhao、ydg、ydgsbddygjx、InspireX、Table Tennis、TT
        if (
            password === 'howard' ||
            password === 'xiongwenhao' ||
            password === 'ydg' ||
            password === 'ydgsbddygjx' ||
            password === 'inspirex' ||
            password === 'tabletennis' ||
            password === 'tt'
        ) {
                modal.classList.remove('active');
                navigateTo('contact');
                
                // 添加已解锁状态到联系按钮
                document.querySelectorAll('.nav-link.red-bg-section[href="#contact"]').forEach(btn => {
                    btn.classList.add('unlocked');
                });
                
                // 保存验证状态到sessionStorage，仅在当前会话有效
                sessionStorage.setItem('contact-verified', 'true');
        } else {
            alert('密码错误，请重试！');
        }
    }
}

// 已移除：密码触发的特殊图片动画

// 初始化更多信息区域的所有板块
function initMoreInfoSections() {
    // 按照用户要求的顺序排列：运动、游戏、工作、软件、动物、品牌、美食、饮料、歌曲、电影、动漫、小说、景点、明星、颜色、数值
    
    // 喜欢的运动
    createMoreInfoSection('sport-section', ['乒乓球', '台球', '羽毛球', '滑雪']);
    
    // 喜欢的游戏
    createMoreInfoSection('game-section', ['我的世界', '皇室战争', '黑神话·悟空', '愤怒的小鸟', '植物大战僵尸', 'BAD PIGGIES', '海岛奇兵', '部落冲突']);
    
    // 喜欢的工作
    createMoreInfoSection('work-section', ['人工智能', '软件设计', '艺术创作', '摄影', '后期', '科研']);
    
    // 喜欢的软件
    createMoreInfoSection('software-section', ['Midjourney', 'Procreate', '剪映']);
    
    // 喜欢的动物
    createMoreInfoSection('pet-section', ['小型热带鱼', '小型观赏虾', '猫', '神兽']);
    
    // 喜欢的植物
    createMoreInfoSection('plant-section', ['水草', '多肉']);
    
    // 喜欢的品牌
    createMoreInfoSection('brand-section', ['大疆', '苹果', '罗技']);
    
    // 喜欢的美食
    createMoreInfoSection('food-section', ['寿司', '韩国烧烤', '巴西烧烤', '冰淇淋', '意大利面', '蛋炒饭', '甜甜圈']);
    
    // 喜欢的饮料
    createMoreInfoSection('drink-section', ['果汁', '牛奶', '椰奶']);
    
    // 喜欢的歌曲
    createMoreInfoSection('music-section', ['精卫(DJ降调版)', '壁上观', '此去半生', 'Once Upon A Time']);
    
    // 喜欢的电影
    createMoreInfoSection('movie-section', ['星球大战', '星际迷航', '指环王', '24小时', '环太平洋']);
    
    // 喜欢的动漫
    createMoreInfoSection('anime-section', ['宫崎骏系列']);
    
    // 喜欢的小说
    createMoreInfoSection('novel-section', ['三体', '西游记']);
    
    // 喜欢的景点
    createMoreInfoSection('scenery-section', ['中国', '美国', '日本', '泰国']);
    
    // 喜欢的明星
    createMoreInfoSection('star-section', ['马龙', '许昕', '张继科']);
    
    // 喜欢的颜色
    createMoreInfoSection('color-section', ['蓝色', '黑色', '白色', '金色', '红色', '紫色']);
    
    // 喜欢的数值
    createMoreInfoSection('number-section', ['XXXX', '1701', '20230211', '6', '8']);
}

// 自定义描述映射对象 - 用户可以在这里为每个项目添加自定义描述
const customDescriptions = {
    // 喜欢的运动——原因or解释
    '乒乓球': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>开球网(上海)最高积分<span style="color:#B8312F;font-weight:bold">1400</span>，当前积分<span style="color:#B8312F;font-weight:bold">1378</span>（记录于2024-08-31），预估目前水平<span style="color:#B8312F;font-weight:bold">1450</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【技能】</span><span style="color:#B8312F;font-weight:bold">正手拉球</span>见长<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【球拍】</span><br>派里奥KC2 + 729-5 + 729-5 -><br>派里奥KC2 + 729-08ES + Yasaka Original Extra B-21 -><br>黄河桧木五夹 + 金力度紫海绵 + 挺拔K2 -><br>狂飙龙5X + 明星40/41度蓝国 + 明星37度柔/T05 -><br>达克塞纳吉 + D09C + T05 -><br><span style="color:#B8312F;font-weight:bold">数字968</span> + 明星39度蓝国+T80 -><br>超级VIS + D09C + T80 -><br><span style="color:#B8312F;font-weight:bold">张本salc</span> + 尼塔库橙色狂飙Pro3 + T19<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>从高中体育专项课开始接触，高二高三迷上，几乎在校天天打，水平属于<span style="color:#B8312F;font-weight:bold">一流</span>（由于我的高中有乒乓球特色，所以这里的一流含金量高）。之后到大学因为与高中球友分开，打球频率极度下滑。</span>',
    '台球': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>在“非痴迷”同学中算<span style="color:#B8312F;font-weight:bold">中上游</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>初中选修课选择台球，持续学习一年，在其中水平属于<span style="color:#B8312F;font-weight:bold">一流</span>。</span>',
    '羽毛球': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>在“非痴迷”同学中算<span style="color:#B8312F;font-weight:bold">中上游</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>小学学习过几年，在4个小学同班同学学员中排第3。原因是第一男生徐同学属于天赋异禀没法比，左手都能吊打所有人(他高中也是我同学)；第二是女生沈同学，也很猛，在高中之前我所遇到的所有同龄人中估计可以排第二-第四。因此在小学、中学，我的羽毛球水平在同学中可以排进<span style="color:#B8312F;font-weight:bold">一流顶级</span>。不过到高中由于学业繁忙没时间联系也没有好场地，导致技能退化。</span>',
    '滑雪': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>初中时可以滑长白山<span style="color:#B8312F;font-weight:bold">“超级”滑道</span>；目前水平有所退化。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【技能】</span><span style="color:#B8312F;font-weight:bold">双板</span>、<span style="color:#B8312F;font-weight:bold">单板</span>都会；先学的双板，且使用双板时间更长。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>小学时在美国猛犸象山与同小区朋友小马初次接触滑雪，几天滑雪没有摔过。之后初中在长白山与当时最好朋友小学周同学一起学过，并可以滑<span style="color:#B8312F;font-weight:bold">“超级”滑道</span>(>30度)。之后因学业繁忙，就滑过几次，能力有所退步。</span>',

    // 喜欢的游戏——原因or解释
    '我的世界': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">神作</span>；<span style="color:#B8312F;font-weight:bold">创造性</span>、自主性。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>主要玩<span style="color:#B8312F;font-weight:bold">单人创造</span>><span style="color:#B8312F;font-weight:bold">单人生存</span>，但是非常希望可以多人生存、跑酷、PVP、创造。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【理念】</span><span style="color:#B8312F;font-weight:bold">游戏理念</span>是致力于创建理想的异世界生活区、尽可能不破坏环境、尽可能少利用游戏漏洞或生物刷新特性；<span style="color:#B8312F;font-weight:bold">建筑理念</span>是追寻符合游戏与现实世界的基本设定，以功能、实用为主，美观为辅；<span style="color:#B8312F;font-weight:bold">红石理念</span>是实用、隐藏。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>国际版Minecraft(账号丢失)游戏时长<span style="color:#B8312F;font-weight:bold">2000+</span>，主要种子数<span style="color:#B8312F;font-weight:bold">3+</span>；网易我的世界(账号丢失)游戏时长<span style="color:#B8312F;font-weight:bold">5000+</span>，主要种子数<span style="color:#B8312F;font-weight:bold">2+</span>；网易我的世界(目前在玩)游戏时长<span style="color:#B8312F;font-weight:bold">1000+</span>，主要种子数<span style="color:#B8312F;font-weight:bold">1</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>初中时，在与当时最好朋友小学周同学去美国的飞机上，看到他玩国际版Minecraft，感觉好玩，因而下载游玩。之后一直偶尔拿出来玩，与小学同学聚会时也会一起玩。可惜的是之后国际版Minecraft和再往后的网易我的世界账号都丢了，现在我玩的是网易我的世界。</span>',
    '皇室战争': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好玩爱玩</span>，小时候大家都玩；最火手游。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">中上游</span>；目前不熟悉，因为更新太频繁。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>最高奖杯数<span style="color:#B8312F;font-weight:bold">8530</span>；目前奖杯数<span style="color:#B8312F;font-weight:bold">8530</span>；<span style="color:#B8312F;font-weight:bold">9年</span>皇室玩家纪念；胜场<span style="color:#B8312F;font-weight:bold">1924</span>；三皇冠胜利次数<span style="color:#B8312F;font-weight:bold">1258</span>；挑战模式最多胜场<span style="color:#B8312F;font-weight:bold">10</span></span>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】天梯最高连胜胜场<span style="color:#B8312F;font-weight:bold">11</span>。<br>',
    '黑神话·悟空': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">《西游记》</span>主题、<span style="color:#B8312F;font-weight:bold">3A</span>、中国3A面向世界首作。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">新手</span>；在不经常玩魂类游戏的同学中水平<span style="color:#B8312F;font-weight:bold">中上游</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>steam<span style="color:#B8312F;font-weight:bold">全成就</span>；<span style="color:#B8312F;font-weight:bold">三周目</span>完成；游戏时间<span style="color:#B8312F;font-weight:bold">200h+</span></span>',
    '愤怒的小鸟': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">经典永不过时</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>正常水平。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>各种版本的愤怒的小鸟通关，比如最初版本，还有之后购买的<span style="color:#B8312F;font-weight:bold">《星球大战》</span>主题版本2个。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>幼儿园、小学玩。</span>',
    '植物大战僵尸': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">经典永不过时</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>正常水平。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>冒险模式通关；生存模式最高难度通关。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>幼儿园、小学玩；大学还喜欢看《植物大战僵尸-杂交版》。</span>',
    'BAD PIGGIES': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">自主性</span>、创造性；好玩、爱玩。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>玩的就是<span style="color:#B8312F;font-weight:bold">自主性</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>小学开始玩的？</span>',
    '海岛奇兵': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>好玩爱玩，小时候<span style="color:#B8312F;font-weight:bold">大家都玩</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">中上游</span>(旧版)。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>小学（主要）、初中爱玩，之后因为打不过别人、基地天天被平推，就渐渐少玩了。</span>',
    '部落冲突': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>好玩爱玩，小时候<span style="color:#B8312F;font-weight:bold">大家都玩</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">中上游</span>(旧版)。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>小学（主要）、初中爱玩，之后因为打不过别人、基地天天被平推，就渐渐少玩了。</span>',

    // 喜欢的工作——原因or解释
    '人工智能': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>感兴趣。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">计算机中有趣</span>的部分。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>学习、实践过<span style="color:#B8312F;font-weight:bold">机器视觉</span>算法；训练过音色模型，完成<span style="color:#B8312F;font-weight:bold">语音合成</span>、<span style="color:#B8312F;font-weight:bold">歌声合成</span>；制作过<span style="color:#B8312F;font-weight:bold">智能体</span>。</span>',
    '软件设计': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>有想法。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">设计</span>、又有关<span style="color:#B8312F;font-weight:bold">计算机</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>独立制作过超过5个网页<span style="color:#B8312F;font-weight:bold">前端</span>设计，2个<span style="color:#B8312F;font-weight:bold">前后端兼备</span>网页项目。</span>',
    '艺术创作': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>无基础，自己玩。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">创作</span>、<span style="color:#B8312F;font-weight:bold">想象</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>使用<span style="color:#B8312F;font-weight:bold">绘画工具</span>、<span style="color:#B8312F;font-weight:bold">P图工具</span>、<span style="color:#B8312F;font-weight:bold">剪辑工具</span>创作许多作品。</span>',
    '摄影': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">优秀</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>喜欢<span style="color:#B8312F;font-weight:bold">记录</span>、喜欢<span style="color:#B8312F;font-weight:bold">美丽</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【设备】</span><br>黑卡 -> <span style="color:#B8312F;font-weight:bold">SONY 2a7</span>；<br>御air -> 御3pro -> <span style="color:#B8312F;font-weight:bold">御4pro</span>；<br><span style="color:#B8312F;font-weight:bold">Insta360</span><br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>从小到大出去<span style="color:#B8312F;font-weight:bold">旅游</span>都带相机拍照；初中是班级、乃至年级的<span style="color:#B8312F;font-weight:bold">摄影担当</span>，选修<span style="color:#B8312F;font-weight:bold">《光·影》</span>摄影课程；大学加入信宣摄影部、乒乓球协会摄影部。</span>',
    '后期': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">优秀</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>喜欢<span style="color:#B8312F;font-weight:bold">表达</span>（尤其是视频中的特效、运镜、表现力、张力等）、喜欢<span style="color:#B8312F;font-weight:bold">创作</span>、喜欢<span style="color:#B8312F;font-weight:bold">短视频</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>初中是班级、乃至年级的<span style="color:#B8312F;font-weight:bold">后期担当</span>；初中时还会做视频发朋友圈；旅游后会习惯做至少一个短视频；大学加入信宣摄影部、乒乓球协会摄影部。</span>',
    '科研': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>水平内容。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>喜欢<span style="color:#B8312F;font-weight:bold">发明创造创新研究</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>从小向往<span style="color:#B8312F;font-weight:bold">发明创造</span>；小学初中学习<span style="color:#B8312F;font-weight:bold">乐高机器人EV3</span>；高中尽可能多的选择、做课题，最后完成了<span style="color:#B8312F;font-weight:bold">生物课题</span>《红雨伞水草在不同条件下的发色情况》和<span style="color:#B8312F;font-weight:bold">工程课题</span>《开关门检测器》。</span>',

    // 喜欢的软件——原因or解释
    'Midjourney': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">不错</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>即时AI制图<span style="color:#B8312F;font-weight:bold">3000+</span>；Uni Dream制图<span style="color:#B8312F;font-weight:bold">1500+</span>；Midjourney制图<span style="color:#B8312F;font-weight:bold">20000+</span>；Stable Diffusion制图<span style="color:#B8312F;font-weight:bold">2000+</span>；。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【作品】</span>小红书发布作品，1月内获得近<span style="color:#B8312F;font-weight:bold">500</span>粉丝，作品最多点赞量超过<span style="color:#B8312F;font-weight:bold">700</span>；哲风壁纸发布作品，获览<span style="color:#B8312F;font-weight:bold">7.5万</span>，获截<span style="color:#B8312F;font-weight:bold">621</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span><span style="color:#B8312F;font-weight:bold">大学开始</span>接触AI绘画，顺序为：<span style="color:#B8312F;font-weight:bold">即时AI</span> -> <span style="color:#B8312F;font-weight:bold">Uni Dream</span> -> <span style="color:#B8312F;font-weight:bold">Midjourney中文版</span> + <span style="color:#B8312F;font-weight:bold">Stable Diffusion</span>。<br>',
    'Procreate': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span>不那么擅长绘画，但是对于能够画出的内容，水平<span style="color:#B8312F;font-weight:bold">尚可</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>画图<span style="color:#B8312F;font-weight:bold">3</span>张；修图<span style="color:#B8312F;font-weight:bold">40+</span>张；制作海报<span style="color:#B8312F;font-weight:bold">1</span>张；制作头像<span style="color:#B8312F;font-weight:bold">3+</span>张；制作图标<span style="color:#B8312F;font-weight:bold">60+</span>张；制作卡片<span style="color:#B8312F;font-weight:bold">80+</span>张。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【作品】</span><span style="color:#B8312F;font-weight:bold">高中毕业暑假</span>接触（从小喜欢<span style="color:#B8312F;font-weight:bold">想象</span>，进而想绘画）。</span>',
    '剪映': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【水平】</span><span style="color:#B8312F;font-weight:bold">一流</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span>抖音作品最高点赞数<span style="color:#B8312F;font-weight:bold">200+</span>、转发数<span style="color:#B8312F;font-weight:bold">200+</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【作品】</span>个人用作品<span style="color:#B8312F;font-weight:bold">10+</span>；班级用作品<span style="color:#B8312F;font-weight:bold">3+</span>；学生会用作品<span style="color:#B8312F;font-weight:bold">5+</span>。</span>',

    // 喜欢的动物——原因or解释
    '小型热带鱼': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>喜欢养鱼；而且小型热带鱼既符合<span style="color:#B8312F;font-weight:bold">经济</span>（>中大型鱼/海鱼）、又符合<span style="color:#B8312F;font-weight:bold">好看</span>（>冷水鱼）、又好养。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>喜欢的小型热带鱼有：<span style="color:#B8312F;font-weight:bold">灯科鱼</span>（如红蚂蚁鱼、巴西宝莲灯……）、<span style="color:#B8312F;font-weight:bold">孔雀鱼</span>（如大耳蕾丝、巴西红、鸿运当头……）、<span style="color:#B8312F;font-weight:bold">巧克力娃娃</span>……</span>',
    '小型观赏虾': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>喜欢养虾；尤其是虾在水里游动、进食时很<span style="color:#B8312F;font-weight:bold">养眼</span>，又有一种<span style="color:#B8312F;font-weight:bold">飞行感</span>（由于鱼游得更快，所以要有飞行感所需鱼缸很大，而且虾的“细节”多些）（但小贵，尤其是量大时）。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>喜欢的小型观赏虾有：<span style="color:#B8312F;font-weight:bold">水晶虾</span>（如纯血红水晶、酒红水晶、黑金刚、红花虎、黑银河、红姘头……）、<span style="color:#B8312F;font-weight:bold">琉璃虾</span>、<span style="color:#B8312F;font-weight:bold">枪鼻虾</span>、<span style="color:#B8312F;font-weight:bold">虎纹虾</span>……</span>',
    '猫': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">哈基米</span>、<span style="color:#B8312F;font-weight:bold">rua</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>喜欢的猫：奶牛、英短、狸花、三花、橘猫……（熊猫）<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>最开始，在高中时，领养小区野猫在花园里，一共6只：蹦蹦、跳跳、海盗…；在其中重点养了一只<span style="color:#B8312F;font-weight:bold">蹦蹦</span>（放到家中养），但是长大就叫着要出去，一开始不让，后来逐渐几天放一次，然后一天一次，之后逐渐很少回来，最后就没再回来了。之后，从我爸同事那里送来了<span style="color:#B8312F;font-weight:bold">妹妹</span>（眉短）、<span style="color:#B8312F;font-weight:bold">蛋蛋</span>（奶牛），第一胎生了旺仔；第二胎生了七只：金毛（后改名小宝）、林妹妹、闪电、黑豆、八嘎、，最终第一胎<span style="color:#B8312F;font-weight:bold">旺仔</span>留了下来，第二胎<span style="color:#B8312F;font-weight:bold">小宝</span>留了下来，其他的都送给我的同学、补课老师、我爸同事了。</span>',
    '神兽': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>不可辩驳。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>青龙白虎朱雀玄武麒麟……</span>',

    // 喜欢的植物——原因or解释
    '水草': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>喜欢<span style="color:#B8312F;font-weight:bold">水草缸</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>喜欢的水草有：<span style="color:#B8312F;font-weight:bold">黑木蕨</span>、<span style="color:#B8312F;font-weight:bold">青木蕨</span>、<span style="color:#B8312F;font-weight:bold">红雨伞</span>、<span style="color:#B8312F;font-weight:bold">绿羽毛</span>……</span>',
    '多肉': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>无法拒绝。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>喜欢的多肉有：生石花、铁甲麒麟……<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>曾经去云南斗南买过多肉，那里批发多肉，非常便宜。去种植大棚里买，直径15-20cm的一盆多肉普遍价格在10-20。</span>',

    // 喜欢的品牌——原因or解释
    '大疆': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">垄断</span>民用无人机、<span style="color:#B8312F;font-weight:bold">无敌</span>；“大疆军工”。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【设备】</span><br>无人机：Mavic Air -> Mavic 3 Pro -> <span style="color:#B8312F;font-weight:bold">Mavic 4 Pro</span><br>手持云台：<span style="color:#B8312F;font-weight:bold">Osmo Pocket 1</span><br>相机云台：<span style="color:#B8312F;font-weight:bold">RS3</span></span>',
    '苹果': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>我幼儿园和小学低年级时家里人都是用三星手机，之后<span style="color:#B8312F;font-weight:bold">家人都用</span>苹果（包括手机、平板，还有一个电脑）。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【设备】</span><br>手机：iPhone 5 -> iPhone 6 -> iPhone 10 -> <span style="color:#B8312F;font-weight:bold">iPhone 14 Pro MAX</span><br>平板：iPad 4 -> 13英寸 iPad 7 Pro -> <span style="color:#B8312F;font-weight:bold">11英寸 iPad 12 Pro</span></span>',
    '罗技': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好用</span>、<span style="color:#B8312F;font-weight:bold">实用</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【设备】</span><br>鼠标：<span style="color:#B8312F;font-weight:bold">Lift 白色</span><br>键盘：<span style="color:#B8312F;font-weight:bold">Wave Keys 白色</span></span>',

    // 喜欢的美食——原因or解释
    '寿司': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好吃</span>、<span style="color:#B8312F;font-weight:bold">爱吃</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span><span style="color:#B8312F;font-weight:bold">合点寿司</span>（之前寿司上的生鱼片又大又厚、两个三文鱼寿司14元，不过现在贵了）。</span>' +
                '<div class="module-photos">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-寿司-1.jpg" alt="寿司图片1" class="skill-photo">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-寿司-2.jpg" alt="寿司图片2" class="skill-photo">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-寿司-3.jpg" alt="寿司图片3" class="skill-photo">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-寿司-4.jpg" alt="寿司图片4" class="skill-photo">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-寿司-5.jpg" alt="寿司图片5" class="skill-photo">' +
                '</div>',
    '韩国烧烤': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">肉肉肉！</span><br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span><span style="color:#B8312F;font-weight:bold">虎丸</span>（贵，店前还有免费冰淇淋，肉好吃质量高）。</span>' +
                '<div class="module-photos">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-韩国烧烤-1.jpg" alt="韩国烧烤图片1" class="skill-photo">' +
                '</div>',
    '巴西烧烤': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">肉肉肉！</span><br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span><span style="color:#B8312F;font-weight:bold">拉提纳</span>（又便宜又好吃；自助巴西烧烤，普通套餐128元/人，目前普通套餐都300+元/人）。</span>' +
                '<div class="module-photos">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-巴西烧烤-1.gif" alt="巴西烧烤图片1" class="skill-photo">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-巴西烧烤-2.gif" alt="巴西烧烤图片2" class="skill-photo">' +
                    '<img src="images/基本信息-MYPREFERENCE-美食-巴西烧烤-3.gif" alt="巴西烧烤图片3" class="skill-photo">' +
                '</div>',
    '冰淇淋': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">冰冰凉凉</span>、<span style="color:#B8312F;font-weight:bold">好吃好吃</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span>肯德基<span style="color:#B8312F;font-weight:bold">原味珍珠麻薯圣代</span>、糖纸<span style="color:#B8312F;font-weight:bold">芒果纷纷雪</span>。</span>',
    '意大利面': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好吃</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span>。</span>',
    '蛋炒饭': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">什么情况下都能吃</span>，比如吃昂贵自助餐的主食、廉价自助餐的主食、酒店早餐的主食、不知道吃什么吃。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span>。</span>',
    '甜甜圈': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好吃</span>；大多情况下作为早餐，比如酒店早餐的主食。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span>（这里的甜甜圈指的是泡牛奶的甜甜圈）<span style="color:#B8312F;font-weight:bold">谷维滋</span>、<span style="color:#B8312F;font-weight:bold">谷脆格</span>、<span style="color:#B8312F;font-weight:bold">可可球</span>。</span>',

    // 喜欢的饮料——原因or解释
    '果汁': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好喝</span>，尤其是自助餐自己打的果汁；比如苹果汁、橙汁、西瓜汁、葡萄汁……（桦树汁）<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span><span style="color:#B8312F;font-weight:bold">自助餐</span>自己打的果汁。</span>',
    '牛奶': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好喝</span>，尤其是自助餐上自己倒的牛奶。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span><span style="color:#B8312F;font-weight:bold">自助餐</span>上自己倒的牛奶。</span>',
    '椰奶': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">好喝</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【推荐】</span><span style="color:#B8312F;font-weight:bold">椰树牌</span>。</span>',

    // 喜欢的歌曲——原因or解释
    '精卫(DJ降调版)': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">刘邦项羽鸿门宴</span>专用曲。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>啊~原来是关中王来了。</span>',
    '壁上观': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">黑神话·悟空</span>专属音乐。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>经历内容。</span>',
    '此去半生': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">朱棣</span>快乐曲/<span style="color:#B8312F;font-weight:bold">大明</span>不妙曲。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span><br>点头yes摇头no，奉天靖难gogogo。<br>来是come去是go，玄武门里double kill。</span>',
    'Once Upon A Time': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">黑神话·悟空</span>专属音乐。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span><br>人，我保住了。经，我取到了……<br>塔是塔，爹是爹，有塔的时候，他叫李靖，没塔的时候，他叫救命。</span>',

    // 喜欢的电影——原因or解释
    '星球大战': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">原力</span>、<span style="color:#B8312F;font-weight:bold">光剑</span>、<span style="color:#B8312F;font-weight:bold">宇宙战舰</span>、宇宙观。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span><span style="color:#B8312F;font-weight:bold">从小看</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',
    '星际迷航': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">宇宙战舰</span>、宇宙观。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span><span style="color:#B8312F;font-weight:bold">在《星球大战》后看</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',
    '指环王': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">神作</span>；世界观。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',
    '24小时': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>好看、爱看；<span style="color:#B8312F;font-weight:bold">无敌</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span><span style="color:#B8312F;font-weight:bold">高中吃饭时看</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>经历内容。</span>',
    '环太平洋': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">机甲</span>、对抗、帅。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【经历】</span><span style="color:#B8312F;font-weight:bold">小学时期的神</span>，看不腻；任何课程一旦放电影，只放《环太平洋》。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>经历内容。</span>',

    // 喜欢的动漫——原因or解释
    '宫崎骏系列': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">神作</span>；世界观。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span><span style="color:#B8312F;font-weight:bold">风之谷</span> >= <span style="color:#B8312F;font-weight:bold">天空之城</span> >= 龙猫 = 千与千寻 = 悬崖上的金鱼姬 >= 幽灵公主 = 魔女宅急便 = 红猪 = 哈尔的移动城堡。</span>',

    // 喜欢的小说——原因or解释
    '三体': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>想象力、<span style="color:#B8312F;font-weight:bold">科幻</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>经历内容。</span>',
    '西游记': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">神话体系</span>、传统、<span style="color:#B8312F;font-weight:bold">经典</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>经历内容。</span>',

    // 喜欢的景点——原因or解释
    '中国': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>上海（出生地、家在）、<span style="color:#B8312F;font-weight:bold">海南</span>（沙滩）、<span style="color:#B8312F;font-weight:bold">南京</span>（外公外婆所在）、苏州（小时候去苏州有粘土捏着玩）、杭州（西湖、希尔顿酒店、绿茶餐厅）、<span style="color:#B8312F;font-weight:bold">长白山</span>（滑雪）……<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',
    '美国': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">迪士尼</span>、<span style="color:#B8312F;font-weight:bold">环球影城</span>、<span style="color:#B8312F;font-weight:bold">城市风景</span>……<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',
    '日本': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">京都</span>、大阪、长野、名古屋、<span style="color:#B8312F;font-weight:bold">北海道</span>……<span style="color:#B8312F;font-weight:bold">秋叶原</span>、涩谷、池袋、<span style="color:#B8312F;font-weight:bold">新宿</span>……<span style="color:#B8312F;font-weight:bold">刺身</span>、<span style="color:#B8312F;font-weight:bold">和牛</span>、<span style="color:#B8312F;font-weight:bold">二次元</span>……<span style="color:#B8312F;font-weight:bold">骏河屋</span>、BOOK OFF、HARD OFF、LOFT……<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',
    '泰国': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">沙滩</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【介绍】</span>。</span>',

    // 喜欢的明星——原因or解释
    '马龙': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">正手好</span>、<span style="color:#B8312F;font-weight:bold">六边形</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span><span style="color:#B8312F;font-weight:bold">双圈大满贯</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【称号】</span>三剑客之一、<span style="color:#B8312F;font-weight:bold">六边形战士</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【技术】</span>控制、正手拉、反手侧切、反手抹……</span>',
    '许昕': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">弧圈艺术</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span><span style="color:#B8312F;font-weight:bold">最强左直</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【称号】</span>三剑客之一、<span style="color:#B8312F;font-weight:bold">人民艺术家</span>、<span style="color:#B8312F;font-weight:bold">大蟒</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【技术】</span>圆月弯刀、背后击球、放高……</span>',
    '张继科': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">帅</span>、<span style="color:#B8312F;font-weight:bold">反手无敌</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【成就】</span><span style="color:#B8312F;font-weight:bold">最快大满贯</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【称号】</span>三剑客之一、<span style="color:#B8312F;font-weight:bold">藏獒</span>。<br>' +
                '<span style="color:#FFFFFF;font-weight:bold">【技术】</span>霸王拧……</span>',

    // 喜欢的颜色——原因or解释
    '蓝色': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">小时候</span>最喜欢（不考虑用途，比如用于电脑、汽车等比一定好看）。</span>',
    '黑色': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">产品颜色</span>好看。比如个人笔记本、鼠标、电子设备、汽车、书包。</span>',
    '白色': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">产品颜色</span>好看。比如鼠标、键盘、汽车。</span>',
    '金色': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">设计配色</span>用好看；高贵、权力、奢华（古代只有皇帝才能用）。</span>',
    '红色': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>部分<span style="color:#B8312F;font-weight:bold">品牌用色</span>，好看。比如红双喜、蝴蝶。</span>',
    '紫色': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>乒乓球海绵紫色海绵（<span style="color:#B8312F;font-weight:bold">紫金皇朝</span>）；高贵、皇朝、权力。</span>',

    // 喜欢的数字——原因or解释
    'XXXX': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>我也不记得为什么会喜欢，但由于常常用于<span style="color:#B8312F;font-weight:bold">密码</span>中，所以不便展示。</span>',
    '1701': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>来自<span style="color:#B8312F;font-weight:bold">狂飙龙5X</span>的编号。</span>',
    '20230211': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span>来自<span style="color:#B8312F;font-weight:bold">数字968</span>的生产年月日。</span>',
    '6': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">666</span>。（无需多言）</span>',
    '8': '<span style="color:#888888">' +
                '<span style="color:#FFFFFF;font-weight:bold">【原因】</span><span style="color:#B8312F;font-weight:bold">发发发</span>；￥￥￥；$$$。（无需多言）</span>',
};


// 创建更多信息区域的板块
function createMoreInfoSection(sectionId, items) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // 清空内容
    section.innerHTML = '';
    
    // 获取板块标题（从sectionId中提取）
    const sectionTitle = sectionId === 'color-section' ? '喜欢的颜色' :
                        sectionId === 'number-section' ? '喜欢的数值' :
                        sectionId === 'sport-section' ? '喜欢的运动' :
                        sectionId === 'game-section' ? '喜欢的游戏' :
                        sectionId === 'work-section' ? '喜欢的工作' :
                        sectionId === 'software-section' ? '喜欢的软件' :
                        sectionId === 'pet-section' ? '喜欢的动物' :
                        sectionId === 'plant-section' ? '喜欢的植物' :
                        sectionId === 'brand-section' ? '喜欢的品牌' :
                        sectionId === 'food-section' ? '喜欢的美食' :
                        sectionId === 'drink-section' ? '喜欢的饮料' :
                        sectionId === 'music-section' ? '喜欢的歌曲' :
                        sectionId === 'movie-section' ? '喜欢的电影' :
                        sectionId === 'anime-section' ? '喜欢的动漫' :
                        sectionId === 'novel-section' ? '喜欢的小说' :
                        sectionId === 'scenery-section' ? '喜欢的景点' :
                        sectionId === 'star-section' ? '喜欢的明星' :
                        '更多信息';
    
    // 创建汇总文本元素
    const summaryElement = document.createElement('div');
    summaryElement.className = 'items-summary';
    
    // 为每个项目创建单独的标签，而不是简单地用逗号连接
    items.forEach((item, index) => {
        const itemElement = document.createElement('span');
        itemElement.className = 'summary-item';
        itemElement.textContent = item;
        
        // 存储项目信息，用于悬浮显示图标
        itemElement.dataset.item = item;
        itemElement.dataset.category = sectionId.split('-')[0];
        
        summaryElement.appendChild(itemElement);
        
        // 在项目之间添加分隔符（除了最后一个项目）
        if (index < items.length - 1) {
            const separator = document.createTextNode(' ');
            summaryElement.appendChild(separator);
        }
    });
    
    // 已删除悬浮显示图标功能
    
    section.appendChild(summaryElement);
    
    // 创建内容模块容器
    const modulesContainer = document.createElement('div');
    modulesContainer.className = 'info-modules-container';
    
    // 添加内容模块到容器
    items.forEach(item => {
        const module = document.createElement('div');
        module.className = 'info-module';
        
        // 获取自定义描述，如果没有则使用默认格式
        const description = customDescriptions[item] || `[对${item}的说明]`;
        
        // 从 sectionTitle 去掉“喜欢的”前缀，得到模块名（如“美食”、“运动”）
        const displaySectionName = (sectionTitle || '').replace(/^喜欢的/, '');
        
        // 图片改由 customDescriptions 中直接提供静态 HTML（含 module-photos / skill-photo）
        module.innerHTML = `
            <div class="module-title">${item}</div>
            <div class="module-content">
                <div class="module-description">${description}</div>
            </div>
        `;
        
        modulesContainer.appendChild(module);
    });
    
    section.appendChild(modulesContainer);
}

// 图片扩展名回退（自动尝试 jpg/jpeg/png/webp）
function setupImageFallbacks() {
    function attachFallback(img) {
        if (img.__fallbackAttached) return;
        img.__fallbackAttached = true;
        const exts = ['jpg', 'jpeg', 'png', 'webp'];
        const tried = new Set();
        function handler() {
            const curr = img.getAttribute('src') || '';
            const currExt = curr.split('.').pop().toLowerCase();
            if (!tried.size) tried.add(currExt);
            const next = exts.find(e => !tried.has(e));
            if (next) {
                tried.add(next);
                try {
                    img.src = curr.replace(new RegExp('\\.' + currExt + '$'), '.' + next);
                } catch (e) {
                    img.removeEventListener('error', handler);
                }
            } else {
                img.removeEventListener('error', handler);
            }
        }
        img.addEventListener('error', handler);
    }
    // 初次绑定
    document.querySelectorAll('img').forEach(attachFallback);
    // 监听后续动态插入的图片
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === 'IMG') {
                        attachFallback(node);
                    }
                    const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
                    imgs.forEach(attachFallback);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// 横向拖拽滚动（适用于 .module-photos 和 .module-images）
function setupDragScroll() {
    const containers = document.querySelectorAll('.module-photos, .module-images');
    containers.forEach(container => {
        // 移除“小手”相关的拖拽功能，仅保留键盘与滚轮滚动
        
        // 键盘左右箭头滚动（需可聚焦）
        if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '0');
        }
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                container.scrollBy({ left: Math.max(120, container.clientWidth * 0.6), behavior: 'smooth' });
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                container.scrollBy({ left: -Math.max(120, container.clientWidth * 0.6), behavior: 'smooth' });
                e.preventDefault();
            }
        });

        // 鼠标滚轮纵向转横向滚动
        container.addEventListener('wheel', (e) => {
            const prev = container.scrollLeft;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                container.scrollLeft += e.deltaY;
                if (container.scrollLeft !== prev) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    });
}

// 切换板块展开/收起状态
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('expanded');
        // 同时给对应的按钮添加/移除展开类
        const button = section.previousElementSibling;
        if (button && button.classList.contains('collapsible-header')) {
            button.classList.toggle('header-expanded');
        }
    }
}

// 通用图片灯箱：点击图片查看放大（不太大）、背景模糊，并支持左右切换当前模块图片
(function setupImageLightbox() {
    function ensureOverlay() {
        let overlay = document.querySelector('.image-lightbox-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'image-lightbox-overlay';
            overlay.setAttribute('tabindex', '-1');
            overlay.innerHTML = `
                <div class="image-lightbox">
                    <button class="image-lightbox-btn image-lightbox-prev" aria-label="上一张">‹</button>
                    <img class="image-lightbox-img" alt="" />
                    <button class="image-lightbox-btn image-lightbox-next" aria-label="下一张">›</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    let currentImages = [];
    let currentIndex = 0;

    function renderLightbox() {
        const overlay = ensureOverlay();
        const imgEl = overlay.querySelector('.image-lightbox-img');
        const box = overlay.querySelector('.image-lightbox');
        const item = currentImages[currentIndex];
        if (!item) return;
        imgEl.src = item.src;
        imgEl.alt = item.alt || '';
        overlay.classList.add('active');
        box.classList.remove('image-lightbox-animate');
        void box.offsetWidth;
        box.classList.add('image-lightbox-animate');
        overlay.focus();
    }

    function openImageLightbox(images, startIndex) {
        currentImages = images || [];
        currentIndex = Math.max(0, Math.min(startIndex || 0, currentImages.length - 1));
        renderLightbox();
    }

    function closeImageLightbox() {
        const overlay = document.querySelector('.image-lightbox-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    function nav(delta) {
        if (!currentImages.length) return;
        currentIndex = (currentIndex + delta + currentImages.length) % currentImages.length;
        renderLightbox();
    }

    document.addEventListener('click', (e) => {
        const targetImg = e.target.closest('.experience-photo, .skill-photo');
        if (!targetImg) return;
        const container = targetImg.closest('.module-photos');
        const allImgs = container ? Array.from(container.querySelectorAll('.experience-photo, .skill-photo')) : [targetImg];
        const start = allImgs.indexOf(targetImg);
        openImageLightbox(allImgs, start > -1 ? start : 0);
    });

    document.addEventListener('click', (e) => {
        const overlay = document.querySelector('.image-lightbox-overlay.active');
        if (!overlay) return;
        if (e.target === overlay) {
            closeImageLightbox();
        }
    });

    document.addEventListener('click', (e) => {
        const overlay = document.querySelector('.image-lightbox-overlay.active');
        if (!overlay) return;
        if (e.target.closest('.image-lightbox-prev')) {
            e.preventDefault();
            nav(-1);
        } else if (e.target.closest('.image-lightbox-next')) {
            e.preventDefault();
            nav(1);
        }
    });

    document.addEventListener('keydown', (e) => {
        const overlay = document.querySelector('.image-lightbox-overlay.active');
        if (!overlay) return;
        if (e.key === 'Escape') {
            closeImageLightbox();
        } else if (e.key === 'ArrowLeft') {
            nav(-1);
        } else if (e.key === 'ArrowRight') {
            nav(1);
        }
    });
})();

// 加载专业履历页面
function loadProfessionalExperience() {
    const container = document.getElementById('professional-experience');
    
    container.innerHTML = `
        <!-- 顶部圆形头像 -->
        <div class="header-avatar">
            <img src="images/顶部-头像.jpg" alt="头像" class="avatar-image">
        </div>
        
        ${renderMainNav('professional-experience')}
        
        <!-- 专业履历导航 -->
        <div class="section-nav">
            <button class="section-nav-btn active" onclick="filterProfessionalExperience('all')">全部</button>
            <button class="section-nav-btn" onclick="filterProfessionalExperience('projects')">项目</button>
            <button class="section-nav-btn" onclick="filterProfessionalExperience('work')">工作</button>
            <button class="section-nav-btn" onclick="filterProfessionalExperience('education')">学业</button>
            <button class="section-nav-btn" onclick="filterProfessionalExperience('selfstudy')">自学</button>
            <button class="section-nav-btn" onclick="filterProfessionalExperience('extracurricular')">课外</button>
            <button class="section-nav-btn" onclick="filterProfessionalExperience('interests')">兴趣</button>
        </div>
        <script>try{filterProfessionalExperience('all')}catch(_){};</script>
        
        <!-- 专业履历内容区域 -->
        <div class="content-grid">
        <div id="professional-experience-content">
            <!-- 项目模块 - 5个 -->
            <div class="skill-module digital-module notification" data-category="projects">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">盲人导航系统<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;课题&nbsp;&nbsp;自动化</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年1月 - 2025年5月</div>
                    <p>学校<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大创</span>项目。
                    <br>项目<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">制作</span> <智能盲杖>，有 <谷歌地图导航>、<被动避障>、<主动探索>、<家人关怀> 等<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">功能</span>。
                    <br>大一时遇到其他学院同学能够找到导师，我与其组队并提供课题 <辅导员-学生交流平台> 。大二后对方无理由突然换导师与课题，我被迫更换后参与部分项目。后因对方课题不重视前期调研、市场分析等（即无法保证课题有意义、有用），又与对方意见、时间等不和，且专业方向不完全一致，故不再继续。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 调研并分析盲人的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">现状</span>与<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">需求</span>。</li>
                            <li>✓ 提出<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">项目概念</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">功能</span>及<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">市场定位</span>，并主导确定 <动态避障> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">技术路线</span>。</li>
                            <li>✓ 负责完成 <雷达>（Mid 360）与 <视觉>（Intel realsense D435）<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">融合建模</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-项目-盲人导航系统-1.png" alt="盲人导航系统图片1" class="skill-photo">
                    <img src="images/专业履历-项目-盲人导航系统-2.png" alt="盲人导航系统图片2" class="skill-photo">
                    <img src="images/专业履历-项目-盲人导航系统-3.jpg" alt="盲人导航系统图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module digital-module notification" data-category="projects">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">语音合成技术的应用综述<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;论文&nbsp;&nbsp;语音合成</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年1月 - 2025年3月</div>
                    <p>完成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">英文综述论文</span> &lt;A Review of Applications of Speech Synthesis Technology&gt;。
                    <br>总结<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">语音合成技术</span>在 <口语教学>、<数字音乐>、<虚拟人物>、<语言保护与传播> 四个方面的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">应用现状</span>，并对这四个方面进行<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">展望</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 2025 3rd International Conference on Artificial Intelligence, Database and Machine Learning (AIDML 2025)<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">收录</span>并<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">发版</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-项目-语音合成技术的应用综述-1.png" alt="语音合成技术的应用综述图片1" class="skill-photo">
                    <img src="images/专业履历-项目-语音合成技术的应用综述-2.png" alt="语音合成技术的应用综述图片2" class="skill-photo">
                </div>
            </div>

            <div class="skill-module digital-module notification" data-category="projects">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">计算语言模型应用研究<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;项目&nbsp;&nbsp;人工智能</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年1月 - 2025年3月</div>
                    <p>北京大学(QS综排亚洲Top1)王副教授，6周，人工智能ChatGPT专题：计算语言模型应用研究——ChatGPT在对话生成等自然语言处理领域的算法原理探究。
                    <br>课程学习：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">语言模型</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">机器学习</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">神经网络</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">深度学习</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">知识表示</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 完成每次项目<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">作业</span>。</li>
                            <li>✓ 完成项目<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">汇报</span>与<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">答辩</span>。</li>
                            <li>✓ 获得辅导老师兼论文指导老师的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">推荐信</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-项目-计算语言模型应用研究-1.png" alt="计算语言模型应用研究图片1" class="skill-photo">
                    <img src="images/专业履历-项目-计算语言模型应用研究-2.png" alt="计算语言模型应用研究图片2" class="skill-photo">
                </div>
            </div>

            <div class="skill-module digital-module notification" data-category="projects">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">红雨伞水草在不同条件下的发色情况<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;课题&nbsp;&nbsp;生物</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2020年9月 - 2022年6月</div>
                    <p>本生物项目面向水族爱好者，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">探究</span>红雨伞水草在不同 <温度>、<光谱> 下的 <生长>、<发色> 情况。
                    <br>项目经历<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1次</span>预实验，与<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3次</span>正式实验。前期于 <学校闲置实验室> 使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">8个</span>水族箱做对比实验，后期由于新冠在 <家> 中使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4个</span>水族箱做对比实验。期间在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中科院分子研究所</span>进行采样、实验。
                    <br>可惜的是，项目期间遇到各种<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">困难</span>：实验素材购买耗时影响实验进度、实验水草样本生长耗时影响实验进度、实验复杂、受新冠疫情影响项目进度、受学业影响项目时间……最终导致无法有足够时间完成分子级别实验研究，宏观级别实验也未能完整完成。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 华师大二附中校“三创”大赛<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一等奖</span>。</li>
                            <li>✓ 完成论文，完成华二“卓越学院”创新项目<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">结题</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-项目-红雨伞水草在不同条件下的发色情况-1.jpg" alt="红雨伞水草在不同条件下的发色情况图片1" class="skill-photo">
                    <img src="images/专业履历-项目-红雨伞水草在不同条件下的发色情况-2.jpg" alt="红雨伞水草在不同条件下的发色情况图片2" class="skill-photo">
                    <img src="images/专业履历-项目-红雨伞水草在不同条件下的发色情况-3.jpg" alt="红雨伞水草在不同条件下的发色情况图片1" class="skill-photo">
                    <img src="images/专业履历-项目-红雨伞水草在不同条件下的发色情况-4.jpg" alt="红雨伞水草在不同条件下的发色情况图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module digital-module notification" data-category="projects">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">开关门检测器<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;课题&nbsp;&nbsp;自动化</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2020年9月 - 2022年6月</div>
                    <p>本工程项目可以门的开关状态，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">用于</span>检测房间进出情况、检测有“门”空间的使用情况、防止老人小孩病人乱走……
                    <br>在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">蘑菇云实验基地</span>制作拥有7个霍尔传感器的1/4圆盘形检测器：可以检测开门角度(90度以内)；角度变化时发出语音播报；同时使用APP实时刷新目前角度。
                    <br>可惜的是，生物课题所花时间过长，最终导致没有时间完成论文。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 华师大二附中校“三创”大赛<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">二等奖</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-项目-开关门检测器-1.jpg" alt="开关门检测器图片1" class="skill-photo">
                    <img src="images/专业履历-项目-开关门检测器-2.jpg" alt="开关门检测器图片2" class="skill-photo">
                </div>
            </div>

            <!-- 工作模块 - 2个 -->
            <div class="experience-module work-module notification" data-category="work">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">人力资源问答智能体<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;实习&nbsp;&nbsp;人工智能应用</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年7月14日 - 2025年8月15日</div>
                    <p>在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">外企德科</span>实习，任<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">人工智能应用</span>岗。应 <市场部经理> 要求，解决 <人力资源部门> 问题，完成项目。
                    <br>项目为解决：HR想要询问人力资源有关问题时，使用大语言模型会出现<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">幻觉</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">不准确</span>信息、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">错误</span>分析等问题。因而使用有质量保证的数据源，如三茅网，作为知识库；使用智能体回答用户问题。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用 <影刀RPA> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>三茅网论坛的人力资源问答信息。</li>
                            <li>✓ 使用 <影刀RPA> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">清洗</span>数据，作为智能体 <知识库>。</li>
                            <li>✓ 使用 &lt;Ninja Ripper&gt;、&lt;FModel&gt; 等工具<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">解包</span>黑神话·悟空，获取黄凤大圣语音文件.</li>
                            <li>✓ 使用 &lt;GPT-SoVITS&gt; 等工具<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">生成</span>符合特定要求的音频，作为智能体平台的AI语音模型输入文件.</li>
                            <li>✓ 在 <文心智能体平台> 制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">智能体</span>，并发表。</li>
                            <li>✓ 获得市场部经理<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">推荐信</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-工作-人力资源问答智能体-1.png" alt="人力资源问答智能体图片1" class="experience-photo">
                    <img src="images/专业履历-工作-人力资源问答智能体-2.png" alt="人力资源问答智能体图片2" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module work-module notification" data-category="work">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">小红书商家<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;博主&nbsp;&nbsp;AIGC</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年6月 - 2024年7月</div>
                    <p>在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小红书</span>实名认证注册成为个人商家.
                    <br>分享由<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Midjourney</span>制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Unidream</span>美化的 <电脑壁纸>、<手机壁纸>。
                    <br>涵盖主题：赛博朋克、《国家队02》同人、初音未来同人、EVA同人、宫崎骏风格……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 在1个月内获得近<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">500</span>粉丝，作品最多点赞量超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">700</span>。</li>
                            <li>✓ 发布图文<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">20+</span>；共壁纸<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">60+</span>。</li>
                            <li>✓ 分享作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">500+</span>；达成交易<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-工作-小红书商家-1.jpg" alt="小红书商家图片1" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-2.jpg" alt="小红书商家图片2" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-3.jpg" alt="小红书商家图片3" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-4.jpg" alt="小红书商家图片4" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-5.jpg" alt="小红书商家图片5" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-6.jpg" alt="小红书商家图片6" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-7.jpg" alt="小红书商家图片7" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-8.jpg" alt="小红书商家图片8" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-9.jpg" alt="小红书商家图片9" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-10.jpg" alt="小红书商家图片10" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-11.jpg" alt="小红书商家图片11" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-12.jpg" alt="小红书商家图片12" class="experience-photo">
                    <img src="images/专业履历-工作-小红书商家-13.jpg" alt="小红书商家图片13" class="experience-photo">
                </div>
            </div>

            <!-- 学业模块 - 3个 -->
            <div class="experience-module education-module notification" data-category="education">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">基于ESP32的多功能气体检测系统设计<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;大作业&nbsp;&nbsp;自动化</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年5月 - 2025年7月</div>
                    <p>大二下<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《基于开源硬件平台的智能感知实训》</span>课程大作业，制作以esp32 CH340为芯片包含7个模块的项目。
                    <br>完成项目结题<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">论文</span>与<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">项目</span>制作，字数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">13000+</span>、图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40+</span>、表格<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">27</span>、代码量<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">500+</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">温湿度</span>模块，采用 &lt;DHT11&gt; 检测温度、湿度。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">二氧化碳检测</span>模块，采用 &lt;JW01-CO2-V2.2&gt; 检测二氧化碳。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">烟雾</span>模块，采用 &lt;MQ2&gt; 检测丙烷、氢气。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">TFT显示</span>模块，采用 &lt;ST7735S&gt; 显示三个界面：参数显示、逻辑设置、报警设置。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">声音报警</span>模块，采用 &lt;S9013 NPN&gt; 报警。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">风扇</span>模块，采用 <5010HSL> 散热。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">按键</span>模块，采用 <4位独立按键模块> 控制：开关机、逻辑控制、风扇控制、界面切换。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">电位器</span>模块，采用 <数字旋钮编码器转动电位器模块> 以：无极调节参数、切换无极调节对象。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-学业-基于ESP32的多功能气体检测系统设计-1.jpg" alt="基于ESP32的多功能气体检测系统设计图片1" class="experience-photo">
                    <img src="images/专业履历-学业-基于ESP32的多功能气体检测系统设计-2.png" alt="基于ESP32的多功能气体检测系统设计图片2" class="experience-photo">
                </div>
            </div>

            <div class="experience-module education-module notification" data-category="education">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">交流学习平台<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;大作业&nbsp;&nbsp;数据库</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年4月 - 2025年6月</div>
                    <p>大二下<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《数据库原理》</span>课程大作业，课程要求制作兼备 <前端网页> 和 <后端数据库> 的项目。
                    <br>基于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">SpringBoot</span>和<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Vue</span>制作名为InspireX的 <交流学习平台>。
                    <br>项目旨在为各领域想要了解信息或学习知识却不知从何获得或学起的人们提供一个可以交流学习的共同平台。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">资源中心</span>模块，管理员会为用户提供编程、创客、运动、旅游等各方面资料或教学资源。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">交流广场</span>模块，为用户提供发表文章的平台。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">在线交流</span>模块，用户可以与其他用户自由文字对话。</li>
                            <li>✓ 设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">公告资讯</span>模块，提供平台介绍、大事件通知等重要事项。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-学业-交流学习平台-1.jpg" alt="交流学习平台图片1" class="experience-photo">
                    <img src="images/专业履历-学业-交流学习平台-2.jpg" alt="交流学习平台图片2" class="experience-photo">
                    <img src="images/专业履历-学业-交流学习平台-3.jpg" alt="交流学习平台图片3" class="experience-photo">
                    <img src="images/专业履历-学业-交流学习平台-4.jpg" alt="交流学习平台图片4" class="experience-photo">
                    <img src="images/专业履历-学业-交流学习平台-5.jpg" alt="交流学习平台图片5" class="experience-photo">
                    <img src="images/专业履历-学业-交流学习平台-6.jpg" alt="交流学习平台图片6" class="experience-photo">
                    <img src="images/专业履历-学业-交流学习平台-7.jpg" alt="交流学习平台图片7" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module education-module notification" data-category="education">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">浏览器导航页<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;大作业&nbsp;&nbsp;网页前端</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年2月 - 2024年6月</div>
                    <p>大一下<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《计算机职业实践》</span>课程大作业，课程要求制作仅有 <前端> 的网页。
                    <br>项目制作网页前端，项目制作 <浏览器的导航页>，模仿 &lt;WeTab&gt; 标签页。有主页、分页。分页有功能：<日历>、<时间>、<天气>、<链接推荐> 等。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">M*N格X子连胜棋</span>模块：可以设定棋盘长宽、几子连线得胜。</li>
                            <li>✓ 制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">计时器</span>模块：多组可同时运行倒计时、可视化钟盘、随时启停、历史记录、主题自定义选择……样式字体美观、设计人性化、运行逻辑完善……使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Midjourney</span>制作模块背景、指针、过场动画等。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-学业-浏览器导航页-1.jpg" alt="浏览器导航页图片1" class="experience-photo">
                    <img src="images/专业履历-学业-浏览器导航页-2.png" alt="浏览器导航页图片2" class="experience-photo">
                    <img src="images/专业履历-学业-浏览器导航页-3.png" alt="浏览器导航页图片3" class="experience-photo">
                    <img src="images/专业履历-学业-浏览器导航页-4.png" alt="浏览器导航页图片4" class="experience-photo">
                    <img src="images/专业履历-学业-浏览器导航页-5.png" alt="浏览器导航页图片5" class="experience-photo">
                    <img src="images/专业履历-学业-浏览器导航页-6.png" alt="浏览器导航页图片6" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module education-module notification" data-category="education">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">英语项目式学习<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;项目式作业&nbsp;&nbsp;英语</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2023年10月 - 2023年11月、2024年4月 - 2024年5月、2024年9月</div>
                    <p>大一上、大一下、大二上<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《大学英语》</span>课程的项目式作业，各班 <优胜者>（<1/12）可被老师选出参加校内 <比赛>（分为三等奖45%、二等奖35%、一等奖15%、特等奖5%）。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 带领团队完成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Clean Energy</span>主题视频制作，整合 &lt;PPT&gt; 动画、<即时AI> AI绘画、&lt;RunwayML&gt; AI视频技术，设计视频开头/结尾及“介绍”部分，获校级<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">三等奖</span>（2023-2024第一学期）。</li>
                            <li>✓ 主导<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Safeguarding the Blue World</span>主题PPT动画设计、素材整合及后期制作（剪映），运用 <即时AI> AI绘画、&lt;Midjourney&gt; AI绘画、&lt;Genmo&gt; AI视频技术完成全流程视频制作，获校级<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">二等奖</span>（2023-2024第二学期）。</li>
                            <li>✓ 独立完成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Denoising Diffusion Probabilistic Model</span>（DDPM）主题。系统学习深度学习、扩散模型理论，实践DDPM训练与运行，使用 &lt;PPT&gt; 动画、&lt;Stable Diffusion&gt; AI绘画、&lt;Midjourney&gt; AI绘画等技术，趣味化展示模型原理与成果，形成完整项目报告。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-学业-英语项目式学习-1.gif" alt="英语项目式学习图片1" class="experience-photo">
                    <img src="images/专业履历-学业-英语项目式学习-2.gif" alt="英语项目式学习图片2" class="experience-photo">
                    <img src="images/专业履历-学业-英语项目式学习-3.jpg" alt="英语项目式学习图片3" class="experience-photo">
                </div>
            </div>
            
            <!-- 自学模块 - 7个 -->
            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">UIverse<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;UI&nbsp;&nbsp;软件工程</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年9月 - 2025年10月</div>
                    <p>在 &lt;UIverse&gt; 分享网站前端设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">UI</span>。
                    <br>Uiverse(The universe of UI)是目前最有名、质量最高且全面的开源UI网站。
                    <br>所有网站上发布的内容 (UI) 都有<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">MIT License</span>(麻省理工大学许可证)。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 上传设计<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40+</span>。其中Patterns<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4+</span>；Buttons<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">7+</span>；Loaders<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">5+</span>；Checkboxes<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">7+</span>；Cards<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">6+</span>；Toggle switches<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4+</span>。</li>
                            <li>✓ 所有上传作品中现已被通过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2个</span>checkbox，获得<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">230</span>Creater Points（创作者积分）。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-UIverse-1.png" alt="UIverse图片1" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-2.png" alt="UIverse图片2" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-3.png" alt="UIverse图片3" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-4.gif" alt="UIverse图片4" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-5.gif" alt="UIverse图片5" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-6.gif" alt="UIverse图片6" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-7.gif" alt="UIverse图片7" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-8.gif" alt="UIverse图片8" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-9.gif" alt="UIverse图片9" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-10.gif" alt="UIverse图片10" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-11.gif" alt="UIverse图片11" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-12.gif" alt="UIverse图片12" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-13.gif" alt="UIverse图片13" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-14.gif" alt="UIverse图片14" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-15.gif" alt="UIverse图片15" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-16.gif" alt="UIverse图片16" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-17.gif" alt="UIverse图片17" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-18.gif" alt="UIverse图片18" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-19.gif" alt="UIverse图片19" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-20.gif" alt="UIverse图片20" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-21.gif" alt="UIverse图片21" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-22.gif" alt="UIverse图片22" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-23.gif" alt="UIverse图片23" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-24.gif" alt="UIverse图片24" class="experience-photo">
                    <img src="images/专业履历-自学-UIverse-25.gif" alt="UIverse图片25" class="experience-photo">
                </div>
            </div>

            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">听力出题信号词<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;智能体&nbsp;&nbsp;人工智能</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年11月</div>
                    <p>项目制作名为 <听力出题型号词> 的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">智能体</span>发布于 <扣子智能体平台> 上。
                    <br>智能体<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">简介</span>：可以根据【听力原文】给出【出题信号词】。【出题信号词】可以方便你记笔记、抓重点。
                    <br>智能体<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">开场白</span>：直接发送【听力原文】，我会给出【出题信号词】。【出题信号词】可以方便你记笔记、抓重点。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 根据<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">托福</span>总结8类听力出题信号词即信号词举例，据此设定 <提示词>。</li>
                            <li>✓ 可以根据用户输入的 <听力原文>，输出 <出题信号类型>、<出题信号词>、<解释>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-听力出题型号词-1.png" alt="听力出题型号词图片1" class="experience-photo">
                    <img src="images/专业履历-自学-听力出题型号词-2.png" alt="听力出题型号词图片2" class="experience-photo">
                </div>
            </div>

            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">二次元人物抽卡<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;智能体&nbsp;&nbsp;人工智能</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年8月 - 2025年9月</div>
                    <p>项目制作名为 <二次元人物抽卡> 的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">智能体</span>发布于 <文心智能体平台> 上。
                    <br>智能体<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">简介</span>：想要属于自己的二次元人物角色卡？来这里试试运气吧！
                    <br>智能体<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">开场白</span>：欢迎使用二次元人物抽卡祭坛！输入【于天】，随机抽取。输入【听命】根据经历抽取。输入【知音】根据兴趣抽取。祝你好运💖💖💖</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">软件机器人</span> <影刀RPA> 建立 <知识库>。调用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大语言模型</span> <百度文心一言> 收集常见二次元动漫中有名或主要二次元人物的 <基本信息>、<形象>、<性格>、<能力与技能>、<经历>、<人际关系>、<分析>、<影响>；调用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大语言模型</span> <火山引擎> 结合本人判断分析二次元人物的 <知名度>、<强度>、<身份>。</li>
                            <li>✓ 设置【于天】、【听命】、【知音】三种 <抽卡方式>，用有趣、详细、游戏化的游戏卡予以反馈，并能提供更多人物详细信息。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-二次元人物抽卡-1.png" alt="二次元人物抽卡图片1" class="experience-photo">
                    <img src="images/专业履历-自学-二次元人物抽卡-2.png" alt="二次元人物抽卡图片2" class="experience-photo">
                    <img src="images/专业履历-自学-二次元人物抽卡-3.png" alt="二次元人物抽卡图片3" class="experience-photo">
                    <img src="images/专业履历-自学-二次元人物抽卡-4.png" alt="二次元人物抽卡图片4" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">你的鱼缸小助手<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;智能体&nbsp;&nbsp;人工智能</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年8月 - 2025年9月</div>
                    <p>项目制作名为 <你的鱼缸小助手> 的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">智能体</span>发布于 <文心智能体平台> 上。
                    <br>智能体<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">简介</span>：养不好鱼？养不好草？选不出器材？配不对药？来这里问问吧！
                    <br>智能体<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">开场白</span>：我是你的鱼缸小助手，欢迎使用！😍我可以回答有关：养鱼🐟or养虾🦐、种草🌿or翻缸📦、选材🧱or野采🎣、造景🪴or维护✂️……淡水鱼🐡or海水鱼🐠、原生缸🪵or水陆缸🏞️……的各种各样、全方面的问题。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用 <影刀RPA> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>海友网、智能鱼缸之家、南美水族的水族信息。</li>
                            <li>✓ 在 <文心智能体平台> 制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">智能体</span>。可以回答有关经验的、主观性的问题与有关知识的、客观性的问题。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-你的鱼缸小助手-1.png" alt="你的鱼缸小助手图片1" class="experience-photo">
                    <img src="images/专业履历-自学-你的鱼缸小助手-2.png" alt="你的鱼缸小助手图片2" class="experience-photo">
                    <img src="images/专业履历-自学-你的鱼缸小助手-3.png" alt="你的鱼缸小助手图片3" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">歌声合成<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;工具&nbsp;&nbsp;深度学习</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年10月-2024年11月</div>
                    <p>歌声转换Singing Voice Conversion(<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">SVC</span>)的常见开源项目有：So-VITS-SVC、RVC、DDSP-SVC、Diffusion-SVC、Diff-SVC、ReFlow-VAE-SVC。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用 &lt;RVC&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型，如林黛玉、杨戬、抗金星君。</li>
                            <li>✓ 使用 &lt;RVC&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">合成</span>歌曲，如用林黛玉的声音唱英语《Burning Desires》、日语《甩葱歌》、葡萄牙语《MontagemNadaTropica》。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-歌声合成-1.png" alt="歌声合成图片1" class="experience-photo">
                    <img src="images/专业履历-自学-歌声合成-2.png" alt="歌声合成图片2" class="experience-photo">
                    <img src="images/专业履历-自学-歌声合成-3.png" alt="歌声合成图片3" class="experience-photo">
                    <img src="images/专业履历-自学-歌声合成-4.png" alt="歌声合成图片4" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">语音合成<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;工具&nbsp;&nbsp;深度学习</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年10月</div>
                    <p>文语转换Text-to-Speech(<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">TTS</span>)属于语音合成的分支，核心任务是将文字信息转化为语音信息。常见开源项目有：Chat-TTS、GPT-SoVITS、OpenVoice。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用 &lt;Chat-TTS&gt;、&lt;GPT-SoVITS&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型，如林黛玉、杨戬、小黄龙、抗金星君。</li>
                            <li>✓ 使用 &lt;Chat-TTS&gt;、&lt;GPT-SoVITS&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">合成</span>语音，用于 <盲人导航系统> 的导航播报语音包、用于 <人力资源问答智能体> 的AI语音收录、用于 &lt;Denoising Diffusion Probabilistic Model&gt; 的开头配音。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-语音合成-1.png" alt="语音合成图片1" class="experience-photo">
                    <img src="images/专业履历-自学-语音合成-2.png" alt="语音合成图片2" class="experience-photo">
                    <img src="images/专业履历-自学-语音合成-3.png" alt="语音合成图片3" class="experience-photo">
                    <img src="images/专业履历-自学-语音合成-4.png" alt="语音合成图片4" class="experience-photo">
                </div>
            </div>

            <div class="experience-module selfstudy-module notification" data-category="selfstudy">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">游戏解包<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;工具&nbsp;&nbsp;软件工程</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年10月-2024年11月</div>
                    <p>解包游戏源文件。提取游戏资源，如图片、模型、音频、剧本等。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用 &lt;Ninja Ripper 2.6&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">实时截取</span>3D资源。</li>
                            <li>✓ 使用 &lt;FModel&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">查看</span>和<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">提取</span>游戏资源。</li>
                            <li>✓ 获取<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">人物语音</span>，用于 <剪辑> 用语音、<语音合成> 及 <歌声合成> 用语音。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-自学-游戏解包-1.png" alt="游戏解包图片1" class="experience-photo">
                    <img src="images/专业履历-自学-游戏解包-2.png" alt="游戏解包图片2" class="experience-photo">
                </div>
            </div>

            <!-- 课外模块 - 3个 -->
            <div class="experience-module extracurricular-module notification" data-category="extracurricular">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">乒乓球协会<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;社团&nbsp;&nbsp;媒体</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2023年9月 - 2025年6月</div>
                    <p>既担任其中的普通<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">运动员</span>、也担任管理员中的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">视频组成员</span>。
                    <br>乒乓球协会，是华东理工大学面向全校普通学生的 <乒乓球社团>，组织丰富有趣的 <社团活动>，还有成绩斐然的高水平业余 <运动队>。
                    <br>乒乓球是华东理工大学的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">特色</span>和<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">特长</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 为至少<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4次</span>乒乓球比赛、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1次</span>裁判赛前培训提供唯一摄影素材来源。</li>
                            <li>✓ 独立完成23年新生乒乓球赛的决赛宣传视频。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-课外-乒乓球协会-1.jpg" alt="乒乓球协会照片1" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-2.jpg" alt="乒乓球协会照片2" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-3.jpg" alt="乒乓球协会照片3" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-4.jpg" alt="乒乓球协会照片4" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-5.jpg" alt="乒乓球协会照片5" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-6.jpg" alt="乒乓球协会照片6" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-7.jpg" alt="乒乓球协会照片7" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-8.jpg" alt="乒乓球协会照片8" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-9.jpg" alt="乒乓球协会照片9" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-10.jpg" alt="乒乓球协会照片10" class="experience-photo">
                    <img src="images/专业履历-课外-乒乓球协会-11.jpg" alt="乒乓球协会照片11" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module extracurricular-module notification" data-category="extracurricular">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">信息宣传与传媒中心<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;学生会&nbsp;&nbsp;媒体</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2023年9月 - 2024年6月</div>
                    <p>担任其中<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">视频组成员</span>。
                    <br>信息宣传与传媒中心的简称是<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">信宣</span>，是信息科学与工程学院的媒体中心、隶属于院级学生会。信宣负责组织各种院内活动、节日，记录并宣传各种活动、讲座等。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 独立完至少<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4次</span> <讲座>、<教学活动> 跟拍记录。</li>
                            <li>✓ 为约<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10次</span> <大型活动> 提供核心摄影、航拍素材，包含军训、运动会、极客节、室内表演等。</li>
                            <li>✓ 独立制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2个</span>“小信息”官方微信 <视频号> 视频。</li>
                            <li>✓ 参与至少<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4次</span> <大型活动> 的视频的后期制作，包含军训、运动会等。</li>
                            <li>✓ 独立组织人员、编写剧本、导演剧情、拍摄、后期制作，完成“内卷风暴”<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4部</span>（包含预告片、上中下三部曲），发布于“小信息”官方 &lt;bilibili账号&gt; 与 <微信视频号> 中。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-1.jpg" alt="信息宣传与传媒中心照片1" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-2.jpg" alt="信息宣传与传媒中心照片2" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-3.jpg" alt="信息宣传与传媒中心照片3" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-4.jpg" alt="信息宣传与传媒中心照片4" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-5.jpg" alt="信息宣传与传媒中心照片5" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-6.jpg" alt="信息宣传与传媒中心照片6" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-7.jpg" alt="信息宣传与传媒中心照片7" class="experience-photo">
                    <img src="images/专业履历-课外-信息宣传与传媒中心-8.jpg" alt="信息宣传与传媒中心照片8" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module extracurricular-module notification" data-category="extracurricular">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">阳光体育<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;政府官方&nbsp;&nbsp;媒体</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2023年11月 - 2024年6月</div>
                    <p>受辅导员邀请、推荐，作为信息科学与工程学院<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">唯一代表</span>加入阳光体育。
                    <br>旨在培养能生动讲述 <体育故事>、有效传播 <体育精神> 的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">宣传人才</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 接受阳光体育线上培训，获得2023年阳光体育线上培训<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">结业证书</span>。</li>
                            <li>✓ 提供23年校内乒乓球新生赛、24年校内乒乓球新生赛、24年龙舟赛决赛等摄影素材。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-课外-阳光体育-1.jpg" alt="阳光体育照片1" class="experience-photo">
                </div>
            </div>
            
            <!-- 兴趣模块 - 4个 -->
            <div class="experience-module interests-module notification" data-category="interests">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">短视频平台<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;艺术设计&nbsp;&nbsp;自媒体</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2023年9月 - 今</div>
                    <p>本人通过苹果 &lt;iPone 14 Pro MAX&gt; 手机、华为 &lt;P50 pro&gt; 手机、<黑卡> 相机、黄金焦距 <24-108 SONY> 相机、长焦 <70-200 SONY> 相机、&lt;Insta 360&gt; 全景相机、大疆 &lt;MAVIC 3 Pro&gt; 无人机、大疆 &lt;MAVIC 4 Pro&gt; 无人机<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">摄影</span>，通过 <剪映> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">剪辑</span>的视频，通过 &lt;LightRoom&gt; <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">修图</span>。
                    <br>部分作品会在 <短视频平台> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">发布</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抖音</span>发布自己的 <摄影>、<航拍>、<剪辑> 作品等。其中第一个作品拍摄于23级军训期间，使用超过3公里的一镜到底、日转夜等，获得超<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">200</span>点赞量、超<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">200</span>转发量。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小红书</span>发布自己的 &lt;AIGC&gt; 创意作品。在1个月内获得近<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">500</span>粉丝，作品最多点赞量超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">700</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-兴趣-短视频平台-1.jpg" alt="短视频平台照片1" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-2.jpg" alt="短视频平台照片2" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-3.jpg" alt="短视频平台照片3" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-4.jpg" alt="短视频平台照片4" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-5.jpg" alt="短视频平台照片5" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-6.jpg" alt="短视频平台照片6" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-7.jpg" alt="短视频平台照片7" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-8.jpg" alt="短视频平台照片8" class="experience-photo">
                    <img src="images/专业履历-兴趣-短视频平台-9.jpg" alt="短视频平台照片9" class="experience-photo">
                </div>
            </div>

            <div class="experience-module interests-module notification" data-category="interests">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">哲风壁纸<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;艺术设计&nbsp;&nbsp;壁纸</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2025年4月</div>
                    <p>期间在 <哲风壁纸> 分享<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">12张</span>由<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Midjourney</span>和<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Procreate</span>制作的壁纸。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 获览<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">7.5万</span>，获截<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">621</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-兴趣-哲风壁纸-1.jpg" alt="哲风壁纸照片1" class="experience-photo">
                    <img src="images/专业履历-兴趣-哲风壁纸-2.jpg" alt="哲风壁纸照片2" class="experience-photo">
                    <img src="images/专业履历-兴趣-哲风壁纸-3.jpg" alt="哲风壁纸照片3" class="experience-photo">
                    <img src="images/专业履历-兴趣-哲风壁纸-4.jpg" alt="哲风壁纸照片4" class="experience-photo">
                    <img src="images/专业履历-兴趣-哲风壁纸-5.jpg" alt="哲风壁纸照片5" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module interests-module notification" data-category="interests">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Steam创意工坊<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;艺术设计&nbsp;&nbsp;游戏</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年9月 - 2025年1月</div>
                    <p>在游玩 <黑神话·悟空> 时，使用截图记录游戏中的重要场景、角色、事件、独特瞬间等。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 截图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1500+</span>。截图覆盖章节：黑风山（第一章）、黄风岭（第二章）、小西天（第三章）、花果山（第六章）。</li>
                            <li>✓ 制作壁纸<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1100+</span>，其中优胜者<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">400+</span>，“王中王”<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">100+</span>。“王中王”包含人物：白衣秀士、黑熊精、黄风大圣、抗金龙、魔将·莲眼、抗金星君、青背龙、大圣残躯。</li>
                            <li>✓ 有特定含义、意义或包含梗或构图精美者<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">400+</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-兴趣-Steam创意工坊-1.jpg" alt="Steam创意工坊照片1" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-2.jpg" alt="Steam创意工坊照片2" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-3.jpg" alt="Steam创意工坊照片3" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-4.jpg" alt="Steam创意工坊照片4" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-5.jpg" alt="Steam创意工坊照片5" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-6.jpg" alt="Steam创意工坊照片6" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-7.jpg" alt="Steam创意工坊照片7" class="experience-photo">
                    <img src="images/专业履历-兴趣-Steam创意工坊-8.jpg" alt="Steam创意工坊照片8" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module interests-module notification" data-category="interests">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">开球网<span style="font-size: 12px; font-weight: normal">&nbsp;&nbsp;— —&nbsp;&nbsp;体育&nbsp;&nbsp;乒乓球</span></h3>
                <div class="notibody">
                    <div class="module-subtitle">2024年8月 - 2024年9月</div>
                    <p>本人略微有<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">两面快攻弧圈</span>打法雏形，以正手拉球见长。
                    <br>个人乒乓球水平在华东理工大学内同年级<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">前十</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 参与<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3次</span>开球网比赛。其中包含一次积分赛。</li>
                            <li>✓ 期间挑战1450-1750分段选手超过12人；最高与1700+女选手交战得分10:12。</li>
                            <li>✓ 开球网目前积分<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1378分</span>，目前实际实力<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1450分</span>左右。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/专业履历-兴趣-开球网-1.png" alt="开球网照片1" class="experience-photo">
                    <img src="images/专业履历-兴趣-开球网-2.png" alt="开球网照片2" class="experience-photo">
                    <img src="images/专业履历-兴趣-开球网-3.png" alt="开球网照片3" class="experience-photo">
                </div>
            </div>

    </div>

        <!-- 底部区域 -->
        <footer class="home-footer">
            <h2 class="welcome-text">WELCOME</h2>
            <nav class="footer-nav">
                <a href="#home" class="footer-link">首页</a>
                <a href="#basic-info" class="footer-link">基本信息</a>
                <a href="#professional-experience" class="footer-link">专业履历</a>
                <a href="#skills" class="footer-link">技能介绍</a>
                <a href="#hobbies" class="footer-link">兴趣爱好</a>
                <a href="#contact" class="footer-link active">联系</a>
            </nav>
            <div class="footer-text">
                <!-- 预留文本区域供用户填写 -->
                <p>xwhinfo.site域名会保留10年(202511-203511)，10年之后域名可能会改为xwhintro.site</p>
            </div>
        </footer>
    `;
    
    // 转换模块格式为轮播图
    setTimeout(convertModulesToCarouselFormat, 100);
}

// 将图片容器转换为轮播图格式
try {
    // 创建一个一次性的转换函数，在页面加载完成后执行
    if (typeof convertModulesToCarouselFormat === 'undefined') {
        function convertModulesToCarouselFormat() {
            // 等待轮播图初始化完成
            setTimeout(() => {
                // 获取所有需要转换的模块
                const modulesWithPhotos = document.querySelectorAll('.experience-module, .skill-module');
                
                modulesWithPhotos.forEach(module => {
                    // 检查模块是否已经有轮播图
                    if (module.querySelector('.carousel-container')) {
                        return; // 已经是轮播图格式，跳过
                    }
                    
                    // 查找图片容器
                    const photoContainer = module.querySelector('.module-photos');
                    if (!photoContainer) {
                        return; // 没有图片容器，跳过
                    }
                    
                    // 获取所有图片
                    const photos = photoContainer.querySelectorAll('img');
                    if (photos.length === 0) {
                        return; // 没有图片，跳过
                    }
                    
                    // 创建轮播图容器
                    const carouselContainer = document.createElement('div');
                    carouselContainer.className = 'carousel-container';
                    
                    // 创建轮播图包装器
                    const carouselWrapper = document.createElement('div');
                    carouselWrapper.className = 'carousel-wrapper';
                    
                    // 将图片转换为轮播图项
                    photos.forEach(photo => {
                        const carouselItem = document.createElement('div');
                        carouselItem.className = 'carousel-item';
                        
                        // 复制图片并修改类名
                        const newPhoto = photo.cloneNode(true);
                        newPhoto.className = 'carousel-image';
                        
                        carouselItem.appendChild(newPhoto);
                        carouselWrapper.appendChild(carouselItem);
                    });
                    
                    // 初始化轮播图位置
                    carouselWrapper.dataset.position = '0';
                    
                    // 添加轮播图导航按钮前，检查图片是否超出一行
                    const itemWidth = 210; // 200px宽 + 10px margin（与moveCarousel函数保持一致）
                    
                    // 先将容器添加到DOM中以获取准确的尺寸（但不可见）
                    carouselContainer.style.visibility = 'hidden';
                    document.body.appendChild(carouselContainer);
                    
                    // 计算在当前容器宽度下可以显示的项目数量
                    const visibleItems = Math.floor(carouselContainer.clientWidth / itemWidth);
                    
                    // 判断是否需要滑动功能（当图片总数超过可显示数量时）
                    const needsScrolling = photos.length > visibleItems;
                    
                    // 从临时位置移除
                    document.body.removeChild(carouselContainer);
                    carouselContainer.style.visibility = '';
                    
                    // 重新添加轮播图包装器
                    carouselContainer.appendChild(carouselWrapper);
                    
                    // 仅在需要时添加导航按钮
                    if (needsScrolling) {
                        const leftButton = document.createElement('button');
                        leftButton.className = 'carousel-nav left';
                        leftButton.innerHTML = '&#10094;';
                        leftButton.onclick = function() { moveCarousel(-1); };
                        
                        const rightButton = document.createElement('button');
                        rightButton.className = 'carousel-nav right';
                        rightButton.innerHTML = '&#10095;';
                        rightButton.onclick = function() { moveCarousel(1); };
                        
                        carouselContainer.appendChild(leftButton);
                        carouselContainer.appendChild(rightButton);
                    }
                    
                    // 替换原始图片容器
                    photoContainer.parentNode.replaceChild(carouselContainer, photoContainer);
                });
            }, 500); // 延迟执行，确保页面内容已经加载完成
        }
        
        // 在页面加载完成后执行转换
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', convertModulesToCarouselFormat);
document.addEventListener('DOMContentLoaded', setupImageFallbacks);
document.addEventListener('DOMContentLoaded', setupDragScroll);
        } else {
            convertModulesToCarouselFormat();
        }
    }
} catch (e) {
    console.error('模块转换函数创建失败:', e);
}
    
    // 关闭轮播转换，保持图片原始布局
    window.convertModulesToCarouselFormat = function(){ return; };
    window.convertAllModulesToCarouselFormat = function(){ return; };
    window.initCarousels = function(){ return; };
    // 避免误调用
    // setTimeout(convertModulesToCarouselFormat, 100);

// 筛选专业履历
function filterProfessionalExperience(category) {
    // 更新标签按钮状态
    document.querySelectorAll('#professional-experience .section-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });
    
    // 筛选模块
    const modules = document.querySelectorAll('#professional-experience-content .experience-module, #professional-experience-content .skill-module');
    modules.forEach(module => {
        if (category === 'all' || module.dataset.category === category) {
            module.style.display = 'flex';
        } else {
            module.style.display = 'none';
        }
    });

    // 触发文字雨重新计算尺寸（仅在rain主题下）
    if (document.body.classList.contains('theme-rain')) {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }
}

// 切换专业履历标签页
function switchProfessionalTab(tabId) {
    // 隐藏所有标签页内容
    document.querySelectorAll('#professional-experience .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示目标标签页内容
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 更新标签按钮状态
    document.querySelectorAll('#professional-experience .section-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });
}

// 加载技能介绍页面
function loadSkills() {
    const container = document.getElementById('skills');
    
    container.innerHTML = `
        <!-- 顶部圆形头像 -->
        <div class="header-avatar">
            <img src="images/顶部-头像.jpg" alt="头像" class="avatar-image">
        </div>
        
        ${renderMainNav('skills')}
        
        <!-- 技能分类导航 -->
        <div class="section-nav">
            <button class="section-nav-btn active" onclick="filterSkills('all')">全部</button>
            <button class="section-nav-btn" onclick="filterSkills('programming')">编程</button>
            <button class="section-nav-btn" onclick="filterSkills('office')">办公</button>
            <button class="section-nav-btn" onclick="filterSkills('digital')">数字</button>
            <button class="section-nav-btn" onclick="filterSkills('creative')">创作</button>
            <button class="section-nav-btn" onclick="filterSkills('sports')">运动</button>
            <button class="section-nav-btn" onclick="filterSkills('music')">才艺</button>
        </div>
        <script>try{filterSkills('all')}catch(_){};</script>
        
        <!-- 技能内容区域 -->
        <div class="content-grid">
        <div id="skills-content">
            <!-- 编程模块 - 4个 -->
            <div class="skill-module programming-module notification" data-category="programming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Python</h3>
                <div class="notibody">
                    <div class="module-subtitle">学习 1年</div>
                    <p>能够熟练运用Python于领域：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据科学</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">机器学习</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">自动化</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">人工智能</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 大一下自学<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">爬虫</span>。学习来自 &lt;Python研究社&gt; 的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">bilibili</span>课程，包含 &lt;Web请求&gt;、&lt;Http协议&gt;、&lt;Require&gt;、&lt;Re解析&gt;（正则表达式）、&lt;Bs4解析&gt;、&lt;Xpath解析&gt;……</li>
                            <li>✓ 大一下学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">机器视觉</span>。学习公选课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《机器视觉算法实训》</span>，包含 <第1章-python编程基础>、<第2章-数字图像处理基础>、<第3章-图像增强>、<第4章-图像分割与边缘检测>、<第5章-深度学习>，课后完成。</li>
                            <li>✓ 大一下、大二上自学<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">PyTorch</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Transformer</span>。学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">李宏毅</span>老师的Transformer &lt;bilibili&gt; 课程等。</li>
                            <li>✓ 大二上自学<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">机器视觉</span>。在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Kaggle</span>等平台学习更多图像处理算法，包含 <锐化>、<阈值处理>、<裁剪>、<模糊>、<轮廓检测>、<形状识别与检测>、<背景去除> 等。</li>
                            <li>✓ 大二上自学<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">深度学习</span>。学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">英特尔AI开发者社区</span>的课程，完成 &lt;OpenVINO初级课程&gt; 和部分 &lt;OpenVINO中级课程&gt;。学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">华为云开发者学堂</span>的课程：<类神经网络训练不起来怎么办>、<鱼和熊掌可以兼得的深度学习>、<Transformer>。</li>
                            <li>✓ 大二下自学<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">语音合成</span>。流畅使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">项目</span>：&lt;ChatTTS&gt;、&lt;DDSP-SVC&gt;、&lt;Diffusion-SVC&gt;、&lt;GPT-SoVITS&gt;、&lt;Openvoice&gt;、&lt;Reflow-VAE-SVC&gt;、&lt;RVC&gt;。</li>
                            <li>✓ 大三上学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据挖掘</span>。学习公选课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《Python与金融数据挖掘》</span>。</li>
                            
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-编程-Python-1.jpg" alt="Python图片1" class="skill-photo">
                    <img src="images/技能介绍-编程-Python-2.jpg" alt="Python图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module programming-module notification" data-category="programming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">HTML & CSS & JavaScript</h3>
                <div class="notibody">
                    <div class="module-subtitle">学习 2年</div>
                    <p>能够熟练运用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">网页设计</span>，熟练前端编程语言：&lt;HTML5&gt;、&lt;CSS3&gt;、&lt;JavaScript&gt;。
                    <br>能够设计美观 <界面>、流畅 <动画>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 大一下学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">动态网页</span>。学习公选课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《动态网页设计》</span>。</li>
                            <li>✓ 大一下实践<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">网页前端</span>。学习必修课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《计算机职业实践》</span>，作为队员负责 <浏览器导航页> 的部分组件设计。</li>
                            <li>✓ 大二下学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据库</span>。学习必修课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《数据库原理》</span>，制作 <交流学习平台>。</li>
                            <li>✓ 大二下自练习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据库</span>。制作 <个人摄影作品分享网站>。</li>
                            <li>✓ 大三上自练习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">动态网页</span>。制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">个人信息展示网页</span>，包含5个版本：<个性创意款>（“凡科网”模板）、<简约款>（“起飞页”模板）、<明色调热门款>（弃用）、<暗色调自创款>（本网站）、<创新款>（在创建）。</li>
                            <li>✓ 大三上自练习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">网页前端</span>。制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">UIverse</span>，设计包含：&lt;Patterns&gt;、&lt;Buttons&gt;、&lt;Loaders&gt;、&lt;Checkboxes&gt;、&lt;Cards&gt;、&lt;Toggle switches&gt;……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-编程-HTMLCSSJavaScript-1.jpg" alt="HTMLCSSJavaScript图片1" class="skill-photo">
                    <img src="images/技能介绍-编程-HTMLCSSJavaScript-2.jpg" alt="HTMLCSSJavaScript图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module programming-module notification" data-category="programming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">JAVA & SQL</h3>
                <div class="notibody">
                    <div class="module-subtitle">学习 0.5年</div>
                    <p>可以简单完成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据库</span>相关功能，包括：<数据操作>、<数据定义>、<数据完整性>、<事务控制>、<权限控制>、<性能优化>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 大二下学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据库</span>。学习必修课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《数据库原理》</span>，制作 <交流学习平台>。</li>
                            <li>✓ 大二下自练习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数据库</span>。制作 <个人摄影作品分享网站>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-编程-JAVASQL-1.jpg" alt="JAVASQL图片1" class="skill-photo">
                    <img src="images/技能介绍-编程-JAVASQL-2.jpg" alt="JAVASQL图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module programming-module notification" data-category="programming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">C/C++</h3>
                <div class="notibody">
                    <div class="module-subtitle">学习 1.5年</div>
                    <p>简单学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">算法、开源硬件</span>相关功能，包括：。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 大一上学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">基础功能</span>。学习必修课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《计算机程序设计》</span>。</li>
                            <li>✓ 大一下学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">基础算法</span>。学习必修课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《算法与数据结构》</span>。</li>
                            <li>✓ 大二下学习<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">开源硬件</span>。学习必修课<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《基于开源硬件平台是智能感知实训》</span>，学习 &lt;Adurino&gt; 的基本功能及相关原件。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-编程-CC++-1.jpg" alt="CC++图片1" class="skill-photo">
                    <img src="images/技能介绍-编程-CC++-2.jpg" alt="CC++图片2" class="skill-photo">
                </div>
            </div>

            <!-- 办公模块 - 3个 -->
            <div class="skill-module office-module notification" data-category="office">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">PPT</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 8年</div>
                    <p>精通使用 &lt;PowerPoint&gt; 制作PPT。为<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">项目汇报</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">集体活动</span>制作。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>负责班内所有PPT制作，包括 <主题活动班会>、<春秋游总结会>、<大型集体活动总结会> 等，总数超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">8次</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>负责年级级别大型重要活动PPT制作，包括 <节日活动>、<学校公开活动>，总数超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3次</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>为比赛制作PPT汇报，包括 &lt;Future City&gt;、<水资源循环>，总数超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3次</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>为竞选制作PPT，如竞选 <大队长>、<荣誉> 等，总数超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">5次</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大学</span>为所有 <英语项目式课题> 制作PPT，共<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3次</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大学</span>为所有我所在 <项目式课题汇报> 制作PPT，共超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">5次</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-办公-PPT-1.gif" alt="PPT图片1" class="skill-photo">
                    <img src="images/技能介绍-办公-PPT-2.gif" alt="PPT图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module office-module notification" data-category="office">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">影刀RPA</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 6月</div>
                    <p>熟练运用 <影刀RPA>，用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">清洗</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">文件处理</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">基础AI任务</span>……
                    <br>RPA是一种<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">软件</span>模拟和集成通常由人类与数字系统进行交互的技术；
                    <br>RPA能够<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">捕获数据</span>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">运行程序</span>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">触发响应</span>，基于规则做出决定并与其他系统交互；
                    <br>RPA主要针对高度手动，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">重复</span>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">基于规则</span>，系统异常率低的标准数字输入的流程。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">影刀学院</span>，其中《影刀初级课程（2025版）》已学93%、《影刀中级课程》已学84%、《影刀专题课程》已学99%、《影刀AI Power初级课程》已学91%。</li>
                            <li>✓ 在 <外企德科> 实习，使用 <影刀RPA>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">清洗</span>三茅网论坛人力资源信息。</li>
                            <li>✓ 使用 <影刀RPA>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>海友网、智能鱼缸之家、南美水族的水族信息。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-办公-影刀RPA-1.png" alt="影刀RPA图片1" class="skill-photo">
                    <img src="images/技能介绍-办公-影刀RPA-2.png" alt="影刀RPA图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module office-module notification" data-category="office">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">文心智能体平台 & 扣子智能体平台 & 影刀 AI Power</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 6月</div>
                    <p>熟练运用 <文心智能体平台>、<扣子智能体平台>，用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">对话助理</span>。
                    <br>智能体平台可以<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">无代码搭建AI应用</span>：简单易用的搭建和调试运行、多元的AI大模型、丰富的AI组件、多样的使用方式、连接知识库；
                    <br>智能体平台可以<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">开箱即用AI业务工具</span>：文案创作、图片生成、智能表格、对话助理、内容分析。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用 <文心智能体平台>、<扣子智能体平台> 制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+个</span>智能体应用。</li>
                            <li>✓ 在 <外企德科> 实习，使用 <影刀RPA>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">清洗</span>三茅网论坛人力资源信息。</li>
                            <li>✓ 使用 <影刀RPA>，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓取</span>海友网、智能鱼缸之家、南美水族的水族信息。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-办公-文心智能体平台扣子智能体平台影刀AIPower-1.png" alt="文心智能体平台扣子智能体平台影刀AIPower图片1" class="skill-photo">
                    <img src="images/技能介绍-办公-文心智能体平台扣子智能体平台影刀AIPower-2.png" alt="文心智能体平台扣子智能体平台影刀AIPower图片2" class="skill-photo">
                    <img src="images/技能介绍-办公-文心智能体平台扣子智能体平台影刀AIPower-3.png" alt="文心智能体平台扣子智能体平台影刀AIPower图片3" class="skill-photo">
                    <img src="images/技能介绍-办公-文心智能体平台扣子智能体平台影刀AIPower-4.png" alt="文心智能体平台扣子智能体平台影刀AIPower图片4" class="skill-photo">
                    <img src="images/技能介绍-办公-文心智能体平台扣子智能体平台影刀AIPower-5.png" alt="文心智能体平台扣子智能体平台影刀AIPower图片5" class="skill-photo">
                    <img src="images/技能介绍-办公-文心智能体平台扣子智能体平台影刀AIPower-6.png" alt="文心智能体平台扣子智能体平台影刀AIPower图片6" class="skill-photo">
                </div>
            </div>

            <div class="skill-module office-module notification" data-category="office">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Goodnotes & Notability & BoardNotes & Notion</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 2年</div>
                    <p><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Goodnotes</span> & <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Notability</span>：专注于手写笔记和PDF标注的“数字纸和笔”，适合<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上课笔记</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">文件分析</span>；
                    <br><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">BoardNotes</span>：专注于无限画布和自由排版的“数字白板”，适合<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">流程图</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">头脑风暴</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">思维导图</span>；
                    <br><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Notion</span>：专注于结构化数据库的“全能工作空间”，适合<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">项目管理</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">知识库搭建</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Goodnotes</span>，手写<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">笔记</span>，比如记录 <大学学校课程笔记>、<草稿本>、<书籍笔记>、<记托福笔记> 等。</li>
                            <li>✓ 使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Notability</span>，手写<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">笔记</span>，比如 <分析文献>、<学习Ted>、<做四六级题目>、<书籍笔记> 等。</li>
                            <li>✓ 使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">BoardNotes</span>，进行带有文件的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">思维导图</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">流程图</span>，比如进行 <旅游规划> 等。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-办公-GoodnotesNotabilityBroadnotesNotion-1.jpg" alt="GoodnotesNotabilityBroadnotesNotion图片1" class="skill-photo">
                    <img src="images/技能介绍-办公-GoodnotesNotabilityBroadnotesNotion-2.jpg" alt="GoodnotesNotabilityBroadnotesNotion图片2" class="skill-photo">
                </div>
            </div>
            
            <!-- 数字模块 - 4个 -->
            <div class="skill-module digital-module notification" data-category="digital">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Midjourney</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 1年</div>
                    <p>使用Midjourney制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">壁纸</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">头像</span>……
                    <br>Midjourney<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">专注</span>AI生成图像与视频，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">核心技术</span>涵盖扩散模型(DDPM)，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">入选</span>《2025福布斯AI 50全榜单》</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 制图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">总量</span>超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">20000+</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小红书</span>发布作品，1月内获得近<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">500粉丝</span>，作品最多点赞量超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">700</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">哲风壁纸</span>发布作品，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">12</span>张壁纸，获览<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">7.5万</span>，获截<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">621</span>。</li>
                            <li>✓ 为<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">他处</span>，如 <头像>、<卡片>、&lt;U盘&gt;、<明信片>、<剪辑作品> 等，制作图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">200+</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-数字-Midjourney-1.jpg" alt="Midjourney图片1" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-2.jpg" alt="Midjourney图片2" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-3.jpg" alt="Midjourney图片3" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-4.jpg" alt="Midjourney图片4" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-5.jpg" alt="Midjourney图片5" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-6.jpg" alt="Midjourney图片6" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-7.jpg" alt="Midjourney图片7" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-8.jpg" alt="Midjourney图片8" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-9.jpg" alt="Midjourney图片9" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-10.jpg" alt="Midjourney图片10" class="skill-photo">
                    <img src="images/技能介绍-数字-Midjourney-11.jpg" alt="Midjourney图片11" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module digital-module notification" data-category="digital">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Stable Diffusion</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 1年</div>
                    <p>使用Stable Diffusion制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">商品背景图</span>……
                    <br>Stable Diffusion是<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">最流行</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">最强大</span>的开源AI绘画项目。
                    <br>中国最著名Stable Diffusion项目为由<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">秋葉aaaki</span>带领制作的 <绘世 - 启动器> <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">Stable Diffusion WebUI</span>，
                    <br>有<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">功能</span>：<文生图>、<图生图>、<后期处理>、&lt;PNG图片信息&gt;、<模型融合>、<训练>……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 制图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">总量</span>超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2000+</span>。</li>
                            <li>✓ 从 &lt;Cicitai&gt;、&lt;LiblibAI&gt;、<吐司>、&lt;Danbooru&gt; 下载、使用模型<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">20+</span>、VAE模型<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3+</span>、Lora模型<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-数字-Stable Diffusion-1.jpg" alt="Stable Diffusion图片1" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-2.jpg" alt="Stable Diffusion图片2" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-3.jpg" alt="Stable Diffusion图片3" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-4.jpg" alt="Stable Diffusion图片4" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-5.jpg" alt="Stable Diffusion图片5" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-6.jpg" alt="Stable Diffusion图片6" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-7.jpg" alt="Stable Diffusion图片7" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-8.jpg" alt="Stable Diffusion图片8" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-9.jpg" alt="Stable Diffusion图片9" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-10.jpg" alt="Stable Diffusion图片10" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-11.jpg" alt="Stable Diffusion图片11" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-12.jpg" alt="Stable Diffusion图片12" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-13.jpg" alt="Stable Diffusion图片13" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-14.jpg" alt="Stable Diffusion图片14" class="skill-photo">
                    <img src="images/技能介绍-数字-Stable Diffusion-15.jpg" alt="Stable Diffusion图片15" class="skill-photo">
                </div>
            </div>

            <div class="skill-module digital-module notification" data-category="digital">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">UniDream</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 1年</div>
                    <p>使用UniDream制作<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">AI扩图/消除</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">AI二维码</span>……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 制图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">总量</span>超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1500+</span>。</li>
                            <li>✓ 熟练运用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">功能</span>：<文生图>、<图生图>、&lt;AI局部改图&gt;、&lt;AI扩图&gt;、&lt;AI消除&gt;、&lt;AI字&gt;、&lt;AI二维码&gt;……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-数字-UniDream-1.jpg" alt="UniDream图片1" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-2.jpg" alt="UniDream图片2" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-3.jpg" alt="UniDream图片3" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-4.jpg" alt="UniDream图片4" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-5.jpg" alt="UniDream图片5" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-6.jpg" alt="UniDream图片6" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-7.jpg" alt="UniDream图片7" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-8.jpg" alt="UniDream图片8" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-9.jpg" alt="UniDream图片9" class="skill-photo">
                    <img src="images/技能介绍-数字-UniDream-10.jpg" alt="UniDream图片10" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module digital-module notification" data-category="digital">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">GPT-SoVITS</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 3月</div>
                    <p>使用GPT-SoVITS于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">合成</span>语音。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型，如 <林黛玉>、<杨戬>、<小黄龙>、<抗金星君>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">合成</span>语音，用于 <盲人导航系统> 的导航播报语音包、用于 <人力资源问答智能体> 的AI语音收录、用于 <Denoising Diffusion Probabilistic Model> 的开头配音。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-数字-GPT-SoVITS-1.png" alt="GPT-SoVITS图片1" class="skill-photo">
                    <img src="images/技能介绍-数字-GPT-SoVITS-2.png" alt="GPT-SoVITS图片2" class="skill-photo">
                    <img src="images/技能介绍-数字-GPT-SoVITS-3.png" alt="GPT-SoVITS图片3" class="skill-photo">
                    <img src="images/技能介绍-数字-GPT-SoVITS-4.png" alt="GPT-SoVITS图片4" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module digital-module notification" data-category="digital">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">RVC</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 3月</div>
                    <p>使用RVC于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">合成</span>歌曲。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练</span>音色模型，如 <林黛玉>、<杨戬>、<抗金星君>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">合成</span>歌曲，如用 <林黛玉> 的声音唱 <英语>《Burning Desires》、<日语>《甩葱歌》、<葡萄牙语>《MontagemNadaTropica》。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-数字-RVC-1.png" alt="RVC图片1" class="skill-photo">
                    <img src="images/技能介绍-数字-RVC-2.png" alt="RVC图片2" class="skill-photo">
                    <img src="images/技能介绍-数字-RVC-3.png" alt="RVC图片3" class="skill-photo">
                    <img src="images/技能介绍-数字-RVC-4.png" alt="RVC图片4" class="skill-photo">
                </div>
            </div>

            <!-- 创作模块 - 3个 -->
            <div class="skill-module creative-module notification" data-category="creative">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">剪映</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 6年</div>
                    <p>基本精通剪映，用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">剪辑娱乐视频</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">学业活动汇报视频</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">旅行记录视频</span>……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抖音</span>作品最高点赞数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">200+</span>、转发数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">200+</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">个人</span>用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+</span>，比如初中时为 <旅游>、<活动> 发朋友圈或自留。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">班级</span>用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3+</span>，比如初中时为 <班级活动>、<年级活动> 等制作总结、宣传视频。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">学生会</span>用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">5+</span>，比如大学时为 <乒乓球协会>、<信宣> 制作活动视频。</li>
                            <li>✓ 初中一次为班级做的年级活动视频：用镜头讲故事。我导演了一个由班级同学演出的课本中学过的故事的视频。其被老师用于参加比赛，并获得<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">普陀区一等奖</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-创作-剪映-1.jpg" alt="剪映图片1" class="skill-photo">
                    <img src="images/技能介绍-创作-剪映-2.jpg" alt="剪映图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module creative-module notification" data-category="creative">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Lightroom</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 1年</div>
                    <p>熟练运用Lightroom，用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">P图</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 为摄影作品美图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">80+</span>张。</li>
                            <li>✓ 为抖音图片作品P图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+</span>张。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-创作-Lightroom-1.jpg" alt="Lightroom图片1" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-2.jpg" alt="Lightroom图片2" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-3.jpg" alt="Lightroom图片3" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-4.jpg" alt="Lightroom图片4" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-5.jpg" alt="Lightroom图片5" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-6.jpg" alt="Lightroom图片6" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-7.jpg" alt="Lightroom图片7" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-8.jpg" alt="Lightroom图片8" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-9.jpg" alt="Lightroom图片9" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-10.jpg" alt="Lightroom图片10" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-11.jpg" alt="Lightroom图片11" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-12.jpg" alt="Lightroom图片12" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-13.jpg" alt="Lightroom图片13" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-14.jpg" alt="Lightroom图片14" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-15.jpg" alt="Lightroom图片15" class="skill-photo">
                    <img src="images/技能介绍-创作-Lightroom-16.jpg" alt="Lightroom图片16" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module creative-module notification" data-category="creative">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">Procreate</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 1.5年</div>
                    <p>熟悉Procreate基本功能并能熟练用于：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">艺术作品</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">头像</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">卡片</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">海报</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">P图</span>……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 画图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3</span>张，有：二次元女孩背影与模糊建筑、水面背景；以“日服第一枪”为核心的海报；大学比赛用作品。</li>
                            <li>✓ 修图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40+</span>张，有：大学学生会用摄影作品、《大学英语》项目用AI图片、数字艺术AIGC作品修改……</li>
                            <li>✓ 制作海报<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1</span>张，有：新生乒乓球赛海报。</li>
                            <li>✓ 制作头像<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3+</span>张，有：长城守望、抖音账号不会炸机的疆……</li>
                            <li>✓ 制作图标<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">60+</span>张，有：人力资源智能体、水族箱智能体、历史智能体、英语智能体、个人信息网站图标、InspireX图标、MINEREALM图标……</li>
                            <li>✓ 制作卡片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">80+</span>张，有：二次元人物卡片、动漫同人卡片、MINEREALM图标卡片、二维码卡片、黑神话·悟空卡片、明信片卡片、摄影作品卡片……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-创作-Procreate-1.jpg" alt="Procreate图片1" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-2.jpg" alt="Procreate图片2" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-3.jpg" alt="Procreate图片3" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-4.jpg" alt="Procreate图片4" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-5.jpg" alt="Procreate图片5" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-6.jpg" alt="Procreate图片6" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-7.jpg" alt="Procreate图片7" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-8.jpg" alt="Procreate图片8" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-9.jpg" alt="Procreate图片9" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-10.jpg" alt="Procreate图片10" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-11.jpg" alt="Procreate图片11" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-12.jpg" alt="Procreate图片12" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-13.jpg" alt="Procreate图片13" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-14.jpg" alt="Procreate图片14" class="skill-photo">
                    <img src="images/技能介绍-创作-Procreate-15.jpg" alt="Procreate图片15" class="skill-photo">
                </div>
            </div>
            
            <!-- 运动模块 - 4个 -->
            <div class="skill-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">乒乓球</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 4年</div>
                    <p>从高中 <体育专项课> 开始接触，高二高三迷上，几乎在校天天打，水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。
                    <br>之后到大学因为与高中球友分开，打球频率极度下滑。
                    <br>目前主要使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">球拍</span>：数字968、张本salc；目前主要使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">套胶</span>：红双喜狂飙3、蝴蝶T80、蝴蝶T19。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 开球网(上海)最高积分<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1400</span>，当前积分<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1378</span>（记录于2024-08-31），预估目前水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1450</span>。</li>
                            <li>✓ 擅长正手，逐渐形成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">两面快攻弧圈</span>打法。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-运动-乒乓球-1.jpg" alt="乒乓球图片1" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-2.jpg" alt="乒乓球图片2" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-3.jpg" alt="乒乓球图片3" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-4.jpg" alt="乒乓球图片4" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-5.jpg" alt="乒乓球图片5" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-6.jpg" alt="乒乓球图片6" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-7.jpg" alt="乒乓球图片7" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-8.jpg" alt="乒乓球图片8" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-9.jpg" alt="乒乓球图片9" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-10.jpg" alt="乒乓球图片10" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-11.jpg" alt="乒乓球图片11" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-12.jpg" alt="乒乓球图片12" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-13.jpg" alt="乒乓球图片13" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-14.jpg" alt="乒乓球图片14" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-15.jpg" alt="乒乓球图片15" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-16.jpg" alt="乒乓球图片16" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-17.jpg" alt="乒乓球图片17" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-18.jpg" alt="乒乓球图片18" class="skill-photo">
                    <img src="images/技能介绍-运动-乒乓球-19.jpg" alt="乒乓球图片19" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">台球</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 2.5年</div>
                    <p>在“非痴迷”同学中算<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中上游</span>。
                    <br>初中 <选修课> 选择台球，持续学习一年，在其中水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。期间主要学习 <美式台球>，同时少量接触学习 <斯诺克>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 初中学习台球 <选修课>，学会<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">基本杆法</span>。</li>
                            <li>✓ 可与未成长起来（在他达到八强水平的1年多前）的 <上海市业余赛八强> 水平同学打成接近<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">平手</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">偏好</span>瞄准进球，中式台球最多连续进球5个。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-运动-台球-1.jpg" alt="台球图片1" class="skill-photo">
                    <img src="images/技能介绍-运动-台球-2.jpg" alt="台球图片2" class="skill-photo">
                </div>
            </div>

            <div class="skill-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">羽毛球</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 3年</div>
                    <p>在“非痴迷”同学中算<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中上游</span>。
                    <br><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>学习过几年，在4个小学同班同学学员中排第3。原因是第一男生 <徐同学> 属于天赋异禀没法比，左手都能吊打所有人(他高中也是我同学)；第二是女生 <沈同学>，也很猛，在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">高中</span>之前我所遇到的所有同龄人中估计可以排第二-第四。因此在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中学</span>，我的羽毛球水平在同学中可以排进<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流顶级</span>。不过到<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">高中</span>由于学业繁忙没时间联系也没有好场地，导致技能退化。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>校内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">优秀</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>班内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数一数二</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">高中</span>校内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大学</span>校内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一般</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-运动-羽毛球-1.jpg" alt="羽毛球图片1" class="skill-photo">
                    <img src="images/技能介绍-运动-羽毛球-2.jpg" alt="羽毛球图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">滑雪</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 2年</div>
                    <p><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>时在美国猛犸象山与同小区朋友小马初次接触滑雪，几天滑雪没有摔过。之后<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>在长白山与当时最好朋友小学周同学一起学过，并可以滑<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“超级”滑道</span>(>30度)。之后因学业繁忙，就滑过几次，能力有所退步。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 初中时可以双板滑长白山<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“超级”滑道</span>、单板滑长白山<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“高级”赛道</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">双板</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">单板</span>都会；先学的双板，且使用双板时间更长。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-运动-滑雪-1.jpg" alt="滑雪图片1" class="skill-photo">
                    <img src="images/技能介绍-运动-滑雪-2.jpg" alt="滑雪图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">游泳</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 5年</div>
                    <p>对于只是会而非用于比赛的同学中，游泳水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。
                    <br>幼儿园、小学低年级时学过游泳；之后初二又学过游泳以应对中考体育，但后来由于新冠疫情，中考体育不考了，就没有再学。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 幼儿园、小学时游泳课程中，虽然姿势等属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上游</span>，但是耐力属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">垫底</span>。期间<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4种</span>泳姿都有学习，但其中蝶泳只得其形没有细学。</li>
                            <li>✓ 初中游泳课程中，可以达到中考<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">优秀</span>水平。耐力缺陷不在明显，于所有会游泳的学生中属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上游</span>，短距离速度属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。</li>
                            <li>✓ 大学游泳课程中，游泳姿势属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>，水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上游</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-运动-游泳-1.jpg" alt="游泳图片1" class="skill-photo">
                    <img src="images/技能介绍-运动-游泳-2.jpg" alt="游泳图片2" class="skill-photo">
                </div>
            </div>

            <div class="skill-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">冲浪</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 3天</div>
                    <p>属于仅能站起的入门新手。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 初中时与朋友小学周同学(当时最好朋友)、小学王同学(小学学习成绩除语文外其他课内外断档领先)一起在泰国旅游时学习冲浪3天，我是其中第一个能够独立站起来的。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-运动-冲浪-1.jpg" alt="冲浪图片1" class="skill-photo">
                    <img src="images/技能介绍-运动-冲浪-2.jpg" alt="冲浪图片2" class="skill-photo">
                </div>
            </div>

            <!-- 才艺模块 - 5个 -->
            <div class="skill-module music-module notification" data-category="music">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">钢琴</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 7年</div>
                    <p>从小学习钢琴，在同龄人中属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上游</span>，在同层次学生中属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">努力型</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 考级：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">三级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">五级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">六级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">七级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">八级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">九级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">十级</span></li>
                            <li>✓ 同老师的 <学生会面交流>（<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">4+</span>次）中正常表现。</li>
                            <li>✓ 小学在一次 <校外活动聚会> 时，上台演奏。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-才艺-钢琴-1.jpg" alt="钢琴图片1" class="skill-photo">
                    <img src="images/技能介绍-才艺-钢琴-2.jpg" alt="钢琴图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module music-module notification" data-category="music">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">小号</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 6年</div>
                    <p><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>被老师测试推荐学习小号，并加入 <管乐队>；<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>加入 <管乐班>，同样加入 <管乐队>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 考级：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">三级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">五级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">六级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">七级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">八级</span></li>
                            <li>✓ 在校管乐队担任<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">二声部成员</span>2年、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一声部首席</span>1周。集体比赛有获得<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">国家级一等奖</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">市级一等奖</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>在校管乐队轮流担任<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">三声部首席</span>。集体比赛有获得<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">国家级一等奖</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">市级一等奖</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-才艺-小号-1.jpg" alt="小号图片1" class="skill-photo">
                    <img src="images/技能介绍-才艺-小号-2.jpg" alt="小号图片2" class="skill-photo">
                </div>
            </div>
            
            <div class="skill-module music-module notification" data-category="music">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">书法</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 5年</div>
                    <p><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>期间于 <师大一村> 学习书法课，两位老师（都是 <中国书法协会> 中的成员，尤其是主教老师，身份人脉不低）指导我学习。我于其中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>，二位老师对我夸赞有佳。主教老师为我起雅号“<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">迎风</span>”。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 考级：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">三级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">五级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">六级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">七级</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">八级</span></li>
                            <li>✓ 为家中写春联2次，为前门、后门写2幅<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">对联</span>，为房间门、横推们写5个<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">福字</span>，为大厅写<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“招财进宝”</span></li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-才艺-书法-1.jpg" alt="书法图片1" class="skill-photo">
                    <img src="images/技能介绍-才艺-书法-2.jpg" alt="书法图片2" class="skill-photo">
                </div>
            </div>

            <div class="skill-module music-module notification" data-category="music">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">国画</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 3年</div>
                    <p>与书法同样，<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>期间于 <师大一村> 学习国画课。我于其中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 课程中学习绘画：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">梅</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">兰</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">竹</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">菊</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">牡丹</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">荷花</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">虾</span>……</li>
                            <li>✓ 课程中有至少3次<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">户外写生</span>。</li>
                            <li>✓ 课程中有至少3次<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">实用趣味活动</span>，比如 <在扇子上绘画> 等。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-才艺-国画-1.jpg" alt="国画图片1" class="skill-photo">
                    <img src="images/技能介绍-才艺-国画-2.jpg" alt="国画图片2" class="skill-photo">
                </div>
            </div>

            <div class="skill-module music-module notification" data-category="music">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">跆拳道 & 空手道</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 3年</div>
                    <p><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">幼儿园</span>期间学习跆拳道、空手道。我于其中水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上游</span>，尤其擅长 <倒立>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 课程中学习绘画：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">梅</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">兰</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">竹</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">菊</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">牡丹</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">荷花</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">虾</span>……</li>
                            <li>✓ 课程中有至少3次<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">户外写生</span>。</li>
                            <li>✓ 课程中有至少3次<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">实用趣味活动</span>，比如 <在扇子上绘画> 等。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/技能介绍-才艺-跆拳道空手道-1.jpg" alt="跆拳道空手道图片1" class="skill-photo">
                    <img src="images/技能介绍-才艺-跆拳道空手道-2.jpg" alt="跆拳道空手道图片2" class="skill-photo">
                </div>
            </div>
        </div>
        
        <!-- 初始化复制按钮功能 -->
        <script>
            setupCopyButtons();
        </script>

        <!-- 底部区域 -->
        <footer class="home-footer">
            <h2 class="welcome-text">WELCOME</h2>
            <nav class="footer-nav">
                <a href="#home" class="footer-link">首页</a>
                <a href="#basic-info" class="footer-link">基本信息</a>
                <a href="#professional-experience" class="footer-link">专业履历</a>
                <a href="#skills" class="footer-link">技能介绍</a>
                <a href="#hobbies" class="footer-link">兴趣爱好</a>
                <a href="#contact" class="footer-link active">联系</a>
            </nav>
            <div class="footer-text">
                <!-- 预留文本区域供用户填写 -->
                <p>xwhinfo.site域名会保留10年(202511-203511)，10年之后域名可能会改为xwhintro.site</p>
            </div>
        </footer>
    `;
    
    // 转换模块格式为轮播图
    setTimeout(convertModulesToCarouselFormat, 100);
}

// 筛选技能
function filterSkills(category) {
    // 更新标签按钮状态
    document.querySelectorAll('#skills .section-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });
    
    // 筛选模块
    const modules = document.querySelectorAll('#skills-content .skill-module');
    modules.forEach(module => {
        if (category === 'all' || module.dataset.category === category) {
            module.style.display = 'flex';
        } else {
            module.style.display = 'none';
        }
    });

    // 触发文字雨重新计算尺寸（仅在rain主题下）
    if (document.body.classList.contains('theme-rain')) {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }
}

// 加载兴趣爱好页面
function loadHobbies() {
    const container = document.getElementById('hobbies');
    
    container.innerHTML = `
        <!-- 顶部圆形头像 -->
        <div class="header-avatar">
            <img src="images/顶部-头像.jpg" alt="头像" class="avatar-image">
        </div>
        
        ${renderMainNav('hobbies')}
        
        <!-- 兴趣爱好分类导航 -->
        <div class="section-nav">
            <button class="section-nav-btn active" onclick="filterHobbies('all')">全部</button>
            <button class="section-nav-btn" onclick="filterHobbies('photography')">摄影</button>
            <button class="section-nav-btn" onclick="filterHobbies('art')">艺术</button>
            <button class="section-nav-btn" onclick="filterHobbies('travel')">旅行</button>
            <button class="section-nav-btn" onclick="filterHobbies('gaming')">游戏</button>
            <button class="section-nav-btn" onclick="filterHobbies('sports')">运动</button>
            <button class="section-nav-btn" onclick="filterHobbies('life')">生活</button>
        </div>
        <script>try{filterHobbies('all')}catch(_){};</script>
        
        <!-- 预览图片区域 -->
        <div class="content-grid">
        
        <!-- 兴趣爱好内容区域 -->
        <div id="hobbies-content">
            <!-- 摄影作品模块 - 3个 -->
            <div class="experience-module photography-module notification" data-category="photography">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">相机摄影</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 9年</div>
                    <p>本人摄影水平于业余爱好者中一直处于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数一数二</span>。
                    <br>擅长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓拍</span> = <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">摄影眼</span>(发现平凡中的不平凡……) >= <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">景物摄影</span> >= <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">实物摄影</span>。
                    <br>使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">器材</span>：黑卡、SONY7a2(微单)、DJI pocket 1(手持云台)、Insta 360(全景相机)、DJI RS3(相机云台)。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 拍摄所有照片估计超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40000张</span>，占存储空间超<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2T</span>。</li>
                            <li>✓ 作品用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">记录生活</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">创作作品</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">记录集体活动</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">宣传集体活动</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">参加比赛</span>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-摄影-相机摄影-1.jpg" alt="相机摄影图片1" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-2.jpg" alt="相机摄影图片2" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-3.jpg" alt="相机摄影图片3" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-4.jpg" alt="相机摄影图片4" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-5.jpg" alt="相机摄影图片5" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-6.jpg" alt="相机摄影图片6" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-7.jpg" alt="相机摄影图片7" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-相机摄影-8.jpg" alt="相机摄影图片8" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module photography-module notification" data-category="photography">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">无人机航拍</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 3年</div>
                    <p>本人航拍水平于业余爱好者中处于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数一数二</span>。
                    <br>擅长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">运镜</span>(水平虽与网红技术博主差距尚远，但也与同龄顶级爱好者拉开差距)、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">超视距摄影</span>。
                    <br>使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">器材</span>：MAVIC Air -> MAVIC 3 Pro -> MAVIC 4 Pro。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 拍摄所有视频估计超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">300段</span>、所有照片估计超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">400张</span>，占存储空间超<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">800G</span>。</li>
                            <li>✓ 作品用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">创作作品</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">记录生活</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">记录集体活动</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">宣传集体活动</span>……</li>
                            <li>✓ 使用 &lt;MAVIC 3 Pro&gt; 飞行总里程<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">302km</span>、飞行总时长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">20.7h</span>、飞行次数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">93</span>、单次最远里程<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">12.8km</span>、单次最高高度<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">499m</span>，单次最长时长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">33min</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-摄影-无人机航拍-1.jpg" alt="无人机航拍图片1" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-2.jpg" alt="无人机航拍图片2" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-3.jpg" alt="无人机航拍图片3" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-4.jpg" alt="无人机航拍图片4" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-5.jpg" alt="无人机航拍图片5" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-6.jpg" alt="无人机航拍图片6" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-7.jpg" alt="无人机航拍图片7" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-无人机航拍-8.jpg" alt="无人机航拍图片8" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module photography-module notification" data-category="photography">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">手机摄影</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 9年</div>
                    <p>本人摄影水平于业余爱好者中一直处于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数一数二</span>。
                    <br>擅长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">抓拍</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">摄影眼</span>(发现平凡中的不平凡……)、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">创新</span>(找角度、构图、内容、参数等，使得照片更有表现力、深意等)。
                    <br>使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">器材</span>：iPhone 5 -> iPhone 6 -> iPhone 10 -> iPhone 14 Pro MAX，HUAWEI P50 pro。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 拍摄所有视频估计超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">500段</span>、所有照片估计超过<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10000张</span>，占存储空间超<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">45G</span>。</li>
                            <li>✓ 作品用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">记录生活</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">创作作品</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">记录集体活动</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">宣传集体活动</span>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-摄影-手机摄影-1.jpg" alt="手机摄影图片1" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-2.jpg" alt="手机摄影图片2" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-3.jpg" alt="手机摄影图片3" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-4.jpg" alt="手机摄影图片4" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-5.jpg" alt="手机摄影图片5" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-6.jpg" alt="手机摄影图片6" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-7.jpg" alt="手机摄影图片7" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-8.jpg" alt="手机摄影图片8" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-9.jpg" alt="手机摄影图片9" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-10.jpg" alt="手机摄影图片10" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-11.jpg" alt="手机摄影图片11" class="experience-photo">
                    <img src="images/兴趣爱好-摄影-手机摄影-12.jpg" alt="手机摄影图片12" class="experience-photo">
                </div>
            </div>
            
            <!-- 艺术模块 - 3个 -->
            <div class="experience-module art-module notification" data-category="art">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">数字艺术</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 2年</div>
                    <p>本人创作数字艺术水平（运气好时）不错。
                    <br>使用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">AI工具</span>制作数字艺术作品。使用 <即时AI>、&lt;Unidream&gt;、&lt;Midjourney&gt;、&lt;Stable Diffusion&gt; 合成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">图片</span>，使用 &lt;GPT-SoVITS&gt;、&lt;RVC&gt; 合成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">音频</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ <即时AI> 合成图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3000+</span>。用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>……</li>
                            <li>✓ &lt;Uni Dream&gt; 合成图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1500+</span>。用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">修图</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">风格转换</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">二维码</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">文字</span>……</li>
                            <li>✓ &lt;Midjourney&gt; 合成图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">20000+</span>。用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">修图</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">风格转换</span>……</li>
                            <li>✓ &lt;Stable Diffusion&gt; 合成图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2000+</span>。用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">修图</span>……</li>
                            <li>✓ &lt;GPT-SoVITS&gt; 合成语音<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">100+</span>。用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">语音播报</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">视频配音</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">训练音色模型</span>……</li>
                            <li>✓ &lt;RVC&gt; 合成歌曲<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">15+</span>。用于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字艺术</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">视频配音</span>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-艺术-数字艺术-1.jpg" alt="数字艺术作品1" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-2.jpg" alt="数字艺术作品2" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-3.jpg" alt="数字艺术作品3" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-4.jpg" alt="数字艺术作品4" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-5.jpg" alt="数字艺术作品5" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-6.jpg" alt="数字艺术作品6" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-7.jpg" alt="数字艺术作品7" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-8.jpg" alt="数字艺术作品8" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-9.jpg" alt="数字艺术作品9" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-10.jpg" alt="数字艺术作品10" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-11.jpg" alt="数字艺术作品11" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-12.jpg" alt="数字艺术作品12" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-数字艺术-13.jpg" alt="数字艺术作品13" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module art-module notification" data-category="art">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">后期制作</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 6年</div>
                    <p>本人进行后期制作水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数一数二</span>。
                    <br>使用 <剪映> 剪辑<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">视频</span>，使用 &lt;Lightroom&gt;、<美图秀秀>、&lt;Midjourney&gt; 美化<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">图片</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ <剪映> 剪辑视频<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">60+</span>。短视频平台用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+</span>；班级用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3+</span>；学生会用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">5+</span>。</li>
                            <li>✓ &lt;Lightroom&gt; 美化图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">100+</span>。短视频平台用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">15+</span>；项目用作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3</span>。</li>
                            <li>✓ <美图秀秀> 美化图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1000+</span>。朋友圈用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">30+</span>；项目用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10+</span>。</li>
                            <li>✓ &lt;Midjourney&gt; 美化图片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40+</span>。学业用<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40+</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-艺术-后期制作-1.jpg" alt="后期制作作品1" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-后期制作-2.jpg" alt="后期制作作品2" class="experience-photo">
                </div>
            </div>

            <div class="experience-module art-module notification" data-category="art">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">平板手绘</h3>
                <div class="notibody">
                    <div class="module-subtitle">使用 2年</div>
                    <p>本人不那么擅长绘画，但是对于能够画出的内容，效果<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">尚可</span>。
                    <br>使用 &lt;Procreate&gt; 绘制<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">图片</span>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ Procreate绘制作品<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">200+</span>。画图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3</span>；修图<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">40+</span>；制作海报<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1</span>；制作头像<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3+</span>；制作图标<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">60+</span>；制作卡片<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">80+</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-艺术-平板手绘-1.jpg" alt="平板手绘作品1" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-2.jpg" alt="平板手绘作品2" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-3.jpg" alt="平板手绘作品3" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-4.jpg" alt="平板手绘作品4" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-5.jpg" alt="平板手绘作品5" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-6.jpg" alt="平板手绘作品6" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-7.jpg" alt="平板手绘作品7" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-8.jpg" alt="平板手绘作品8" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-9.jpg" alt="平板手绘作品9" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-10.jpg" alt="平板手绘作品10" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-11.jpg" alt="平板手绘作品11" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-12.jpg" alt="平板手绘作品12" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-13.jpg" alt="平板手绘作品13" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-14.jpg" alt="平板手绘作品14" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-15.jpg" alt="平板手绘作品15" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-16.jpg" alt="平板手绘作品16" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-17.jpg" alt="平板手绘作品17" class="experience-photo">
                    <img src="images/兴趣爱好-艺术-平板手绘-18.jpg" alt="平板手绘作品18" class="experience-photo">
                </div>
            </div>
            
            <!-- 旅行模块 - 3个 -->
            <div class="experience-module travel-module notification" data-category="travel">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">日本</h3>
                <div class="notibody">
                    <div class="module-subtitle">旅行 4次</div>
                    <p>日本距离上海近、便宜、汇率好、相对安全、服务好，是离上海最方便出国的地方。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 城市：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">东京</span>、京都、大阪、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">北海道</span>、名古屋、长野、松本、白马、伊豆……</li>
                            <li>✓ 景点：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">秋叶原</span>、新宿、池袋、涩谷……</li>
                            <li>✓ 美食店：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">和牛焼肉</span>(烤肉)……</li>
                            <li>✓ 商店：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">骏河屋</span>(二次元)、BOOK OFF(中古)、HARD OFF(中古)、LOFT(商场)、吉卜力橡子共和国(宫崎骏)……</li>
                            <li>✓ 酒店：</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-旅游-日本-1.jpg" alt="日本照片1" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-2.jpg" alt="日本照片2" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-3.jpg" alt="日本照片3" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-4.jpg" alt="日本照片4" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-5.jpg" alt="日本照片5" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-6.jpg" alt="日本照片6" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-7.jpg" alt="日本照片7" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-8.jpg" alt="日本照片8" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-9.jpg" alt="日本照片9" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-10.jpg" alt="日本照片10" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-11.jpg" alt="日本照片11" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-12.jpg" alt="日本照片12" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-13.jpg" alt="日本照片13" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-14.jpg" alt="日本照片14" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-16.jpg" alt="日本照片16" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-17.jpg" alt="日本照片17" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-18.jpg" alt="日本照片18" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-19.jpg" alt="日本照片19" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-20.jpg" alt="日本照片20" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-21.jpg" alt="日本照片21" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-22.jpg" alt="日本照片22" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-23.jpg" alt="日本照片23" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-24.jpg" alt="日本照片24" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-25.jpg" alt="日本照片25" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-日本-26.jpg" alt="日本照片26" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module travel-module notification" data-category="travel">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">中国</h3>
                <div class="notibody">
                    <div class="module-subtitle">旅行 10+次</div>
                    <p>中国人哪有不在中国旅游的？</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 城市：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">南京</span>(外公外婆家)、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上海</span>(我家)、苏州、杭州、海南(沙滩)、长白山(滑雪)……</li>
                            <li>✓ 景点：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">西湖</span>(杭州)、莫愁湖(南京)、外滩(上海)……</li>
                            <li>✓ 美食店：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">绿茶</span>(东坡肉、猫耳朵)……</li>
                            <li>✓ 商店：</li>
                            <li>✓ 酒店：西湖希尔顿酒店。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-旅游-中国-1.jpg" alt="中国照片1" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-中国-2.jpg" alt="中国照片2" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module travel-module notification" data-category="travel">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">美国</h3>
                <div class="notibody">
                    <div class="module-subtitle">旅行 6+次</div>
                    <p>美国乃当今除中国外另一大国，集合许多中国不多见的地形、有名景点、旅游去处……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 城市：旧金山、洛杉矶、拉斯维加斯……</li>
                            <li>✓ 景点：<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">黄石公园</span>、迪士尼、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">环球影城</span>……</li>
                            <li>✓ 美食店：</li>
                            <li>✓ 商店：</li>
                            <li>✓ 酒店：</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-旅游-美国-1.jpg" alt="美国照片1" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-美国-2.jpg" alt="美国照片2" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module travel-module notification" data-category="travel">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">欧洲</h3>
                <div class="notibody">
                    <div class="module-subtitle">旅行 1次</div>
                    <p>欧洲多国有多种多样、丰富多彩的历史、建筑、文化……</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 城市：</li>
                            <li>✓ 景点：</li>
                            <li>✓ 美食店：</li>
                            <li>✓ 商店：</li>
                            <li>✓ 酒店：</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-旅游-欧洲-1.jpg" alt="欧洲照片1" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-欧洲-2.jpg" alt="欧洲照片2" class="experience-photo">
                </div>
            </div>

            <div class="experience-module travel-module notification" data-category="travel">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">泰国</h3>
                <div class="notibody">
                    <div class="module-subtitle">旅行 3+次</div>
                    <p>大海、沙滩……浮潜、冲浪……泰国相比中国海南，可以说是国外提升版，在景色、景点方面会更加丰富一些。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 城市：</li>
                            <li>✓ 景点：</li>
                            <li>✓ 美食店：</li>
                            <li>✓ 商店：</li>
                            <li>✓ 酒店：</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-旅游-泰国-1.jpg" alt="泰国照片1" class="experience-photo">
                    <img src="images/兴趣爱好-旅游-泰国-2.jpg" alt="泰国照片2" class="experience-photo">
                </div>
            </div>

            <!-- 游戏模块 - 3个 -->
            <div class="experience-module gaming-module notification" data-category="gaming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">我的世界</h3>
                <div class="notibody">
                    <div class="module-subtitle">8年玩家</div>
                    <p>主要玩<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">单人创造</span>><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">单人生存</span>，但是非常希望可以多人生存、跑酷、PVP、创造。
                    <br><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">游戏理念</span>是致力于创建理想的异世界生活区、尽可能不破坏环境、尽可能少利用游戏漏洞或生物刷新特性；<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">建筑理念</span>是追寻符合游戏与现实世界的基本设定，以功能、实用为主，美观为辅；<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">红石理念</span>是实用、隐藏。
                    <br>初中时，在与当时最好朋友小学周同学去美国的飞机上，看到他玩国际版Minecraft，感觉好玩，因而下载游玩。之后一直偶尔拿出来玩，与小学同学聚会时也会一起玩。可惜的是之后国际版Minecraft和再往后的网易我的世界账号都丢了，现在我玩的是网易我的世界。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 国际版Minecraft（账号丢失）游戏时长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2000h+</span>，主要种子数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">3+</span>。</li>
                            <li>✓ 网易我的世界（账号丢失）游戏时长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">5000h+</span>，主要种子数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">2+</span>。</li>
                            <li>✓ 网易我的世界（目前在玩）游戏时长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1000h+</span>，主要种子数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-游戏-我的世界-1.jpg" alt="我的世界图片1" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-2.jpg" alt="我的世界图片2" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-3.jpg" alt="我的世界图片3" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-4.jpg" alt="我的世界图片4" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-5.jpg" alt="我的世界图片5" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-6.jpg" alt="我的世界图片6" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-7.jpg" alt="我的世界图片7" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-8.jpg" alt="我的世界图片8" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-9.jpg" alt="我的世界图片9" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-10.jpg" alt="我的世界图片10" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-11.jpg" alt="我的世界图片11" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-12.jpg" alt="我的世界图片12" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-13.jpg" alt="我的世界图片13" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-14.jpg" alt="我的世界图片14" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-15.jpg" alt="我的世界图片15" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-16.jpg" alt="我的世界图片16" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-17.jpg" alt="我的世界图片17" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-18.jpg" alt="我的世界图片18" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-19.jpg" alt="我的世界图片19" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-20.jpg" alt="我的世界图片20" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-21.jpg" alt="我的世界图片21" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-22.jpg" alt="我的世界图片22" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-23.jpg" alt="我的世界图片23" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-24.jpg" alt="我的世界图片24" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-25.jpg" alt="我的世界图片25" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-我的世界-26.jpg" alt="我的世界图片26" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module gaming-module notification" data-category="gaming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">皇室战争</h3>
                <div class="notibody">
                    <div class="module-subtitle">8年玩家</div>
                    <p>好玩爱玩，小时候大家都玩；最火手游。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 最高奖杯数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">8530</span>。</li>
                            <li>✓ 目前奖杯数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">8530</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">9年</span>皇室玩家纪念。</li>
                            <li>✓ 胜场<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1924</span>。</li>
                            <li>✓ 三皇冠胜利次数<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1258</span>。</li>
                            <li>✓ 挑战模式最多胜场<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">10</span>。</li>
                            <li>✓ 天梯最高连胜胜场<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">11</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-游戏-皇室战争-1.jpg" alt="皇室战争图片1" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-2.jpg" alt="皇室战争图片2" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-3.jpg" alt="皇室战争图片3" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-4.jpg" alt="皇室战争图片4" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-5.jpg" alt="皇室战争图片5" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-6.jpg" alt="皇室战争图片6" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-7.jpg" alt="皇室战争图片7" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-8.jpg" alt="皇室战争图片8" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-9.jpg" alt="皇室战争图片9" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-10.jpg" alt="皇室战争图片10" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-11.jpg" alt="皇室战争图片11" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-12.jpg" alt="皇室战争图片12" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-13.jpg" alt="皇室战争图片13" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-14.jpg" alt="皇室战争图片14" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-15.jpg" alt="皇室战争图片15" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-16.jpg" alt="皇室战争图片16" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-17.jpg" alt="皇室战争图片17" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-18.jpg" alt="皇室战争图片18" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-皇室战争-19.jpg" alt="皇室战争图片19" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module gaming-module notification" data-category="gaming">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">黑神话·悟空</h3>
                <div class="notibody">
                    <div class="module-subtitle">1年玩家</div>
                    <p>我是3A“魂类”游戏<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">新手</span>，水平于新手中属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">上乘</span>。
                    <br><黑神话·悟空> 既是中国<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">首款</span>真正3A游戏，又是<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">《西游记》</span>主题。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 解锁<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">81</span>/81(100%)所有成就。</li>
                            <li>✓ 完成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">三周目</span>，游戏时间<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">220h+</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">披挂</span>习惯使用：<行者套>、<大力套>……</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">武器</span>习惯使用：<鲲棍·通天>、<三尖两刃枪>、<混铁棍>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">法宝</span>习惯使用：<辟火罩>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">其他</span>习惯使用 <青天葫芦>；从不使用 <丹药>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">精魄</span>习惯使用：<幽魂>、<波波浪浪>、<虎伥>……</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">法术</span>习惯使用：<劈棍>、<戳棍>，<定身法>、<禁字法>，<聚形散气>，<身外身法>、<救命毫毛>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">变化</span>习惯使用：<广智>、<小黄龙>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-1.jpg" alt="黑神话悟空图片1" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-2.jpg" alt="黑神话悟空图片2" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-3.jpg" alt="黑神话悟空图片3" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-4.jpg" alt="黑神话悟空图片4" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-5.jpg" alt="黑神话悟空图片5" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-6.jpg" alt="黑神话悟空图片6" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-7.jpg" alt="黑神话悟空图片7" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-8.jpg" alt="黑神话悟空图片8" class="experience-photo">
                    <img src="images/兴趣爱好-游戏-黑神话悟空-9.jpg" alt="黑神话悟空图片9" class="experience-photo">
                </div>
            </div>
            
            <!-- 运动模块 - 3个 -->
            <div class="experience-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">乒乓球</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 4年</div>
                    <p>从高中 <体育专项课> 开始接触，高二高三迷上，几乎在校天天打，水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。
                    <br>之后到大学因为与高中球友分开，打球频率极度下滑。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 开球网(上海)最高积分<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1400</span>，当前积分<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1378</span>（记录于2024-08-31），预估目前水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">1450</span>。</li>
                            <li>✓ 逐渐形成<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">两面快攻弧圈</span>打法。</li>    
                            <li>✓ 擅长<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">近台正手拉下旋</span> = <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">侧身爆冲</span> = <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">下意识快反应回球</span> >= <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中台反拉</span> >= <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中台对拉</span> > <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">搓球</span> = <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">反手切</span> >= <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">放高</span>。</li>
                            <li>✓ 中国红双喜<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数字968</span>：擅长控制、旋转；但反手使用较为吃力，难以应对较快球速的球。</li>
                            <li>✓ 日本蝴蝶<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">超级张本智和alc</span>：擅长速度、反手、控制；但弧线对我来说较长，容易出台。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-运动-乒乓球-1.jpg" alt="乒乓球图片1" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-2.jpg" alt="乒乓球图片2" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-3.jpg" alt="乒乓球图片3" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-4.jpg" alt="乒乓球图片4" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-5.jpg" alt="乒乓球图片5" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-6.jpg" alt="乒乓球图片6" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-7.jpg" alt="乒乓球图片7" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-8.jpg" alt="乒乓球图片8" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-9.jpg" alt="乒乓球图片9" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-10.jpg" alt="乒乓球图片10" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-11.jpg" alt="乒乓球图片11" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-12.jpg" alt="乒乓球图片12" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-13.jpg" alt="乒乓球图片13" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-14.jpg" alt="乒乓球图片14" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-15.jpg" alt="乒乓球图片15" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-16.jpg" alt="乒乓球图片16" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-17.jpg" alt="乒乓球图片17" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-18.jpg" alt="乒乓球图片18" class="experience-photo">
                    <img src="images/兴趣爱好-运动-乒乓球-19.jpg" alt="乒乓球图片19" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">台球</h3>
                <div class="notibody">
                    <div class="module-subtitle">练习 2.5年</div>
                    <p>在“非痴迷”同学中算<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">中上游</span>。
                    <br>初中 <选修课> 选择台球，持续学习一年，在其中水平属于<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。期间主要学习 <美式台球>，同时少量接触学习 <斯诺克>。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>校内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">优秀</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>班内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">数一数二</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">高中</span>校内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一流</span>。</li>
                            <li>✓ 在<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">大学</span>校内爱好者中水平<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">一般</span>。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-运动-台球-1.jpg" alt="台球图片1" class="experience-photo">
                    <img src="images/兴趣爱好-运动-台球-2.jpg" alt="台球图片2" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module sports-module notification" data-category="sports">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">滑雪</h3>
                <div class="notibody">
                    <div class="module-subtitle">周末活动</div>
                    <p><span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小学</span>时在美国猛犸象山与同小区朋友小马初次接触滑雪，几天滑雪没有摔过。之后<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">初中</span>在长白山与当时最好朋友小学周同学一起学过，并可以滑<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“超级”滑道</span>(>30度)。之后因学业繁忙，就滑过几次，能力有所退步。</p>
                    <div class="module-achievements">
                        <h4>主要成果：</h4>
                        <ul>
                            <li>✓ 初中时可以双板滑长白山<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“超级”滑道</span>、单板滑长白山<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">“高级”赛道</span>。</li>
                            <li>✓ <span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">双板</span>、<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">单板</span>都会；先学的双板，且使用双板时间更长。</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-运动-滑雪-1.jpg" alt="滑雪图片1" class="experience-photo">
                    <img src="images/兴趣爱好-运动-滑雪-2.jpg" alt="滑雪图片2" class="experience-photo">
                </div>
            </div>
            
            <!-- 生活模块 - 4个 -->
            <div class="experience-module life-module notification" data-category="life">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">美食</h3>
                <div class="notibody">
                    <div class="module-subtitle">初中至今</div>
                    <p>本人不太挑食。传统中食、西食、日食等都有喜爱。</p>
                    <div class="module-achievements">
                        <h4>主要推荐：</h4>
                        <ul>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">主食</span>有 <寿司>、<韩国烧烤>、<巴西烧烤>、<意大利面>、<蛋炒饭>、<甜甜圈>……</li>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">小食</span>有 <冰淇淋>……</li>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">饮料</span>有 <果汁>、<牛奶>、<椰奶>、<水>、<桦树汁>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-生活-美食-1.jpg" alt="美食图片1" class="experience-photo">
                    <img src="images/兴趣爱好-生活-美食-2.gif" alt="美食图片2" class="experience-photo">
                    <img src="images/兴趣爱好-生活-美食-3.jpg" alt="美食图片3" class="experience-photo">
                    <img src="images/兴趣爱好-生活-美食-4.jpg" alt="美食图片4" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module life-module notification" data-category="life">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">动植物</h3>
                <div class="notibody">
                    <div class="module-subtitle">初中至今</div>
                    <p>喜欢动植物，最喜欢的电视节目也是动物世界等。</p>
                    <div class="module-achievements">
                        <h4>主要推荐：</h4>
                        <ul>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">动物</span>有 <小型热带鱼>、<小型观赏虾>、<海鱼>、<猫>……</li>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">植物</span>有 <水草>、<多肉>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-生活-动物-1.jpg" alt="动物图片1" class="experience-photo">
                    <img src="images/兴趣爱好-生活-动物-2.jpg" alt="动物图片2" class="experience-photo">
                </div>
            </div>

            <div class="experience-module life-module notification" data-category="life">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">玩具</h3>
                <div class="notibody">
                    <div class="module-subtitle">从小至今</div>
                    <p>更喜欢的有创造性的玩具。</p>
                    <div class="module-achievements">
                        <h4>主要推荐：</h4>
                        <ul>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">拼装类玩具</span>有 &lt;LEGO&gt;、<乐高机器人EV3>、<3D纸模型>……</li>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">摆件类玩具</span>有 <小汽车>、<盲盒>、<手办>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-生活-玩具-1.png" alt="玩具图片1" class="experience-photo">
                    <img src="images/兴趣爱好-生活-玩具-2.png" alt="玩具图片2" class="experience-photo">
                    <img src="images/兴趣爱好-生活-玩具-3.jpg" alt="玩具图片3" class="experience-photo">
                    <img src="images/兴趣爱好-生活-玩具-4.jpg" alt="玩具图片4" class="experience-photo">
                </div>
            </div>
            
            <div class="experience-module life-module notification" data-category="life">
                <div class="notiglow"></div>
                <div class="notiborderglow"></div>
                <h3 class="notititle">文具</h3>
                <div class="notibody">
                    <div class="module-subtitle">初中至今</div>
                    <p>各种实用、创意文具我都喜欢。</p>
                    <div class="module-achievements">
                        <h4>主要推荐：</h4>
                        <ul>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">笔</span>有 <可擦笔>、<自转铅芯铅笔>……</li>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">鼠标</span>有 <罗技LIFT>、<外星人AW系列>……</li>
                            <li>✓ 喜欢的<span style="color:#ff4291; font-weight: 0.5em; vertical-align: middle;">键盘</span>有 <罗技WAVE KEY>……</li>
                        </ul>
                    </div>
                </div>
                <div class="module-photos">
                    <img src="images/兴趣爱好-生活-文具-1.png" alt="文具图片1" class="experience-photo">
                    <img src="images/兴趣爱好-生活-文具-2.png" alt="文具图片2" class="experience-photo">
                    <img src="images/兴趣爱好-生活-文具-3.png" alt="文具图片3" class="experience-photo">
                    <img src="images/兴趣爱好-生活-文具-4.png" alt="文具图片4" class="experience-photo">
                    <img src="images/兴趣爱好-生活-文具-5.jpg" alt="文具图片5" class="experience-photo">
                    <img src="images/兴趣爱好-生活-文具-6.jpg" alt="文具图片6" class="experience-photo">
                    <img src="images/兴趣爱好-生活-文具-7.jpg" alt="文具图片7" class="experience-photo">
                </div>
            </div>
        </div>

        <!-- 底部区域 -->
        <footer class="home-footer">
            <h2 class="welcome-text">WELCOME</h2>
            <nav class="footer-nav">
                <a href="#home" class="footer-link active">首页</a>
                <a href="#basic-info" class="footer-link">基本信息</a>
                <a href="#professional-experience" class="footer-link">专业履历</a>
                <a href="#skills" class="footer-link">技能介绍</a>
                <a href="#hobbies" class="footer-link">兴趣爱好</a>
                <a href="#contact" class="footer-link">联系</a>
            </nav>
            <div class="footer-text">
                <!-- 预留文本区域供用户填写 -->
                <p>xwhinfo.site域名会保留10年(202511-203511)，10年之后域名可能会改为xwhintro.site</p>
            </div>
        </footer>
    `;
    
    // 初始化轮播图
    initCarousels();
    

    
    // 转换模块格式为轮播图
    setTimeout(convertModulesToCarouselFormat, 100);
}

// 筛选兴趣爱好
function filterHobbies(category) {
    // 更新标签按钮状态
    document.querySelectorAll('#hobbies .section-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });
    
    // 筛选模块
    const modules = document.querySelectorAll('#hobbies-content .experience-module');
    modules.forEach(module => {
        if (category === 'all' || module.dataset.category === category) {
            module.style.display = 'flex';
        } else {
            module.style.display = 'none';
        }
    });

    // 触发文字雨重新计算尺寸（仅在rain主题下）
    if (document.body.classList.contains('theme-rain')) {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }
}

// 初始化轮播图
// 轮播图功能已移除，替换为静态图片展示

// 以下函数保留为空以确保兼容性
function initCarousels() {
    // 轮播图功能已移除
}

// 切换兴趣爱好标签页 - 保留原有函数以确保兼容性
function switchHobbiesTab(tabId) {
    filterHobbies(tabId);
}

// 加载联系页面
function loadContact() {
    const container = document.getElementById('contact');
    
    // 为联系页面按钮添加复制功能的函数
    function setupCopyButtons() {
        // 等待DOM更新完成
        setTimeout(() => {
            const contactButtons = document.querySelectorAll('.contact-cards-container .button');
            contactButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // 获取按钮上的文本内容
                    const textToCopy = this.textContent.trim();
                    
                    // 使用现代的 Clipboard API 复制文本
                    if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(textToCopy)
                            .then(() => {
                                // 临时改变按钮文本以提供反馈
                                const originalText = this.textContent;
                                this.textContent = '已复制!';
                                this.style.backgroundColor = 'hsl(120, 92%, 58%)';
                                
                                // 1.5秒后恢复原始状态
                                setTimeout(() => {
                                    this.textContent = originalText;
                                    this.style.backgroundColor = '';
                                }, 1500);
                            })
                            .catch(err => {
                                console.error('复制失败:', err);
                                // 降级方案：使用传统的方法复制
                                fallbackCopyTextToClipboard(textToCopy, this);
                            });
                    } else {
                        // 降级方案：使用传统的方法复制
                        fallbackCopyTextToClipboard(textToCopy, this);
                    }
                });
            });
        }, 100); // 小延迟确保DOM已更新
    }
    
    // 降级复制方法（兼容旧浏览器）
    function fallbackCopyTextToClipboard(text, buttonElement) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // 确保元素不可见但能被选中
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            // 执行复制命令
            document.execCommand('copy');
            
            // 临时改变按钮文本以提供反馈
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '已复制!';
            buttonElement.style.backgroundColor = 'hsl(120, 92%, 58%)';
            
            // 1.5秒后恢复原始状态
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.backgroundColor = '';
            }, 1500);
        } catch (err) {
            console.error('复制失败:', err);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    container.innerHTML = `
        <!-- 顶部圆形头像 -->
        <div class="header-avatar">
            <img src="images/顶部-头像.jpg" alt="头像" class="avatar-image">
        </div>
        
        ${renderMainNav('contact')}
        
        <!-- 蓝色多点卡样式 -->
        <style>
        /* 联系卡片容器 - 居中显示并实现响应式布局 */
        .contact-cards-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: stretch;
            gap: 1.5rem;
            margin: 2rem auto;
            padding: 0 1rem;
            width: 100%;
            max-width: 1000px;
        }
        
        /* 卡片样式 - 确保一行最多显示3个 */
        .card {
            flex: 1 0 calc(33.333% - 1rem); /* 使用flex:1允许卡片适当伸展 */
            min-width: 250px;
            /* 移除max-width限制，让卡片能够在响应式布局中更好地自适应 */
            margin: 0;
        }
        
        /* 响应式设计 - 在不同屏幕尺寸下自动调整卡片数量 */
        @media (max-width: 768px) {
            .card {
                flex: 1 0 calc(50% - 0.75rem); /* 调整计算方式，考虑gap间距 */
            }
        }
        
        @media (max-width: 576px) {
            .card {
                flex: 1 0 100%; /* 小屏幕显示1个 */
                max-width: 400px; /* 在小屏幕上限制最大宽度以保持美观 */
                margin: 0 auto; /* 在小屏幕上居中显示 */
            }
        }
        
        .section-title {
            text-align: center;
            margin: 2rem 0;
            font-size: 2rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #ff9f43);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 8s ease infinite;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* 卡片详细样式 - 保留视觉效果但移除宽度限制 */
        .card {
          --white: hsl(0, 0%, 100%);
          --black: hsl(240, 15%, 9%);
          --paragraph: hsl(0, 0%, 83%);
          --line: hsl(240, 9%, 17%);
          --primary: hsl(189, 92%, 58%);

          position: relative;

          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 250px; /* 确保卡片有最小高度 */

          padding: 1rem;
          width: 100%; /* 让宽度继承自flexbox设置 */
          background-color: hsla(240, 15%, 9%, 1);
          background-image: radial-gradient(
              at 88% 40%,
              hsla(240, 15%, 9%, 1) 0px,
              transparent 85%
            ),
            radial-gradient(at 49% 30%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
            radial-gradient(at 14% 26%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
            radial-gradient(at 0% 64%, hsl(189, 99%, 26%) 0px, transparent 85%),
            radial-gradient(at 41% 94%, hsl(189, 97%, 36%) 0px, transparent 85%),
            radial-gradient(at 100% 99%, hsl(188, 94%, 13%) 0px, transparent 85%);

          border-radius: 1rem;
          box-shadow: 0px -16px 24px 0px rgba(255, 255, 255, 0.25) inset;
        }
        
        /* 确保列表内容不会无限伸展，让按钮可以到底部 */
        .card__list {
          flex-grow: 1;
        }

        .card .card__border {
          overflow: hidden;
          pointer-events: none;

          position: absolute;
          z-index: -10;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          width: calc(100% + 2px);
          height: calc(100% + 2px);
          background-image: linear-gradient(
            0deg,
            hsl(0, 0%, 100%) -50%,
            hsl(0, 0%, 40%) 100%
          );

          border-radius: 1rem;
        }

        .card .card__border::before {
          content: "";
          pointer-events: none;

          position: fixed;
          z-index: 200;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%), rotate(0deg);
          transform-origin: left;

          width: 200%;
          height: 10rem;
          background-image: linear-gradient(
            0deg,
            hsla(0, 0%, 100%, 0) 0%,
            hsl(189, 100%, 50%) 40%,
            hsl(189, 100%, 50%) 60%,
            hsla(0, 0%, 40%, 0) 100%
          );

          animation: rotate 8s linear infinite;
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        .card .card_title__container .card_title {
          font-size: 1rem;
          color: var(--white);
        }

        .card .card_title__container .card_paragraph {
          margin-top: 0.25rem;
          width: 65%;

          font-size: 0.5rem;
          color: var(--paragraph);
        }

        .card .line {
          width: 100%;
          height: 0.1rem;
          background-color: var(--line);

          border: none;
        }

        .card .card__list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card .card__list .card__list_item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card .card__list .card__list_item .check {
          display: flex;
          justify-content: center;
          align-items: center;

          width: 1rem;
          height: 1rem;
          min-width: 1rem;
          min-height: 1rem;
          background-color: var(--primary);
          flex-shrink: 0;

          border-radius: 50%;
        }

        .card .card__list .card__list_item .check .check_svg {
          width: 0.75rem;
          height: 0.75rem;

          fill: var(--black);
        }

        .card .card__list .card__list_item .list_text {
          font-size: 0.75rem;
          color: var(--white);
        }

        .card .button {
          cursor: pointer;

          padding: 0.5rem;
          width: 100%;
          background-image: linear-gradient(
            0deg,
            hsl(189, 92%, 58%),
            hsl(189, 99%, 26%) 100%
          );

          font-size: 0.75rem;
          color: var(--white);

          border: 0;
          border-radius: 9999px;
          box-shadow: inset 0 -2px 25px -4px var(--white);
          margin-top: auto; /* 推到底部 */
        }
        </style>
        
        <!-- 如何联系我板块 -->
        <h2 class="section-title">如何联系我</h2>
        <div class="contact-cards-container">
            <!-- 卡片1 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">微信</span>
                    <p class="card_paragraph">wxid_piww02hv917z12</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">常用的、主要的线上交流方式</span>
                    </li>
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">仅熟人使用，且不常看</span>
                    </li>
                </ul>
                <button class="button">wxid_piww02hv917z12</button>
            </div>
            
            <!-- 卡片2 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">QQ</span>
                    <p class="card_paragraph">926135219</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">不常用，仅不得不使用时使用</span>
                    </li>
                </ul>
                <button class="button">926135219</button>
            </div>
            
            <!-- 卡片3 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">steam</span>
                    <p class="card_paragraph">Xuper Inspire</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">steam用户名，欢迎访问</span>
                    </li>
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">不过steam游戏除了《黑神话·悟空》其他不常玩</span>
                    </li>
                </ul>
                <button class="button">Xuper Inspire</button>
            </div>
            
            <!-- 卡片4 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">QQ邮箱</span>
                    <p class="card_paragraph">926135219@qq.com</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">常用邮箱</span>
                    </li>
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">平时联系、非娱乐联系用</span>
                    </li>
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">工作电话</span>
                    </li>
                </ul>
                <button class="button">926135219@qq.com</button>
            </div>
            
            <!-- 卡片5 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">网易163邮箱</span>
                    <p class="card_paragraph">18117301767@163.com</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">入职后工作用</span>
                    </li>
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">论文、项目用</span>
                    </li>
                </ul>
                <button class="button">18117301767@163.com</button>
            </div>
            
            <!-- 卡片6 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">网易126邮箱</span>
                    <p class="card_paragraph">hl20230211@126.com</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">交流、分享个人介绍网站、相关作品等</span>
                    </li>
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">交流乒乓球、水族养殖、我的世界、摄影……</span>
                    </li>
                </ul>
                <button class="button">hl20230211@126.com</button>
            </div>
            
            <!-- 卡片7 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">新浪邮箱</span>
                    <p class="card_paragraph">syberlong@sina.com</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">非娱乐用：摄影、后期、设计……</span>
                    </li>
                </ul>
                <button class="button">syberlong@sina.com</button>
            </div>
            
            <!-- 卡片8 -->
            <div class="card">
                <div class="card__border"></div>
                <div class="card_title__container">
                    <span class="card_title">抖音</span>
                    <p class="card_paragraph">不会炸机的疆</p>
                </div>
                <hr class="line" />
                <ul class="card__list">
                    <li class="card__list_item">
                        <span class="check">
                            <svg class="check_svg" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                        <span class="list_text">摄影作品、航拍作品、剪辑作品……</span>
                    </li>
                </ul>
                <button class="button">不会炸机的疆</button>
            </div>
        </div>
        
        <!-- 所有联系方式板块 -->
        <h2 class="section-title">所有联系方式</h2>
        <div class="contact-grid">
            <!-- 第一行：微信、QQ、钉钉 -->
            <div class="contact-item" title="平时用，访客建议通过网易126邮箱交流">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon wechat"></span>
                        <div class="contact-content">
                            <div class="contact-name">微信</div>
                            <div class="contact-value">wxid_piww02hv917z12</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="学校用，访客建议通过网易126邮箱交流">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon qq"></span>
                        <div class="contact-content">
                            <div class="contact-name">QQ</div>
                            <div class="contact-value">926135219</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="工作用">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon dingtalk"></span>
                        <div class="contact-content">
                            <div class="contact-name">钉钉</div>
                            <div class="contact-value">Howard熊文浩</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="占位项">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon steam"></span>
                        <div class="contact-content">
                            <div class="contact-name">steam</div>
                            <div class="contact-value">Xuper Inspire</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第二行：Whatsapp、Facebook、X、Instagram -->
            <div class="contact-item" title="Whatsapp联系">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon whatsapp"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Whatsapp</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="Facebook联系">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon facebook"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Facebook</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="X(Twitter)联系">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon x"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">X</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="Instagram联系">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon instagram"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Instagram</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第三行：QQ邮箱、网易163邮箱、网易126邮箱、新浪邮箱 -->
            <div class="contact-item" title="个人常用、注册网站用">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon email-qq"></span>
                        <div class="contact-content">
                            <div class="contact-name">QQ邮箱</div>
                            <div class="contact-value">926135219@qq.com</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="工作用">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon email-163"></span>
                        <div class="contact-content">
                            <div class="contact-name">网易163邮箱</div>
                            <div class="contact-value">18117301767@163.com</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="交流兴趣爱好用，想要和我交流通过这个">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon email-126"></span>
                        <div class="contact-content">
                            <div class="contact-name">网易126邮箱</div>
                            <div class="contact-value">hl20230211@126.com</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="专业/商用/非兴趣媒体创作交流用">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon email-sina"></span>
                        <div class="contact-content">
                            <div class="contact-name">新浪邮箱</div>
                            <div class="contact-value">syberlong@sina.com</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第三行：高中邮箱、大学邮箱、硕士邮箱、博士邮箱 -->
            <div class="contact-item" title="高中使用">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-school"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">高中邮箱</div>
                            <div class="contact-value">[高中邮箱地址]</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="大学使用">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon email-university"></span>
                        <div class="contact-content">
                            <div class="contact-name">大学邮箱</div>
                            <div class="contact-value">23013139@ecust.edu.cn</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="硕士使用">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-school"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">硕士邮箱</div>
                            <div class="contact-value">[硕士邮箱地址]</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="博士使用">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-school"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">博士邮箱</div>
                            <div class="contact-value">[博士邮箱地址]</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第四行：企业邮箱、Zoho Mail、Облако Mail、Tuta Mail -->
            <div class="contact-item" title="工作企业邮箱">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-company"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">企业邮箱</div>
                            <div class="contact-value">[企业邮箱地址]</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="美国邮箱，未定用途">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-zoho"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Zoho Mail</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="俄国邮箱，未定用途">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-russia"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Облако Mail</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="物">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon email-tuta"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Tuta Mail</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第五行：联系电话、备用电话、监护人电话、监护人电话 -->
            <div class="contact-item" title="访客请勿打扰，不认识的不接">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon phone"></span>
                        <div class="contact-content">
                            <div class="contact-name">联系电话</div>
                            <div class="contact-value">181 1730 1767</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="HUAWEI电话，不接">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon phone"></span>
                        <div class="contact-content">
                            <div class="contact-name">备用电话</div>
                            <div class="contact-value">133 XXXX 9609</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="父方电话">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon phone"></span>
                        <div class="contact-content">
                            <div class="contact-name">监护人电话</div>
                            <div class="contact-value">138 XXXX 0673</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="母方电话">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon phone"></span>
                        <div class="contact-content">
                            <div class="contact-name">监护人电话</div>
                            <div class="contact-value">133 XXXX 9609</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第六行：GitHub、Gitee、Kaggle、SCDN -->
            <div class="contact-item" title="GitHub暂未有作品">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon github"></span>
                        <div class="contact-content">
                            <div class="contact-name">GitHub</div>
                            <div class="contact-value">XuperMavic</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="Gitee暂未有作品">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon gitee"></span>
                        <div class="contact-content">
                            <div class="contact-name">Gitee</div>
                            <div class="contact-value">XuperMavic</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="Kaggle暂未有作品">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon kaggle"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">Kaggle</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="SCDN暂未有作品">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon scdn"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">SCDN</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 第七行：bilibili、TikTok、RED、YouTube -->
            <div class="contact-item" title="bilibili暂未有作品">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon bilibili"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">bilibili</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="有航拍、剪辑、摄影作品">
                <div class="contact-item-inner">
                    <span></span>
                    <span></span>
                    <div class="display">
                        <span class="contact-icon tiktok"></span>
                        <div class="contact-content">
                            <div class="contact-name">TikTok</div>
                            <div class="contact-value">不会炸机的疆</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="有数字创作作品">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon red"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">RED</div>
                            <div class="contact-value">暂不公开</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-item" title="YouTube未注册">
                <div class="contact-item-inner dimmed-gradient">
                    <span></span>
                    <span></span>
                    <div class="display dim">
                        <span class="contact-icon youtube"></span>
                        <div class="contact-content">
                            <div class="contact-name dim">YouTube</div>
                            <div class="contact-value">暂未注册</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部区域 -->
        <footer class="home-footer">
            <h2 class="welcome-text">WELCOME</h2>
            <nav class="footer-nav">
                <a href="#home" class="footer-link active">首页</a>
                <a href="#basic-info" class="footer-link">基本信息</a>
                <a href="#professional-experience" class="footer-link">专业履历</a>
                <a href="#skills" class="footer-link">技能介绍</a>
                <a href="#hobbies" class="footer-link">兴趣爱好</a>
                <a href="#contact" class="footer-link">联系</a>
            </nav>
            <div class="footer-text">
                <!-- 预留文本区域供用户填写 -->
                <p>xwhinfo.site域名会保留10年(202511-203511)，10年之后域名可能会改为xwhintro.site</p>
            </div>
        </footer>
    `;
    
    // 确保联系页面加载后更新导航链接的活动状态
    updateActiveLinks('contact');
    
    // 添加时钟功能
    function updateClock() {
        const now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }
    
    // 立即更新一次
    updateClock();
    // 每秒更新一次
    setInterval(updateClock, 1000);
}

// 格式转换相关函数

// 格式转换相关函数
function convertAllModulesToCarouselFormat() {
    // 1. 转换专业履历页面的模块
    const professionalExperienceModules = document.querySelectorAll('#professional-experience .experience-module');
    convertModulesToCarousel(professionalExperienceModules, 'experience-photo');
    
    // 2. 转换技能介绍页面的模块
    const skillsModules = document.querySelectorAll('#skills .skill-module');
    convertModulesToCarousel(skillsModules, 'skill-photo');
    
    // 3. 转换兴趣爱好页面除了城市风光摄影外的其他模块
    const hobbiesModules = document.querySelectorAll('#hobbies .experience-module:not(.photography-module)');
    convertModulesToCarousel(hobbiesModules, 'experience-photo');
}

function convertModulesToCarousel(modules, photoClassName) {
    modules.forEach(module => {
        // 查找图片容器
        const photoContainer = module.querySelector('.module-photos');
        if (photoContainer && photoContainer.querySelectorAll(`.${photoClassName}`).length > 0) {
            // 创建轮播图容器
            const carouselContainer = document.createElement('div');
            carouselContainer.className = 'carousel-container';
            
            // 创建轮播图包装器
            const carouselWrapper = document.createElement('div');
            carouselWrapper.className = 'carousel-wrapper';
            
            // 获取所有图片并转换为轮播图项
            const photos = photoContainer.querySelectorAll(`.${photoClassName}`);
            photos.forEach(photo => {
                const carouselItem = document.createElement('div');
                carouselItem.className = 'carousel-item';
                
                // 复制图片并修改类名
                const newPhoto = photo.cloneNode(true);
                newPhoto.className = 'carousel-image';
                
                carouselItem.appendChild(newPhoto);
                carouselWrapper.appendChild(carouselItem);
            });
            
            // 添加轮播图导航按钮
            const leftButton = document.createElement('button');
            leftButton.className = 'carousel-nav left';
            leftButton.innerHTML = '&#10094;';
            leftButton.onclick = function() { moveCarousel(-1); };
            
            const rightButton = document.createElement('button');
            rightButton.className = 'carousel-nav right';
            rightButton.innerHTML = '&#10095;';
            rightButton.onclick = function() { moveCarousel(1); };
            
            // 组装轮播图
            carouselContainer.appendChild(carouselWrapper);
            carouselContainer.appendChild(leftButton);
            carouselContainer.appendChild(rightButton);
            
            // 替换原始图片容器
            photoContainer.parentNode.replaceChild(carouselContainer, photoContainer);
        }
    });
}

// 轮播图移动函数已移除
function moveCarousel(direction) {
    // 轮播图功能已移除
}

// 确保在main.js的DOMContentLoaded事件中调用格式转换函数
if (typeof initPage === 'function') {
    const originalInitPage = initPage;
    initPage = function() {
        originalInitPage();
        convertAllModulesToCarouselFormat();
        initAnnouncement(); // 添加公告功能初始化
    };
} else {
    // 如果initPage函数不存在，则直接调用
    convertAllModulesToCarouselFormat();
}

// 初始化公告功能
function initAnnouncement() {
    console.log('初始化公告功能');
    const announcementModal = document.getElementById('announcement-modal');
    const announcementClose = document.getElementById('announcement-close');
    
    if (!announcementModal || !announcementClose) {
        console.log('公告模态框元素未找到');
        return;
    }
    
    // 关闭按钮
    announcementClose.addEventListener('click', function(e) {
        e.stopPropagation();
        hideAnnouncementModal();
    });
    
    // 背景点击关闭
    announcementModal.addEventListener('click', function(e) {
        if (e.target === announcementModal) {
            hideAnnouncementModal();
        }
    });
    
    // ESC关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && announcementModal.classList.contains('active')) {
            hideAnnouncementModal();
        }
    });
    
    function hideAnnouncementModal() {
        announcementModal.classList.remove('active');
        setTimeout(function() { document.body.style.overflow = ''; }, 300);
    }
    
    // 内容区域不透传点击
    const announcementContent = announcementModal.querySelector('.announcement-content');
    if (announcementContent) {
        announcementContent.addEventListener('click', function(e) { e.stopPropagation(); });
    }
    
    // 全局事件委托：任意页面的公告按钮都能工作
    if (!window.__announcementDelegationBound) {
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('#announcement-btn');
            if (btn) {
                e.stopPropagation();
                announcementModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
        window.__announcementDelegationBound = true;
    }
}
