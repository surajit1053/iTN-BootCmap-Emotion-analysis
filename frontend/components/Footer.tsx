import React from "react";

const Footer = () => {
  return (
    <footer className="flex items-center justify-center bg-zinc-800 text-zinc-200 p-4 text-sm">
      <p>
        © {new Date().getFullYear()} Emotion Analysis App. Built with ❤️ using Next.js & FastAPI.
      </p>
    </footer>
  );
};

export default Footer;