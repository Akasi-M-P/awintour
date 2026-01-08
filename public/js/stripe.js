import axios from "axios";
import { showAlert } from "./alerts";

const stripe = Stripe(
  "pk_test_51Sn6QZBtbZ8dx38DOfkWUkwru6VPVQR1NjEH69F7EylVwJpBivdc0WmxaSasnLy9r2hffoUP4eEmGqBR4nH09fx600NdjNtcNd"
);

export const bookTour = async (tourId) => {
  try {
    // GET CHECKOUT SESSION FROM API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);

    // CREATE CHECKOUT FORM AND CHARGE CREDIT CARD
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert("error", error);
  }
};
