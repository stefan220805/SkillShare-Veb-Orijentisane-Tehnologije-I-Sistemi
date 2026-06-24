import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [name, setName] = useState(userInfo?.name || "");
  const [profilePicture, setProfilePicture] = useState(userInfo?.profilePicture || "");
  const [password, setPassword] = useState("");
  
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [myCourses, setMyCourses] = useState([]);
  const [tradeRequests, setTradeRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // 1. Moji kursevi
        const coursesRes = await axios.get("http://localhost:5001/api/courses");
        const userCourses = coursesRes.data.filter(
          (course) => course.user?._id === userInfo._id || course.user === userInfo._id
        );
        setMyCourses(userCourses);

        // 2. Pristigli zahtevi za razmenu
        const tradesRes = await axios.get("http://localhost:5001/api/swaps/received", config);
        setTradeRequests(tradesRes.data);

        // 3. Poslati zahtevi za razmenu
        const sentTradesRes = await axios.get("http://localhost:5001/api/swaps/sent", config);
        setSentRequests(sentTradesRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Greška pri povlačenju podataka:", err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMessage("");
    setUpdateError("");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.put("http://localhost:5001/api/users/profile", { name, profilePicture, password }, config);

      const updatedUser = { 
        ...userInfo, 
        name: res.data.user.name, 
        profilePicture: res.data.user.profilePicture,
        token: res.data.user.token 
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      
      setUpdateMessage("Profil je uspešno ažuriran!");
      setPassword("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Greška pri ažuriranju profila.");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj kurs? Ovo se ne može poništiti.")) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5001/api/courses/${courseId}`, config);
        setMyCourses(myCourses.filter((course) => course._id !== courseId));
      } catch (err) {
        alert(err.response?.data?.message || "Greška pri brisanju kursa.");
      }
    }
  };

  const handleTradeAction = async (requestId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // OVO JE BILO POGREŠNO: Bilo je /api/trades, sada je tačno /api/swaps/status/
      await axios.put(`http://localhost:5001/api/swaps/status/${requestId}`, { status: newStatus }, config);
      
      // Ažuriramo stanje na frontendu
      setTradeRequests(tradeRequests.map(req => 
        req._id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (err) {
      console.error("Detalji greške:", err.response || err);
      alert(err.response?.data?.message || "Došlo je do greške pri ažuriranju statusa.");
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
                <div className="w-24 h-24 bg-[#7e52a0] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-4 border-[#e6bccd]">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-center text-[#012a36] mb-6">Podešavanja naloga</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {updateMessage && <p className="text-green-600 bg-green-50 p-3 rounded text-sm">{updateMessage}</p>}
                {updateError && <p className="text-red-600 bg-red-50 p-3 rounded text-sm">{updateError}</p>}

                <div>
                  <label className="block text-sm font-medium text-[#012a36] mb-1">Ime i prezime</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#012a36] mb-1">Profilna slika (URL)</label>
                  <input type="url" placeholder="https://..." value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#012a36] mb-1">Nova lozinka</label>
                  <input type="password" placeholder="Prazno ako ne menjate" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0]" />
                </div>
                <button type="submit" className="w-full bg-[#012a36] text-white py-2.5 rounded-lg font-bold hover:bg-[#29274c] transition mt-4">Sačuvaj izmene</button>
              </form>
            </div>
          </div>

          {/* DESNA STRANA: Moji Kursevi i Zahtevi */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sekcija 1: Moji Kursevi */}
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
                      <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-[#012a36] text-lg mb-1">{course.title}</h3>
                        <p className="text-sm text-[#7e52a0] font-medium mb-2">Tražim: {course.tradeFor}</p>
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Link to={`/course/${course._id}`} className="flex-1 sm:flex-none text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition">Pogledaj</Link>
                        
                        {/* NOVO DODATO DUGME ZA IZMENU */}
                        <Link to={`/edit-course/${course._id}`} className="flex-1 sm:flex-none text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition">Izmeni</Link>
                        
                        <button onClick={() => handleDeleteCourse(course._id)} className="flex-1 sm:flex-none text-center bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 hover:text-red-700 transition">Obriši</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sekcija 2: Pristigli zahtevi za razmenu */}
            <div className="bg-white p-8 shadow-md rounded-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-[#012a36] mb-6 border-b pb-4">Pristigli zahtevi za razmenu</h2>
              
              {loading ? (
                <p className="text-center text-[#7e52a0]">Učitavanje zahteva...</p>
              ) : tradeRequests.length === 0 ? (
                <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">Trenutno nema novih ponuda za razmenu.</p>
              ) : (
                <div className="space-y-4">
                  {tradeRequests.map((req) => (
                    <div key={req._id} className="border border-gray-200 bg-gray-50 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-[#012a36] mb-1">
                          {req.sender?.name || "Korisnik"} želi tvoj kurs: <span className="text-[#7e52a0]">{req.requestedCourse?.title}</span>
                        </p>
                        <div className="bg-white p-3 rounded border border-[#e6bccd] text-sm text-[#012a36] mb-3 shadow-sm font-medium">
                          Nudi u zamenu: {req.offeredCourse?.title}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                          req.status === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          Status: {req.status === 'pending' ? 'Na čekanju' : req.status === 'accepted' ? 'Prihvaćeno' : 'Odbijeno'}
                        </span>
                      </div>
                      
                      {req.status === 'pending' && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => handleTradeAction(req._id, 'accepted')} 
                            className="flex-1 md:flex-none bg-[#012a36] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#29274c] transition shadow-md"
                          >
                            Prihvati
                          </button>
                          <button 
                            onClick={() => handleTradeAction(req._id, 'rejected')} 
                            className="flex-1 md:flex-none bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                          >
                            Odbij
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sekcija 3: Poslati zahtevi za razmenu */}
            <div className="bg-white p-8 shadow-md rounded-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-[#012a36] mb-6 border-b pb-4">Poslati zahtevi za razmenu</h2>
              
              {loading ? (
                <p className="text-center text-[#7e52a0]">Učitavanje zahteva...</p>
              ) : sentRequests.length === 0 ? (
                <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">Nisi poslao nijedan zahtev za razmenu.</p>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((req) => (
                    <div key={req._id} className="border border-gray-200 bg-gray-50 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-[#012a36] mb-1">
                          Poslao si zahtev korisniku: <span className="text-[#7e52a0]">{req.receiver?.name || "Korisnik"}</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Tražiš njegov kurs: <span className="font-semibold text-[#012a36]">{req.requestedCourse?.title}</span>
                        </p>
                        <div className="bg-white p-3 rounded border border-gray-100 text-sm text-[#012a36] mb-3 shadow-sm font-medium">
                          Nudiš mu svoj kurs: {req.offeredCourse?.title}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                          req.status === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          Status: {req.status === 'pending' ? 'Na čekanju' : req.status === 'accepted' ? 'Prihvaćeno' : 'Odbijeno'}
                        </span>
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