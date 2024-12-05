// components/Navbar.tsx
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">TechTrust</h1>
      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/buy-points">Buy Points</Link>
        <Link href="/products">Products</Link>
        <Link href="/Connect Wallet">Connect Wallet</Link>
      </div>
    </nav>
  );
};

export default Navbar;
