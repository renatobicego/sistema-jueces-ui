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

export const createSeriesOptions = (numberOfSeries: number) => {
  return createOptions(
    Array.from({ length: numberOfSeries }, (_, i) => i).map(
      (number) => `Serie_${number + 1}`,
    ),
  );
};

export const seriesTypesOptions = (
  hasSeries: boolean,
  hasSemifinals: boolean,
) => {
  return [
    {
      key: "create-series",
      label: "Crear Series",
      value: "create-series",
    },
    ...(hasSeries
      ? [
          {
            key: "create-semifinal",
            label: "Crear Semifinal",
            value: "create-semifinal",
          },
        ]
      : []),
    ...(hasSeries || hasSemifinals
      ? [
          {
            key: "create-final-a",
            label: "Crear Final A",
            value: "create-final-a",
          },
          {
            key: "create-final-b",
            label: "Crear Final B",
            value: "create-final-b",
          },
        ]
      : []),
  ];
};
