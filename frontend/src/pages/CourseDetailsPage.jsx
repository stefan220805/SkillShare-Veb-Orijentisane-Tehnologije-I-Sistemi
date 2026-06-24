import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const CourseDetailsPage = () => {
  const { id } = useParams();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [myCourses, setMyCourses] = useState([]);
  const [selectedOfferedCourse, setSelectedOfferedCourse] = useState("");
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeStatus, setTradeStatus] = useState({ type: "", text: "" });
  
  // NOVO: Stanje pristupa (zaključano po defaultu)
  const [hasAccess, setHasAccess] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("embed/")) {
      return url; 
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`http://localhost:5001/api/courses/${id}`);
        setCourse(courseRes.data);

        const reviewsRes = await axios.get(`http://localhost:5001/api/reviews/${id}`);
        setReviews(reviewsRes.data);

        if (userInfo) {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          
          // Učitavamo kurseve korisnika za padajući meni
          const myCoursesRes = await axios.get("http://localhost:5001/api/courses");
          const filtered = myCoursesRes.data.filter(
            (c) => c.user?._id === userInfo._id || c.user === userInfo._id
          );
          setMyCourses(filtered);
          if (filtered.length > 0) setSelectedOfferedCourse(filtered[0]._id);

          // NOVO: Proveravamo da li korisnik ima otključan pristup
          try {
            const accessRes = await axios.get(`http://localhost:5001/api/swaps/check-access/${id}`, config);
            setHasAccess(accessRes.data.hasAccess);
          } catch (accessErr) {
            console.error("Greška pri proveri pristupa:", accessErr);
            setHasAccess(false);
          }
        } else {
          setHasAccess(false); // Gosti nemaju pristup
        }

        setLoading(false);
      } catch (err) {
        console.error("Greška:", err);
        setError("Kurs nije pronađen ili je došlo do greške.");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.post("http://localhost:5001/api/reviews", { courseId: id, rating, comment }, config);
      setReviews([res.data.review, ...reviews]);
      setComment("");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Greška pri dodavanju recenzije.");
    }
  };

  const handleTradeSubmit = async () => {
    if (!selectedOfferedCourse) {
      setTradeStatus({ type: "error", text: "Moraš kreirati i izabrati kurs koji nudiš." });
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const payload = {
        receiver: course.user?._id || course.user,
        offeredCourse: selectedOfferedCourse,
        requestedCourse: id
      };
      await axios.post("http://localhost:5001/api/swaps", payload, config);
      
      setTradeStatus({ type: "success", text: "Zahtev za razmenu je uspešno poslat!" });
      setTimeout(() => setShowTradeForm(false), 3000);
    } catch (err) {
      setTradeStatus({ type: "error", text: err.response?.data?.message || "Greška pri slanju." });
    }
  };

  if (loading) return <div className="text-center py-20 text-[#7e52a0] font-bold text-xl">Učitavanje...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;
  if (!course) return null;

  const hasLessons = course.lessons && course.lessons.length > 0;
  const activeLesson = hasLessons ? course.lessons[activeLessonIndex] : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ZAGLAVLJE KURSA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#012a36] mb-1">{course.title}</h1>
            <p className="text-[#7e52a0] font-medium text-sm uppercase tracking-wide">
              Instruktor: {course.user?.name || "SkillShare Kreator"}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="bg-[#29274c] text-white px-5 py-2 rounded-lg shadow-sm border border-[#012a36] text-right w-full md:w-auto">
              <span className="text-xs text-[#e6bccd] uppercase block mb-0.5">Zamena za:</span>
              <span className="font-bold">{course.tradeFor}</span>
            </div>
            
            {userInfo ? (
              course.user?._id !== userInfo._id && (
                <div className="w-full md:w-80">
                  {!showTradeForm ? (
                    <button 
                      onClick={() => setShowTradeForm(true)}
                      className="w-full bg-[#7e52a0] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#d295bf] transition shadow-md text-sm"
                    >
                      🤝 Zatraži razmenu
                    </button>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg w-full">
                      <p className="text-xs font-bold text-[#012a36] mb-2">Koji tvoj kurs nudiš u zamenu?</p>
                      
                      {myCourses.length === 0 ? (
                        <p className="text-xs text-red-500 mb-2">Moraš prvo kreirati svoj kurs da bi nudio razmenu!</p>
                      ) : (
                        <select 
                          className="w-full border border-gray-300 rounded md p-2 text-sm focus:ring-[#7e52a0] mb-2"
                          value={selectedOfferedCourse}
                          onChange={(e) => setSelectedOfferedCourse(e.target.value)}
                        >
                          {myCourses.map(c => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                          ))}
                        </select>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button onClick={handleTradeSubmit} disabled={myCourses.length === 0} className="flex-1 bg-[#012a36] text-white text-xs py-2 rounded font-bold hover:bg-[#29274c] disabled:bg-gray-400">Pošalji ponudu</button>
                        <button onClick={() => setShowTradeForm(false)} className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded font-bold hover:bg-gray-300">Odustani</button>
                      </div>
                    </div>
                  )}
                  {tradeStatus.text && (
                    <p className={`mt-2 text-xs font-bold text-right ${tradeStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {tradeStatus.text}
                    </p>
                  )}
                </div>
              )
            ) : (
              <p className="text-xs text-gray-500 italic">Prijavi se za razmenu</p>
            )}
          </div>
        </div>

        {/* LMS INTERFEJS SA ZAKLJUČAVANJEM */}
        <div className="relative mb-12">
          
          {/* KATANAC I OVERLAY (Prikazuje se samo ako NEMA pristup) */}
          {!hasAccess && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border border-gray-100">
              <div className="bg-[#012a36] text-white p-8 rounded-2xl text-center shadow-2xl max-w-md mx-4 border border-gray-700">
                <span className="text-6xl block mb-4">🔒</span>
                <h3 className="text-2xl font-bold mb-3">Sadržaj je zaključan</h3>
                <p className="text-[#e6bccd] mb-8 text-sm leading-relaxed">
                  Da bi pristupio video lekcijama ovog kursa, moraš poslati zahtev za razmenu i sačekati da ga autor prihvati.
                </p>
                <button 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setShowTradeForm(true);
                  }} 
                  className="bg-[#7e52a0] w-full py-3 rounded-xl font-bold hover:bg-[#d295bf] transition-colors shadow-lg"
                >
                  🤝 Zatraži razmenu sada
                </button>
              </div>
            </div>
          )}

          {/* SAMI SADRŽAJ KURSA (Zamuti se ako nema pristup) */}
          <div className={`transition-all duration-300 ${!hasAccess ? 'filter blur-[8px] pointer-events-none select-none opacity-60' : ''}`}>
            {hasLessons ? (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                  <div className="bg-[#012a36] text-white p-4">
                    <h2 className="font-bold text-lg">Sadržaj kursa</h2>
                    <p className="text-[#e6bccd] text-sm">{course.lessons.length} lekcija ukupno</p>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2" style={{ scrollbarWidth: 'thin' }}>
                    {course.lessons.map((lesson, index) => (
                      <button key={index} onClick={() => setActiveLessonIndex(index)} className={`w-full text-left px-4 py-4 rounded-xl mb-2 transition-all flex items-center border ${ activeLessonIndex === index ? "bg-[#7e52a0] text-white border-[#7e52a0]" : "bg-white border-gray-100 hover:bg-gray-50" }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm flex-shrink-0 ${ activeLessonIndex === index ? "bg-white text-[#7e52a0]" : "bg-gray-100 text-gray-500" }`}>{index + 1}</div>
                        <span className="font-medium line-clamp-2">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:w-2/3 bg-black rounded-2xl overflow-hidden shadow-lg h-[300px] sm:h-[400px] lg:h-[500px] relative border border-gray-800">
                  {activeLesson?.videoUrl ? (
                    <iframe className="absolute top-0 left-0 w-full h-full" src={getYouTubeEmbedUrl(activeLesson.videoUrl)} title={activeLesson.title} frameBorder="0" allowFullScreen></iframe>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400 flex-col"><span className="text-4xl mb-2">🎥</span><p>Video materijal nije dostupan</p></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"><h2 className="text-xl font-bold text-[#012a36] mb-4">Opis kursa</h2><p className="text-gray-600 whitespace-pre-wrap">{course.content}</p></div>
            )}
          </div>
        </div>

        {/* RECENZIJE */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#012a36] mb-6 border-b pb-4">Iskustva polaznika</h2>
          
          {userInfo ? (
            course.user?._id !== userInfo._id ? (
              // NOVO: Proveravamo da li ima pristup kursu pre nego što prikažemo formu
              hasAccess ? (
                <form onSubmit={submitReview} className="mb-10 bg-[#f8f9fa] p-6 rounded-xl border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ocena</label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7e52a0]">
                      <option value="5">5 - Odlično</option>
                      <option value="4">4 - Vrlo dobro</option>
                      <option value="3">3 - Dobro</option>
                      <option value="2">2 - Dovoljno</option>
                      <option value="1">1 - Nedovoljno</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <textarea required rows="3" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7e52a0] resize-none" placeholder="Kakvo je tvoje iskustvo sa ovim kursom?"></textarea>
                  </div>
                  <button type="submit" className="bg-[#012a36] text-white px-5 py-2 rounded-md font-bold hover:bg-[#29274c]">Pošalji recenziju</button>
                </form>
              ) : (
                <div className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-500 font-medium text-sm">
                    🔒 Moraš imati prihvaćenu razmenu da bi mogao da ostaviš recenziju za ovaj kurs.
                  </p>
                </div>
              )
            ) : (
              <p className="mb-8 text-[#7e52a0] font-medium bg-[#7e52a0]/10 p-4 rounded-lg">Ovo je tvoj kurs. Ne možeš ostaviti recenziju na svoj sadržaj.</p>
            )
          ) : (
            <p className="mb-8 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              Moraš biti <Link to="/login" className="text-[#7e52a0] font-bold">prijavljen</Link> da bi ocenio ovaj kurs.
            </p>
          )}

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#d295bf] text-white flex items-center justify-center font-bold mr-3">{review.user?.name ? review.user.name.charAt(0).toUpperCase() : "K"}</div>
                  <div>
                    <h4 className="font-bold text-[#012a36]">{review.user?.name || "Korisnik"}</h4>
                    <div className="text-yellow-500 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                  </div>
                </div>
                <p className="text-gray-600 pl-11">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;