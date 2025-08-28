import {parseJsonApiError} from '../api/errorParser';

export type LoginArgs = {
    email: string;
    passwordHash: string
}
export type RegisterArgs = {
    userData: {
        name: string;
        surname: string;
        email: string;
        birthDate: string;
    }
    credentials: {
        email: string;
        passwordHash: string;
    }
}

const BASE_GATEWAY_PATH : string = process.env.VITE_API_GATEWAY_PATH   || 'http://localhost:8083'
const LOGIN_PATH        : string = process.env.VITE_AUTH_LOGIN_PATH    || '/api-gateway/login'
const REGISTER_PATH     : string = process.env.VITE_AUTH_REGISTER_PATH || '/api-gateway/register'

async function request(path: string, body: any): Promise<any> {
    const requestPath: string = BASE_GATEWAY_PATH + path;
    const res: Response = await fetch(requestPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
        return await parseJsonApiError(res);
    }

    const contentLength: string | null = res.headers.get('content-length');
    if (contentLength === '0' || !contentLength) {
        console.log('Empty response received');
        return {};
    }

    try {
        return res.json()
    } catch (error) {
        console.error('JSON parsing error:', error);
        throw new Error('Invalid JSON response from server');
    }
}


export async function login(args: LoginArgs) : Promise<any>{
    return request(LOGIN_PATH, args)
}

export async function register(args: RegisterArgs): Promise<any>{
    return request(REGISTER_PATH, args)
}