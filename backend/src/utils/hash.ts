import bcrypt from 'bcrypt'

export const hashPassword = async (pass : string) => {
    return await bcrypt.hash(pass,12);
}

export const comparePassword = async (pass : string, enc: string) => {
    return await bcrypt.compare(pass, enc);
} 