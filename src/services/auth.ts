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
const LOGIN_PATH        : string = process.env.VITE_AUTH_LOGIN_PATH    || '/auth/login'
const REGISTER_PATH     : string = process.env.VITE_AUTH_REGISTER_PATH || '/registration/register'

async function request(path: string, body: any) : Promise<any> {
    const requestPath : string = BASE_GATEWAY_PATH + path
    const res : Response = await fetch(requestPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    if (!res.ok) {
        throw await parseJsonApiError(res);
    }
    return res.json()
}

export async function login(args: LoginArgs) : Promise<any>{
    return request(LOGIN_PATH, args)
}

export async function register(args: RegisterArgs): Promise<any>{
    return request(REGISTER_PATH, args)
}