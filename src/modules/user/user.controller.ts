
import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { userService } from './user.service.js'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body
  const user = await userService.registerUserIntoDB(payload)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: { user }
  })
})


// const registerUser = async (req: Request, res: Response) => {
//   const payload = req.body
//   const user = await userService.registerUserIntoDB(payload)

//   return res.status(httpStatus.CREATED).json({
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: 'User registered successfully',
//     data: { user },
//   })
// }


const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const profile=await userService.getMyProfileFromDb(req.user?.id as string)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: { profile }
  })
})

export const userController = {
  registerUser,
  getMyProfile
}