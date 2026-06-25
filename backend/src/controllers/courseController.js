import Course from "../models/Course.js";
import Review from "../models/Review.js";

export async function getAllCourses (req, res) {
    try {
        // Proveravamo da li je sa frontenda poslat neki pojam za pretragu (?keyword=nesto)
        const keyword = req.query.keyword ? {
            title: {
                $regex: req.query.keyword,
                $options: "i", // ignorise velika i mala slova
            },
        } : {};

        // 1. U find() ubacujemo keyword, sortiramo i OBAVEZNO populiramo podatke o kreatoru
        const courses = await Course.find({...keyword})
            .populate("user", "name profilePicture")
            .sort({createdAt:-1}); 
        
        // 2. Povlačimo sve recenzije iz baze
        const reviews = await Review.find({});

        // 3. Za svaki kurs računamo njegov tačan prosek ocena
        const coursesWithRatings = courses.map(course => {
            const courseObj = course.toObject(); // Pretvaramo Mongoose dokument u običan objekat
            
            // Nalazimo samo recenzije koje pripadaju ovom kursu
            const courseReviews = reviews.filter(r => r.course.toString() === courseObj._id.toString());
            const numReviews = courseReviews.length;
            
            // Računamo prosek (ako nema recenzija, prosek je 0)
            const averageRating = numReviews > 0
                ? courseReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
                : 0;

            return {
                ...courseObj,
                averageRating: Number(averageRating.toFixed(1)), // Npr. 4.3
                numReviews
            };
        });

        // 4. Vraćamo obogaćene kurseve na frontend
        res.status(200).json(coursesWithRatings);
    } catch(error) {
        console.error("Error in getAllCourses controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function getCourseById(req, res) {
    try {
        const course = await Course.findById(req.params.id);
        if(!course) return res.status(404).json({message:"Course not found"});
            res.json(course);
    } catch (error) {
        console.error("Error in getCourseById controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function createCourse (req, res) {
   try {
        // Zamenili smo 'content' sa 'lessons'
        const { title, lessons, image, tradeFor } = req.body; 
        const user = req.user.id; 

        // I ovde prosleđujemo 'lessons' u bazu
        const newCourse = new Course({ title, lessons, image, tradeFor, user });

        await newCourse.save();
        res.status(201).json({ message: "Course created successfully", course: newCourse });
   } catch (error) {
        console.error("Error in createCourse controller", error);
        res.status(500).json({ message: "Internal server error" });
   }
}

export async function updateCourse (req, res) {
    try {
        // Uklonjen 'content', ostali su samo naslov, slika, tradeFor i lekcije
        const { title, image, tradeFor, lessons } = req.body;
        const userId = req.user.id; 

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.user.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to update this course" });
        }

        course.title = title || course.title;
        course.image = image !== undefined ? image : course.image;
        course.tradeFor = tradeFor || course.tradeFor;
        
        // Ažuriramo lekcije
        if (lessons) {
            course.lessons = lessons;
        }

        const updatedCourse = await course.save();
        res.status(200).json({ message: "Course updated successfully", course: updatedCourse });

    } catch (error) {
        console.error("Error in updateCourse controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// BRISANJE KURSA (Dozvoljeno autoru kursa ili administratoru)
export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    
    // Podatke o korisniku uzimamo iz tokena
    const userId = req.user.id;
    const role = req.user.role; 

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Provera: Korisnik mora biti ili autor kursa ILI administrator
    if (course.user.toString() !== userId && role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCourse controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Preuzimanje kursa za odredjenog korisnika (Za profilnu stranicu)
export async function getMyCourses(req, res) {
  try {
    // Umesto iz URL parametara, ID čitamo direktno iz tokena, isto kao za createCourse
    const userId = req.user.id; 
    
    const courses = await Course.find({ user: userId });
    
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error in getMyCourses controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}