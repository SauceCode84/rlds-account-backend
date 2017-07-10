
import { IrisModule } from "./iris-module.interface";
import { Controller } from "../controllers";

export interface ModuleMetadata {
  modules?: IrisModule[] | any[];
  components?: any[];
  controllers?: Controller[] | any[];
  exports?: any[];
}
