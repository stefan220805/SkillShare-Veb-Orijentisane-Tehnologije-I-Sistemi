import { useState, useEffect } from "react";
import axios from "axios";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // ZAMENI OVO SVOJIM KLJUČEM SA OPENWEATHER SAJTA
        const API_KEY = "d6aa527af4a43b887b38f3df38faa214"; 
        
        // Podesili smo Novi Sad, metrički sistem (Celzijusi) i srpski jezik
        const city = "Novi Sad"; 
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sr&appid=${API_KEY}`;
        
        const { data } = await axios.get(url);
        setWeather(data);
        setLoading(false);
      } catch (error) {
        console.error("Greška pri povlačenju vremena sa OpenWeather API:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading || !weather) return null;

  return (
    <div className="mt-6 bg-gradient-to-r from-[#012a36] to-[#29274c] text-white p-5 rounded-xl shadow-md flex items-center justify-between border border-[#7e52a0]/30">
      <div>
        <p className="text-xs text-[#e6bccd] uppercase font-bold tracking-wide mb-1">
          Atmosfera za učenje ({weather.name})
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black">{Math.round(weather.main.temp)}°C</p>
          <p className="text-sm text-gray-300 capitalize">{weather.weather[0].description}</p>
        </div>
      </div>
      
      {/* OpenWeather daje i besplatne ikonice koje odgovaraju trenutnom vremenu */}
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
        <img 
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
          alt="Vremenska prognoza" 
          className="w-full h-full drop-shadow-md"
        />
      </div>
    </div>
  );
};

export default WeatherWidget;