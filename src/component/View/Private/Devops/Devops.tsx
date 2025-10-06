import React from "react";
import { Outlet } from "react-router-dom";

export default function Devops() {
  return (
    <>
      {/* Render Child Components */}
      <Outlet />
    </>
  );
}

