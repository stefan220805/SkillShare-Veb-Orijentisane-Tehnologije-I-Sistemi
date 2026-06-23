import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Stanja za formu ažuriranja profila
  const [name, setName] = useState(userInfo?.name || "");
  const [password, setPassword] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // Stanja za kurseve korisnika
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Provera da li je korisnik ulogovan i povlačenje njegovih kurseva
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const fetchMyCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/courses");
        // Filtriramo kurseve tako da ostanu samo oni čiji je autor trenutno ulogovani korisnik
        const userCourses = res.data.filter(
          (course) => course.user?._id === userInfo._id || course.user === userInfo._id
        );
        setMyCourses(userCourses);
        setLoading(false);
      } catch (err) {
        console.error("Greška pri povlačenju kurseva:", err);
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [navigate, userInfo]);

  // Funkcija za AŽURIRANJE profila
 const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMessage("");
    setUpdateError("");

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const res = await axios.put(
        "http://localhost:5001/api/users/profile",
        { name, password },
        config
      );

      // ISPRAVKA: Čitamo name iz res.data.user.name!
      // Takođe, dobra je praksa osvežiti i token pošto ga backend već generiše novog
      const updatedUser = { 
        ...userInfo, 
        name: res.data.user.name,
        token: res.data.user.token 
      };
      
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      
      setUpdateMessage("Profil je uspešno ažuriran!");
      setPassword(""); // Čistimo polje za lozinku
      
      // Osvežavamo stranicu da bi se novo ime prikazalo u Navbaru
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Greška pri ažuriranju profila.");
    }
  };

  // Funkcija za BRISANJE kursa
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj kurs? Ovo se ne može poništiti.")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        await axios.delete(`http://localhost:5001/api/courses/${courseId}`, config);
        
        // Uklanjamo obrisani kurs iz state-a bez potrebe za ponovnim učitavanjem cele stranice
        setMyCourses(myCourses.filter((course) => course._id !== courseId));
      } catch (err) {
        alert(err.response?.data?.message || "Greška pri brisanju kursa.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#012a36]">Moj Profil</h1>
          <p className="text-gray-600">Upravljaj svojim podacima i kursevima na jednom mestu.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEVA STRANA: Izmena podataka */}
          <div className="lg:col-span-1">
            <div className="bg-white py-8 px-6 shadow-md rounded-xl border border-gray-100 sticky top-24">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-[#7e52a0] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {userInfo?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-center text-[#012a36] mb-6">Podešavanja naloga</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {updateMessage && <p className="text-green-600 bg-green-50 p-3 rounded text-sm">{updateMessage}</p>}
                {updateError && <p className="text-red-600 bg-red-50 p-3 rounded text-sm">{updateError}</p>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email adresa</label>
                  <input 
                    type="email" 
                    value={userInfo?.email} 
                    disabled 
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email se ne može menjati.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#012a36] mb-1">Ime i prezime</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0] focus:border-[#7e52a0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#012a36] mb-1">Nova lozinka</label>
                  <input 
                    type="password" 
                    placeholder="Ostavite prazno ako ne menjate"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0] focus:border-[#7e52a0]"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#012a36] text-white py-2.5 rounded-lg font-bold hover:bg-[#29274c] transition mt-4"
                >
                  Sačuvaj izmene
                </button>
              </form>
            </div>
          </div>

          {/* DESNA STRANA: Moji Kursevi */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 shadow-md rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-[#012a36]">Moji Kursevi</h2>
                <Link to="/create-course" className="bg-[#7e52a0] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#d295bf] transition text-sm">
                  + Dodaj novi
                </Link>
              </div>

              {loading ? (
                <p className="text-center text-[#7e52a0] py-10">Učitavanje kurseva...</p>
              ) : myCourses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">Još uvek nisi kreirao nijedan kurs.</p>
                  <Link to="/create-course" className="text-[#7e52a0] font-bold hover:underline">Započni razmenu znanja sada!</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCourses.map((course) => (
                    <div key={course._id} className="flex flex-col sm:flex-row items-center bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition gap-4">
                      {/* Slika */}
                      <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Informacije */}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-[#012a36] text-lg mb-1">{course.title}</h3>
                        <p className="text-sm text-[#7e52a0] font-medium mb-2">Tražim: {course.tradeFor}</p>
                        <p className="text-xs text-gray-400">Lekcija: {course.lessons?.length || 0}</p>
                      </div>

                      {/* Akcije */}
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Link 
                          to={`/course/${course._id}`} 
                          className="flex-1 sm:flex-none text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                        >
                          Pogledaj
                        </Link>
                        <button 
                          onClick={() => handleDeleteCourse(course._id)}
                          className="flex-1 sm:flex-none text-center bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 hover:text-red-700 transition"
                        >
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
    </div>
  );
};

export default ProfilePage;