
import { METHOD_METADATA, PATH_METADATA } from "./constants";

interface RequestMappingMetadata {
  path?: string;
  method?: string;
}

const defaultRequestMappingMetadata: RequestMappingMetadata = {
  [PATH_METADATA]: "/",
  [METHOD_METADATA]: "GET"
}

const RequestMapping = (metadata: RequestMappingMetadata = defaultRequestMappingMetadata): MethodDecorator => {
  const path = metadata[PATH_METADATA] || "/";
  const requestMethod = metadata[METHOD_METADATA] || "GET";

  return (target, key, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
    Reflect.defineMetadata(METHOD_METADATA, requestMethod, descriptor.value);

    return descriptor;
  };
};

const createMappingDecorator = (method: string) => (path?: string): MethodDecorator => {
  return RequestMapping({
    [PATH_METADATA]: path,
    [METHOD_METADATA]: method
  });
};

export const Get = createMappingDecorator("GET");
export const Post = createMappingDecorator("POST");
export const Put = createMappingDecorator("PUT");
