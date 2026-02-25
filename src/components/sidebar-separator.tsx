'use client';

import type { ReactNode } from 'react';
import * as Base from 'fumadocs-ui/components/sidebar/base';

interface SeparatorItem {
  type: 'separator';
  name?: ReactNode;
  icon?: ReactNode;
}

export function SidebarSeparator({ item }: { item: SeparatorItem }) {
  const depth = Base.useFolderDepth();

  return (
    <Base.SidebarSeparator
      className="text-[0.7rem] font-semibold uppercase tracking-wider text-fd-muted-foreground/70"
      style={{
        paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))`,
      }}
    >
      {item.icon}
      {item.name}
    </Base.SidebarSeparator>
  );
}
