import { Switch, Label } from "@heroui/react";
import type { SwitchRootProps } from "@heroui/react";

type CustomSwitchProps = {
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  size?: SwitchRootProps["size"];
  children?: React.ReactNode;
};

export function CustomSwitch({
  isSelected,
  onChange,
  isDisabled,
  size,
  children,
}: CustomSwitchProps) {
  return (
    <Switch
      isSelected={isSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      size={size}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      {children && <Label>{children}</Label>}
    </Switch>
  );
}
