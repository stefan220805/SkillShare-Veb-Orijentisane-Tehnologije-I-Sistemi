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

    // 1. ZABRANA DUPLIRANJA: Provera da li je korisnik već ocenio ovaj kurs
    const alreadyReviewed = await Review.findOne({
      course: courseId,
      user: userId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Već ste ostavili recenziju za ovaj kurs." });
    }

    const review = new Review({
      rating,
      comment,
      course: courseId,
      user: userId,
    });

    await review.save();

    // 2. POPRAVKA ZA FRONTEND: Izvlačimo ime i sliku iz baze
    const populatedReview = await Review.findById(review._id).populate("user", "name profilePicture");

    // Vraćamo populisanu recenziju nazad na frontend
    res.status(201).json({ message: "Recenzija uspešno dodata", review: populatedReview });
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
// BRISANJE RECENZIJE (Samo Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Recenzija nije pronađena" });
    }

    // Dodatna provera: Samo admin sme da obriše (pošto front to svakako sakriva od ostalih)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Nemate ovlašćenje da obrišete recenziju" });
    }

    await Review.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Recenzija je uspešno obrisana" });
  } catch (error) {
    console.error("Greška pri brisanju recenzije:", error);
    res.status(500).json({ message: "Interna greška servera" });
  }
};