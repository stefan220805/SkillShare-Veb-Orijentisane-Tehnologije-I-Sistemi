import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const rawUserInfo = localStorage.getItem("userInfo");
  const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="bg-[#29274c] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Levi deo - Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-wider text-white hover:text-[#d295bf] transition-colors">
            SkillShare
          </Link>
          
          {/* Desni deo - Linkovi i Autentifikacija */}
          <div className="flex items-center gap-6">
            <Link to="/courses" className="hidden md:block text-[#e6bccd] hover:text-white font-medium transition-colors">
              Svi Kursevi
            </Link>

            {/* Secure Admin Access Link */}
            {userInfo && userInfo.role === "admin" && (
              <Link 
                to="/admin" 
                className="bg-[#7e52a0]/40 text-[#e6bccd] hover:bg-[#7e52a0] hover:text-white border border-[#7e52a0]/60 px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                🛡️ Admin Panel
              </Link>
            )}

            {userInfo ? (
              /* ULOGOVAN KORISNIK */
              <div className="flex items-center gap-4 pl-6 border-l border-[#7e52a0]/40 ml-2">
                <Link 
                  to="/create-course" 
                  className="bg-[#d295bf] text-[#29274c] px-4 py-1.5 rounded-lg font-bold hover:bg-[#e6bccd] transition-colors text-sm shadow-sm"
                >
                  + Dodaj Kurs
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 bg-[#012a36]/40 hover:bg-[#012a36] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#7e52a0]/50"
                >
                  {/* Avatar krug sa prvim slovom imena */}
                  <span className="w-7 h-7 bg-[#7e52a0] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-white hidden sm:block">
                    {userInfo.name.split(" ")[0]}
                  </span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-colors"
                >
                  Odjavi se
                </button>
              </div>
            ) : (
              /* GOST */
              <div className="flex items-center gap-4 pl-2">
                <Link to="/login" className="text-[#e6bccd] hover:text-white font-medium transition-colors px-3 py-2">
                  Prijava
                </Link>
                <Link to="/register" className="bg-[#7e52a0] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#d295bf] transition-colors shadow-md">
                  Registracija
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
