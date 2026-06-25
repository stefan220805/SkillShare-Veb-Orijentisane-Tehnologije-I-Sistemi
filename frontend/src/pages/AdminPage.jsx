import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const rawUserInfo = localStorage.getItem("userInfo");
  const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;

  useEffect(() => {
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        // Povlačimo samo korisnike, kurseve ćemo povlačiti na posebnoj stranici
        const { data } = await axios.get("http://localhost:5001/api/users", config);
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Greška pri učitavanju admin panela", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate, userInfo]);

  const deleteUser = async (id) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovog korisnika i sve njegove podatke?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5001/api/users/${id}`, config);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) { 
        alert("Greška pri brisanju korisnika."); 
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-[#7e52a0] font-bold text-xl">Učitavanje korisnika...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#012a36]">Upravljanje Korisnicima</h1>
          <p className="text-gray-600">Admin kontrolna tabla za pregled i brisanje naloga.</p>
        </div>
        
        {/* GRID KARTICA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map(u => (
            <div key={u._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition">
              
              <div className="w-20 h-20 bg-[#7e52a0] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-inner border-4 border-[#e6bccd]">
                {u.profilePicture ? (
                  <img src={u.profilePicture} alt={u.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  u.name.charAt(0).toUpperCase()
                )}
              </div>
              
              <h3 className="font-bold text-[#012a36] text-lg">{u.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{u.email}</p>
              
              <span className={`text-xs font-bold px-3 py-1 rounded-full mb-6 ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                {u.role === "admin" ? "Administrator" : "Korisnik"}
              </span>

              <div className="flex w-full gap-2 mt-auto">
                <Link to={`/admin/user/${u._id}`} className="flex-1 bg-[#012a36] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#29274c] transition shadow-sm">
                  Detalji
                </Link>
                {u._id !== userInfo._id ? (
                  <button onClick={() => deleteUser(u._id)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition">
                    Obriši
                  </button>
                ) : (
                  <div className="flex-1 py-2 text-xs font-bold text-gray-400 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                    Tvoj Nalog
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;