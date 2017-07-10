
export interface IrisMiddleware {
  resolve(...args): (req?, res?, next?) => void;
}
