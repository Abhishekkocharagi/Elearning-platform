import React, { useEffect, useState } from "react"
// Icons
// import { FaRegStar, FaStar } from "react-icons/fa"
// import ReactStars from "react-rating-stars-component"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"

import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';
import { buyCourse } from "../../../services/operations/studentFeaturesAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"



function Course_Card({ course, Height }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  
  // const avgReviewCount = GetAvgRating(course.ratingAndReviews)
  // console.log(course.ratingAndReviews)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  const [isEnrolling, setIsEnrolling] = useState(false)
  
  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews)
    setAvgReviewCount(count)
  }, [course])
  // console.log("count............", avgReviewCount)

  // Check if user is already enrolled (handle both array of IDs and array of objects)
  const isEnrolled = user && course?.studentsEnrolled && course.studentsEnrolled.some(id => {
    const idString = id?._id ? id._id.toString() : (id?.toString ? id.toString() : id);
    return idString === user._id;
  })

  const handleCourseClick = async (e) => {
    e.preventDefault()
    
    // If user is already enrolled, navigate to course
    if (isEnrolled) {
      navigate(`/view-course/${course._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)
      return
    }

    // If user is not logged in, navigate to login
    if (!token) {
      toast.error("Please login to enroll in courses")
      navigate("/login")
      return
    }

    // If user is an instructor, show error
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors cannot enroll in courses")
      return
    }

    // Enroll the user
    setIsEnrolling(true)
    try {
      await buyCourse(token, [course._id], user, navigate, dispatch)
      // buyCourse already navigates to enrolled courses, so we don't need to navigate again
    } catch (error) {
      console.error("Enrollment error:", error)
      // If enrollment fails, navigate to course details page
      navigate(`/courses/${course._id}`)
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className='hover:scale-[1.03] transition-all duration-200 z-50 '>
      <div 
        onClick={handleCourseClick}
        className="cursor-pointer"
      >
        <div className="">
          <div className="rounded-lg relative">
            <Img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full rounded-xl object-cover `}
            />
            {isEnrolling && (
              <div className="absolute inset-0 bg-richblack-900 bg-opacity-75 flex items-center justify-center rounded-xl">
                <p className="text-yellow-50 font-semibold">Enrolling...</p>
              </div>
            )}
            {isEnrolled && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                Enrolled
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl text-richblack-5">{course?.courseName}</p>
            <p className="text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-5">{avgReviewCount || 0}</span>
              {/* <ReactStars
                count={5}
                value={avgReviewCount || 0}
                size={20}
                edit={false}
                activeColor="#ffd700"
                emptyIcon={<FaRegStar />}
                fullIcon={<FaStar />}
              /> */}
              <RatingStars Review_Count={avgReviewCount} />
              <span className="text-richblack-400">
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>
            <p className="text-xl text-richblack-5">Rs. {course?.price}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Course_Card
