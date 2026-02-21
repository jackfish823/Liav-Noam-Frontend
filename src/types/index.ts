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
    profileImage?: IImage;
}

export interface IPost {
    _id: string;
    message: string;
    author: IUser;
    commentsCount?: number;
    image?: IImage;
    createdAt?: string;
    updatedAt?: string;
}

export interface IComment {
    _id: string;
    body: string;
    postId: string | IPost;
    author: IUser;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginResponse {
    token: string;
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
