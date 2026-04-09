import { Spinner } from "@heroui/react";

export function LoadingCenter() {
  return (
    <div className="flex justify-center pt-12">
      <Spinner size="lg" />
    </div>
  );
}
