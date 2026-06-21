import Review from "../models/Review.js";
import Course from "../models/Course.js";

//Dodaj novu recenziju za kurs
export const addReview = async (req, res) => {
  try {
    const { rating, comment, courseId } = req.body;
    const userId = req.user.id;

    // Provera da li kurs postoji
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Kurs nije pronađen" });
    }

    // Zabrana korisnicima da ocenjuju sopstvene kurseve
    if (course.user.toString() === userId) {
        return res.status(400).json({ message: "Ne možete oceniti svoj sopstveni kurs" });
    }

    const review = new Review({
      rating,
      comment,
      course: courseId,
      user: userId,
    });

    await review.save();
    res.status(201).json({ message: "Recenzija uspešno dodata", review });
  } catch (error) {
    console.error("Greška u addReview:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

// Preuzmi sve recenzije za jedan kurs
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // .populate('user', 'name') ce samo ID-ja korisnika dati i njegovo ime da prikazemo na frontendu
    const reviews = await Review.find({ course: courseId }).populate("user", "name").sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Greška u getCourseReviews:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};