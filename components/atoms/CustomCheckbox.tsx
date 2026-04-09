import { Checkbox, Label } from "@heroui/react";
import type { CheckboxRootProps } from "@heroui/react";

type CustomCheckboxProps = {
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
  variant?: CheckboxRootProps["variant"];
  children?: React.ReactNode;
};

export function CustomCheckbox({
  isSelected,
  onChange,
  isDisabled,
  isIndeterminate,
  variant,
  children,
}: CustomCheckboxProps) {
  return (
    <Checkbox
      isSelected={isSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      isIndeterminate={isIndeterminate}
      variant={variant}
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      {children && <Label>{children}</Label>}
    </Checkbox>
  );
}
