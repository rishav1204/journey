// src/components/common/Card.jsx
import PropTypes from "prop-types";

const Card = ({ image, title, description, rating }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img className="w-full h-48 object-cover" src={image} alt={title} />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        {rating && (
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  rating: PropTypes.number, // Not required, but must be a number if provided
};

export default Card;
