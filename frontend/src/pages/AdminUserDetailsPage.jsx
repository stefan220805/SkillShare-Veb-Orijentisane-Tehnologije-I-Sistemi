import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const rawUserInfo = localStorage.getItem("userInfo");
  const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;

  const [targetUser, setTargetUser] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // Povlačimo sve korisnike i sve kurseve, pa filtriramo
        const [usersRes, coursesRes] = await Promise.all([
          axios.get("http://localhost:5001/api/users", config),
          axios.get("http://localhost:5001/api/courses")
        ]);

        const foundUser = usersRes.data.find(u => u._id === id);
        const filteredCourses = coursesRes.data.filter(c => (c.user?._id || c.user) === id);

        setTargetUser(foundUser);
        setUserCourses(filteredCourses);
        setLoading(false);
      } catch (err) {
        console.error("Greška:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, userInfo]);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Admin brisanje: Da li ste sigurni da želite da obrišete ovaj kurs?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5001/api/courses/${courseId}`, config);
        setUserCourses(userCourses.filter(c => c._id !== courseId));
      } catch (err) {
        alert("Greška pri brisanju kursa.");
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-[#7e52a0] font-bold">Učitavanje podataka...</div>;
  if (!targetUser) return <div className="text-center py-20 text-red-500 font-bold">Korisnik nije pronađen.</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEVA STRANA - Info o korisniku */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center sticky top-24">
            <Link to="/admin" className="text-sm font-bold text-[#7e52a0] hover:underline block text-left mb-6">
              &larr; Nazad na sve korisnike
            </Link>
            <div className="w-24 h-24 bg-[#7e52a0] mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 border-4 border-[#e6bccd]">
              {targetUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-[#012a36]">{targetUser.name}</h2>
            <p className="text-gray-500 mb-4">{targetUser.email}</p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-left">
              <p><strong>ID:</strong> {targetUser._id}</p>
              <p><strong>Uloga:</strong> {targetUser.role}</p>
              <p><strong>Ukupno kurseva:</strong> {userCourses.length}</p>
            </div>
          </div>
        </div>

        {/* DESNA STRANA - Kursevi korisnika */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-2xl font-bold text-[#012a36] mb-6 border-b pb-4">Kursevi ovog korisnika</h3>
            
            {userCourses.length === 0 ? (
              <p className="text-gray-500 italic">Ovaj korisnik trenutno nema objavljenih kurseva.</p>
            ) : (
              <div className="space-y-4">
                {userCourses.map(course => (
                  <div key={course._id} className="flex flex-col sm:flex-row items-center bg-gray-50 border border-gray-200 rounded-xl p-4 gap-4">
                    <div className="w-full sm:w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"} alt="Kurs" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-bold text-[#012a36]">{course.title}</h4>
                      <p className="text-sm text-[#7e52a0] mt-1">Traži: {course.tradeFor}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/course/${course._id}`} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-100">
                        Pregledaj
                      </Link>
                      <button onClick={() => handleDeleteCourse(course._id)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-100">
                        Obriši
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUserDetailsPage;