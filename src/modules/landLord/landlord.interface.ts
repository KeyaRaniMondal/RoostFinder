export interface ICreateLandlord {
    phone: string;
    address?: string;
    dateOfBirth?: Date;

    occupation?: string;
    companyName?: string;

    nidNumber?: string;
    profilePhoto?: string;

    bio?: string;
}

export interface IUpdateLandlord {
    phone?: string;
    address?: string;
    dateOfBirth?: Date;

    occupation?: string;
    companyName?: string;

    nidNumber?: string;
    profilePhoto?: string;

    bio?: string;
}