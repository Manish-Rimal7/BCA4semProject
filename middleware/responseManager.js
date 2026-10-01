export const responseManager = {
  success: (res, responseCode = 200, message = "success", data = {}) => {
    return res.status(responseCode).json({
      responseCode,
      responseMessage: message,
      responseData: data,
    });
  },

  error: (res, responseCode = 500, message = "error") => {
    return res.status(responseCode).json({
      responseCode,
      responseMessage: message,
    });
  },
};


//dashboard maa intrest added ra removed both maa red dekhaudai xa that should be different
