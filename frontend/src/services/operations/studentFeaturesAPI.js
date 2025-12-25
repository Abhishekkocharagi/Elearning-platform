import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API, DIRECT_ENROLLMENT_API } = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }
        document.body.appendChild(script);
    })
}

// ================ buyCourse (Direct Enrollment - No Payment) ================ 
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Enrolling in course...");
    dispatch(setPaymentLoading(true));

    try {
        console.log("Enrolling in courses:", coursesId);
        console.log("API endpoint:", DIRECT_ENROLLMENT_API);
        
        // Direct enrollment without payment
        const response = await apiConnector("POST", DIRECT_ENROLLMENT_API,
            { coursesId },
            {
                Authorization: `Bearer ${token}`,
            });

        console.log("Enrollment response:", response);

        if (!response.data.success) {
            throw new Error(response.data.message || "Enrollment failed");
        }

        toast.success("Successfully enrolled in course(s)!");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("ENROLLMENT API ERROR.....", error);
        console.log("Error response:", error.response);
        console.log("Error data:", error.response?.data);
        console.log("Error message:", error.message);
        
        const errorMessage = error.response?.data?.message 
            || error.response?.data?.error 
            || error.message 
            || "Could not enroll in course. Please try again.";
        
        toast.error(errorMessage);
        throw error; // Re-throw so calling function knows it failed
    }
    finally {
        toast.dismiss(toastId);
        dispatch(setPaymentLoading(false));
    }
}


// ================ send Payment Success Email ================
async function sendPaymentSuccessEmail(response, amount, token) {
    try {
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        })
    }
    catch (error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}


// ================ verify payment ================
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));

    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("payment Successful, you are addded to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}