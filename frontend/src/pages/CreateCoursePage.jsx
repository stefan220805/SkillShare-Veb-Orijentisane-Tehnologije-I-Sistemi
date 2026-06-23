import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCoursePage = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [tradeFor, setTradeFor] = useState("");
  
  // NOVO: Stanje za lekcije (Niz objekata, kreće sa jednom praznom lekcijom)
  const [lessons, setLessons] = useState([{ title: "", videoUrl: "" }]);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) navigate("/login");
  }, [navigate]);

  // Funkcija za promenu vrednosti određene lekcije
  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  // Funkcija za dodavanje novog polja za lekciju
  const addLesson = () => {
    setLessons([...lessons, { title: "", videoUrl: "" }]);
  };

  // Funkcija za brisanje lekcije
  const removeLesson = (index) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      // Šaljemo 'lessons' niz umesto 'content'
      await axios.post(
        "http://localhost:5001/api/courses",
        { title, lessons, image, tradeFor },
        config
      );

      navigate("/courses");
    } catch (err) {
      console.error("Greška pri kreiranju kursa:", err);
      setError(err.response?.data?.message || "Došlo je do greške pri dodavanju kursa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#012a36]">
            Kreiraj LMS Kurs
          </h2>
          <p className="mt-2 text-gray-600">
            Dodaj naziv kursa i ujedini svoje YouTube lekcije u jednu strukturiranu celinu.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Osnovni podaci kursa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#012a36] mb-1">Naziv celog kursa *</label>
                <input
                  type="text" required placeholder="npr. Premiere Pro Masterclass"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e52a0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#012a36] mb-1">Šta tražiš u zamenu? *</label>
                <input
                  type="text" required placeholder="npr. UI/UX Dizajn časovi"
                  value={tradeFor} onChange={(e) => setTradeFor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e52a0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#012a36] mb-1">Cover slika kursa (URL)</label>
                <input
                  type="url" placeholder="https://..."
                  value={image} onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e52a0]"
                />
              </div>
            </div>

            <hr className="border-gray-200 my-8" />

            {/* SEKCIJA ZA LEKCIJE (DINAMIČKA) */}
            <div>
              <h3 className="text-xl font-bold text-[#012a36] mb-4">Sadržaj kursa (Lekcije)</h3>
              
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={index} className="bg-[#f8f9fa] p-5 rounded-lg border border-gray-200 relative">
                    {/* Dugme za brisanje (prikazuje se samo ako ima više od jedne lekcije) */}
                    {lessons.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeLesson(index)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 font-bold text-sm"
                      >
                        ✕ Ukloni
                      </button>
                    )}
                    
                    <h4 className="font-bold text-[#7e52a0] mb-3">Lekcija {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Naslov lekcije *</label>
                        <input
                          type="text" required placeholder="npr. Interfejs i alati"
                          value={lesson.title}
                          onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#7e52a0]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">YouTube URL *</label>
                        <input
                          type="url" required placeholder="https://www.youtube.com/watch?v=..."
                          value={lesson.videoUrl}
                          onChange={(e) => handleLessonChange(index, "videoUrl", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#7e52a0]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dugme za dodavanje nove lekcije */}
              <button
                type="button"
                onClick={addLesson}
                className="mt-4 bg-[#e6bccd]/30 text-[#7e52a0] border border-[#e6bccd] px-4 py-2 rounded-lg font-bold hover:bg-[#e6bccd]/50 transition-colors text-sm w-full border-dashed"
              >
                + Dodaj novu lekciju
              </button>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit" disabled={loading}
                className="w-full py-3 px-4 rounded-lg shadow-md font-bold text-white bg-[#012a36] hover:bg-[#29274c] transition-colors disabled:bg-gray-400 text-lg"
              >
                {loading ? "Čuvanje u bazi..." : "Objavi Kurs na SkillShare"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;