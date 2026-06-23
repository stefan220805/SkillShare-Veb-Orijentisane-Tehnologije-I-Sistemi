import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const CourseDetailsPage = () => {
  const { id } = useParams();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NOVO: Stanje koje prati koja lekcija je trenutno izabrana (kreće od prve - index 0)
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Pametna funkcija koja pretvara običan YouTube link u Embed link potreban za sajt
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
    const fetchCourseAndReviews = async () => {
      try {
        const courseRes = await axios.get(`http://localhost:5001/api/courses/${id}`);
        setCourse(courseRes.data);

        const reviewsRes = await axios.get(`http://localhost:5001/api/reviews/${id}`);
        setReviews(reviewsRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Greška:", err);
        setError("Kurs nije pronađen ili je došlo do greške.");
        setLoading(false);
      }
    };
    fetchCourseAndReviews();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.post(
        "http://localhost:5001/api/reviews",
        { courseId: id, rating, comment },
        config
      );

      setReviews([res.data.review, ...reviews]);
      setComment("");
      window.location.reload(); 
    } catch (err) {
      setReviewError(err.response?.data?.message || "Greška pri dodavanju recenzije.");
    }
  };

  if (loading) return <div className="text-center py-20 text-[#7e52a0] font-bold text-xl">Učitavanje...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;

  // Proveravamo da li je ovo novi kurs sa lekcijama ili neki stari testni kurs
  const hasLessons = course.lessons && course.lessons.length > 0;
  const activeLesson = hasLessons ? course.lessons[activeLessonIndex] : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ZAGLAVLJE KURSA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#012a36] mb-1">{course.title}</h1>
            <p className="text-[#7e52a0] font-medium text-sm uppercase tracking-wide">
              Instruktor: {course.user?.name || "SkillShare Kreator"}
            </p>
          </div>
          <div className="bg-[#29274c] text-white px-5 py-2 rounded-lg shadow-sm border border-[#012a36]">
            <span className="text-xs text-[#e6bccd] uppercase block mb-0.5">Zamena za:</span>
            <span className="font-bold">{course.tradeFor}</span>
          </div>
        </div>

        {/* LMS INTERFEJS (Prikazuje se ako kurs ima lekcije) */}
        {hasLessons ? (
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            
            {/* LEVA STRANA: Lista Lekcija */}
            <div className="lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
              <div className="bg-[#012a36] text-white p-4">
                <h2 className="font-bold text-lg">Sadržaj kursa</h2>
                <p className="text-[#e6bccd] text-sm">{course.lessons.length} lekcija ukupno</p>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2" style={{ scrollbarWidth: 'thin' }}>
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson._id || index}
                    onClick={() => setActiveLessonIndex(index)}
                    className={`w-full text-left px-4 py-4 rounded-xl mb-2 transition-all duration-200 flex items-center border ${
                      activeLessonIndex === index 
                        ? "bg-[#7e52a0] text-white border-[#7e52a0] shadow-md" 
                        : "bg-white text-gray-700 border-gray-100 hover:bg-[#f8f9fa] hover:border-[#d295bf]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm flex-shrink-0 ${
                      activeLessonIndex === index ? "bg-white text-[#7e52a0]" : "bg-gray-100 text-gray-500"
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium line-clamp-2">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DESNA STRANA: Video Plejer */}
            <div className="lg:w-2/3 bg-black rounded-2xl overflow-hidden shadow-lg h-[300px] sm:h-[400px] lg:h-[500px] relative border border-gray-800">
              {activeLesson?.videoUrl ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                  title={activeLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 flex-col">
                  <span className="text-4xl mb-2">🎥</span>
                  <p>Video materijal nije dostupan</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* FALLBACK ZA STARE KURSEVE BEZ LEKCIJA */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
            <h2 className="text-xl font-bold text-[#012a36] mb-4">Opis kursa</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{course.content || "Ovaj kurs nema unet sadržaj ni lekcije."}</p>
          </div>
        )}

        {/* SEKCIJA ZA RECENZIJE (Ista kao pre) */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#012a36] mb-6 border-b pb-4">Iskustva polaznika</h2>

          {userInfo ? (
            course.user?._id !== userInfo._id ? (
              <form onSubmit={submitReview} className="mb-10 bg-[#f8f9fa] p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-[#012a36] mb-4">Ostavi svoju recenziju</h3>
                {reviewError && <p className="text-red-500 text-sm mb-2">{reviewError}</p>}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ocena</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7e52a0]"
                  >
                    <option value="5">5 - Odlično</option>
                    <option value="4">4 - Vrlo dobro</option>
                    <option value="3">3 - Dobro</option>
                    <option value="2">2 - Dovoljno</option>
                    <option value="1">1 - Nedovoljno</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
                  <textarea 
                    required rows="3" value={comment} onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7e52a0] resize-none"
                    placeholder="Kakvo je tvoje iskustvo sa ovim lekcijama?"
                  ></textarea>
                </div>
                <button type="submit" className="bg-[#012a36] text-white px-5 py-2 rounded-md font-bold hover:bg-[#29274c] transition-colors">
                  Pošalji recenziju
                </button>
              </form>
            ) : (
              <p className="mb-8 text-[#7e52a0] font-medium bg-[#7e52a0]/10 p-4 rounded-lg">
                Ovo je tvoj kurs. Ne možeš ostaviti recenziju na svoj sadržaj.
              </p>
            )
          ) : (
            <p className="mb-8 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              Moraš biti <Link to="/login" className="text-[#7e52a0] font-bold">prijavljen</Link> da bi ocenio ovaj kurs.
            </p>
          )}

          <div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic text-center py-6">Još uvek nema recenzija za ovaj kurs. Budi prvi!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#d295bf] text-white flex items-center justify-center font-bold mr-3">
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#012a36]">{review.user?.name || "Anonimni korisnik"}</h4>
                        <div className="text-yellow-500 text-sm">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 pl-11">{review.comment}</p>
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

export default CourseDetailsPage;