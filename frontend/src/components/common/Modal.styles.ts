/**
 * Modal组件的CSS动画样式
 */
export const modalStyles = `
/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 向上滑入动画 */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 向下滑入动画 */
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 向左滑入动画 */
@keyframes slideLeft {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 向右滑入动画 */
@keyframes slideRight {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 缩放动画 */
@keyframes scale {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 动画类名 */
.animate-fadeIn {
  animation: fadeIn var(--animation-duration, 0.2s) ease;
}

.animate-slideUp {
  animation: slideUp var(--animation-duration, 0.2s) ease;
}

.animate-slideDown {
  animation: slideDown var(--animation-duration, 0.2s) ease;
}

.animate-slideLeft {
  animation: slideLeft var(--animation-duration, 0.2s) ease;
}

.animate-slideRight {
  animation: slideRight var(--animation-duration, 0.2s) ease;
}

.animate-scale {
  animation: scale var(--animation-duration, 0.2s) ease;
}
`;

/**
 * 动态注入样式到文档中
 */
export const injectModalStyles = (): void => {
  if (typeof document !== 'undefined') {
    // 检查样式是否已经存在
    if (!document.getElementById('modal-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'modal-styles';
      styleElement.textContent = modalStyles;
      document.head.appendChild(styleElement);
    }
  }
};
