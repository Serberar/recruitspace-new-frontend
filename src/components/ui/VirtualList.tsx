import { memo, type ReactNode, type CSSProperties } from 'react';
import { List } from 'react-window';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  rowHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscanCount?: number;
}


// Row component for react-window v2
function RowComponent<T>({
  index,
  style,
  items,
  renderItem,
}: {
  index: number;
  style: CSSProperties;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
}) {
  return (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );
}

function VirtualListInner<T>({
  items,
  height,
  rowHeight,
  renderItem,
  className,
  overscanCount = 5,
}: VirtualListProps<T>) {
  return (
    <List
      rowCount={items.length}
      rowHeight={rowHeight}
      rowComponent={RowComponent}
      rowProps={{ items, renderItem }}
      className={className}
      overscanCount={overscanCount}
      style={{ height, width: '100%' }}
    />
  );
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner;

// Auto-sized virtual list that fills parent container
interface AutoSizedVirtualListProps<T> extends Omit<VirtualListProps<T>, 'height'> {
  minHeight?: number;
  maxHeight?: number;
}

export function AutoVirtualList<T>({
  items,
  rowHeight,
  renderItem,
  className,
  overscanCount = 5,
  minHeight = 200,
  maxHeight = 600,
}: AutoSizedVirtualListProps<T>) {
  const calculatedHeight = Math.min(
    Math.max(items.length * rowHeight, minHeight),
    maxHeight
  );

  return (
    <VirtualList
      items={items}
      height={calculatedHeight}
      rowHeight={rowHeight}
      renderItem={renderItem}
      className={className}
      overscanCount={overscanCount}
    />
  );
}
