import { ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import type { ButtonRootProps } from "@heroui/react";

type SubmitButtonProps = {
  submitting?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "reset" | "submit";
} & Omit<ButtonRootProps, "type">;

export const SubmitButton = ({
  submitting,
  children,
  fullWidth = true,
  type = "submit",
  ...props
}: SubmitButtonProps) => {
  return (
    <Button type={type} fullWidth={fullWidth} isPending={submitting} {...props}>
      {({ isPending }) => (
        <>
          {isPending && <Spinner color="current" size="sm" />}
          {children}
        </>
      )}
    </Button>
  );
};
