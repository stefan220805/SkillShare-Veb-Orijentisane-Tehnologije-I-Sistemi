import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [title, setTitle] = useState("");
  const [tradeFor, setTradeFor] = useState("");
  const [image, setImage] = useState("");
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5001/api/courses/${id}`);
        
        const courseOwnerId = data.user?._id || data.user;
        if (courseOwnerId !== userInfo._id) {
          navigate("/profile");
          return;
        }

        setTitle(data.title || "");
        setTradeFor(data.tradeFor || "");
        setImage(data.image || "");
        setLessons(data.lessons || []);
        
        setLoading(false);
      } catch (err) {
        setError("Greška pri učitavanju kursa.");
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]); // Bez userInfo u zavisnostima

  const handleAddLesson = () => {
    setLessons([...lessons, { title: "", videoUrl: "" }]);
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  const handleRemoveLesson = (index) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // Više ne šaljemo 'content', samo polja iz modela
      await axios.put(
        `http://localhost:5001/api/courses/${id}`,
        { title, tradeFor, image, lessons },
        config
      );
      
      setSuccess("Kurs je uspešno ažuriran!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške pri ažuriranju.");
    }
  };

  if (loading) return <div className="text-center py-20 text-[#7e52a0] font-bold text-xl">Učitavanje podataka...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-[#012a36] mb-6">Izmeni Kurs</h1>
        
        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-sm font-bold border border-red-200">{error}</p>}
        {success && <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 text-sm font-bold border border-green-200">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[#012a36] mb-1">Naziv kursa</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0] outline-none transition-shadow" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#012a36] mb-1">Šta tražiš u zamenu?</label>
              <input type="text" required value={tradeFor} onChange={(e) => setTradeFor(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0] outline-none transition-shadow" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#012a36] mb-1">Naslovna slika (URL)</label>
            <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7e52a0] outline-none transition-shadow" />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#012a36]">Video Lekcije</h3>
              <button type="button" onClick={handleAddLesson} className="bg-[#e6bccd] text-[#012a36] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d295bf] transition">
                + Dodaj lekciju
              </button>
            </div>

            {lessons.length === 0 && <p className="text-gray-500 text-sm italic mb-4">Trenutno nema unetih lekcija.</p>}

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1 w-full">
                    <input type="text" placeholder="Naziv lekcije" required value={lesson.title} onChange={(e) => handleLessonChange(index, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm focus:ring-[#7e52a0] outline-none" />
                    <input type="url" placeholder="YouTube URL" value={lesson.videoUrl} onChange={(e) => handleLessonChange(index, "videoUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-[#7e52a0] outline-none" />
                  </div>
                  <button type="button" onClick={() => handleRemoveLesson(index)} className="bg-red-100 text-red-600 px-3 py-2 rounded font-bold hover:bg-red-200 text-sm w-full md:w-auto h-[76px] flex items-center justify-center transition-colors">
                    Obriši
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button type="submit" className="flex-1 bg-[#7e52a0] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#d295bf] transition-colors shadow-md">
              Sačuvaj izmene
            </button>
            <button type="button" onClick={() => navigate("/profile")} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;