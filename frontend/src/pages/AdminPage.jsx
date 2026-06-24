import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const rawUserInfo = localStorage.getItem("userInfo");
  const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;

  useEffect(() => {
    // Provera da li je korisnik admin
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        // Koristimo tvoju lokalnu adresu beka (port 5001)
        const [usersRes, coursesRes] = await Promise.all([
          axios.get("http://localhost:5001/api/users", config),
          axios.get("http://localhost:5001/api/courses")
        ]);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Greška pri učitavanju admin panela", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const deleteUser = async (id) => {
    if (window.confirm("Obrisati korisnika?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5001/api/users/${id}`, config);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) { 
        alert("Greška pri brisanju korisnika"); 
      }
    }
  };

  if (loading) return <div className="text-center py-20">Učitavanje admin panela...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#012a36]">Admin Kontrolna Tabla</h1>
        
        {/* Tabela Korisnika */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-10 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-[#7e52a0]">Svi korisnici</h2>
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-2">Ime</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Uloga</th>
                <th className="pb-2">Akcija</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b text-sm">
                  <td className="py-3 font-semibold text-[#012a36]">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u._id !== userInfo._id ? (
                      <button onClick={() => deleteUser(u._id)} className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 font-bold px-3 py-1 rounded transition-colors">
                        Obriši
                      </button>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Ti (Admin)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela Kurseva */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-[#7e52a0]">Svi kursevi</h2>
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-2">Naslov</th>
                <th className="pb-2">Kreator (ID)</th>
                <th className="pb-2">Akcija</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id} className="border-b text-sm">
                  <td className="py-3 font-semibold text-[#012a36]">{c.title}</td>
                  <td className="font-mono text-xs text-gray-500">{c.user?._id || c.user}</td>
                  <td>
                    <button onClick={() => navigate(`/course/${c._id}`)} className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-xs font-bold">
                      Pogledaj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;