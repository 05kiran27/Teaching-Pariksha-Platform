import React from "react";
import HomeSidebar from "../HomeSidebar/HomeSidebar";

const HomeLayout = ({ children }) => {
  return (
    <div className="flex">
      <HomeSidebar />
      <div className="flex-1 ml-[250px]">{children}</div> {/* margin for sidebar */}
    </div>
  );
};

export default HomeLayout;
