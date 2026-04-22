"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  Label,
  Key,
} from "@heroui/react";
import type { SelectItem } from "@/types";

export type { SelectItem };

type CustomSelectProps<K> = {
  label?: string;
  placeholder?: string;
  items: SelectItem[];
  value?: K;
  onChange?: (value: K) => void;
  className?: string;
  renderItem?: (item: SelectItem<K>) => React.ReactNode;
  selectionMode?: "single" | "multiple";
};

export function CustomSelect<K>({
  label,
  placeholder,
  items,
  value,
  onChange,
  className,
  renderItem,
  selectionMode = "single",
}: CustomSelectProps<K>) {
  const selectedKey =
    selectionMode === "multiple"
      ? (value as Key[])
      : (items.find((item) => item.value === value)?.key ?? null);

  return (
    <div className={className}>
      {label && <Label htmlFor={label}>{label}</Label>}
      <Select
        value={selectedKey}
        onChange={(key) => {
          const selected = items.find((item) => item.key === key);
          if (selected) onChange?.(selected.value);
          if (selectionMode === "multiple") onChange?.(key as K);
        }}
        id={label}
        aria-label={label}
        placeholder={placeholder}
        selectionMode={selectionMode}
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectPopover>
          <ListBox items={items} selectionMode={selectionMode}>
            {(item) => (
              <ListBoxItem
                aria-label={item.label}
                id={item.key}
                textValue={item.label}
              >
                {renderItem ? renderItem(item) : item.label}
                <ListBox.ItemIndicator />
              </ListBoxItem>
            )}
          </ListBox>
        </SelectPopover>
      </Select>
    </div>
  );
}
