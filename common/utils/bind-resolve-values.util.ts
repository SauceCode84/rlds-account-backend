import { Constructor } from "./merge-with-values.util";
import { IrisMiddleware } from "../interfaces";

export const BindResolveMiddlewareValues = <T extends Constructor<IrisMiddleware>>(data: any[]) => {
  return (Metatype: T) => {
    const Type = class extends Metatype {
      
      public resolve() {
        return super.resolve(...data);
      }

    };
    const token = Metatype.name + JSON.stringify(data);

    Object.defineProperty(Type, "name", { value: token });

    return Type;
  };
};
