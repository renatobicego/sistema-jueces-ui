import { Card } from "@heroui/react";
import { ReactNode } from "react";

type PressableCardProps = {
  children: ReactNode;
  onPress?: () => void;
  isPressable?: boolean;
  className?: string;
  wrapperClassName?: string;
};

export function PressableCard({
  children,
  onPress,
  isPressable = false,
  className = "",
  wrapperClassName,
}: PressableCardProps) {
  if (isPressable && onPress) {
    return (
      <button
        onClick={onPress}
        className={`focus:outline-none w-full ${wrapperClassName}`}
      >
        <Card className={`hover:shadow-md transition-shadow ${className}`}>
          {children}
        </Card>
      </button>
    );
  }

  return <Card className={className}>{children}</Card>;
}
