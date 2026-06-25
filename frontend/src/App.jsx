import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; 
import CreateCoursePage from "./pages/CreateCoursePage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import EditCoursePage from "./pages/EditCoursePage";
import AdminPage from "./pages/AdminPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-course" element={<CreateCoursePage />} />
        <Route path="/course/:id" element={<CourseDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-course/:id" element={<EditCoursePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/user/:id" element={<AdminUserDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;