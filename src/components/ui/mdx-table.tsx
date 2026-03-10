import type { ComponentPropsWithoutRef } from "react";

/**
 * Custom MDX table components with sticky first column for mobile.
 *
 * Wraps <table> in a scrollable container; first <th>/<td> in each row
 * is sticky so labels stay visible while scrolling horizontally.
 */

export function MdxTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="relative overflow-x-auto prose-no-margin my-6">
      <table
        {...props}
        className="mdx-sticky-table"
        style={{ borderCollapse: "separate", borderSpacing: 0, overflow: "visible" }}
      />
    </div>
  );
}

export function MdxTh(props: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      {...props}
      className={`min-w-[120px] ${props.className ?? ""}`}
    />
  );
}

export function MdxTd(props: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      {...props}
      className={props.className ?? ""}
    />
  );
}
