
export interface IrisApplication {
  init(): void;
  listen(port: number, callback?: () => void);
  close();
}
