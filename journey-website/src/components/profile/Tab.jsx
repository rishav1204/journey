// src/components/profile/Tab.jsx
import PropTypes from "prop-types";

const Tab = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border-b-2 ${
        isActive
          ? "border-blue-500 text-blue-500"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {children}
    </button>
  );
};

Tab.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Tab;
