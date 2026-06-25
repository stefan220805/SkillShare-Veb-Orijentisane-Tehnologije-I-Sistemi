import SwapRequest from "../models/SwapRequest.js";
import Course from "../models/Course.js";

// 1. KREIRANJE ZAHTEVA ZA RAZMENU
export async function createSwapRequest(req, res) {
  try {
    const { receiver, offeredCourse, requestedCourse } = req.body;
    const sender = req.user.id; // Uzimamo direktno iz tokena!

    if (sender === receiver) {
      return res.status(400).json({ message: "Cannot send a request to yourself." });
    }

    // NOVO: Zabrana dupliranja - Provera da li već postoji zahtev za ovaj kurs
    const existingRequest = await SwapRequest.findOne({
      sender,
      requestedCourse
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: "Već ste poslali zahtev za ovaj kurs. Proverite svoj profil." 
      });
    }

    const newRequest = await SwapRequest.create({
      sender,
      receiver,
      offeredCourse,
      requestedCourse,
    });

    res.status(201).json({ message: "Request was sent successfully", swapRequest: newRequest });
  } catch (error) {
    console.error("Error in createSwapRequest controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 2. PREUZIMANJE PRIMLJENIH ZAHTEVA (Samo za ulogovanog korisnika)
export async function getMyReceivedRequests(req, res) {
  try {
    const userId = req.user.id; 

    const requests = await SwapRequest.find({ receiver: userId })
      .populate("sender", "name email")
      .populate("offeredCourse", "title")
      .populate("requestedCourse", "title");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getMyReceivedRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 3. AZURIRANJE STATUSA (Prihvatanje ili Odbijanje)
export async function updateSwapStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body; 
    const userId = req.user.id; // ID korisnika koji pokušava da prihvati/odbije

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status not valid." });
    }

    // Prvo nadjemo zahtev u bazi da proverimo ko je primalac
    const swapRequest = await SwapRequest.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Bezbednosna provera: Samo korisnik koji je PRIMIO zahtev može da ga odobri/odbije
    if (swapRequest.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to respond to this request." });
    }

    // Ako je sve u redu, menjamo status
    swapRequest.status = status;
    const updatedRequest = await swapRequest.save();

    // Ispravljen string sa backtick-ovima za ispravan ispis statusa
    res.status(200).json({
      message: `Request successfully updated on status: ${status}`,
      swapRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Error in updateSwapStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// 4. PREUZIMANJE POSLATIH ZAHTEVA (Koji je ulogovani korisnik poslao drugima)
export async function getMySentRequests(req, res) {
  try {
    const userId = req.user.id; 

    // Tražimo gde je ulogovani korisnik SENDER
    const requests = await SwapRequest.find({ sender: userId })
      .populate("receiver", "name email")
      .populate("offeredCourse", "title")
      .populate("requestedCourse", "title");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getMySentRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// 5. PROVERA PRISTUPA KURSU (Da li je otključan)
export async function checkCourseAccess(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const courseId = req.params.courseId;

    // Admin ima pristup svim kursevima
    if (req.user && req.user.role === "admin") {
      return res.status(200).json({ hasAccess: true });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseOwnerId = course.user?._id || course.user;
    if (String(courseOwnerId) === userId) {
      return res.status(200).json({ hasAccess: true });
    }

    const swap = await SwapRequest.findOne({
      status: "accepted",
      $or: [
        { sender: userId, requestedCourse: courseId },
        { receiver: userId, offeredCourse: courseId }
      ]
    });

    if (swap) {
      return res.status(200).json({ hasAccess: true });
    }

    return res.status(200).json({ hasAccess: false });
  } catch (error) {
    console.error("Error checking course access:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}