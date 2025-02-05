export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateFormField = (name, value, formData = {}) => {
  switch (name) {
    case "email":
      return validateEmail(value) ? "" : "Please enter a valid email";
    case "password":
      return validatePassword(value)
        ? ""
        : "Password must be at least 6 characters";
    case "confirmPassword":
      return !formData.password || value === formData.password
        ? ""
        : "Passwords must match";
    case "username":
      return value.length >= 3 ? "" : "Username must be at least 3 characters";
    default:
      return "";
  }
};
