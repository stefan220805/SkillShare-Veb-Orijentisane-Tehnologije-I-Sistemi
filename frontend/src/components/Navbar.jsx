import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-[#29274c] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-extrabold tracking-wider text-white hover:text-[#d295bf] transition-colors">
            SkillShare
          </Link>
          <div className="flex items-center space-x-5">
            <Link to="/courses" className="hidden md:block text-[#e6bccd] hover:text-white font-medium transition-colors mr-2">
              Svi Kursevi
            </Link>
            <Link to="/login" className="text-[#e6bccd] hover:text-white font-medium transition-colors px-3 py-2">
              Prijava
            </Link>
            <Link to="/register" className="bg-[#7e52a0] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#d295bf] transition-colors shadow-md">
              Registracija
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;