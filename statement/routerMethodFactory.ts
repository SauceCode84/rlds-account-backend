
export const routerMethodFactory = (target, requestMethod: string): Function => {
  switch (requestMethod) {
    case "POST":
      return target.post;

    default:
      return target.get;
  }
};
