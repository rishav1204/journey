// src/components/common/Button.jsx
import PropTypes from "prop-types";

const Button = ({
  children,
  onClick,
  variant = "contained",
  disabled = false,
}) => {
  const baseStyles = "px-4 py-2 rounded transition-colors duration-200";

  const variants = {
    contained: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
    outlined:
      "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["contained", "outlined"]),
  disabled: PropTypes.bool,
};

export default Button;
