export function argParser(args: string[]): string[] {
  return args.map((arg: string) => {
    return arg.trim();
  });
}
