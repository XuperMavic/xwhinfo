/**
 * Click Spark 鼠标点击特效
 * 用于在点击网页背景时显示火花效果
 */
class ClickSpark {
    constructor(options = {}) {
        // 默认配置
        this.config = {
            sparkColor: '#fff',
            sparkSize: 10,
            sparkRadius: 15,
            sparkCount: 8,
            duration: 400,
            easing: 'ease-out',
            extraScale: 1.0,
            ...options
        };
        
        this.canvas = null;
        this.ctx = null;
        this.parent = null;
        this.sparks = [];
        this.animationId = null;
        this.resizeTimeout = null;
        this.startTime = null;
    }
    
    // 初始化Canvas和事件监听
    init(parentElement) {
        this.parent = parentElement;
        
        // 创建Canvas元素
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.canvas.style.userSelect = 'none';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '10000'; // 高于所有元素，包括图片灯箱的z-index 9999
        
        this.parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // 设置Canvas尺寸
        this.resizeCanvas();
        
        // 添加事件监听
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // 开始动画循环
        this.animate();
        
        return this;
    }
    
    // 调整Canvas尺寸
    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }
    
    // 延迟调整尺寸，避免频繁触发
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 100);
    }
    
    // 缓动函数
    easeFunc(t) {
        switch (this.config.easing) {
            case 'linear':
                return t;
            case 'ease-in':
                return t * t;
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default: // ease-out
                return t * (2 - t);
        }
    }
    
    // 处理点击事件，生成火花
    handleClick(e) {
        // 获取canvas的显示尺寸和实际尺寸的比例，用于坐标转换
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // 将鼠标点击位置从客户端坐标转换为canvas实际坐标
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const now = performance.now();
        
        // 生成多个火花
        const newSparks = Array.from({ length: this.config.sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / this.config.sparkCount,
            startTime: now
        }));
        
        this.sparks.push(...newSparks);
    }
    
    // 动画循环
    animate() {
        const timestamp = performance.now();
        if (!this.startTime) {
            this.startTime = timestamp;
        }
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新并绘制所有火花
        this.sparks = this.sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= this.config.duration) {
                return false;
            }
            
            const progress = elapsed / this.config.duration;
            const eased = this.easeFunc(progress);
            
            const distance = eased * this.config.sparkRadius * this.config.extraScale;
            const lineLength = this.config.sparkSize * (1 - eased);
            
            // 修改火花线段的起点和终点计算，使其以点击位置为中心
            const x1 = spark.x + (distance - lineLength/2) * Math.cos(spark.angle);
            const y1 = spark.y + (distance - lineLength/2) * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength/2) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength/2) * Math.sin(spark.angle);
            
            // 绘制火花
            this.ctx.strokeStyle = this.config.sparkColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            return true;
        });
        
        // 继续动画循环
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // 销毁实例，清理资源
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        window.removeEventListener('resize', () => this.handleResize());
        document.removeEventListener('click', (e) => this.handleClick(e));
        
        if (this.canvas && this.parent) {
            this.parent.removeChild(this.canvas);
        }
        
        this.canvas = null;
        this.ctx = null;
        this.parent = null;
        this.sparks = [];
    }
}

// 在DOM加载完成后初始化
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // 创建ClickSpark实例并初始化为页面背景点击效果
        const clickSpark = new ClickSpark({
            sparkColor: '#ffd700', // 金色火花
            sparkSize: 12,
            sparkRadius: 20,
            sparkCount: 10,
            duration: 500
        });
        
        // 将效果添加到body
        clickSpark.init(document.body);
        
        // 暴露到window对象，以便调试和控制
        window.clickSpark = clickSpark;
    });
}