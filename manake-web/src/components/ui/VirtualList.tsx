import React, { useState, useRef, useCallback, useEffect } from "react";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * VirtualList component for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualListProps<T>): React.ReactElement {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const endReachedRef = useRef(false);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  // Calculate visible range with overscan
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    startIndex + visibleCount + 2 * overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      setScrollTop(scrollTop);

      // Check if we've reached the end threshold
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      if (
        scrollPercentage >= endReachedThreshold &&
        !endReachedRef.current &&
        onEndReached
      ) {
        endReachedRef.current = true;
        onEndReached();
      } else if (scrollPercentage < endReachedThreshold) {
        endReachedRef.current = false;
      }
    },
    [onEndReached, endReachedThreshold]
  );

  // Reset end reached when items change
  useEffect(() => {
    endReachedRef.current = false;
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VariableVirtualListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, measureRef: React.RefCallback<HTMLDivElement>) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * VirtualList with variable item heights
 * Uses dynamic measurement for accurate positioning
 */
export function VariableVirtualList<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = "",
}: VariableVirtualListProps<T>): React.ReactElement {
  const [scrollTop, setScrollTop] = useState(0);
  const measuredHeights = useRef<Map<number, number>>(new Map());

  // Get height for an item (measured or estimated)
  const getItemHeight = (index: number): number => {
    return measuredHeights.current.get(index) ?? estimatedItemHeight;
  };

  // Calculate total height
  const getTotalHeight = (): number => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += getItemHeight(i);
    }
    return total;
  };

  // Find visible range
  const getVisibleRange = (): { start: number; end: number; offsetY: number } => {
    let accumulated = 0;
    let start = 0;
    let offsetY = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (accumulated + height > scrollTop) {
        start = i;
        offsetY = accumulated;
        break;
      }
      accumulated += height;
    }

    // Find end index
    let end = start;
    let visibleHeight = 0;
    for (let i = start; i < items.length; i++) {
      visibleHeight += getItemHeight(i);
      end = i + 1;
      if (visibleHeight > containerHeight) break;
    }

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan),
      offsetY: Math.max(0, offsetY - overscan * estimatedItemHeight),
    };
  };

  const { start, end, offsetY } = getVisibleRange();
  const visibleItems = items.slice(start, end);

  const measureItem = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      if (node) {
        const height = node.getBoundingClientRect().height;
        if (measuredHeights.current.get(index) !== height) {
          measuredHeights.current.set(index, height);
        }
      }
    },
    []
  );

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: getTotalHeight(), position: "relative" }}>
        <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
          {visibleItems.map((item, i) => {
            const actualIndex = start + i;
            return (
              <div key={actualIndex}>
                {renderItem(item, actualIndex, measureItem(actualIndex))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
