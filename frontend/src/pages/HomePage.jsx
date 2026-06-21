import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const [trendingCourses, setTrendingCourses] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/courses");
        // Uzimamo samo prvih 5 za prikaz u skrolu
        setTrendingCourses(res.data.slice(0, 5));
      } catch (err) {
        console.error("Greška pri učitavanju trending kurseva", err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Glavna Hero Sekcija */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2 text-left mb-12 lg:mb-0">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-[#012a36] leading-tight mb-6">
            Oslobodi svoj potencijal uz najbolje <span className="text-[#e6bccd] bg-[#29274c] px-2 leading-snug">SkillShare</span> kurseve
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            Podigni svoje veštine na viši nivo uz našu pažljivo odabranu kolekciju kurseva. 
            Platforma kreirana da inspiriše, edukuje i osnaži tvoje kreativno i tehničko putovanje.
          </p>
          <div className="flex space-x-4">
            <Link to="/courses" className="bg-[#29274c] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#012a36] transition shadow-lg">
              Istraži kurseve
            </Link>
            <Link to="/register" className="border-2 border-[#7e52a0] text-[#7e52a0] px-8 py-3 rounded-md font-semibold hover:bg-[#e6bccd] hover:text-[#29274c] hover:border-[#e6bccd] transition">
              Započni odmah
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <div className="grid grid-cols-2 gap-4 w-[350px] h-[350px]">
            <div className="bg-[#012a36] rounded-tl-full rounded-br-full shadow-md"></div>
            <div className="bg-[#29274c] rotate-45 transform scale-75 shadow-md"></div>
            <div className="bg-[#d295bf] rounded-full shadow-md"></div>
            <div className="bg-[#7e52a0] rounded-tr-full shadow-md"></div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f9fa] py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-[#d295bf]">300+</h3>
            <p className="text-[#012a36] font-medium mt-2">Dostupnih kurseva</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-[#e6bccd]">50+</h3>
            <p className="text-[#012a36] font-medium mt-2">Eksperata mentora</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-[#7e52a0]">1000+</h3>
            <p className="text-[#012a36] font-medium mt-2">Sati materijala</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center gap-12 overflow-hidden">

        <div className="lg:w-1/3 text-left">
          <h2 className="text-3xl font-extrabold text-[#012a36] mb-4">
            Nauči ključne veštine za karijeru i život
          </h2>
          <p className="text-gray-600 mb-6">
            SkillShare ti pomaže da brzo savladaš najtraženije veštine. Istraži kurseve sa najboljim recenzijama naše zajednice i započni razmenu znanja!
          </p>
          <Link to="/courses" className="text-[#7e52a0] font-bold hover:text-[#d295bf] flex items-center transition-colors">
            Prikaži sve kurseve <span className="ml-2 text-xl">→</span>
          </Link>
        </div>

        <div className="lg:w-2/3 flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'thin' }}>
          {trendingCourses.length === 0 ? (
            <p className="text-gray-400 italic">Trenutno nema kurseva za prikaz...</p>
          ) : (
            trendingCourses.map((course, index) => (
              <div 
                key={course._id} 
                className="min-w-[280px] h-[340px] bg-gray-100 rounded-2xl relative group snap-start shrink-0 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={course.image && course.image.startsWith('http') ? course.image : `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&sig=${index}`} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg flex justify-between items-center group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex flex-col pr-2">
                    <h3 className="font-bold text-[#012a36] text-sm line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">Za: {course.tradeFor}</p>
                  </div>
                  <div className="text-[#7e52a0] font-bold text-xl">→</div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;