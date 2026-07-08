import { ActiveStatus } from "../../../prisma/generated/prisma/client";

export interface IUpdateUserStatus {
    activeStatus: ActiveStatus; // that one is defined in user
}