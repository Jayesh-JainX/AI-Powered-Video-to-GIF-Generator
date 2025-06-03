"use client";
import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-12">
      <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} GifGenie. All rights reserved.
      </div>
    </footer>
  );
};
