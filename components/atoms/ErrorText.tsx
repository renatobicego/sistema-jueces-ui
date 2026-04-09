type ErrorTextProps = {
  message: string;
};

export function ErrorText({ message }: ErrorTextProps) {
  return <p className="text-danger text-sm">{message}</p>;
}
