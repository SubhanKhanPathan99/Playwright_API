export const stringFormat = (str, ...args) =>
  str.replace(/{{(\d+)}}/g, (match, index) => {
    const value = args[index];
    return value !== undefined && value !== null ? value.toString() : "";
  });
