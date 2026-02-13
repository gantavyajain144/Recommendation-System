// It defines the blueprint for the data objects you use throughout your React app.

export interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    picture?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface UserRegister {
    email: string;
    password: string;
    full_name?: string;
}

export interface UserLogin {
    username: string; // OAuth2 password flow expects 'username' (email)
    password: string;
}

export interface Content {
    id: number;
    show_id: string;
    type: string;
    title: string;
    director?: string;
    cast?: string;
    country?: string;
    date_added?: string;
    release_year?: number;
    rating?: string;
    duration?: string;
    listed_in?: string;
    description?: string;
    image_url?: string;
    video_url?: string;
}
