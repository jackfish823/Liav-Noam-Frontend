export interface IImage {
    id: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
}

export interface IUser {
    _id: string;
    username: string;
    email: string;
    imgUrl?: string;
    profileImage?: string | IImage; // Can be image ID or populated image object
}

export interface IPost {
    _id: string;
    message: string;
    author: string | IUser; // depending on population
    imgUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IComment {
    _id: string;
    body: string;
    postId: string | IPost;
    author: string | IUser;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    _id: string; // userId usually returned
}

export interface UploadImageResponse {
    id: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
}
