
import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { userService } from './user.service'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'

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

const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const profile = await userService.updateMyProfile(req.user?.id as string, req.body)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile updated successfully',
    data: { profile }
  })
})

const uploadProfileImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    throw new Error('No file uploaded')
  }

  const user = await userService.uploadProfileImage(req.file.buffer, req.user?.id as string)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile image uploaded successfully',
    data: { user }
  })
})

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  uploadProfileImage
}