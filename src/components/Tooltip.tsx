import React, { useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    onTooltip: (data: { content: string; position: { top: number; left: number } } | null) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, onTooltip }) => {
    const childrenRef = useRef<HTMLDivElement>(null);

    const updateTooltipPosition = useCallback(() => {
        if (!childrenRef.current) return;

        // 获取 item 的位置
        const itemRect = childrenRef.current.getBoundingClientRect();
        
        // 获取列表容器的位置
        const listWrapper = document.querySelector('.jp-snippets-list-wrapper');
        if (!listWrapper) return;
        const listRect = listWrapper.getBoundingClientRect();

        // 计算可用空间
        const windowWidth = window.innerWidth;
        const rightSpace = windowWidth - listRect.right;
        const showOnLeft = rightSpace < 400;

        // 计算 tooltip 的位置
        const tooltipPosition = {
            top: itemRect.top,
            left: showOnLeft 
                ? listRect.left - 408  // 左侧显示：列表容器左边界 - tooltip宽度 - 间距
                : listRect.right + 8   // 右侧显示：列表容器右边界 + 间距
        };

        onTooltip({
            content,
            position: tooltipPosition
        });
    }, [content, onTooltip]);

    useEffect(() => {
        updateTooltipPosition();
        window.addEventListener('resize', updateTooltipPosition);
        window.addEventListener('scroll', updateTooltipPosition, true);

        return () => {
            window.removeEventListener('resize', updateTooltipPosition);
            window.removeEventListener('scroll', updateTooltipPosition, true);
        };
    }, [updateTooltipPosition]);

    return (
        <div 
            ref={childrenRef}
            className="jp-snippets-tooltip-trigger"
            onMouseEnter={updateTooltipPosition}
            onMouseLeave={() => onTooltip(null)}
        >
            {children}
        </div>
    );
};