"use client";
import Link from "next/link";
import React from "react";

export const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href={"/"}
          className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
        >
          GifGenie
        </Link>
        <div className="space-x-6 hidden md:flex">
          <a
            href="/#features"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          >
            How it works
          </a>
          <a
            href="/#cta"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          >
            Get Started
          </a>
        </div>
        <a
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Launch App
        </a>
      </div>
    </nav>
  );
};
