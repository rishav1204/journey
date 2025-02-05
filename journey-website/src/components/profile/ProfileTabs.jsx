// src/components/profile/ProfileTabs.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";

const ProfileTabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = React.Children.toArray(children);

  return (
    <div className="mt-6">
      <div className="border-b border-gray-200">
        {tabs.map((child) => (
          <Tab
            key={child.props.value}
            isActive={child.props.value === activeTab}
            onClick={() => setActiveTab(child.props.value)}
          >
            {child.props.label}
          </Tab>
        ))}
      </div>
      <div className="mt-6">
        {tabs.find((child) => child.props.value === activeTab)}
      </div>
    </div>
  );
};

ProfileTabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTab: PropTypes.string.isRequired,
};

export default ProfileTabs;
