import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-zinc-900 p-4 text-white">
      <h1 className="text-2xl font-semibold">Emotion Analysis</h1>
      <nav className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/analyze">Analyze</Link>
      </nav>
    </header>
  );
};

export default Header;