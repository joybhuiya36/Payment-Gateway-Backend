export const success = (message: string, data: any = null) => {
  return {
    success: true,
    message: message,
    data: data,
  };
};

export const failure = (message: string, error: any = null) => {
  return {
    success: false,
    message: message,
    error: error,
  };
};
