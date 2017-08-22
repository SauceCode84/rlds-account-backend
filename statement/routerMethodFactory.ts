
export const routerMethodFactory = (target, requestMethod: string): Function => {
  switch (requestMethod) {
    case "POST":
      return target.post;

    case "PUT":
      return target.put;

    default:
      return target.get;
  }
};
