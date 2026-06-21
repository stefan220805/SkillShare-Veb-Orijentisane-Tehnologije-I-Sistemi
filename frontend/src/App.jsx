import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Ovo su "privremene" komponente samo da testiramo rute
// Kasnije ćemo ih prebaciti u posebne fajlove unutar 'pages' foldera
const HomePage = () => <div className="p-10 text-2xl">Dobrodošli na SkillShare Početnu!</div>;
const LoginPage = () => <div className="p-10 text-2xl">Ovo je Login stranica</div>;
const RegisterPage = () => <div className="p-10 text-2xl">Ovo je stranica za Registraciju</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        
        {/* Jednostavan Navbar koji će biti na svakoj stranici */}
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold tracking-wider">SkillShare</Link>
            <div className="space-x-4">
              <Link to="/login" className="hover:text-blue-200">Prijava</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-1 rounded-md font-medium hover:bg-gray-100">
                Registracija
              </Link>
            </div>
          </div>
        </nav>

        {/* Ovde se menjaju stranice u zavisnosti od URL-a */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;