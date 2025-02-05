// src/components/home/RecommendedSection.jsx
import Card from "../common/Card";
import PropTypes from "prop-types";

const RecommendedSection = ({ title }) => {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Example cards - replace with real data */}
        <Card
          image="/sample-image.jpg"
          title="Sample Title"
          description="Sample description"
          rating={4.5} // Changed from string to number
        />
        {/* Add more example cards */}
        <Card
          image="/sample-image.jpg"
          title="Another Place"
          description="Another great location"
          rating={4.8}
        />
        <Card
          image="/sample-image.jpg"
          title="Popular Spot"
          description="Must visit location"
          rating={4.2}
        />
        <Card
          image="/sample-image.jpg"
          title="Hidden Gem"
          description="A secret paradise"
          rating={4.7}
        />
      </div>
    </section>
  );
};

RecommendedSection.propTypes = {
  title: PropTypes.string.isRequired,
};

export default RecommendedSection;
