import { SelectItem } from "@/components/atoms/CustomSelect";

export const createOptions = <K extends string>(
  values: K[],
): SelectItem<K>[] => {
  return values.map((value) => ({
    key: value,
    label: value,
    value,
  }));
};
