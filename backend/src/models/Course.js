import mongoose from "mongoose";

//Korak 1: Kreiranje seme
//Korak 2: Kreiranje modela na osnovu te seme

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Naslov kursa je obavezan"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Kratak opis je obavezan"],
      maxlength: [500, "Opis ne može imati više od 500 karaktera"],
    },
    image: {
      type: String,
      required: [true, "Link do slike je obavezan"],
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEdwRWKlqcPa4yZQ2-HTNbBaDaPBziOCzHeA&s", // Podrazumevana slika 
    },
    tradeFor: {
      type: String,
      required: [true, "Morate navesti šta želite u zamenu za ovaj kurs"],
      placeholder: "Npr. Menjam za Osnove Dizajna ili React za početnike",
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Unosi se tačno ime modela korisnika (verovatno se zove 'User')
      required: true,
    },
  },
  {
    timestamps: true, // Dodaje 'createdAt' i 'updatedAt' (vreme kreiranja i izmene)
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;