import { useId } from "react";
import { Input, Label } from "@heroui/react";
import type { InputRootProps } from "@heroui/react";

type CustomInputProps = {
  label: string;
  onValueChange: (value: string) => void;
} & Omit<InputRootProps, "onChange">;

const CustomInput = ({ label, onValueChange, ...props }: CustomInputProps) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-label={label}
        onChange={(event) => onValueChange(event.target.value)}
        {...props}
      />
    </div>
  );
};

export default CustomInput;
