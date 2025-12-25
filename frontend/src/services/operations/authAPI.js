import { toast } from "react-hot-toast"

import { setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"

const {
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

// ================ Sign Up ================
export function signup(signupData, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    
    try {
      console.log("Signup data being sent:", signupData);
      console.log("Signup API endpoint:", SIGNUP_API);
      
      const response = await apiConnector("POST", SIGNUP_API, signupData);
      
      console.log("Signup API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Signup Successful");
      navigate("/login");
    } catch (error) {
      console.log("SIGNUP API ERROR --> ", error);
      console.log("Error response:", error.response);
      console.log("Error data:", error.response?.data);
      console.log("Error message:", error.message);
      console.log("Full error:", JSON.stringify(error, null, 2));
      
      // Show more specific error messages
      let errorMessage = "Signup Failed. Please try again.";
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || error.message;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Cannot connect to server. Please make sure the backend server is running on port 5000.";
        console.log("No response received. Check if backend server is running.");
        console.log("Attempted URL:", SIGNUP_API);
        console.log("Make sure to start the backend server: cd backend && node server.js");
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
}


// ================ Login ================
export function login(email, password, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      console.log("LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Login Successful")
      dispatch(setToken(response.data.token))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      dispatch(setUser({ ...response.data.user, image: userImage }));
      // console.log('User data - ', response.data.user);/
      localStorage.setItem("token", JSON.stringify(response.data?.token));

      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }));

      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("LOGIN API ERROR.......", error)
      toast.error(error.response?.data?.message || "Login Failed. Please check your credentials.")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ get Password Reset Token ================
export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("RESET PASS TOKEN RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Reset Email Sent")
      setEmailSent(true)
    } catch (error) {
      console.log("RESET PASS TOKEN ERROR............", error)
      toast.error(error.response?.data?.message)
      // toast.error("Failed To Send Reset Email")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}


// ================ reset Password ================
export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))

    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Password Reset Successfully")
      navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      toast.error(error.response?.data?.message)
      // toast.error("Failed To Reset Password");
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}


// ================ Logout ================
export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}