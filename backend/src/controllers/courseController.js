import Course from "../models/Course.js";

export async function getAllCourses (req, res) {
    try{
        const courses = await Course.find().sort({createdAt:-1}); //sortira od najnovijeg
        res.status(200).json(courses);

    }catch(error){
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
        const {title,content,image,tradeFor,user} = req.body;
        const newCourse = new Course({title, content, image, tradeFor, user});

        await newCourse.save();
        res.status(201).json({message: "Course created successfully", course: newCourse});
   } catch (error) {
        console.error("Error in createCourse controller", error);
        res.status(500).json({message: "Internal server error"});
   }
}

export async function updateCourse (req, res)  {
    try {
        const {title,content,image,tradeFor} = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, 
            {
                title,
                content,
                image,
                tradeFor
            }); 

        if(!updateCourse) return res.status(404).json({message:"Course not found"});
        res.status(200).json({message:"Course updated successfully"});
    } catch (error) {
        console.error("Error in updateCourse controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}

// BRISANJE KURSA (Dozvoljeno autoru kursa ili administratoru)
export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const { userId, role } = req.body; // Šaljemo ID i ulogu onoga ko pokušava da obriše kroz body (dok ne stavimo auth)

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Provera: Da li je korisnik autor kursa ILI je admin
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
    const { userId } = req.params;
    
    const courses = await Course.find({ user: userId });
    
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error in getMyCourses controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}