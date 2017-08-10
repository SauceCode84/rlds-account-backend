
const Inject = (dependencies): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    (<any>target).$injectParams = dependencies;
  };
};
