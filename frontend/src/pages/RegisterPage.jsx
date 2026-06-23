import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/api/users/register", { name, email, password });
      
      // Čuvamo podatke nakon uspešne registracije
      localStorage.setItem("token", res.data.user.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      
      navigate("/");
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || "Greška pri registraciji. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#012a36]">
          Napravi novi nalog
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pridruži se zajednici i započni razmenu znanja
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#012a36]">Ime i prezime</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7e52a0] focus:border-[#7e52a0] sm:text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#012a36]">Email adresa</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7e52a0] focus:border-[#7e52a0] sm:text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#012a36]">Lozinka</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7e52a0] focus:border-[#7e52a0] sm:text-sm transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#7e52a0] hover:bg-[#d295bf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e52a0] transition-colors disabled:bg-gray-400"
              >
                {loading ? "Kreiranje naloga..." : "Registruj se"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Već imaš nalog?{" "}
              <Link to="/login" className="font-bold text-[#7e52a0] hover:text-[#29274c] transition-colors">
                Prijavi se ovde
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;