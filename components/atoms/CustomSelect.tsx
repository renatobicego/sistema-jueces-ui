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
} from "@heroui/react";
import type { SelectItem } from "@/types";

export type { SelectItem };

type CustomSelectProps<K> = {
  label?: string;
  placeholder?: string;
  items: SelectItem<K>[];
  value?: K;
  onChange?: (value: K) => void;
  className?: string;
  renderItem?: (item: SelectItem<K>) => React.ReactNode;
};

export function CustomSelect<K>({
  label,
  placeholder,
  items,
  value,
  onChange,
  className,
  renderItem,
}: CustomSelectProps<K>) {
  const selectedKey = items.find((item) => item.value === value)?.key ?? null;

  return (
    <div className={className}>
      {label && <Label htmlFor={label}>{label}</Label>}
      <Select
        value={selectedKey}
        onChange={(key) => {
          const selected = items.find((item) => item.key === key);
          if (selected) onChange?.(selected.value);
        }}
        id={label}
        aria-label={label}
        placeholder={placeholder}
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectPopover>
          <ListBox items={items}>
            {(item) => (
              <ListBoxItem id={item.key} textValue={item.label}>
                {renderItem ? renderItem(item) : item.label}
              </ListBoxItem>
            )}
          </ListBox>
        </SelectPopover>
      </Select>
    </div>
  );
}
