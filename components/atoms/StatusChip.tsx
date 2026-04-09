import { Chip } from "@heroui/react";
import type { ChipRootProps } from "@heroui/react";

type StatusChipProps = {
  color?: ChipRootProps["color"];
  variant?: ChipRootProps["variant"];
  size?: ChipRootProps["size"];
  children: React.ReactNode;
};

export function StatusChip({
  color = "default",
  variant = "soft",
  size = "sm",
  children,
}: StatusChipProps) {
  return (
    <Chip color={color} variant={variant} size={size}>
      {children}
    </Chip>
  );
}
