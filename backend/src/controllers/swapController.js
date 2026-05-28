import SwapRequest from "../models/SwapRequest.js";


export async function createSwapRequest(req, res) {
  try {
    const { sender, receiver, offeredCourse, requestedCourse } = req.body;

    if (sender === receiver) {
      return res.status(400).json({ message: "Cannot send a request to yourself." });
    }

    const newRequest = await SwapRequest.create({
      sender,
      receiver,
      offeredCourse,
      requestedCourse,
    });

    res.status(201).json({message: "Request was sent successfully"});
  } catch (error) {
    console.error("Error in createSwapRequest controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 2. Preuzimanje svih zahteva koje je primio određeni korisnik (da ih odobri ili odbije)
export async function getMyReceivedRequests(req, res) {
  try {
    const { userId } = req.params;

    // .populate služi da iz baze povučemo i detalje o korisnicima i kursevima, a ne samo njihove ID-jeve
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

// 3. Ažuriranje statusa zahteva (Prihvatanje ili Odbijanje)
export async function updateSwapStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // očekujemo "accepted" ili "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status not valid." });
    }

    const updatedRequest = await SwapRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found." });
    }

    res.status(200).json({
      message: "Request successfully updated on status: ${status}",
      swapRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Error in updateSwapStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}