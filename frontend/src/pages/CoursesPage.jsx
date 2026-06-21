import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Funkcija za pretragu
  const fetchCourses = async (keyword = "") => {
    setLoading(true);
    try {
      const url = keyword 
        ? `http://localhost:5001/api/courses?keyword=${keyword}` 
        : "http://localhost:5001/api/courses";
      
      const res = await axios.get(url);
      setCourses(res.data);
      setLoading(false);
      setError("");
    } catch (err) {
      console.error("Greška:", err);
      setError("Nije moguće učitati kurseve.");
      setLoading(false);
    }
  };

  // Učitava sve kurseve na početku
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(searchTerm);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Naslov i Pretraga */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#012a36] mb-4 md:mb-0">
            Svi Kursevi
          </h2>
          
          <form onSubmit={handleSearch} className="flex w-full md:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="Pronađi kurs (npr. React, Dizajn...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#7e52a0]"
            />
            <button 
              type="submit" 
              className="bg-[#7e52a0] text-white px-4 py-2 rounded-r-md hover:bg-[#29274c] transition"
            >
              Traži
            </button>
          </form>
        </div>

        {loading && <p className="text-center text-[#7e52a0]">Učitavanje...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {!loading && courses.length === 0 ? (
            <p className="col-span-full text-gray-500">Nema rezultata za tvoju pretragu.</p>
          ) : (
            courses.map((course, index) => (
              <div 
                key={course._id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition duration-200 flex flex-col cursor-pointer group"
              >
                <div className="h-32 w-full overflow-hidden bg-gray-100">
                  <img 
                    src={course.image && course.image.startsWith('http') ? course.image : `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&sig=${index}`} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#012a36] text-sm mb-1 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{course.user?.name || "SkillShare Kreator"}</p>
                  <div className="flex items-center text-yellow-500 text-xs mb-2">
                    ★★★★☆ <span className="text-gray-400 ml-1">(4.5)</span>
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-semibold text-[#e6bccd] bg-[#29274c] px-2 py-1 rounded">
                      Zamena za: {course.tradeFor}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default CoursesPage;